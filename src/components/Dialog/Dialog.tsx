import React, { Component } from 'react';
import WaveFile from 'wavefile';
import './Dialog.css';
import MicrophoneAudioSource, { MicrophoneAudioSourceOptions } from '../../audio/MicrophoneAudioSource';
import WaveFileAudioSource, { WaveFileAudioSourceOptions } from '../../audio/WaveFileAudioSource';
import AsrController from '../../services/ASRController';
import TtsController from '../../services/TtsController';
import NluController, { NluResult, NluEntity } from '../../services/NluController';
import DialogController, { DialogControllerOptions } from '../../services/DialogController';
import AudioContextAudioSink from '../../audio/AudioContextAudioSink';
import AudioWaveformVisualizer from '../../components/AudioWaveformVisualizer/AudioWaveformVisualizer';
import AudioEqVisualizer from '../../components/AudioEqVisualizer/AudioEqVisualizer';
import AudioSource from '../../audio/AudioSource';
import AudioSink from '../../audio/AudioSink';

import Model from '../../model/Model';
import { AppSettingsOptions } from '../../model/AppSettings';
import Log from '../../utils/Log';

import EarconManager, { EarconTone } from '../../audio/EarconManager';
import WakewordController from '../../audio/WakewordController';

import { AsrHypothesis } from '../Asr/Asr';

let fs: any;
let path: any;
let app: any;
if (process.env.REACT_APP_MODE === 'electron') {
  fs = require('fs-extra');
  path = require('path');
  app = require('electron').remote.app;
}

const basepath = app.getAppPath();

interface ServiceCredentials {
  url: string;
  username: string;
  password: string;
  scope: string;
}

export interface DialogProps { model: Model }
export interface DialogState {
  settings: AppSettingsOptions;
  dialogInput: string;
  chat: string;
  messages: string;
  ttsVisualizerSource: AudioSource | AudioSink | undefined;
  asrVisualizerSource: AudioSource | AudioSink | undefined;
}

export default class Dialog extends React.Component<DialogProps, DialogState> {

  private _log: Log;

  private _microphoneAudioSource: MicrophoneAudioSource | undefined;
  private _waveFileAudioSource: WaveFileAudioSource | undefined;
  private _serviceCredentials: ServiceCredentials;
  private _asrController: AsrController | undefined;
  private _ttsController: TtsController | undefined;
  private _nluController: NluController | undefined;
  private _dialogController: DialogController | undefined;
  private _audioContextAudioSink: AudioContextAudioSink | undefined;

  private _onChangeHandler: any = (event: any) => this.onChangeHandler(event);
  private _onBlurHandler: any = (event: any) => this.onBlurHandler(event);

  private _wakewordController: WakewordController | undefined;
  private _startAsrHandler: any = this.startAsr.bind(this);
  private _stopAsrHandler: any = this.stopAsr.bind(this);
  private _asrEosIntervalTimeout: NodeJS.Timeout;

  constructor(props: DialogProps) {
    super(props);
    this._serviceCredentials = {
      url: this.props.model.appSettings.authUrl,
      username: this.props.model.appSettings.authUsername,
      password: this.props.model.appSettings.authPassword,
      scope: this.props.model.appSettings.authScope,
    };
    this.state = {
      settings: this.props.model.appSettings.json,
      dialogInput: '',
      chat: '',
      messages: 'Waiting...',
      ttsVisualizerSource: undefined,
      asrVisualizerSource: undefined
    };
  }

  componentDidMount() {
    this._wakewordController = new WakewordController();
  }

  componentWillUnmount() {
    if (this._dialogController) {
      this._dialogController.dispose();
      this._dialogController = undefined;
    }
    if (this._wakewordController)
      this._wakewordController.dispose();
  }

  submit() {
    console.log(`submit: ${this.state.dialogInput}`);
    this.setState({
      chat: this.state.chat + '\n' + this.state.dialogInput,
      dialogInput: ''
    });
    this._dialogController.execute(this.state.dialogInput);
  }

  parseResponse(response: any) {
    let prompt: string = '';
    if (response && response.payload && response.payload.action) {
      response.payload.action.forEach((action: any) => {
        if (action.prompt && action.prompt.visual) {
          action.prompt.visual.forEach((visual: any) => {
            if (visual.text) {
              prompt += visual.text + '';
            }
          });
        }
      });
    }
    if (prompt) {
      this.setState({
        chat: this.state.chat + '\n>: ' + prompt,
      });
      this.startTts(prompt);
    }
  }

  parseAsrResults(results: any) {
    let utterance: string = '';
    let highestConfidence: number = 0;
    const hypotheses: any[] = [];
    if (results) {
      results.forEach((result: any) => {
        if (result.result && result.result.hypotheses) {
          result.result.hypotheses.forEach((hypothesis: any) => {
            const confidence: number = hypothesis.confidence || 0;
            const avgConfidence: number = hypothesis.average_confidence || 0;
            const conf = Math.max(confidence, avgConfidence);
            console.log(conf, highestConfidence);
            hypotheses.push({
              text: hypothesis.formatted_text,
              confidence: confidence,
              avgConfidence: avgConfidence,
              rejected: hypothesis.rejected
            })
            if (!hypothesis.rejected && hypothesis.formatted_text && (conf > highestConfidence)) {
              highestConfidence = conf;
              utterance = hypothesis.formatted_text;
            }
          });
        }
      });
    }
    this.setState({
      dialogInput: utterance
    });
    return hypotheses;
  }

  messageFromResults(results: any): string {
    const hypotheses = this.parseAsrResults(results);
    hypotheses.sort((a: AsrHypothesis, b: AsrHypothesis): number => {
      const confA = Math.max(a.confidence, a.avgConfidence);
      const confB = Math.max(b.confidence, b.avgConfidence);
      return confB - confA;
    });
    let hypothesesText = '';
    if (hypotheses) {
      hypotheses.forEach((hypothesis: AsrHypothesis) => {
        let text: string = `${hypothesis.text}\t${hypothesis.confidence}\t${hypothesis.avgConfidence}\t${hypothesis.rejected}`;
        hypothesesText += text + '\n';
      });
    }
    const resultsText: string = JSON.stringify(results, null, 2);
    return hypothesesText + '\n' + resultsText;
  }

  startAsr() {
    EarconManager.Instance().playTone(EarconTone.LISTEN_START);
    this._microphoneAudioSource = new MicrophoneAudioSource({
      targetSampleRate: 16000,
      monitorAudio: false,
      captureAudio: true,
    });
    this._asrController = new AsrController(this._serviceCredentials, this._microphoneAudioSource);
    this._asrController.start();
    this.setState({
      messages: `recording: started:`,
      asrVisualizerSource: this._microphoneAudioSource
    });
    // if (this._wakewordController.isRunning) {
      this._asrEosIntervalTimeout = setInterval(this._stopAsrHandler, 3000);
    // }
  }

  stopAsr() {
    if (this._asrEosIntervalTimeout) {
      clearInterval(this._asrEosIntervalTimeout);
      this._asrEosIntervalTimeout = undefined;
    }
    EarconManager.Instance().playTone(EarconTone.LISTEN_STOP);
    if (this._asrController && this._microphoneAudioSource) {
      this._asrController.on('end', ((results: any) => {
        this.setState({
          messages: this.messageFromResults(results),
          asrVisualizerSource: undefined
        }, () => {
          this._asrController.dispose();
          this._asrController = undefined;
          this._microphoneAudioSource.dispose();
          this._microphoneAudioSource = undefined;
        });
        this.parseAsrResults(results);
      }));
      this._asrController.stop();
    }
  }

  onButtonClicked(action: string, event: any) {
    // console.log(`onButtonClicked: ${action}`);
    event.preventDefault();

    switch (action) {
      case 'btnDialogSubmit':
        this.submit();
        break;
      case 'btnDialogStart':
        if (this._dialogController) {
          this._dialogController.dispose();
        }
        this._dialogController = new DialogController(this._serviceCredentials, {
          modelRef: this.props.model.appSettings.dialogModelRef,
          channel: 'default',
          language: 'eng-USA',
          library: 'default',
        });
        this._dialogController.on('started', (data: any) => {
          const output: string = JSON.stringify(data, null, 2);
          this.setState({
            messages: output
          });
        });
        this._dialogController.on('response', (data: any) => {
          const output: string = JSON.stringify(data, null, 2);
          this.setState({
            messages: output
          });
          this.parseResponse(data.response);
        });
        this._dialogController.start();
        this.setState({
          messages: `dialog: started`,
          chat: '[new chat session]'
        });
        break;
      case 'btnAsrStart':
        this.startAsr();
        break;
      case 'btnAsrStop':
        this.stopAsr();
        break;
      case 'btnWakeword':
        EarconManager.Instance().playTone(EarconTone.INITIALIZE);
        if (this._wakewordController) {
          if (this._wakewordController.isRunning) {
            this._wakewordController.stop();
            this._wakewordController.off('wakeword', this._startAsrHandler);
            this._wakewordController.off('cancel', this._stopAsrHandler);
          } else {
            this._wakewordController.start();
            this._wakewordController.on('wakeword', this._startAsrHandler);
            this._wakewordController.on('cancel', this._stopAsrHandler);
          }
        }
        break;
    }
  }

  onChangeHandler(event: any) {
    const nativeEvent: any = event.nativeEvent;
    // this.log.debug(nativeEvent);
    let updateObj: any = undefined;
    switch (nativeEvent.target.id) {
      case 'dialogInput':
        updateObj = { dialogInput: nativeEvent.target.value };
        break;
    }

    if (updateObj) {
      this.setState(updateObj);
    }
  }

  onBlurHandler(event: any) {
    // this.props.changed(this.state);
  }

  startTts(prompt: string) {
    if (this._audioContextAudioSink) {
      this._audioContextAudioSink.dispose();
    }
    if (this._ttsController) {
      this._ttsController.dispose();
    }
    this._audioContextAudioSink = new AudioContextAudioSink({
      sampleRate: 22500,
      analyzerSamples: 32
    });
    this._audioContextAudioSink.on('ended', () => {
      if (this._ttsController) {
        this._ttsController.dispose();
        this._ttsController = undefined;
      }
      this._audioContextAudioSink.dispose();
      this._audioContextAudioSink = undefined;
      this.setState({
        messages: `tts: stopped`,
        ttsVisualizerSource: undefined
      });
    });
    this._ttsController = new TtsController(this._serviceCredentials);
    this._ttsController.on('data', (data: any) => {
      //console.log(data);
      if (data.response === 'audio' && data.audio) {
        this._audioContextAudioSink.writeAudio(data.audio);
      }
    });
    this._ttsController.on('end', () => {
      this._audioContextAudioSink.play();
    });
    this._ttsController.start(prompt);
    this.setState({
      messages: `tts: started:`,
      ttsVisualizerSource: this._audioContextAudioSink
    });
  }

  render() {
    return (
      <div className='Dialog'>
        <div className='Dialog-chat'>
          <AudioEqVisualizer audioDataSource={this.state.ttsVisualizerSource} options={{ w: 256, h: 50, tickWidth: 1 }} />
          <textarea className='Dialog' value={this.state.chat} readOnly rows={5} />
          <form className='form' role='form' onSubmit={(event: any) => { this.onButtonClicked('btnDialogSubmit', event) }}>
            <div className='Dialog-row'>
              <input id='dialogInput' type='text' className='form-control' placeholder='input' value={this.state.dialogInput} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
            </div>
            <div className='Dialog-row'>
              <button id='btnDialogSubmit' type='button' className={`btn btn-primary App-button`}
                onClick={(event) => this.onButtonClicked(`btnDialogSubmit`, event)}>
                Submit
          </button>
              <button id='btnDialogStart' type='button' className={`btn btn-primary App-button`}
                onClick={(event) => this.onButtonClicked(`btnDialogStart`, event)}>
                DialogStart
          </button>
              <button id='btnAsrStart' type='button' className={`btn btn-primary App-button`}
                onClick={(event) => this.onButtonClicked(`btnAsrStart`, event)}>
                AsrStart
          </button>
              <button id='btnAsrStop' type='button' className={`btn btn-primary App-button`}
                onClick={(event) => this.onButtonClicked(`btnAsrStop`, event)}>
                AsrStop
          </button>
              <button id='btnWakeword' type='button' className={`btn btn-primary App-button`}
                onClick={(event) => this.onButtonClicked(`btnWakeword`, event)}>
                Wakeword
          </button>
            </div>
          </form>
          <AudioWaveformVisualizer audioDataSource={this.state.asrVisualizerSource} options={{ w: 256, h: 50, tickWidth: 0.5 }} />
        </div>
        <div className='Dialog-messages'>
          <textarea className='Dialog' value={this.state.messages} readOnly rows={20} />
        </div>
      </div>
    );
  }
}

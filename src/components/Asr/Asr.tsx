import React, { Component } from 'react';
import WaveFile from 'wavefile';
import './Asr.css';
import MicrophoneAudioSource, { MicrophoneAudioSourceOptions } from '../../audio/MicrophoneAudioSource';
import WaveFileAudioSource, { WaveFileAudioSourceOptions } from '../../audio/WaveFileAudioSource';
import AsrController from '../../services/ASRController';
import AudioWaveformVisualizer from '../../components/AudioWaveformVisualizer/AudioWaveformVisualizer';
import AudioEqVisualizer from '../../components/AudioEqVisualizer/AudioEqVisualizer';
import AudioSource from '../../audio/AudioSource';
import AudioSink from '../../audio/AudioSink';

import Model from '../../model/Model';
import { AppSettingsOptions } from '../../model/AppSettings';
import Log from '../../utils/Log';

import WakewordController from '../../audio/WakewordController';
import EarconManager, { EarconTone } from '../../audio/EarconManager';

let fs: any;
let path: any;
let app: any;
let dialog: any;
if (process.env.REACT_APP_MODE === 'electron') {
  fs = require('fs-extra');
  path = require('path');
  app = require('electron').remote.app;
  dialog = require('electron').remote.dialog;
}

const basepath = app.getAppPath();

interface ServiceCredentials {
  url: string;
  username: string;
  password: string;
  scope: string;
}

export interface AsrProps { model: Model }
export interface AsrState {
  // settings: AppSettingsOptions;
  message: string;
  asrResult: string;
  visualizerSource: AudioSource | AudioSink | undefined;
}
export interface AsrHypothesis {
  text: string;
  confidence: number;
  avgConfidence: number;
  rejected: boolean;
}

export default class Asr extends React.Component<AsrProps, AsrState> {

  private _log: Log;

  private _microphoneAudioSource: MicrophoneAudioSource | undefined;
  private _waveFileAudioSource: WaveFileAudioSource | undefined;
  private _serviceCredentials: ServiceCredentials;
  private _asrController: AsrController | undefined;

  private _wakewordController: WakewordController | undefined;
  private _startAsrHandler: any = this.startAsr.bind(this);
  private _stopAsrHandler: any = this.stopAsr.bind(this);
  private _asrEosIntervalTimeout: NodeJS.Timeout;

  constructor(props: AsrProps) {
    super(props);
    this._serviceCredentials = {
      url: this.props.model.appSettings.authUrl,
      username: this.props.model.appSettings.authUsername,
      password: this.props.model.appSettings.authPassword,
      scope: this.props.model.appSettings.authScope,
    };
    this.state = {
      // settings: this.props.model.appSettings.json,
      message: 'Waiting...',
      asrResult: '',
      visualizerSource: undefined
    };
  }

  componentDidMount() {
    this._wakewordController = new WakewordController();
  }

  componentWillUnmount() {
    if (this._wakewordController) this._wakewordController.dispose();
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
      asrResult: utterance
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
      message: `recording: started:`,
      visualizerSource: this._microphoneAudioSource
    });
    if (this._wakewordController.isRunning) {
      this._asrEosIntervalTimeout = setInterval(this._stopAsrHandler, 3000);
    }
  }

  stopAsr() {
    if (this._asrEosIntervalTimeout) {
      clearInterval(this._asrEosIntervalTimeout);
      this._asrEosIntervalTimeout = undefined;
    }
    EarconManager.Instance().playTone(EarconTone.LISTEN_STOP);
    if (this._asrController && this._microphoneAudioSource) {
      if (this._microphoneAudioSource.audioData) {
        let audioData = this._microphoneAudioSource.audioData;
        this.writeAudioData16ToFile(audioData);
      }
      this._asrController.on('end', ((results: any) => {
        this.setState({
          message: this.messageFromResults(results),
          visualizerSource: undefined
        }, () => {
          this._asrController.dispose();
          this._asrController = undefined;
          this._microphoneAudioSource.dispose();
          this._microphoneAudioSource = undefined;
        });

      }));
      this._asrController.stop();
    }
  }

  writeAudioData16ToFile(audioData: Int16Array) {
    let audioFile = path.resolve(basepath, 'audio-pcm-16.raw');
    fs.writeFileSync(audioFile, Buffer.from(audioData.buffer));
    const wav: any = new WaveFile();
    wav.fromScratch(1, 16000, '16', audioData);
    let wavFile = path.resolve(basepath, 'audio-pcm-16.wav');
    fs.writeFileSync(wavFile, wav.toBuffer());
  }

  onButtonClicked(action: string, event: any) {
    // console.log(`onButtonClicked: ${action}`);
    event.preventDefault();

    switch (action) {
      case 'btnRecordStart':
        const options: MicrophoneAudioSourceOptions = {
          targetSampleRate: 16000,
          monitorAudio: false,
          captureAudio: true,
        }
        this._microphoneAudioSource = new MicrophoneAudioSource(options);
        this.setState({
          message: `recording: started:`,
          visualizerSource: this._microphoneAudioSource
        });
        break;
      case 'btnRecordStop':
        if (this._microphoneAudioSource) {
          const audioData: Int16Array = this._microphoneAudioSource.audioData;
          let bytesCaptured: number = 0;
          if (audioData) {
            this.writeAudioData16ToFile(audioData);
          }

          this.setState({
            message: `recording: stopped:\nbytes captured: ${bytesCaptured}`,
            visualizerSource: undefined
          }, () => {
            this._microphoneAudioSource.dispose();
            this._microphoneAudioSource = undefined;
          });
        }
        break;
      case 'btnAsrStart':
        this.startAsr();
        break;
      case 'btnAsrStop':
        this.stopAsr();
        break;
      case 'btnWavStart':
        let wavFilename = path.resolve(basepath, './notebooks/data/this_is_a_test.wav');
        dialog.showOpenDialog({
          properties: ['openFile']
        }, (files) => {
          if (files !== undefined) {
            console.log(files);
            wavFilename = files[0];
          }

          try {
            this._waveFileAudioSource = new WaveFileAudioSource({
              filename: wavFilename,
              sampleRate: 16000,
              monitorAudio: false,
              captureAudio: false,
            });
            this._waveFileAudioSource.on('done', () => {
              this._asrController.on('end', ((results: string) => {
                this.setState({
                  message: this.messageFromResults(results),
                });
                this._asrController.dispose();
                this._asrController = undefined;
              }));
              this._asrController.stop();
              this._waveFileAudioSource.dispose();
              this._waveFileAudioSource = undefined;
            })
            this._asrController = new AsrController(this._serviceCredentials, this._waveFileAudioSource);
            this._asrController.start();
            this.setState({
              message: `wav: upload started:`
            });
          } catch (error) {
            this.setState({
              message: error + '\n' + 'Please select a PCM16 wav file (16khz, 16bit, signed, le).'
            });
          }
        });
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

  render() {
    return (
      <div className="Asr">
        <div className='Asr-controls'>
          <AudioEqVisualizer audioDataSource={this.state.visualizerSource} options={{ w: 256, h: 50, tickWidth: 1 }} />
          <textarea className="Asr" value={this.state.message} readOnly rows={10} />
          <div className='Asr-row'>
            <input id='asrResult' type='text' className='form-control' placeholder='input' value={this.state.asrResult} readOnly />
          </div>
          <div className='Asr-row'>
            <button id='btnRecordStart' type='button' className={`btn btn-primary App-button`}
              onClick={(event) => this.onButtonClicked(`btnRecordStart`, event)}>
              RecordStart
          </button>
            <button id='btnRecordStop' type='button' className={`btn btn-primary App-button`}
              onClick={(event) => this.onButtonClicked(`btnRecordStop`, event)}>
              RecordStop
          </button>
            <button id='btnAsrStart' type='button' className={`btn btn-primary App-button`}
              onClick={(event) => this.onButtonClicked(`btnAsrStart`, event)}>
              AsrStart
          </button>
            <button id='btnAsrStop' type='button' className={`btn btn-primary App-button`}
              onClick={(event) => this.onButtonClicked(`btnAsrStop`, event)}>
              AsrStop
          </button>
            <button id='btnWavStart' type='button' className={`btn btn-primary App-button`}
              onClick={(event) => this.onButtonClicked(`btnWavStart`, event)}>
              WavStart
          </button>
            <button id='btnWakeword' type='button' className={`btn btn-primary App-button`}
              onClick={(event) => this.onButtonClicked(`btnWakeword`, event)}>
              Wakeword
          </button>
          </div>
          <div className='Asr-row'>
            <AudioWaveformVisualizer audioDataSource={this.state.visualizerSource} options={{ w: 256, h: 50, tickWidth: 1 }} />
          </div>
        </div>
      </div>
    );
  }
}

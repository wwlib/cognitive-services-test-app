import React, { Component } from 'react';
import {
  AzureSpeechClient,
  AudioSourceWaveStreamer,
  WaveFileAudioSource,
  AudioSource,
  AudioSink,
  MicrophoneAudioSource,
  MicrophoneAudioSourceOptions,
  AudioUtils,
} from 'cognitiveserviceslib';

import './Asr.css';
import AudioWaveformVisualizer from '../../components/AudioWaveformVisualizer/AudioWaveformVisualizer';
import AudioEqVisualizer from '../../components/AudioEqVisualizer/AudioEqVisualizer';
import Model from '../../model/Model';
import Log from '../../utils/Log';
import WakewordController from '../../audio/WakewordController';
import EarconManager, { EarconTone } from '../../audio/EarconManager';
import PathUtils from '../../utils/PathUtils';
import Timer from '../../utils/Timer';

// import { createReadStream, read, write } from 'fs';
// import { PassThrough } from 'stream';

let fs: any;
let path: any;
let dialog: any;
let createWriteStream: any;

if (process.env.REACT_APP_MODE === 'electron') {
  fs = require('fs-extra');
  createWriteStream = fs.createWriteStream;
  path = require('path');
  dialog = require('electron').remote.dialog;
}

export interface AsrProps { model: Model }
export interface AsrState {
  message: string;
  asrResult: string;
  visualizerSource: AudioSource | AudioSink | undefined;
}

export interface AsrHypothesis {
  Confidence: number;
  Display: string;
  ITN: string;
  Lexical: string;
  MaskedITN: string;
}

export interface AsrResults {
  Duration: number;
  NBest: AsrHypothesis[];
  Offset: number;
  RecognitionStatus: string;
}

export default class Asr extends React.Component<AsrProps, AsrState> {

  private _log: Log;

  private _microphoneAudioSource: MicrophoneAudioSource | undefined;
  private _waveFileAudioSource: WaveFileAudioSource | undefined;
  private _azureSpeechClient: AzureSpeechClient | undefined;

  private _wakewordController: WakewordController | undefined;
  private _startAsrHandler: any = this.startAsr.bind(this);
  private _stopAsrHandler: any = this.stopAsr.bind(this);
  private _asrEosIntervalTimeout: NodeJS.Timeout;

  private _audioSourceWaveStreamer: AudioSourceWaveStreamer;
  private _asrTimer: Timer;

  constructor(props: AsrProps) {
    super(props);
    this._azureSpeechClient = new AzureSpeechClient(this.props.model.config.json);
    this.state = {
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

  parseAsrResults(results: any): any[] {
    let utterance: string = '';
    let hyoptheses: any[] = [];
    if (results && results.NBest) {
      hyoptheses = results.NBest;
      if (results.NBest[0]) {
        utterance = results.NBest[0].Display;
      }
    }

    this.setState({
      asrResult: utterance
    });
    return hyoptheses;
  }

  messageFromResults(results: any): string {
    const timeMessage: string = this._asrTimer ? `${this._asrTimer.name}: ${this._asrTimer.elapsedTime()} milliseconds` : '';
    const hypotheses = this.parseAsrResults(results);
    hypotheses.sort((a: AsrHypothesis, b: AsrHypothesis): number => {
      const confA = a.Confidence;
      const confB = b.Confidence;
      return confB - confA;
    });
    let hypothesesText = `${timeMessage}\n`;
    if (hypotheses) {
      hypotheses.forEach((hypothesis: AsrHypothesis) => {
        let text: string = `Confidence: ${hypothesis.Confidence}\nDisplay: ${hypothesis.Display}\nLexical: ${hypothesis.Lexical}\nITN: ${hypothesis.ITN}\nMaskedITN: ${hypothesis.MaskedITN}`;
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
    this._audioSourceWaveStreamer = new AudioSourceWaveStreamer(this._microphoneAudioSource);
    // const writeStream = createWriteStream(PathUtils.resolve('out.wav'));
    // this._audioSourceWaveStreamer.readStream.pipe(writeStream);
    this._azureSpeechClient.recognizeStream(this._audioSourceWaveStreamer.readStream)
      .then((results: any) => {
        // console.log(results);
        this.setState({
          message: this.messageFromResults(results),
          visualizerSource: undefined
        }, () => {
          if (this._microphoneAudioSource) this._microphoneAudioSource.dispose();
          this._microphoneAudioSource = undefined;
        });
      })
      .catch((error: any) => {
        // console.log(error);
        this.setState({
          message: error,
          visualizerSource: undefined
        }, () => {
          if (this._microphoneAudioSource) this._microphoneAudioSource.dispose();
          this._microphoneAudioSource = undefined;
        });
      });
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
    this._asrTimer = new Timer('ASR Response Time');
    if (this._audioSourceWaveStreamer) this._audioSourceWaveStreamer.dispose();
    this._audioSourceWaveStreamer = undefined;

    EarconManager.Instance().playTone(EarconTone.LISTEN_STOP);
    if (this._microphoneAudioSource) {
      if (this._microphoneAudioSource.audioData) {
        let audioData = this._microphoneAudioSource.audioData;
        AudioUtils.writeAudioData16ToFile(audioData, PathUtils.resolve('audio-pcm-16'));
      }
    }
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
            AudioUtils.writeAudioData16ToFile(audioData, PathUtils.resolve('audio-pcm-16'));
          }

          this.setState({
            message: `recording: stopped:\nbytes captured: ${bytesCaptured}`,
            visualizerSource: undefined
          }, () => {
            if (this._microphoneAudioSource) this._microphoneAudioSource.dispose();
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
        let wavFilename = '';
        dialog.showOpenDialog({
          properties: ['openFile']
        }, (files) => {
          if (files !== undefined) {
            // console.log(files);
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
              this._asrTimer = new Timer('ASR Response Time');
            });
            this._waveFileAudioSource.start();
            this._audioSourceWaveStreamer = new AudioSourceWaveStreamer(this._waveFileAudioSource);
            // const writeStream = createWriteStream('temp.wav');
            // this._audioSourceWaveStreamer.readStream.pipe(writeStream);

            // ALT: This is a faster, non-realtime way to stream the wave file to the server
            // const readableStream = createReadStream(wavFilename);
            // const passThrough = new PassThrough();
            // readableStream.pipe(passThrough);
            // passThrough.on('end', () => { console.log(`END`); this._asrTimer = new Timer('ASR Response Time'); })

            this._azureSpeechClient.recognizeStream(this._audioSourceWaveStreamer.readStream) // (passThrough) // (this._audioSourceWaveStreamer.readStream) //
              .then((results: any) => {
                this.setState({
                  message: this.messageFromResults(results),
                  visualizerSource: undefined
                });
              })
              .catch((error: any) => {
                this.setState({
                  message: error,
                  visualizerSource: undefined
                });
              });
            this.setState({
              message: `upload: started:`,
              visualizerSource: this._waveFileAudioSource
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
            <button id='btnAsrStart' type='button' className={`btn btn-primary App-button`}
              onClick={(event) => this.onButtonClicked(`btnAsrStart`, event)}>
              AsrStart
            </button>
            <button id='btnAsrStop' type='button' className={`btn btn-primary App-button`}
              onClick={(event) => this.onButtonClicked(`btnAsrStop`, event)}>
              AsrStop
            </button>
            <button id='btnRecordStart' type='button' className={`btn btn-primary App-button`}
              onClick={(event) => this.onButtonClicked(`btnRecordStart`, event)}>
              RecordStart
            </button>
            <button id='btnRecordStop' type='button' className={`btn btn-primary App-button`}
              onClick={(event) => this.onButtonClicked(`btnRecordStop`, event)}>
              RecordStop
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

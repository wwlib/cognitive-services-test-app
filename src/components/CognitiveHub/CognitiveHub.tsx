import React, { Component } from 'react';
import {
  AudioSourceWaveStreamer,
  WaveFileAudioSource,
  AudioSource,
  AudioSink,
  MicrophoneAudioSource,
  MicrophoneAudioSourceOptions,
  AudioUtils,
} from 'cognitiveserviceslib';
import './CognitiveHub.css';
import AudioWaveformVisualizer from '../../components/AudioWaveformVisualizer/AudioWaveformVisualizer';
import AudioEqVisualizer from '../../components/AudioEqVisualizer/AudioEqVisualizer';
import Model from '../../model/Model';
import WakewordController from '../../audio/WakewordController';
import EarconManager, { EarconTone } from '../../audio/EarconManager';
import PathUtils from '../../utils/PathUtils';
// import Timer from '../../utils/Timer';
import CognitiveHubClientController from '../../model/CognitiveHubClientController'

let fs: any;
// let path: any;
let dialog: any;

if (process.env.REACT_APP_MODE === 'electron') {
  fs = require('fs-extra');
  // path = require('path');
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

export default class CognitiveHub extends React.Component<AsrProps, AsrState> {

  private _microphoneAudioSource: MicrophoneAudioSource | undefined;
  private _waveFileAudioSource: WaveFileAudioSource | undefined;
  private _wakewordController: WakewordController | undefined;
  private _asrEosIntervalTimeout: NodeJS.Timeout | undefined;
  private _audioSourceWaveStreamer: AudioSourceWaveStreamer | undefined;
  // private _asrTimer: Timer;
  private _cognitiveHubClient: CognitiveHubClientController | undefined;

  constructor(props: AsrProps) {
    super(props);
    this.state = {
      message: 'Waiting...',
      asrResult: '',
      visualizerSource: undefined
    };
  }

  componentDidMount() {
    this._wakewordController = new WakewordController();
    this._cognitiveHubClient = this.props.model.getCognitiveHubClientController();
    if (this._cognitiveHubClient) {
      this._cognitiveHubClient.connect();
      this._cognitiveHubClient.on('asrEnded', this.onAsrEnded);
    }
  }

  componentWillUnmount() {
    if (this._wakewordController) this._wakewordController.dispose();
    if (this._cognitiveHubClient) {
      this._cognitiveHubClient.disconnect();
      this._cognitiveHubClient.off('asrEnded', this.onAsrEnded);
    }
    this._cognitiveHubClient = undefined;
  }

  // parseAsrResults(results: any): any[] {
  //   let utterance: string = '';
  //   let hyoptheses: any[] = [];
  //   if (results && results.NBest) {
  //     hyoptheses = results.NBest;
  //     if (results.NBest[0]) {
  //       utterance = results.NBest[0].Display;
  //     }
  //   }

  //   this.setState({
  //     asrResult: utterance
  //   });
  //   return hyoptheses;
  // }

  // messageFromResults(results: any): string {
  //   const timeMessage: string = this._asrTimer ? `${this._asrTimer.name}: ${this._asrTimer.elapsedTime()} milliseconds` : '';
  //   const hypotheses = this.parseAsrResults(results);
  //   hypotheses.sort((a: AsrHypothesis, b: AsrHypothesis): number => {
  //     const confA = a.Confidence;
  //     const confB = b.Confidence;
  //     return confB - confA;
  //   });
  //   let hypothesesText = `${timeMessage}\n`;
  //   if (hypotheses) {
  //     hypotheses.forEach((hypothesis: AsrHypothesis) => {
  //       let text: string = `Confidence: ${hypothesis.Confidence}\nDisplay: ${hypothesis.Display}\nLexical: ${hypothesis.Lexical}\nITN: ${hypothesis.ITN}\nMaskedITN: ${hypothesis.MaskedITN}`;
  //       hypothesesText += text + '\n';
  //     });
  //   }
  //   const resultsText: string = JSON.stringify(results, null, 2);
  //   return hypothesesText + '\n' + resultsText;
  // }

  startAsr = () => {
    EarconManager.Instance().playTone(EarconTone.LISTEN_START);
    this._microphoneAudioSource = new MicrophoneAudioSource({
      targetSampleRate: 16000,
      monitorAudio: false,
      captureAudio: true,
    });
    this._audioSourceWaveStreamer = new AudioSourceWaveStreamer(this._microphoneAudioSource);

    if (this._cognitiveHubClient && this._cognitiveHubClient.connected) {
      this._cognitiveHubClient.audioStart();
      this._audioSourceWaveStreamer.readStream.on('readable', async () => {
        const data = this._audioSourceWaveStreamer ? this._audioSourceWaveStreamer.readStream.read() : undefined;
        if (data && this._cognitiveHubClient) {
          this._cognitiveHubClient.sendAudio(data);
        } else {
          console.log('CognitiveHub: startAsr(): NOT sending audio data. missing data or not connected.')
        }

      })

      this._audioSourceWaveStreamer.readStream.on('end', async () => {
        if (this._cognitiveHubClient) this._cognitiveHubClient.audioEnd();
        this.setState({
          visualizerSource: undefined
        }, () => {
          if (this._microphoneAudioSource) this._microphoneAudioSource.dispose();
          this._microphoneAudioSource = undefined;
        });
      })

      this.setState({
        message: `recording: started:`,
        visualizerSource: this._microphoneAudioSource
      });
      // timeout is not needed when using streaming ASR which provides EOS events
      // if (this._wakewordController && this._wakewordController.isRunning) {
      //   this._asrEosIntervalTimeout = setInterval(this.stopAsr, 3000);
      // }
    } else {
      console.log('startAsr: not connected');
    }
  }

  onAsrEnded = (results: any) => {
    console.log('onAsrEnded', results);
    let message = '';
    if (results) {
      try {
        // { text: 'Do you like Mac and cheese?', confidence: 0.96467835 }
        message = JSON.stringify(results, null, 2);
      } catch(error) {
        console.log(error);
        message = error;
      }
    }
    this.setState({
      message: message,
    }, () => {
    });
    this.stopAsr();
  }

  stopAsr = () => {
    if (this._asrEosIntervalTimeout) {
      clearInterval(this._asrEosIntervalTimeout);
      this._asrEosIntervalTimeout = undefined;
    }
    // this._asrTimer = new Timer('ASR Response Time');
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
          const audioData: Int16Array | undefined = this._microphoneAudioSource.audioData;
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
              // this._asrTimer = new Timer('ASR Response Time');
            });
            this._waveFileAudioSource.start();
            this._audioSourceWaveStreamer = new AudioSourceWaveStreamer(this._waveFileAudioSource);

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
            this._wakewordController.off('wakeword', this.startAsr);
            this._wakewordController.off('cancel', this.stopAsr);
          } else {
            this._wakewordController.start();
            this._wakewordController.on('wakeword', this.startAsr);
            this._wakewordController.on('cancel', this.stopAsr);
          }
        }
        break;
    }
  }

  render() {
    return (
      <div className="CognitiveHub">
        <div className='CognitiveHub-controls'>
          <AudioEqVisualizer audioDataSource={this.state.visualizerSource} options={{ w: 256, h: 50, tickWidth: 1 }} />
          <textarea className="CognitiveHub" value={this.state.message} readOnly rows={10} />
          <div className='CognitiveHub-row'>
            <input id='asrResult' type='text' className='form-control' placeholder='input' value={this.state.asrResult} readOnly />
          </div>
          <div className='CognitiveHub-row'>
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
          <div className='CognitiveHub-row'>
            <AudioWaveformVisualizer audioDataSource={this.state.visualizerSource} options={{ w: 256, h: 50, tickWidth: 1 }} />
          </div>
        </div>
      </div>
    );
  }
}

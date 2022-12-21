import React, { Component } from 'react';
import {
  AudioSourceWaveStreamer,
  WaveFileAudioSource,
  AudioSource,
  AudioSink,
  MicrophoneAudioSource,
  MicrophoneAudioSourceOptions,
  AudioUtils,
  AudioContextAudioSink,
} from 'cognitiveserviceslib';
import './CognitiveHub.css';
import AudioWaveformVisualizer from '../../components/AudioWaveformVisualizer/AudioWaveformVisualizer';
import AudioEqVisualizer from '../../components/AudioEqVisualizer/AudioEqVisualizer';
import Model from '../../model/Model';
import WakewordController from '../../audio/WakewordController';
import AudioFxManager, { AudioFxTone } from '../../audio/AudioFxManager';
import PathUtils from '../../utils/PathUtils';
// import Timer from '../../utils/Timer';
import CognitiveHubClientController from '../../model/CognitiveHubClientController'
import { TimeData } from 'robokit-command-system';
import Webcam from "react-webcam"

let fs: any;
// let path: any;
let dialog: any;

if (process.env.REACT_APP_MODE === 'electron') {
  fs = require('fs-extra');
  // path = require('path');
  dialog = require('electron').remote.dialog;
}

export interface CognitiveHubProps { model: Model }
export interface CognitiveHubState {
  message: string;
  asrResult: string;
  visualizerSource: AudioSource | AudioSink | undefined;
  synchronizedTimeString: string
  audioContextElapsedTime: number
  timeBgColor: string
  availableCameraDevices: any[]
  cameraDeviceId: string
  ttsInput: string
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

export default class CognitiveHub extends React.Component<CognitiveHubProps, CognitiveHubState> {

  private _microphoneAudioSource: MicrophoneAudioSource | undefined;
  private _waveFileAudioSource: WaveFileAudioSource | undefined;
  private _wakewordController: WakewordController | undefined;
  private _asrEosIntervalTimeout: NodeJS.Timeout | undefined;
  private _audioSourceWaveStreamer: AudioSourceWaveStreamer | undefined;
  // private _asrTimer: Timer;
  private _cognitiveHubClient: CognitiveHubClientController | undefined;
  private _webcamGetScreenshotFunction: any
  private _audioContextAudioSink: AudioContextAudioSink | undefined;

  constructor(props: CognitiveHubProps) {
    super(props);
    this.state = {
      message: 'Waiting...',
      asrResult: '',
      visualizerSource: undefined,
      synchronizedTimeString: 'TBD',
      audioContextElapsedTime: 0,
      timeBgColor: 'black',
      availableCameraDevices: [],
      cameraDeviceId: '',
      ttsInput: '',
    };
  }

  getAvailableCameraButtons = () => {
    const availableCameras: any[] = []
    navigator.mediaDevices.enumerateDevices().then((mediaDevices) => {
      // console.log(mediaDevices)
      mediaDevices.forEach((mediaDevice: any) => {
        if (mediaDevice.kind === 'videoinput') {
          const deviceId: string = mediaDevice.deviceId
          const deviceLabel: string = mediaDevice.label
          const button = <button className={`btn btn-primary App-button`} key={deviceId} onClick={() => this.onCameraSelected(deviceId)}>{deviceLabel.substring(0, 16)}</button>
          // deviceId: "84af885306903b6dfb9c4c95de6f33ef1364bfa075a40472456ad63d7815a0b6"
          // groupId: "e01b6babb6e41da1ec25835cdce7f3557a760e1d9abd5bd24a1256b36355d554"
          // kind: "videoinput"
          // label: "FaceTime HD Camera (Built-in) (05ac:8514)"
          availableCameras.push(button)
          if (deviceLabel.indexOf('Built-in') >= 0) {
            this.setState({ cameraDeviceId: deviceId })
          }
        }
      })
      this.setState({ availableCameraDevices: availableCameras })
    })
  }

  componentDidMount() {
    this._wakewordController = new WakewordController();
    this._cognitiveHubClient = this.props.model.getCognitiveHubClientController(true);
    if (this._cognitiveHubClient) {
      this._cognitiveHubClient.connect();
      this._cognitiveHubClient.on('asrEnded', this.onAsrEnded);
      this._cognitiveHubClient.on('clockUpdate', this.onClockUpdate);
      this._cognitiveHubClient.on('getBase64Photo', this.getBase64Photo);
      this._cognitiveHubClient.on('ttsAudioStart', this.onTtsAudioStart);
      this._cognitiveHubClient.on('ttsAudio', this.onTtsAudio);
      this._cognitiveHubClient.on('ttsAudioEnd', this.onTtsAudioEnd);
      this._cognitiveHubClient.on('ttsAudioError', this.onTtsAudioError);
    }
    this.getAvailableCameraButtons()
  }

  componentWillUnmount() {
    if (this._wakewordController) this._wakewordController.dispose();
    if (this._cognitiveHubClient) {
      this._cognitiveHubClient.dispose();
      this._cognitiveHubClient.off('asrEnded', this.onAsrEnded);
      this._cognitiveHubClient.off('clockUpdate', this.onClockUpdate);
      this._cognitiveHubClient.off('getBase64Photo', this.getBase64Photo);
      this._cognitiveHubClient.off('ttsAudioStart', this.onTtsAudioStart);
      this._cognitiveHubClient.off('ttsAudio', this.onTtsAudio);
      this._cognitiveHubClient.off('ttsAudioEnd', this.onTtsAudioEnd);
      this._cognitiveHubClient.off('ttsAudioError', this.onTtsAudioError);
      this._cognitiveHubClient = undefined;
    }
  }

  onClockUpdate = (data: any) => {
    // console.log(timeData)
    const timeData: TimeData = data.timeData
    const second = Math.round(timeData.synchronized / 1000)
    const timeBgColor = second % 2 === 0 ? 'black' : '#428bca'
    const audioContextElapsedTime = data.audioContextElapsedTime
    this.setState({
      synchronizedTimeString: timeData.simpleFormat,
      audioContextElapsedTime: audioContextElapsedTime,
      timeBgColor: timeBgColor
    })
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

  // ASR

  startAsr = () => {
    AudioFxManager.getInstance().playTone(AudioFxTone.LISTEN_START);
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
      console.log('startAsr: not connected', this._cognitiveHubClient);
    }
  }

  onAsrEnded = (results: any) => {
    console.log('onAsrEnded', results);
    let message = '';
    if (results) {
      try {
        // { text: 'Do you like Mac and cheese?', confidence: 0.96467835 }
        message = JSON.stringify(results, null, 2);
      } catch (error) {
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

    AudioFxManager.getInstance().playTone(AudioFxTone.LISTEN_STOP);
    if (this._microphoneAudioSource) {
      if (this._microphoneAudioSource.audioData) {
        let audioData = this._microphoneAudioSource.audioData;
        AudioUtils.writeAudioData16ToFile(audioData, PathUtils.resolve('audio-pcm-16'));
      }
    }
  }

  // TTS

  onTtsAudioStart = (data: any) => {
    if (this._audioContextAudioSink) this._audioContextAudioSink.dispose()
    this._audioContextAudioSink = new AudioContextAudioSink({
      sampleRate: 16000
    });
    // cleanup after audio is no longer needed, i.e. after playing it
    this._audioContextAudioSink.on('ended', () => {
      let audioData: Int16Array | undefined = this._audioContextAudioSink ? this._audioContextAudioSink.int16Data : undefined;
      if (audioData && this._audioContextAudioSink) {
        AudioUtils.writeAudioData16ToFile(audioData, PathUtils.resolve('audio_tts'));
        this._audioContextAudioSink.dispose();
        this._audioContextAudioSink = undefined;
      }
    });
  }

  onTtsAudio = (data: any) => {
    if (this._audioContextAudioSink) this._audioContextAudioSink.writeAudio(data);
  }

  onTtsAudioEnd = (data: any) => {
    if (this._audioContextAudioSink) this._audioContextAudioSink.play();
  }

  onTtsAudioError = (data: any) => {
    this._audioContextAudioSink?.dispose();
    this._audioContextAudioSink = undefined;
  }

  // Photo

  getBase64Photo = () => {
    if (this._webcamGetScreenshotFunction && this._cognitiveHubClient) {
      const base64PhotoData = this._webcamGetScreenshotFunction()
      this._cognitiveHubClient.sendBase64Photo(base64PhotoData)
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
      case 'btnTtsStart':
        this._cognitiveHubClient?.sendTTSCommand(this.state.ttsInput)
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
        AudioFxManager.getInstance().playTone(AudioFxTone.INITIALIZE);
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
      case 'btnPlayMidi':
        AudioFxManager.getInstance().playTone(AudioFxTone.LISTEN_START);
        const startAtTime = new Date().getTime()
        const scheduleOptions = {
          channelsToPlay: [4]
        }
        AudioFxManager.getInstance().playMidiFile('twinkle_twinkle_3_chan.mid', startAtTime, scheduleOptions); //('silent_night_easy.mid'); //('twinkle_twinkle.mid');
        break;
    }
  }

  onCameraSelected = (deviceId: string) => {
    this.setState({ cameraDeviceId: deviceId })
  }

  onChangeHandler = (event: any) => {
    const nativeEvent: any = event.nativeEvent;
    let updateObj: any = undefined;
    switch (nativeEvent.target.id) {
      case 'ttsInput':
        updateObj = { ttsInput: nativeEvent.target.value };
        break;
    }
    if (updateObj) {
      this.setState(updateObj);
    }
  }

  onBlurHandler = (event: any) => {
    // this.props.changed(this.state);
  }

  render() {
    const videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: "user",
      deviceId: this.state.cameraDeviceId
    }

    return (
      <div className="CognitiveHub">
        <div className='CognitiveHub-controls'>
          <AudioEqVisualizer audioDataSource={this.state.visualizerSource} options={{ w: 256, h: 50, tickWidth: 1 }} />
          <textarea className="CognitiveHub" value={this.state.message} readOnly rows={10} />
          <div className='CognitiveHub-row'>
            <input id='asrResult' type='text' className='form-control' placeholder='ASR/STT Transcript' value={this.state.asrResult} readOnly />
          </div>
          <div className='CognitiveHub-row'>
            <form className='form' role='form' onSubmit={(event: any) => { this.onButtonClicked('btnTtsStart', event) }}>
              <input id='ttsInput' type='text' className='form-control' placeholder='TTS Input' value={this.state.ttsInput} onChange={this.onChangeHandler} onBlur={this.onBlurHandler} />
            </form>
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
            <button id='btnTtsStart' type='button' className={`btn btn-primary App-button`}
              onClick={(event) => this.onButtonClicked(`btnTtsStart`, event)}>
              TtsStart
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
            <button id='btnPlayMidi' type='button' className={`btn btn-primary App-button`}
              onClick={(event) => this.onButtonClicked(`btnPlayMidi`, event)}>
              PlayMidi
            </button>
          </div>
          <div className='CognitiveHub-row'>
            <AudioWaveformVisualizer audioDataSource={this.state.visualizerSource} options={{ w: 256, h: 50, tickWidth: 1 }} />
          </div>
          <div className='CognitiveHub-time' style={{ backgroundColor: this.state.timeBgColor }}>
            {this.state.synchronizedTimeString}
          </div>
          <div className='CognitiveHub-time'>
            {this.state.audioContextElapsedTime}
          </div>
          <div className='CognitiveHub-row'>
            {this.state.availableCameraDevices}
          </div>
          <div className='CognitiveHub-row webcam'>
            <Webcam
              audio={false}
              height={720}
              screenshotFormat="image/jpeg"
              width={1280}
              videoConstraints={videoConstraints}
              mirrored={true}
            >
              {({ getScreenshot }) => {
                this._webcamGetScreenshotFunction = getScreenshot
                return <button className={`btn btn-primary App-button`}
                  onClick={() => {
                    const imageSrc = getScreenshot()
                    console.log(imageSrc)
                    if (imageSrc && this._cognitiveHubClient) {
                      this._cognitiveHubClient.sendBase64Photo(imageSrc);
                    }
                  }}
                >
                  Capture photo
                </button>
              }
              }
            </Webcam>
          </div>
        </div>
      </div>
    );
  }
}

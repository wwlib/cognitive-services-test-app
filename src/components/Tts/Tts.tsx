import React, { Component } from 'react';
import { 
  AudioSource,
  AudioSink,
  AudioContextAudioSink,
  AzureSpeechClient,
  AudioUtils,
} from 'cognitiveserviceslib';

import './Tts.css';
import AudioWaveformVisualizer from '../../components/AudioWaveformVisualizer/AudioWaveformVisualizer';
import AudioEqVisualizer from '../../components/AudioEqVisualizer/AudioEqVisualizer';
import Model from '../../model/Model';
import Log from '../../utils/Log';
import PathUtils from '../../utils/PathUtils';

let fs: any;
let path: any;
let app: any;
if (process.env.REACT_APP_MODE === 'electron') {
  fs = require('fs-extra');
  path = require('path');
  app = require('electron').remote.app;
}

interface ServiceCredentials {
  url: string;
  username: string;
  password: string;
  scope: string;
}

export interface TtsProps { model: Model }
export interface TtsState {
  ttsInput: string;
  message: string;
  visualizerSource: AudioSource | AudioSink | undefined;
}

export default class Tts extends React.Component<TtsProps, TtsState> {

  private _log: Log;

  private _azureSpeechClient: AzureSpeechClient;
  private _audioContextAudioSink: AudioContextAudioSink | undefined;

  private _onChangeHandler: any = (event: any) => this.onChangeHandler(event);
  private _onBlurHandler: any = (event: any) => this.onBlurHandler(event);

  constructor(props: TtsProps) {
    super(props);
    this._azureSpeechClient = new AzureSpeechClient(this.props.model.settings.json);
    this.state = {
      ttsInput: '',
      message: 'Waiting...',
      visualizerSource: undefined
    };
  }

  componentDidMount() {
  }

  onButtonClicked(action: string, event: any) {
    // console.log(`onButtonClicked: ${action}`);
    event.preventDefault();

    switch (action) {

      case 'btnTtsStart':
        this._audioContextAudioSink = new AudioContextAudioSink({
          sampleRate: 16000
        });
        this._audioContextAudioSink.on('ended', () => {
          let audioData: Int16Array | undefined = this._audioContextAudioSink ? this._audioContextAudioSink.int16Data : undefined;
          if (audioData && this._audioContextAudioSink) {
            AudioUtils.writeAudioData16ToFile(audioData, PathUtils.resolve('audio_tts'));
            this._audioContextAudioSink.dispose();
            this._audioContextAudioSink = undefined;
            this.setState({
              message: `tts: ended`,
              visualizerSource: undefined
            });
          }
        });
        this._azureSpeechClient.synthesizeStream(this.state.ttsInput)
          .then((audioStream: NodeJS.ReadableStream) => {
            console.log(audioStream);
            // const file = fs.createWriteStream(PathUtils.resolve('tts-out.wav'));
            // audioStream.pipe(file);
            audioStream.on('data', (data: any) => {
              console.log(`data:`, data);
              if (this._audioContextAudioSink) this._audioContextAudioSink.writeAudio(data);
            });
            audioStream.on('end', () => {
              console.log(`Tts: synthesizeStream: end`);
              if (this._audioContextAudioSink) this._audioContextAudioSink.play();
              this.setState({
                message: `tts: playing:`,
                visualizerSource: this._audioContextAudioSink
              });
            });
          })
          .catch((error) => {
            console.log(`Tts: synthesizeStream: error:`, error);
          });
        this.setState({
          message: `tts: started:`,
          visualizerSource: undefined
        });
        break;
    }
  }

  onChangeHandler(event: any) {
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

  onBlurHandler(event: any) {
    // this.props.changed(this.state);
  }

  render() {
    return (
      <div className="Tts">
        <AudioEqVisualizer audioDataSource={this.state.visualizerSource} options={{ w: 256, h: 50, tickWidth: 0.5 }} />
        <textarea className="Tts" value={this.state.message} readOnly rows={5} />
        <div className='Tts-row'>
          <form className='form' role='form' onSubmit={(event: any) => { this.onButtonClicked('btnTtsStart', event) }}>
            <input id='ttsInput' type='text' className='form-control' placeholder='input' value={this.state.ttsInput} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
          </form>
        </div>
        <div className='Tts-row'>
          <button id='btnTtsStart' type='button' className={`btn btn-primary App-button`}
            onClick={(event) => this.onButtonClicked(`btnTtsStart`, event)}>
            TtsStart
          </button>
        </div>
        <div className='Tts-row'>
          <AudioWaveformVisualizer audioDataSource={this.state.visualizerSource} options={{ w: 256, h: 50, tickWidth: 0.5 }} />
        </div>
      </div>
    );
  }
}

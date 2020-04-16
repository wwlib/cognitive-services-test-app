import React, { Component } from 'react';
import WaveFile from 'wavefile';
import './Tts.css';
import TtsController from '../../services/TtsController';
import AudioContextAudioSink from '../../audio/AudioContextAudioSink';
import AudioWaveformVisualizer from '../../components/AudioWaveformVisualizer/AudioWaveformVisualizer';
import AudioEqVisualizer from '../../components/AudioEqVisualizer/AudioEqVisualizer';
import AudioSource from '../../audio/AudioSource';
import AudioSink from '../../audio/AudioSink';

import Model from '../../model/Model';
import { AppSettingsOptions } from '../../model/AppSettings';
import Log from '../../utils/Log';

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

export interface TtsProps { model: Model }
export interface TtsState {
  settings: AppSettingsOptions;
  ttsInput: string;
  message: string;
  visualizerSource: AudioSource | AudioSink | undefined;
}

export default class Tts extends React.Component<TtsProps, TtsState> {

  private _log: Log;

  private _serviceCredentials: ServiceCredentials;
  private _ttsController: TtsController | undefined;
  private _audioContextAudioSink: AudioContextAudioSink | undefined;

  private _onChangeHandler: any = (event: any) => this.onChangeHandler(event);
  private _onBlurHandler: any = (event: any) => this.onBlurHandler(event);

  constructor(props: TtsProps) {
    super(props);
    this._serviceCredentials = {
      url: this.props.model.appSettings.authUrl,
      username: this.props.model.appSettings.authUsername,
      password: this.props.model.appSettings.authPassword,
      scope: this.props.model.appSettings.authScope,
    };
    this.state = {
      settings: this.props.model.appSettings.json,
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
          sampleRate: 22500
        });
        this._audioContextAudioSink.on('ended', () => {
          this._ttsController.dispose();
          this._ttsController = undefined;

          let audioData: Int16Array = this._audioContextAudioSink.int16Data
          // let bytesCaptured = audioData.length;
          let audioFile = path.resolve(basepath, 'audio_tts.raw');
          fs.writeFileSync(audioFile, Buffer.from(audioData.buffer));
          const wav = new WaveFile();
          wav.fromScratch(1, 22500, '16', audioData);
          let wavFile = path.resolve(basepath, 'audio_tts.wav');
          fs.writeFileSync(wavFile, wav.toBuffer());

          this._audioContextAudioSink.dispose();
          this._audioContextAudioSink = undefined;
          this.setState({
            message: `tts: stopped`,
            visualizerSource: undefined
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
        this._ttsController.start(this.state.ttsInput);
        this.setState({
          message: `tts: started:`,
          visualizerSource: this._audioContextAudioSink
        });
        break;
    }
  }

  onChangeHandler(event: any) {
    const nativeEvent: any = event.nativeEvent;
    // this.log.debug(nativeEvent);
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

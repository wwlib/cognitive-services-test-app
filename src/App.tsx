import React, { Component } from 'react';
import WaveFile from 'wavefile';
import './App.css';
import Logo from './components/Logo/Logo';
import MicrophoneAudioSource, { MicrophoneAudioSourceOptions } from './audio/MicrophoneAudioSource';
import WaveFileAudioSource, { WaveFileAudioSourceOptions } from './audio/WaveFileAudioSource';
import AsrController from './services/ASRController';
import TtsController from './services/TtsController';
import NluController, { NluResult, NluEntity } from './services/NluController';
import DialogController from './services/DialogController';
import AudioContextAudioSink from './audio/AudioContextAudioSink';
import AudioWaveformVisualizer from './components/AudioWaveformVisualizer/AudioWaveformVisualizer';
import AudioEqVisualizer from './components/AudioEqVisualizer/AudioEqVisualizer';
import AudioSource from './audio/AudioSource';
import AudioSink from './audio/AudioSink';

import Model from './model/Model';
import { AppSettingsOptions } from './model/AppSettings';
import Log from './utils/Log';

//panel components
import Settings from './components/Settings/Settings';
import Asr from './components/Asr/Asr';
import Nlu from './components/Nlu/Nlu';
import Tts from './components/Tts/Tts';
import Dialog from './components/Dialog/Dialog';

interface ServiceCredentials {
  url: string;
  username: string;
  password: string;
  scope: string;
}

let fs: any;
let path: any;
let app: any;
if (process.env.REACT_APP_MODE === 'electron') {
  fs = require('fs-extra');
  path = require('path');
  app = require('electron').remote.app;
}

const basepath = app.getAppPath();

export interface AppProps { model: Model }
export interface AppState {
  settings: AppSettingsOptions;
  activeTab: string;
  message: string;
  visualizerSource: AudioSource | AudioSink | undefined;
}

export default class App extends React.Component<AppProps, AppState> {

  private _log: Log;

  private _microphoneAudioSource: MicrophoneAudioSource | undefined;
  private _waveFileAudioSource: WaveFileAudioSource | undefined;
  private _serviceCredentials: ServiceCredentials;
  private _asrController: AsrController | undefined;
  private _ttsController: TtsController | undefined;
  private _nluController: NluController | undefined;
  private _dialogController: DialogController | undefined;
  private _audioContextAudioSink: AudioContextAudioSink | undefined;

  constructor(props: AppProps) {
    super(props);
    this._serviceCredentials = {
      url: '',
      username: '',
      password: '',
      scope: '',
    };
    this.state = {
      activeTab: 'Settings',
      settings: this.props.model.appSettings.json,
      message: 'Waiting...',
      visualizerSource: undefined
    };
  }

  componentDidMount() {
  }

  onTabButtonClicked(action: string, event: any) {
    event.preventDefault();
    switch (action) {
      case 'tabSettings':
        this.setState({ activeTab: 'Settings' });
        break;
      case 'tabAsr':
        this.setState({ activeTab: 'Asr' });
        break;
      case 'tabNlu':
        this.setState({ activeTab: 'Nlu' });
        break;
      case 'tabTts':
        this.setState({ activeTab: 'Tts' });
        break;
      case 'tabDialog':
        this.setState({ activeTab: 'Dialog' });
        break;
    }
  }

  onSettingsChanged(settings: AppSettingsOptions) {
    this.props.model.setAppParams(settings);
    this.setState({
      settings: this.props.model.appSettings.json
    })
  }

  // File Drop

  handleUploadFileList(fileList: any[]): void {
    console.log(`handleUploadFileList: `, fileList);
    let fileListLength: number = fileList.length;
    for (var i = 0; i < fileListLength; i++) {
      var file = fileList[i];
      this.handleUploadBlob(file);
    }
  }

  getFileExtension(filename: string) {
    var idx = filename.lastIndexOf('.');
    return (idx < 1) ? "" : filename.substr(idx + 1);
  }

  handleUploadBlob(file: any): void {
    console.log(`handleUploadBlob: `, file);
    let fileExtension: string = this.getFileExtension(file.name);
    switch (fileExtension) {
      case 'json':
        const jsonReader = new FileReader();
        jsonReader.onload = (event: any) => {
          const jsonText = event.target.result;
          try {
            const jsonObject = JSON.parse(jsonText);
            if (jsonObject.appId && jsonObject.appKey) {
              this._log.debug(`handleUploadBlob: settings:`, jsonObject);
              this.onSettingsChanged(jsonObject);
            }
          } catch (error) {
            this._log.error(`upload json: `, error);
          }
        }
        jsonReader.readAsText(file);
        break;
    }
  }

  getActiveTab(): any {
    let activeTab: any = null;
    switch (this.state.activeTab) {
      case 'Settings':
        activeTab =
          <Settings
            model={this.props.model}
            settings={this.state.settings}
            changed={(settings: AppSettingsOptions) => { this.onSettingsChanged(settings) }}
            fileHandler={(fileList: any[]) => this.handleUploadFileList(fileList)}
          />
        break;
      case 'Asr':
        activeTab =
          <Asr
            model={this.props.model}
          />
        break;
      case 'Nlu':
        activeTab =
          <Nlu
            model={this.props.model}
          />
        break;
      case 'Tts':
        activeTab =
          <Tts
            model={this.props.model}
          />
        break;
      case 'Dialog':
        activeTab =
          <Dialog
            model={this.props.model}
          />
        break;
    }
    return activeTab;
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Logo />
          <div className='App-nav-tabs'>
            <button id='btn_settings' type='button' className={`btn btn-info`}
              onClick={(event) => this.onTabButtonClicked(`tabSettings`, event)}>
              Settings
                </button>
            <button id='btn_asr' type='button' className='btn btn-primary'
              onClick={(event) => this.onTabButtonClicked(`tabAsr`, event)}>
              Asr
                </button>
            <button id='btn_nlu' type='button' className='btn btn-primary'
              onClick={(event) => this.onTabButtonClicked(`tabNlu`, event)}>
              Nlu
                </button>
            <button id='btn_tts' type='button' className='btn btn-primary'
              onClick={(event) => this.onTabButtonClicked(`tabTts`, event)}>
              Tts
                </button>
            <button id='btn_dialog' type='button' className='btn btn-primary'
              onClick={(event) => this.onTabButtonClicked(`tabDialog`, event)}>
              Dialog
                </button>
          </div>
        </header>
        <div className='Tabs'>
          {this.getActiveTab()}
        </div>
      </div>
    );
  }
}

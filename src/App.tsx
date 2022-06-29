import React, { Component } from 'react';
import { AudioSource, AudioSink } from 'cognitiveserviceslib';

import './App.css';
import Logo from './components/Logo/Logo';
import { AppSettingsOptions } from './model/AppSettings';
import Model from './model/Model';
import Log from './utils/Log';

//panel components
import Settings from './components/Settings/Settings';
import Asr from './components/Asr/Asr';
import AsrStreaming from './components/AsrStreaming/AsrStreaming';
import Nlu from './components/Nlu/Nlu';
import Tts from './components/Tts/Tts';
import CognitiveHub from './components/CognitiveHub/CognitiveHub';

let fs: any;
let path: any;
let app: any;
if (process.env.REACT_APP_MODE === 'electron') {
  fs = require('fs-extra');
  path = require('path');
  app = require('electron').remote.app;
}

export interface AppProps {
  model: Model
}

export interface AppState {
  settings: AppSettingsOptions;
  activeTab: string;
  message: string;
  visualizerSource: AudioSource | AudioSink | undefined;
}

export default class App extends React.Component<AppProps, AppState> {

  private _log: Log;

  constructor(props: AppProps) {
    super(props);
    this.state = {
      activeTab: 'Settings',
      settings: this.props.model.settings.json,
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
      case 'tabAsrStreaming':
        this.setState({ activeTab: 'AsrStreaming' });
        break;
      case 'tabNlu':
        this.setState({ activeTab: 'Nlu' });
        break;
      case 'tabTts':
        this.setState({ activeTab: 'Tts' });
        break;
      case 'tabCognitiveHub':
        this.setState({ activeTab: 'CognitiveHub' });
        break;
      case 'tabDialog':
        this.setState({ activeTab: 'Dialog' });
        break;
    }
  }

  onSettingsChanged(settings: AppSettingsOptions) {
    this.props.model.setAppSettings(settings);
    this.setState({
      settings: this.props.model.settings.json
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
      case 'AsrStreaming':
        activeTab =
          <AsrStreaming
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
      case 'CognitiveHub':
        activeTab =
          <CognitiveHub
            model={this.props.model}
          />
        break;
    }
    return activeTab;
  }

  getButtonStyle(buttonName: string): string {
    let style: string = 'btn btn-primary';
    if (buttonName === this.state.activeTab) {
      style = 'btn btn-info';
    }
    return style;
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Logo />
          <div className='App-nav-tabs'>
            <button id='btn_settings' type='button' className={this.getButtonStyle('Settings')}
              onClick={(event) => this.onTabButtonClicked(`tabSettings`, event)}>
              Settings
            </button>
            <button id='btn_asr' type='button' className={this.getButtonStyle('Asr')}
              onClick={(event) => this.onTabButtonClicked(`tabAsr`, event)}>
              AsrHTTP
            </button>
            <button id='btn_asr' type='button' className={this.getButtonStyle('AsrStreaming')}
              onClick={(event) => this.onTabButtonClicked(`tabAsrStreaming`, event)}>
              AsrStreaming
            </button>
            <button id='btn_nlu' type='button' className={this.getButtonStyle('Nlu')}
              onClick={(event) => this.onTabButtonClicked(`tabNlu`, event)}>
              Nlu
            </button>
            <button id='btn_tts' type='button' className={this.getButtonStyle('Tts')}
              onClick={(event) => this.onTabButtonClicked(`tabTts`, event)}>
              Tts
            </button>
            <button id='btn_tts' type='button' className={this.getButtonStyle('CognitiveHub')}
              onClick={(event) => this.onTabButtonClicked(`tabCognitiveHub`, event)}>
              CognitiveHub (Robokit)
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

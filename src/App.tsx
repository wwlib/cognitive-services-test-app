import React, { Component } from 'react';
import { AudioSource, AudioSink, CognitiveServicesConfigOptions } from 'cognitiveserviceslib';

import './App.css';
import Logo from './components/Logo/Logo';
import Model from './model/Model';
import Log from './utils/Log';

//panel components
import Settings from './components/Settings/Settings';
import Asr from './components/Asr/Asr';
import Nlu from './components/Nlu/Nlu';
import Tts from './components/Tts/Tts';

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

export interface AppProps { model: Model }
export interface AppState {
  settings: CognitiveServicesConfigOptions;
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
      settings: this.props.model.config.json,
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

  onSettingsChanged(settings: CognitiveServicesConfigOptions) {
    this.props.model.setAppParams(settings);
    this.setState({
      settings: this.props.model.config.json
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
            changed={(settings: CognitiveServicesConfigOptions) => { this.onSettingsChanged(settings) }}
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
              Asr
                </button>
            <button id='btn_nlu' type='button' className={this.getButtonStyle('Nlu')}
              onClick={(event) => this.onTabButtonClicked(`tabNlu`, event)}>
              Nlu
                </button>
            <button id='btn_tts' type='button' className={this.getButtonStyle('Tts')}
              onClick={(event) => this.onTabButtonClicked(`tabTts`, event)}>
              Tts
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

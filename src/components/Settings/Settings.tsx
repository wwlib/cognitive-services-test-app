import * as React from "react";
// import { CognitiveServicesConfigOptions } from 'cognitiveserviceslib';
import { AppSettingsOptions } from '../../model/AppSettings'

import './Settings.css';
import Model from '../../model/Model';
import Log from '../../utils/Log';
import parentLog from '../../log';
import FileDrop from '../FileDrop/FileDrop';

export interface SettingsProps { model: Model, settings: AppSettingsOptions, changed: any, fileHandler: any }
export interface SettingsState {
  AzureSpeechSubscriptionKey: string;
  AzureSpeechTokenEndpoint: string;
  AzureSpeechEndpointAsr: string;
  AzureSpeechEndpointTts: string;
  LuisEndpoint: string;
  LuisAppId: string;
  LuisSubscriptionKey: string;
  CognitiveHubServiceUrl: string;
  CognitiveHubAuthUrl: string;
  CognitiveHubUsername: string;
  CognitiveHubPassword: string;
}

export default class Settings extends React.Component<SettingsProps, SettingsState> {

  public log: Log;

  private _onChangeHandler: any = (event: any) => this.onChangeHandler(event);
  private _onBlurHandler: any = (event: any) => this.onBlurHandler(event);
  private _onCheckboxHandler: any = (event: any) => this.onCheckboxHandler(event);
  private _onOptionHandler: any = (event: any) => this.onOptionHandler(event);

  constructor(props: SettingsProps) {
    super(props);
    this.log = parentLog.createChild('App');
    console.log(`this.props.settings:`, this.props.settings);
    this.state = {
      AzureSpeechSubscriptionKey: this.props.settings.Microsoft.AzureSpeechSubscriptionKey,
      AzureSpeechTokenEndpoint: this.props.settings.Microsoft.AzureSpeechTokenEndpoint,
      AzureSpeechEndpointAsr: this.props.settings.Microsoft.AzureSpeechEndpointAsr,
      AzureSpeechEndpointTts: this.props.settings.Microsoft.AzureSpeechEndpointTts,
      LuisEndpoint: this.props.settings.Microsoft.LuisEndpoint,
      LuisAppId: this.props.settings.Microsoft.LuisAppId,
      LuisSubscriptionKey: this.props.settings.Microsoft.LuisSubscriptionKey,
      CognitiveHubServiceUrl: this.props.settings.CognitiveHub.serviceUrl,
      CognitiveHubAuthUrl: this.props.settings.CognitiveHub.authUrl,
      CognitiveHubUsername: this.props.settings.CognitiveHub.username,
      CognitiveHubPassword: this.props.settings.CognitiveHub.password,
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.setSDKVersionField()
  }

  componentWillReceiveProps(nextProps: SettingsProps) {
    // console.log(nextProps);
    if (true) {
      this.setState({
        AzureSpeechSubscriptionKey: nextProps.settings.Microsoft.AzureSpeechSubscriptionKey,
        AzureSpeechTokenEndpoint: nextProps.settings.Microsoft.AzureSpeechTokenEndpoint,
        AzureSpeechEndpointAsr: nextProps.settings.Microsoft.AzureSpeechEndpointAsr,
        AzureSpeechEndpointTts: nextProps.settings.Microsoft.AzureSpeechEndpointTts,
        LuisEndpoint: nextProps.settings.Microsoft.LuisEndpoint,
        LuisAppId: nextProps.settings.Microsoft.LuisAppId,
        LuisSubscriptionKey: nextProps.settings.Microsoft.LuisSubscriptionKey,
        CognitiveHubServiceUrl: nextProps.settings.CognitiveHub.serviceUrl,
        CognitiveHubAuthUrl: nextProps.settings.CognitiveHub.authUrl,
        CognitiveHubUsername: nextProps.settings.CognitiveHub.username,
        CognitiveHubPassword: nextProps.settings.CognitiveHub.password,
      })
    }
  }

  setSDKVersionField() {
  }

  onKeyPress(event: any) {
    event.preventDefault();
    let nativeEvent: any = event.nativeEvent;
    if (nativeEvent.key == 'Enter') {
      // TBD
    }
  }

  onChangeHandler(event: any) {
    const nativeEvent: any = event.nativeEvent;
    // this.log.debug(nativeEvent);
    let updateObj: any = undefined;
    switch (nativeEvent.target.id) {
      case 'AzureSpeechSubscriptionKey':
        updateObj = { AzureSpeechSubscriptionKey: nativeEvent.target.value };
        break;
      case 'AzureSpeechTokenEndpoint':
        updateObj = { AzureSpeechTokenEndpoint: nativeEvent.target.value };
        break;
      case 'AzureSpeechEndpointAsr':
        updateObj = { AzureSpeechEndpointAsr: nativeEvent.target.value };
        break;
      case 'AzureSpeechEndpointTts':
        updateObj = { AzureSpeechEndpointTts: nativeEvent.target.value };
        break;
      case 'LuisEndpoint':
        updateObj = { LuisEndpoint: nativeEvent.target.value };
        break;
      case 'LuisAppId':
        updateObj = { LuisAppId: nativeEvent.target.value };
        break;
      case 'LuisSubscriptionKey':
        updateObj = { LuisSubscriptionKey: nativeEvent.target.value };
        break;
      case 'CognitiveHubServiceUrl':
        updateObj = { CognitiveHubServiceUrl: nativeEvent.target.value };
        break;
      case 'CognitiveHubAuthUrl':
        updateObj = { CognitiveHubAuthUrl: nativeEvent.target.value };
        break;
      case 'CognitiveHubUsername':
        updateObj = { CognitiveHubUsername: nativeEvent.target.value };
        break;
      case 'CognitiveHubPassword':
        updateObj = { CognitiveHubPassword: nativeEvent.target.value };
        break;
    }

    if (updateObj) {
      this.setState(updateObj);
    }
  }

  onBlurHandler(event: any) {
    this.props.changed({
      Microsoft: {
        AzureSpeechSubscriptionKey: this.state.AzureSpeechSubscriptionKey,
        AzureSpeechTokenEndpoint: this.state.AzureSpeechTokenEndpoint,
        AzureSpeechEndpointAsr: this.state.AzureSpeechEndpointAsr,
        AzureSpeechEndpointTts: this.state.AzureSpeechEndpointTts,
        LuisEndpoint: this.state.LuisEndpoint,
        LuisAppId: this.state.LuisAppId,
        LuisSubscriptionKey: this.state.LuisSubscriptionKey,
      },
      CognitiveHub: {
        serviceUrl: this.state.CognitiveHubServiceUrl,
        authUrl: this.state.CognitiveHubAuthUrl,
        username: this.state.CognitiveHubUsername,
        password: this.state.CognitiveHubPassword,
      }
    });
  }

  onCheckboxHandler(event: any) {
    const nativeEvent: any = event.nativeEvent;
    // this.log.debug(`onCheckboxHandler:`, nativeEvent);
    let updateObj: any = undefined;
    switch (nativeEvent.target.id) {
      case 'tbd':
        updateObj = { tbd: nativeEvent.target.checked };
        break;
    }
    if (updateObj) {
      this.setState(updateObj);
    }
  }

  onOptionHandler(event: any) {
    const nativeEvent: any = event.nativeEvent;
    this.log.debug(`onOptionHandler:`, nativeEvent);
    let updateObj: any = undefined;
    switch (nativeEvent.target.id) {
      case 'tbd':
        updateObj = { appName: nativeEvent.target.value };
        break;
    }

    if (updateObj) {
      this.setState(updateObj);
    }
  }

  handleFileDrop(fileList: any, event: any): void {
    this.props.fileHandler(fileList, null);
  }

  handleDragOver(event: any) {
  }

  render() {
    return (
      <div className='Settings'>
        <FileDrop className='FileDrop' targetClassName='FileDropTarget'
          onDrop={(fileList: any, event: any) => this.handleFileDrop(fileList, event)}
          onDragOver={(event: any) => this.handleDragOver(event)}>


          <div className='SettingsGroup'>
            <div className="SettingsItem">
              <label htmlFor="AzureSpeechSubscriptionKey" className="col-form-label">AzureSpeechSubscriptionKey</label>
              <input id="AzureSpeechSubscriptionKey" type="password" className="form-control" placeholder="" value={this.state.AzureSpeechSubscriptionKey} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
            </div>
            <div className="SettingsItem">
              <label htmlFor="AzureSpeechTokenEndpoint" className="col-form-label">AzureSpeechTokenEndpoint</label>
              <input id="AzureSpeechTokenEndpoint" type="text" className="form-control" placeholder="" value={this.state.AzureSpeechTokenEndpoint} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
            </div>
            <div className="SettingsItem">
              <label htmlFor="AzureSpeechEndpointAsr" className="col-form-label">AzureSpeechEndpointAsr</label>
              <input id="AzureSpeechEndpointAsr" type="text" className="form-control" placeholder="" value={this.state.AzureSpeechEndpointAsr} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
            </div>
            <div className="SettingsItem">
              <label htmlFor="AzureSpeechEndpointTts" className="col-form-label">AzureSpeechEndpointTts</label>
              <input id="AzureSpeechEndpointTts" type="text" className="form-control" placeholder="" value={this.state.AzureSpeechEndpointTts} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
            </div>

            <div className="SettingsItem">
              <label htmlFor="LuisEndpoint" className="col-form-label">LuisEndpoint</label>
              <input id="LuisEndpoint" type="text" className="form-control" placeholder="" value={this.state.LuisEndpoint} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
            </div>
            <div className="SettingsItem">
              <label htmlFor="LuisAppId" className="col-form-label">LuisAppId</label>
              <input id="LuisAppId" type="password" className="form-control" placeholder="" value={this.state.LuisAppId} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
            </div>
            <div className="SettingsItem">
              <label htmlFor="LuisSubscriptionKey" className="col-form-label">LuisSubscriptionKey</label>
              <input id="LuisSubscriptionKey" type="password" className="form-control" placeholder="" value={this.state.LuisSubscriptionKey} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
            </div>
            <div className="SettingsItem">
              <label htmlFor="CognitiveHubServiceUrl" className="col-form-label">CognitiveHubServiceUrl</label>
              <input id="CognitiveHubServiceUrl" type="text" className="form-control" placeholder="" value={this.state.CognitiveHubServiceUrl} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
            </div>
            <div className="SettingsItem">
              <label htmlFor="CognitiveHubAuthUrl" className="col-form-label">CognitiveHubAuthUrl</label>
              <input id="CognitiveHubAuthUrl" type="text" className="form-control" placeholder="" value={this.state.CognitiveHubAuthUrl} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
            </div>
            <div className="SettingsItem">
              <label htmlFor="CognitiveHubUsername" className="col-form-label">CognitiveHubUsername</label>
              <input id="CognitiveHubUsername" type="text" className="form-control" placeholder="" value={this.state.CognitiveHubUsername} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
            </div>
            <div className="SettingsItem">
              <label htmlFor="CognitiveHubPassword" className="col-form-label">CognitiveHubPassword</label>
              <input id="CognitiveHubPassword" type="password" className="form-control" placeholder="" value={this.state.CognitiveHubPassword} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
            </div>
          </div>


        </FileDrop>
      </div>
    );
  }
}

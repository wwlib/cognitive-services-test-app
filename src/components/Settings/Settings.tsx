import * as React from "react";
import './Settings.css';
import Model from '../../model/Model';
import Log from '../../utils/Log';
import parentLog from '../../log';
import { AppSettingsOptions } from '../../model/AppSettings';
import FileDrop from '../FileDrop/FileDrop';

export interface SettingsProps { model: Model, settings: AppSettingsOptions, changed: any, fileHandler: any }
export interface SettingsState {
  authUrl: string;
  authApiKey: string;
  authUsername: string;
  authPassword: string;
  authScope: string;

  modelProjectId: string;
  baseApiUrl: string;

  dialogModelRef: string;
  dialogChannel: string;
  dialogLanguage: string;
  dialogLibrary: string;

  asrLanguage: string;
  asrClientCompany: string;
  asrClientUser: string;

  nluId: string;
  nluType: string;
  nluUri: string;

  ttsVoiceName: string;
  ttsSpeakingRatePercentage: number;
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
    this.state = {
      authUrl: this.props.settings.authUrl,
      authApiKey: this.props.settings.authApiKey,
      authUsername: this.props.settings.authUsername,
      authPassword: this.props.settings.authPassword,
      authScope: this.props.settings.authScope,

      modelProjectId: this.props.settings.modelProjectId,
      baseApiUrl: this.props.settings.baseApiUrl,

      dialogModelRef: this.props.settings.dialogModelRef,
      dialogChannel: this.props.settings.dialogChannel,
      dialogLanguage: this.props.settings.dialogLanguage,
      dialogLibrary: this.props.settings.dialogLibrary,

      asrLanguage: this.props.settings.asrLanguage,
      asrClientCompany: this.props.settings.asrClientCompany,
      asrClientUser: this.props.settings.asrClientUser,

      nluId: this.props.settings.nluId,
      nluType: this.props.settings.nluType,
      nluUri: this.props.settings.nluUri,

      ttsVoiceName: this.props.settings.ttsVoiceName,
      ttsSpeakingRatePercentage: this.props.settings.ttsSpeakingRatePercentage,
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
        authUrl: nextProps.settings.authUrl,
        authApiKey: nextProps.settings.authApiKey,
        authUsername: nextProps.settings.authUsername,
        authPassword: nextProps.settings.authPassword,
        authScope: nextProps.settings.authScope,

        modelProjectId: nextProps.settings.modelProjectId,
        baseApiUrl: nextProps.settings.baseApiUrl,

        dialogModelRef: nextProps.settings.dialogModelRef,
        dialogChannel: nextProps.settings.dialogChannel,
        dialogLanguage: nextProps.settings.dialogLanguage,
        dialogLibrary: nextProps.settings.dialogLibrary,

        asrLanguage: nextProps.settings.asrLanguage,
        asrClientCompany: nextProps.settings.asrClientCompany,
        asrClientUser: nextProps.settings.asrClientUser,

        nluId: nextProps.settings.nluId,
        nluType: nextProps.settings.nluType,
        nluUri: nextProps.settings.nluUri,

        ttsVoiceName: nextProps.settings.ttsVoiceName,
        ttsSpeakingRatePercentage: nextProps.settings.ttsSpeakingRatePercentage,
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
      case 'authUrl':
        updateObj = { authUrl: nativeEvent.target.value };
        break;
      case 'authApiKey':
        updateObj = { authApiKey: nativeEvent.target.value };
        break;
      case 'authUsername':
        updateObj = { authUsername: nativeEvent.target.value };
        break;
      case 'authPassword':
        updateObj = { authPassword: nativeEvent.target.value };
        break;
      case 'authScope':
        updateObj = { authScope: nativeEvent.target.value };
        break;
      case 'modelProjectId':
        updateObj = { modelProjectId: nativeEvent.target.value };
        break;
      case 'baseApiUrl': // model version
        updateObj = { baseApiUrl: nativeEvent.target.value };
        break;
      case 'dialogModelRef': // readonly
        updateObj = { dialogModelRef: nativeEvent.target.value };
        break;
      case 'dialogChannel': // readonly
        updateObj = { dialogChannel: nativeEvent.target.value };
        break;
      case 'dialogLanguage': // readonly
        updateObj = { dialogLanguage: nativeEvent.target.value };
        break;
      case 'dialogLibrary': // readonly
        updateObj = { dialogLibrary: nativeEvent.target.value };
        break;
      case 'asrLanguage': // readonly
        updateObj = { asrLanguage: nativeEvent.target.value };
        break;
      case 'asrClientCompany': // readonly
        updateObj = { asrClientCompany: nativeEvent.target.value };
        break;
      case 'asrClientUser': // readonly
        updateObj = { asrClientUser: nativeEvent.target.value };
        break;
      case 'nluId': // readonly
        updateObj = { nluId: nativeEvent.target.value };
        break;
      case 'nluType': // readonly
        updateObj = { nluType: nativeEvent.target.value };
        break;
      case 'nluUri': // readonly
        updateObj = { nluUri: nativeEvent.target.value };
        break;
      case 'ttsVoiceName': // readonly
        updateObj = { ttsVoiceName: nativeEvent.target.value };
        break;
      case 'ttsSpeakingRatePercentage': // readonly
        updateObj = { ttsSpeakingRatePercentage: nativeEvent.target.value };
        break;
    }

    if (updateObj) {
      this.setState(updateObj);
    }
  }

  onBlurHandler(event: any) {
    this.props.changed(this.state);
  }

  onCheckboxHandler(event: any) {
    const nativeEvent: any = event.nativeEvent;
    // this.log.debug(`onCheckboxHandler:`, nativeEvent);
    let updateObj: any = undefined;
    switch (nativeEvent.target.id) {
      case 'dmva_mode':
        updateObj = { dmvaMode: nativeEvent.target.checked };
        break;
      case 'secret_mode':
        updateObj = { secretMode: nativeEvent.target.checked };
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
      case 'app_name_selector':
        updateObj = { appName: nativeEvent.target.value };
        break;
      case 'timezone_selector':
        updateObj = { timeZone: nativeEvent.target.value };
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
          <div className='panel-body'>
            <form>
              <div className='Settings-group'>
                <div className="col-sm-6">
                  <label htmlFor="authUrl" className="col-form-label">authUrl</label>
                  <input id="authUrl" type="text" className="form-control" placeholder="" value={this.state.authUrl} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
                </div>
                <div className="col-sm-6">
                  <label htmlFor="authApiKey" className="col-form-label">authApiKey</label>
                  <input id="authApiKey" type="text" className="form-control" value={this.state.authApiKey} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
                </div>
                <div className="col-sm-6">
                  <label htmlFor="authUsername" className="col-form-label">authUsername</label>
                  <input id="authUsername" type="text" className="form-control" value={this.state.authUsername} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
                </div>

                <div className="col-sm-6">
                  <label htmlFor="authPassword" className="col-form-label">authPassword</label>
                  <input id="authPassword" type="text" className="form-control" value={this.state.authPassword} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
                </div>
                <div className="col-sm-6">
                  <label htmlFor="authScope" className="col-form-label">authScope</label>
                  <input id="authScope" type="text" className="form-control" placeholder="nlu" value={this.state.authScope} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
                </div>
              </div>

              <div className='Settings-group'>
                <div className="col-sm-6">
                  <label htmlFor="dialogModelRef" className="col-form-label">dialogModelRef</label>
                  <input id="dialogModelRef" type="text" className="form-control" value={this.state.dialogModelRef} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
                </div>
              </div>

              <div className='Settings-group'>
                <div className="col-sm-6">
                  <label htmlFor="nluUri" className="col-form-label">nluUri</label>
                  <input id="nluUri" type="text" className="form-control" value={this.state.nluUri} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
                </div>
              </div>
            </form>
          </div>
        </FileDrop>
      </div>
    );
  }
}

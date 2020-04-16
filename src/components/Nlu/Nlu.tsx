import React, { Component } from 'react';
import './Nlu.css';
import NluController, { NluResult, NluEntity } from '../../services/NluController';

import Model from '../../model/Model';
import { AppSettingsOptions } from '../../model/AppSettings';
import Log from '../../utils/Log';

interface ServiceCredentials {
  url: string;
  username: string;
  password: string;
  scope: string;
}

export interface NluProps { model: Model }
export interface NluState {
  settings: AppSettingsOptions;
  nluInput: string;
  message: string;
}

export default class Nlu extends React.Component<NluProps, NluState> {

  private _log: Log;

  private _serviceCredentials: ServiceCredentials;
  private _nluController: NluController | undefined;

  private _onChangeHandler: any = (event: any) => this.onChangeHandler(event);
  private _onBlurHandler: any = (event: any) => this.onBlurHandler(event);

  constructor(props: NluProps) {
    super(props);
    this._serviceCredentials = {
      url: this.props.model.appSettings.authUrl,
      username: this.props.model.appSettings.authUsername,
      password: this.props.model.appSettings.authPassword,
      scope: this.props.model.appSettings.authScope,
    };
    this.state = {
      settings: this.props.model.appSettings.json,
      nluInput: '',
      message: 'Waiting...',
    };
  }

  componentDidMount() {
  }

  onButtonClicked(action: string, event: any) {
    // console.log(`onButtonClicked: ${action}`);
    event.preventDefault();

    switch (action) {
      case 'btnNluStart':
        this._nluController = new NluController(this._serviceCredentials);
        this._nluController.on('data', (data: any) => {
          console.log(`on data:`, data);
        });
        this._nluController.on('end', () => {
          console.log(`on end`);
        });
        this._nluController.on('done', (data: any) => {
          console.log(`*** DONE ***`);
          console.log(JSON.stringify(data.nluResult, null, 2));
          const output: string = JSON.stringify(data.nluResult, null, 2);
          this.setState({
            message: output
          });
          this._nluController.dispose();
          this._nluController = undefined;
        });
        this._nluController.start(this.state.nluInput, this.props.model.appSettings.nluId, this.props.model.appSettings.nluType, this.props.model.appSettings.nluUri);
        this.setState({
          message: `nlu: started`
        });
        break;
    }
  }

  onChangeHandler(event: any) {
    const nativeEvent: any = event.nativeEvent;
    // this.log.debug(nativeEvent);
    let updateObj: any = undefined;
    switch (nativeEvent.target.id) {
      case 'nluInput':
        updateObj = { nluInput: nativeEvent.target.value };
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
      <div className="Nlu">
        <textarea className="Nlu" value={this.state.message} readOnly rows={10} />
        <form className='form' role='form' onSubmit={(event: any) => { this.onButtonClicked('btnNluStart', event) }}>
          <div className='Nlu-row'>
            <input id='nluInput' type='text' className='form-control' placeholder='input' value={this.state.nluInput} onChange={this._onChangeHandler} onBlur={this._onBlurHandler} />
          </div>
        </form>
        <div className='Nlu-row'>
          <button id='btnNluStart' type='button' className={`btn btn-primary App-button`}
            onClick={(event) => this.onButtonClicked(`btnNluStart`, event)}>
            NlusStart
          </button>
        </div>
      </div>
    );
  }
}

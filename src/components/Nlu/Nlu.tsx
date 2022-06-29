import React, { Component } from 'react';
import { LUISController } from 'cognitiveserviceslib';

import './Nlu.css';
import Model from '../../model/Model';
import Log from '../../utils/Log';

interface ServiceCredentials {
  url: string;
  username: string;
  password: string;
  scope: string;
}

export interface NluProps { model: Model }
export interface NluState {
  nluInput: string;
  message: string;
}

export default class Nlu extends React.Component<NluProps, NluState> {

  private _log: Log;

  private _nluController: LUISController;

  private _onChangeHandler: any = (event: any) => this.onChangeHandler(event);
  private _onBlurHandler: any = (event: any) => this.onBlurHandler(event);

  constructor(props: NluProps) {
    super(props);
    this._nluController = new LUISController(this.props.model.settings.json);
    this.state = {
      // settings: this.props.model.config.json,
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
        let timeLog: any = {
          timeStart: new Date().getTime(),
        }
        const token = this._nluController.getIntentAndEntities(this.state.nluInput);
        if (token.complete) token.complete
          .then((intentAndEntities) => {
            timeLog.complete = new Date().getTime();
            timeLog.cloudLatency = timeLog.complete - timeLog.timeStart;
            const messageData: any = {
              timeLog,
              intentAndEntities,
            }
            const message: string = JSON.stringify(messageData, null, 2);
            this.setState({
              message: message
            });
          })
          .catch((error) => {
            this.setState({
              message: error
            });
          });
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

import { EventEmitter } from 'events';

// const path = require('path');
// const grpc = require('grpc');
// const protoLoader = require('@grpc/proto-loader');
// const protobufjs = require("protobufjs");
// const app = require('electron').remote.app

interface ServiceCredentials {
  url: string;
  username: string;
  password: string;
  scope: string;
}

export interface DialogControllerOptions {
  modelRef: string;
  channel: string;
  language: string;
  library: string;
}

export interface DialogResult {

}

export default class DialogController extends EventEmitter {

  public StartRequest: any;
  public ExecuteRequest: any;
  public StopRequest: any;

  private _serviceCredentials: ServiceCredentials;
  private _options: DialogControllerOptions
  private _dialog: any;
  private _stub: any;
  private _call: any;
  private _call2: any;
  private _call3: any;
  private _sessionId: string;

  constructor(serviceCredentials: ServiceCredentials, options: DialogControllerOptions) {
    super();
    this._serviceCredentials = serviceCredentials;
    this._options = options;
    this._sessionId = this.generateSessionId();
    this.setupGrpc();
  }

  async start() {
    console.log('DialogController: start');
    return null;
  }

  stop() {
    console.log('DialogController: stop');
  }

  execute(input: string) {
  }

  setupGrpc() {
  }

  async instantiateDialogaas() {
    return null;
  }

  generateSessionId() {
    let ts = Date.now();
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    // current hours
    let hours = date_ob.getHours();
    // current minutes
    let minutes = date_ob.getMinutes();
    // current seconds
    let seconds = date_ob.getSeconds();
    return "session" + year + month + date + hours + minutes + seconds;
  }

  dispose() {
    // this.stop();
    this.removeAllListeners();
  }

}

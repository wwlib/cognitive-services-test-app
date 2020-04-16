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

export default class TtsController extends EventEmitter {

  public GetVoicesRequest: any;
  public SynthesisRequest: any;

  private _serviceCredentials: ServiceCredentials;
  private _tts: any;
  private _stub: any;
  private _call: any;

  constructor(serviceCredentials: ServiceCredentials) {
    super();
    this._serviceCredentials = serviceCredentials;
    this.setupGrpc();
  }

  async start(prompt: string) {
    console.log('TtsController: start');
    return null;
  }

  stop() {
    console.log('TtsController: stop');
  }

  setupGrpc() {
  }

  async instantiateTtsaas() {
    return null;
  }

  dispose() {
    // this.stop();
    this.removeAllListeners();
  }

}

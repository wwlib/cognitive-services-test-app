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

export interface NluEntity {
  name: string;
  value: string;
}

export interface NluResult {
  intent: string;
  entity: NluEntity;
}

export default class NluController extends EventEmitter {

  public InterpretRequest: any;
  public InterpretationInput: any;
  public ResourceReference: any;

  private _serviceCredentials: ServiceCredentials;
  private _nlu: any;
  private _stub: any;
  private _call: any;

  constructor(serviceCredentials: ServiceCredentials) {
    super();
    this._serviceCredentials = serviceCredentials;
    this.setupGrpc();
  }

  async start(utterance: string, modelId: string, modelType: string, modelUri: string) {
    console.log('NluController: start');
    return null;
  }

  stop() {
    console.log('NluController: stop');
  }

  setupGrpc() {
  }

  async instantiateNluaas() {
    return null;
  }

  dispose() {
    // this.stop();
    this.removeAllListeners();
  }

}

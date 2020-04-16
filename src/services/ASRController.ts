import { EventEmitter } from 'events';
import AudioSource from '../audio/AudioSource';

interface ServiceCredentials {
  url: string;
  username: string;
  password: string;
  scope: string;
}

// const path = require('path');
// const grpc = require('grpc');
// const protoLoader = require('@grpc/proto-loader');
// const protobufjs = require("protobufjs");
// const app = require('electron').remote.app

export default class ASRController extends EventEmitter {

  public RecognizeInitMessage: any;
  public RecognizeRequest: any;
  public PCM: any;
  public AudioFormat: any;

  private _serviceCredentials: ServiceCredentials;
  private _audioSource: AudioSource;
  private _asr: any;
  private _stub: any;
  private _call: any;
  private _onAudioHandler: any;

  constructor(serviceCredentials: ServiceCredentials, audioSource: AudioSource) {
    super();
    this._serviceCredentials = serviceCredentials;
    this._audioSource = audioSource;
    this._onAudioHandler = this.onAudio.bind(this);
    this.setupGrpc();
  }

  async start() {
    return null
  }

  stop() {
    console.log('AsrController: stop');
  }

  onAudio(audio: Int16Array) {
  }

  setupGrpc() {
  }

  async instantiateAsraas() {
    return null;
  }

  dispose() {
    this.stop();
    this.removeAllListeners();
  }

}

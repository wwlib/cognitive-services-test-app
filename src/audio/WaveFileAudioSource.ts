import AudioSource from './AudioSource';
import { getBytesFromAudio16Buffer } from './AudioUtils';

const fs = require('fs');
const WaveFile = require('wavefile');

declare const global: {
  Resampler: any;
}

export interface WaveFileAudioSourceOptions {
  filename: string;
  sampleRate?: number;
  monitorAudio?: boolean;
  captureAudio?: boolean;
}

export default class WaveFileAudioSource extends AudioSource {

  // private _audioContext: AudioContext = new AudioContext();
  private _sampleRate = 16000;
  private _monitorAudio: boolean = false;
  private _captureAudio: boolean = false;
  private _filename: string = '';
  private _audioData: Int16Array = new Int16Array(0);
  private _wav: any | undefined;
  private _interval: NodeJS.Timeout | undefined;


  constructor(options: WaveFileAudioSourceOptions) {
    super();

    if (!options || !options.filename) {
      throw new Error('valid filename must be specified in the options');
    }
    this._sampleRate = options.sampleRate || this._sampleRate;
    this._monitorAudio = options.monitorAudio || this._monitorAudio;
    this._captureAudio = options.captureAudio || this._captureAudio
    this._filename = options.filename || '';
    this._wav = new WaveFile(fs.readFileSync(this._filename));
    console.log(this._wav);
    if (!(this._wav.fmt.sampleRate == 16000 && this._wav.fmt.bitsPerSample == 16)) {
      throw new Error(`Unsupported format.`);
    }

    const packetDuration = 0.020;
    const packetMilliseconds = packetDuration * 1000;
    const samplesPerPacket = this._sampleRate * packetDuration;
    const bytesPerSample = 2;
    const bytesPerPacket = samplesPerPacket * bytesPerSample;
    const byteCount = this._wav.chunkSize; // 24675
    const sampleCount = byteCount / bytesPerSample; // 49350
    const packetCount = byteCount / bytesPerPacket;
    let packetNum = 0;

    // console.log(`samplesPerPacket: ${samplesPerPacket}, bytesPerPacket: ${bytesPerPacket}, packetCount: ${packetCount}`);
    this._interval = setInterval(() => {
      const startSample = packetNum * samplesPerPacket;
      //console.log(packetNum, startSample);
      const packetBytes = getBytesFromAudio16Buffer(this._wav.data.samples, packetNum * samplesPerPacket, samplesPerPacket);
      packetNum++;
      //console.log(packetBytes);
      
      if (packetNum < packetCount) {
        this.sendAudio(new Int16Array(packetBytes));
      } else {
        if (this._interval) {
          clearInterval(this._interval);
          this._interval = undefined;
        }
        this.emit('done');
        // console.log('...done');
      }
    }, packetMilliseconds);

  }

  get audioData(): Int16Array | undefined {
    this._captureAudio = false;
    this._monitorAudio = false;
    return this._audioData;
  }

  dispose() {
    super.dispose();
    this._wav = undefined;
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = undefined;
    }
  }

}
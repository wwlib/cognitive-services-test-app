// https://github.com/Picovoice/Porcupine
// https://github.com/Picovoice/Porcupine/tree/master/resources/keyword_files
//   xxd -i -g 1 resources/keyword_files/wasm/americano_wasm.ppn
//   https://github.com/Picovoice/porcupine/tree/0507c5250b50d0a938b714ba604819d61fc9e602/resources/keyword_files
//     dragonfly
//   https://github.com/Picovoice/porcupine/tree/8124a4230824576c256d6a298ba51983397dd520/resources/keyword_files
//     all the wasm versions (25)
// https://github.com/Picovoice/Porcupine/issues/118
// 

import { EventEmitter } from 'events';

declare const PicovoiceAudioManager: any;
declare const Porcupine: any;

const keywordIDs: any = {
  'orange': new Uint8Array([
    0xd2, 0xe8, 0xe8, 0xbc, 0xee, 0x44, 0xd1, 0xc7, 0x8c, 0x96, 0x78, 0x04,
    0x68, 0x4c, 0x21, 0x17, 0xd9, 0x2e, 0x8e, 0xd3, 0xa1, 0xf8, 0xad, 0x48,
    0xd8, 0x3a, 0x52, 0x37, 0x0a, 0xc5, 0xe1, 0x5a, 0xa9, 0xc5, 0x73, 0xf9,
    0x51, 0x7d, 0xc8, 0x6c, 0x5c, 0x70, 0x5f, 0xed, 0x0f, 0xbe, 0xea, 0x76,
    0x11, 0x26, 0x4f, 0x5c, 0x04, 0xb4, 0x97, 0x3f, 0x9b, 0xec, 0xb1, 0x19,
    0x19, 0xe6, 0xe3, 0x1e, 0x2b, 0xc0, 0x2e, 0x0e, 0xbe, 0x9a, 0xcb, 0x03,
    0xef, 0x39, 0x4d, 0x42]),
  'dragonfly': new Uint8Array([
    0xb4, 0xca, 0xdb, 0x48, 0xed, 0x24, 0xe0, 0xa0, 0x91, 0x7e, 0xd3, 0xba,
    0xf2, 0x4d, 0x06, 0xbd, 0x0e, 0x42, 0xb8, 0x00, 0xb3, 0x9f, 0x2e, 0xd4,
    0x46, 0xd2, 0x83, 0xc4, 0xe0, 0x02, 0x11, 0x4a, 0x0f, 0x7a, 0x0c, 0xc7,
    0xb0, 0x2a, 0x80, 0xb7, 0x7a, 0x52, 0x93, 0x46, 0x24, 0xf3, 0xa8, 0x4a,
    0xb5, 0x21, 0xa6, 0x80, 0x9e, 0x00, 0xcd, 0xef, 0x5a, 0x4e, 0xaf, 0xc3,
    0x58, 0x86, 0x88, 0x0a, 0x8c, 0x1c, 0x63, 0x9b, 0xfb, 0x84, 0xfc, 0x06,
    0xc4, 0x39, 0x29, 0xee, 0xf6, 0x47, 0x12, 0xf7, 0xce, 0x73, 0xc8, 0xd6,
    0x86, 0xae, 0x7d, 0xa3, 0x9a, 0xa8, 0xc1, 0x7b, 0xfd, 0x1b, 0xd7, 0xe3]),
  'grapefruit': new Uint8Array([
    0x9f, 0x3d, 0x37, 0xf7, 0x6c, 0xce, 0x13, 0x1e, 0x55, 0xf3, 0x24, 0x27,
    0x08, 0x77, 0x48, 0xce, 0xeb, 0xc9, 0x51, 0x45, 0x16, 0xb1, 0x94, 0xc6,
    0x59, 0x0b, 0x0f, 0x08, 0xab, 0x19, 0x94, 0x5b, 0xd5, 0x92, 0x37, 0xdb,
    0x83, 0xbf, 0x47, 0xa4, 0xa6, 0xcf, 0xa9, 0x0a, 0x96, 0x2f, 0xc8, 0x29,
    0x21, 0x2a, 0x16, 0xf8, 0x9a, 0x7c, 0xfe, 0xf5, 0x17, 0xa2, 0x4f, 0x41,
    0xc3, 0x7d, 0xd6, 0x8d, 0x2c, 0x0c, 0x9a, 0xc3, 0x70, 0xfd, 0x0b, 0xe9,
    0x86, 0x94, 0x6b, 0x27, 0x39, 0xcc, 0x2e, 0x4b, 0x8f, 0xc7, 0xe4, 0x2b,
    0x8a, 0x3f, 0xac, 0xe7, 0x96, 0x66, 0xad, 0xdf]),
  // BROKEN
  // 'yellow': new Uint8Array([
  //   0x6f, 0x7d, 0x2c, 0x10, 0xcb, 0xf0, 0x76, 0x1b, 0xee, 0xeb, 0x80, 0xaa,
  //   0xe1, 0xa5, 0xfa, 0x53, 0xe3, 0xce, 0x4b, 0x59, 0x7d, 0xeb, 0xe3, 0x11,
  //   0x13, 0x87, 0x61, 0xa5, 0xef, 0x04, 0x04, 0x37, 0x63, 0xf6, 0x63, 0x91,
  //   0x44, 0x22, 0xf2, 0x50, 0xab, 0xb7, 0x35, 0x8c, 0xcf, 0x33, 0xf7, 0xc1,
  //   0xf1, 0x06, 0x6c, 0x37, 0x6b, 0x2d, 0x50, 0x0e, 0x1c, 0x1c, 0xee, 0x9d,
  //   0x3d, 0x56, 0xa6, 0x54, 0x51, 0xb2, 0xf4, 0x3d, 0x76, 0x7b, 0xcf, 0x4c]),
  'iguana': new Uint8Array([
    0x88, 0xb6, 0x9d, 0xf1, 0x2a, 0x6f, 0x51, 0x47, 0x83, 0x37, 0xb6, 0x7f,
    0x97, 0x65, 0x39, 0xa0, 0x4f, 0x7e, 0xff, 0x13, 0x94, 0x70, 0x5f, 0xf9,
    0xba, 0x3f, 0x00, 0xf0, 0xa2, 0x3b, 0x19, 0x59, 0xea, 0x9c, 0x08, 0xa9,
    0x31, 0x80, 0xe1, 0x31, 0xcc, 0x21, 0x70, 0xe7, 0xc1, 0xf0, 0x69, 0xa3,
    0x60, 0x70, 0xb7, 0x85, 0x53, 0xa9, 0xcc, 0x1e, 0x93, 0xe3, 0x7e, 0x59,
    0x36, 0x2e, 0xc7, 0x39, 0x58, 0x43, 0x20, 0xcf, 0x49, 0x91, 0xfc, 0x0d,
    0xde, 0xe1, 0x1f, 0x83, 0x24, 0x87, 0x6f, 0x9a]),
  'pineapple': new Uint8Array([
    0x72, 0x42, 0xc4, 0x37, 0xe3, 0x9b, 0xe6, 0x6b, 0xcf, 0xfa, 0x05, 0xee,
    0xe2, 0x55, 0xdd, 0x3c, 0x77, 0x91, 0x72, 0x6f, 0xc0, 0x97, 0x45, 0xc9,
    0x1b, 0x07, 0x02, 0x06, 0xb1, 0xd9, 0x9f, 0x42, 0x7f, 0x31, 0xcc, 0xe6,
    0x6d, 0x6c, 0x16, 0x3d, 0x09, 0x9e, 0xad, 0x01, 0xc7, 0xcd, 0xe7, 0x4f,
    0xb6, 0x7f, 0x78, 0x52, 0x67, 0xed, 0xff, 0x3c, 0xa8, 0xbb, 0xc4, 0xdf,
    0xa6, 0xe0, 0xdc, 0x6f, 0x52, 0x29, 0xe3, 0x23, 0x09, 0x04, 0x90, 0x38,
    0xff, 0x1d, 0x84, 0x4a, 0x48, 0x09, 0xc7, 0xa1, 0xa2, 0xdb, 0x88, 0xcd,
    0xd1, 0xc9, 0x90, 0x39]),
  'raspberry': new Uint8Array([
    0x21, 0x2e, 0x75, 0xad, 0xa2, 0x3b, 0xf9, 0x1f, 0xa8, 0xcc, 0x7d, 0x3c,
    0xf3, 0x42, 0x33, 0x99, 0x61, 0x05, 0x57, 0x36, 0x93, 0x13, 0xc9, 0x99,
    0xcb, 0xf5, 0x23, 0x27, 0x7c, 0xa1, 0x59, 0x11, 0xac, 0x54, 0x8c, 0x0e,
    0xf7, 0xf7, 0x1a, 0x30, 0xda, 0x1d, 0x35, 0x04, 0x3f, 0xd2, 0x48, 0x95,
    0x59, 0x94, 0x36, 0x35, 0x18, 0x1d, 0xc1, 0x36, 0x13, 0x08, 0xfa, 0x22,
    0x10, 0xf7, 0x43, 0xce, 0x88, 0x9f, 0x49, 0xd0, 0x3e, 0x18, 0x89, 0xd3,
    0x6d, 0xff, 0x69, 0xa2, 0xb8, 0x2d, 0x3a, 0xd8, 0xad, 0x5f, 0xb1, 0x01,
    0xf6, 0xaf, 0x97, 0xa0]),

};

const keywordNames: string[] = Object.keys(keywordIDs);

export default class WakewordController extends EventEmitter {

  public audioManager: any;
  public sensitivities: any;
  public processCallback: any;
  public audioManagerErrorCallback: any;
  public isRunning: boolean;
  public isListening: boolean;
  public listeningStartSeconds: number;

  constructor() {
    super();
    this.isRunning = false;
    this.isListening = false;
    this.listeningStartSeconds = 0;
    this.sensitivities = new Float32Array([0.5, 1, 1, 1, 1, 1]);

    this.processCallback = (keywordIndex: number) => {
      let keyword = keywordNames[keywordIndex];
      if (keyword === "grapefruit") {
        console.log(`HEARD WAKEWORD`);
        this.emit(`wakeword`);
      } else if (keyword === "orange") {
        console.log(`HEARD CANCEL`);
        this.emit(`cancel`);
      }
    };

    this.audioManagerErrorCallback = (ex: any) => {
      console.log(`WakeWordController: audioManagerErrorCallback: error:`, ex.toString());
    };

    console.log(`PicovoiceAudioManager:`, PicovoiceAudioManager);
    console.log(`Porcupine:`, Porcupine);
  }

  currentTimeSeconds() {
    return new Date().getTime() / 1000
  };

  start(): void {
    console.log(`WAKEWORD CONTROLLER: Start`);
    this.isRunning = true;
    this.audioManager = new PicovoiceAudioManager();
    this.audioManager.start(Porcupine.create(Object.values(keywordIDs), this.sensitivities), this.processCallback, this.audioManagerErrorCallback);
  }

  stop(): void {
    console.log(`WAKEWORD CONTROLLER: Stop`);
    this.isRunning = false;
    this.audioManager.stop();
  }

  dispose(): void {
    if (this.isRunning && this.audioManager) {
      this.stop();
    }
  }
}
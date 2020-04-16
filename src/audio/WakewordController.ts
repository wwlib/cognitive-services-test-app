// https://github.com/Picovoice/Porcupine

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
};

const keywordNames: string[] =  Object.keys(keywordIDs);

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
      // if (keywordIndex === -1) {
      //     if (this.isListening && (this.currentTimeSeconds() - this.listeningStartSeconds) > 5) {
      //         console.log(`SILENT FOR 5 SECONDS: STOPPED LISTENING`);
      //         this.isListening = false;
      //     }
      //     return;
      // }

      let keyword = keywordNames[keywordIndex];
      if (keyword === "dragonfly") {
          console.log(`HEARD WAKEWORD`);
          // this.isListening = true;
          // this.listeningStartSeconds = this.currentTimeSeconds();
          this.emit(`wakeword`);
      } else if (keyword === "orange") {
        console.log(`HEARD CANCEL`);
        // this.isListening = true;
        // this.listeningStartSeconds = this.currentTimeSeconds();
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
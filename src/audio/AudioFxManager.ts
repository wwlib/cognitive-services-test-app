import WwMusicController from '../ww/WwMusicController';

export enum AudioFxTone {
    LISTEN_START,
    LISTEN_STOP,
    INITIALIZE
}

export type AudioFxManagerOptions = {
}

export default class AudioFxManager {

    private static _instance: AudioFxManager;

    public musicController: WwMusicController;

    private _syncOffset: number

    constructor(options?: AudioFxManagerOptions) {
        this.musicController = new WwMusicController();
        this.musicController.init();
        this._syncOffset = 0
    }

    get syncOffset(): number {
        return this._syncOffset
    }

    set syncOffset(offset: number) {
        this._syncOffset = offset
        if (this.musicController) {
            this.musicController.syncOffset = this._syncOffset
        }
    }

    static getInstance(options?: AudioFxManagerOptions) {
        return this._instance || (this._instance = new this(options));
    }

    playTone(tone: AudioFxTone) {
        switch (tone) {
            case AudioFxTone.LISTEN_START:
                this.musicController.playMidiNote(48);
                break;
            case AudioFxTone.LISTEN_STOP:
                this.musicController.playMidiNote(49);
                break;
            case AudioFxTone.INITIALIZE:
                this.musicController.playMidiNote(53);
                break;
        }
    }

    playMidiNote(note: number, channel: number = 1, volume: number = 127) {
        this.musicController.playMidiNote(note, channel, volume);
    }

    playMidiFile(midiFileName: string, startAtTime: number, scheduleOptions?: any, callback?: any) {
        this.musicController.playMidiFile(midiFileName, startAtTime, scheduleOptions, callback)
    }
}
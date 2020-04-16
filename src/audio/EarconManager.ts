import WwMusicController from '../ww/WwMusicController';

export enum EarconTone {
    LISTEN_START,
    LISTEN_STOP,
    INITIALIZE
}

export type EarconManagerOptions = {
}

export default class EarconManager {

    private static _instance: EarconManager;

    public musicController: WwMusicController;

    constructor(options?: EarconManagerOptions) {
        this.musicController = new WwMusicController();
        this.musicController.init();
    }

    static Instance(options?: EarconManagerOptions) {
        return this._instance || (this._instance = new this(options));
    }

    playTone(tone: EarconTone) {
        switch (tone) {
            case EarconTone.LISTEN_START:
                this.musicController.playMidiNote(48);
                break;
            case EarconTone.LISTEN_STOP:
                this.musicController.playMidiNote(49);
                break;
            case EarconTone.INITIALIZE:
                this.musicController.playMidiNote(53);
                break;
        }
    }
}
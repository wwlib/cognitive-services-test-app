import PathUtils from '../utils/PathUtils';
import { AudioInstrument, AudioNote, InstrumentManager, MidiToMediaPlayer } from 'ww-music';
import { start } from 'repl';

const fs = require('fs');
const path = require('path');
const rootPath = PathUtils.findRoot(); // path.resolve(__dirname);
const dirname = path.basename(rootPath)
const configFile = path.resolve(rootPath, 'audio/instrument_config.json');
// const configFile = rootPath + '/data/instrument_config.json';

console.log(`WwMusicController: rootPath:`, rootPath);
console.log(`WwMusicController: dirname:`, dirname);
console.log(`WwMusicController: configFile:`, configFile);
// const instrumentConfig = require(configFile);
// console.log(`WwMusicController: instrumentConfig:`, instrumentConfig);

export default class WwMusicController {

    private _midiToMediaPlayer: MidiToMediaPlayer | undefined
    private _synchronizedStartAtTime: number
    private _syncOffset: number

    constructor() {
        this._synchronizedStartAtTime = 0
        this._syncOffset = 0
    }

    get localStartAtTime(): number {
        return this._synchronizedStartAtTime - this._syncOffset
    }

    get synchronizedStartAtTime(): number {
        return this._synchronizedStartAtTime
    }

    set synchronizedStartAtTime(time: number) {
        console.log(`WwMusicController: set synchronizedStartAtTime: ${time}`)
        this._synchronizedStartAtTime = time
        if (this._midiToMediaPlayer && this.localStartAtTime) {
            this._midiToMediaPlayer.setStartAtTime(this.localStartAtTime)
        }
    }

    get syncOffset(): number {
        return this._syncOffset
    }

    set syncOffset(offset: number) {
        console.log(`WwMusicController: set syncOffset: ${offset}`)
        this._syncOffset = offset
        if (this._midiToMediaPlayer && this.localStartAtTime) {
            this._midiToMediaPlayer.setStartAtTime(this.localStartAtTime)
        }
    }

    init() {
        fs.readFile(configFile, "utf8", (err: any, data: any) => {
            if (err) {
                console.log(err);
            } else {
                let instrumentConfig = JSON.parse(data);
                console.log(instrumentConfig);
                InstrumentManager.instance.init(rootPath, instrumentConfig);//(rootPath, instrumentConfig);
            }
        });
    }

    playMidiNote(note: number = 48, channel: number = 3, volume: number = 127) {
        // var intervalId = window.setInterval(function(){
        console.log(`Playing note: ${note} chan: ${channel} vol: ${volume}`);
        InstrumentManager.instance.playMidiNoteWithChannel(note, volume, channel);
        // }, 1000);
        // InstrumentManager.instance.testPieAno();
    }

    playMidiFile(midifile: string, synchronizedStartAtTime: number, scheduleOptions?: any, callback?: any) {
        midifile = midifile || 'twinkle_twinkle.mid';
        if (this._midiToMediaPlayer) {
            this._midiToMediaPlayer.dispose()
            this._midiToMediaPlayer = undefined
        }
        this._midiToMediaPlayer = new MidiToMediaPlayer(rootPath);
        this._midiToMediaPlayer.loadMidiFile(midifile);
        this.synchronizedStartAtTime = synchronizedStartAtTime
        // midiToMediaPlayer.on('note', ((data: any) => {
        //     console.log('WwMusicController: on note:', data)
        // }))

        console.log(`playing midi file:`, scheduleOptions);
        this._midiToMediaPlayer.scheduleAllNoteEvents(this.localStartAtTime, scheduleOptions, () => {
            console.log(`playMidiFile: done.`);
            this.playMidiNote(49);
            if (callback) {
                callback()
            }
        })
        this._midiToMediaPlayer.on('endOfFile', () => {
            console.log('endOfFile')
        });
        this._midiToMediaPlayer.playMidiFile(this.localStartAtTime)
    }
}

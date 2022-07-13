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

    constructor() {
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

    playMidiFile(midifile: string, startAtTime: number = 0, scheduleOptions?: any, callback?: any) {
        midifile = midifile || 'twinkle_twinkle.mid';


        const midiToMediaPlayer = new MidiToMediaPlayer(rootPath);
        midiToMediaPlayer.loadMidiFile(midifile);
        // midiToMediaPlayer.on('note', ((data: any) => {
        //     console.log('WwMusicController: on note:', data)
        // }))

        if (!startAtTime) {
            startAtTime = new Date().getTime();
        }

        console.log(`playing midi file:`, scheduleOptions);
        midiToMediaPlayer.scheduleAllNoteEvents(startAtTime, scheduleOptions, () => {
            console.log(`playMidiFile: done.`);
            this.playMidiNote(49);
            if (callback) {
                callback()
            }
        })
        midiToMediaPlayer.on('endOfFile', () => {
            console.log('endOfFile')
        });
        midiToMediaPlayer.playMidiFile(startAtTime)
    }
}

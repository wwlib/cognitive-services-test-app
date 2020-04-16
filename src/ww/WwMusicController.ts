import PathUtils from '../utils/PathUtils';
import  { AudioInstrument, AudioNote, InstrumentManager, MidiToMediaPlayer } from 'ww-music';

const fs = require('fs');
const path = require('path');
const root = PathUtils.findRoot(__dirname); // path.resolve(__dirname);
const dirname = path.basename(root)
const configFile = path.resolve(root, 'audio/instrument_config.json');
// const configFile = root + '/data/instrument_config.json';

console.log(`WwMusicController: root:`, root);
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
                InstrumentManager.instance.init(root, instrumentConfig);//(root, instrumentConfig);
            }
        });
    }

    playMidiNote(note: number = 48, channel: number = 3, volume: number = 127) {
        // var intervalId = window.setInterval(function(){
            console.log(`Playing note: ${note} chan: ${channel} vol: ${volume}`);
            InstrumentManager.instance.playMidiNoteWithChannel(note, 127, 3);
        // }, 1000);
        // InstrumentManager.instance.testPieAno();
    }

    playMidi(midifile: string) {
        midifile = midifile || 'twinkle_twinkle.mid';


        const midiToMediaPlayer = new MidiToMediaPlayer(root);
        midiToMediaPlayer.loadMidiFile(midifile);

        setTimeout(function(){
            console.log(`playing midi file:`, midiToMediaPlayer.midiPlayer);
            midiToMediaPlayer.scheduleAllNoteEvents(performance.now())
         }, 3000);

    }
}

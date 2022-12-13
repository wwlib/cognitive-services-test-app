import {
    RCSCommand,
    RCSCommandName,
    RCSCommandStatus,
    AbstractCommandExecutor,
    CommandExecutorCallback
} from 'robokit-command-system'
import AudioFxManager from '../audio/AudioFxManager'
export default class ExampleCommandExecutor extends AbstractCommandExecutor {

    private _syncOffset: number

    constructor(id: string) {
        super(id)
        this._syncOffset = 0
    }

    set syncOffset(offset: number) {
        this._syncOffset = offset
        AudioFxManager.getInstance().syncOffset = this._syncOffset
    }

    executeCommand(command: RCSCommand, callback: CommandExecutorCallback) {
        // console.log(`CommandExecutor: executeCommand: ${command.name}, ${command.id}`)
        switch (command.name) {
            case RCSCommandName.play:
                this.executePlayCommand(command, callback)
                break;
            case 'getBase64Photo': // TODO: add RCSCommandName.getBase64Photo
                this.executeGetBase64PhotoCommand(command, callback)
                break;
            default:
                callback(command, RCSCommandStatus.unimplemented, new Date().getTime() + this._syncOffset, `Command ${command.name} unimplemented.`)
                break;
        }
    }

    executePlayCommand(command: RCSCommand, callback: CommandExecutorCallback) {
        if (command.payload && command.payload.midi) {
            if (command.payload.midi.note) {
                const note = command.payload.midi.note
                const channel = command.payload.midi.channel || 1
                const volume = command.payload.midi.volume || 127
                const startAtTime = command.payload.midi.startAtTime
                const currentTime = new Date().getTime()
                let scheduleOffset = 0
                if (startAtTime && startAtTime > (currentTime + this._syncOffset)) {
                    scheduleOffset = startAtTime - (currentTime + this._syncOffset)
                }
                setTimeout(() => {
                    AudioFxManager.getInstance().playMidiNote(note, channel, volume)
                    callback(command, RCSCommandStatus.OK, new Date().getTime() + this._syncOffset)
                }, scheduleOffset)
            } else if (command.payload.midi.filename) {
                const currentTime = new Date().getTime()
                // convert synchronized starAtTime to local startAtTime (synchronized - syncOffset)
                const synchronizedStartAtTime = command.payload.midi.startAtTime
                console.log(`play: midi:`)
                console.log(`currentTime:`, currentTime)
                console.log(`synchronized start time:`, synchronizedStartAtTime)
                console.log(`_syncOffset:`, this._syncOffset)
                const channelsToPlay = command.payload.midi.channelsToPlay || undefined
                const scheduleOptions = {
                    channelsToPlay,
                }
                const tempCallback = () => {
                    callback(command, RCSCommandStatus.OK, new Date().getTime() + this._syncOffset)
                }
                AudioFxManager.getInstance().playMidiFile(command.payload.midi.filename, synchronizedStartAtTime, scheduleOptions, tempCallback); //('silent_night_easy.mid'); //('twinkle_twinkle.mid');
            } else {
                this.nop(command, callback)
            }
        } else {
            // NOP
            this.nop(command, callback)
        }
    }
    
    executeGetBase64PhotoCommand(command: RCSCommand, callback: CommandExecutorCallback) {
        // actual execution is currently handled in CognitiveHubClientController
        console.log(`ExampleCommandExecutor: getBase64Photo: PLACEHOLDER`)
        const currentTime = new Date().getTime()
        console.log(`currentTime: ${currentTime}`)
        console.log(`syncOffset: ${this._syncOffset}`)
        console.log(command)
        callback(command, RCSCommandStatus.OK, new Date().getTime() + this._syncOffset)
    }

    nop(command: RCSCommand, callback: CommandExecutorCallback) {
        console.log(`ExampleCommandExecutor: play: NOP`)
        const currentTime = new Date().getTime()
        console.log(`currentTime: ${currentTime}`)
        console.log(`syncOffset: ${this._syncOffset}`)
        console.log(command)
        callback(command, RCSCommandStatus.OK, new Date().getTime() + this._syncOffset)
    }
}
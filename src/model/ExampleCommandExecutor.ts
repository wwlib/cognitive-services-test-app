import {
    RCSCommand,
    RCSCommandName,
    RCSCommandStatus,
    ICommandExecutor,
    CommandExecutorCallback
} from 'robokit-command-system'
import AudioFxManager from '../audio/AudioFxManager'
export default class ExampleCommandExecutor implements ICommandExecutor {

    private _syncOffset: number

    constructor() {
        this._syncOffset = 0
    }

    set syncOffset(offset: number) {
        this._syncOffset = offset
    }

    executeCommand(command: RCSCommand, callback: CommandExecutorCallback) {
        // console.log(`CommandExecutor: executeCommand: ${command.name}, ${command.id}`)
        switch (command.name) {
            case RCSCommandName.play:
                this.executePlayCommand(command, callback)
                break;
            default:
                callback(command, RCSCommandStatus.unimplemented, `Command ${command.name} unimplemented.`)
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
                    AudioFxManager.Instance().playMidiNote(note, channel, volume)
                    callback(command, RCSCommandStatus.OK)
                }, scheduleOffset)
            } else if (command.payload.midi.filename) {
                const currentTime = new Date().getTime()
                // convert synchronized starAtTime to local startAtTime (synchronized - syncOffset)
                const startAtTime = command.payload.midi.startAtTime ? command.payload.midi.startAtTime - this._syncOffset : currentTime
                const channelsToPlay = command.payload.midi.channelsToPlay || undefined
                const scheduleOptions = {
                    channelsToPlay,
                }
                const tempCallback = () => {
                    callback(command, RCSCommandStatus.OK)
                }
                AudioFxManager.Instance().playMidiFile(command.payload.midi.filename, startAtTime, scheduleOptions, tempCallback); //('silent_night_easy.mid'); //('twinkle_twinkle.mid');
            } else {
                this.nop(command, callback)
            }
        } else {
            // NOP
            this.nop(command, callback)
        }
    }

    nop(command: RCSCommand, callback: CommandExecutorCallback) {
        console.log(`ExampleCommandExecutor: play: NOP`)
        const currentTime = new Date().getTime()
        console.log(`currentTime: ${currentTime}`)
        console.log(`syncOffset: ${this._syncOffset}`)
        console.log(command)
        callback(command, RCSCommandStatus.OK)
    }
}
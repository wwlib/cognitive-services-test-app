import { 
    RCSCommand,
    RCSCommandName,
    RCSCommandStatus,
    ICommandExecutor,
    CommandExecutorCallback
} from 'robokit-command-system'

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
                console.log(`ExampleCommandExecutor: play`)
                const currentTime = new Date().getTime()
                console.log(`currentTime: ${currentTime}`)
                console.log(`syncOffset: ${this._syncOffset}`)
                console.log(command)
                callback(command, RCSCommandStatus.OK)
                break;
            default:
                callback(command, RCSCommandStatus.unimplemented, `Command ${command.name} unimplemented.`)
                break;
        }
        
    }
}
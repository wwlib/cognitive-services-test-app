export default class Timer {
    public name: String;
    public startTime: number;
    public expires: number;

    private running: boolean;
    public _elapsedTime: number;

    constructor(name: String, startTime?: number, expires?: number) {
        this.name = name;
        this.startTime = startTime || new Date().getTime();
        this._elapsedTime = 0;
        this.expires = expires || 0;
        this.running = false;
    }

    start() {
        this.running = true;
        return this;
    }

    stop(frameTime?: number) {
        frameTime = frameTime || new Date().getTime();
        this._elapsedTime = frameTime - this.startTime;
        this.running = false;
        return this;
    }

    update(frameTime: number) {
        this._elapsedTime = frameTime - this.startTime;
    }

    isExpired(frameTime: number) {
        let result = false;
        this._elapsedTime = frameTime - this.startTime;
        if(this.running){
            if ((frameTime - this.startTime) >= this.expires) {
                this.running = false;
                result = true;
            }
        }
        return result;
    }

    elapsedTime(frameTime?: number) {
        frameTime = frameTime || new Date().getTime();
        this._elapsedTime = frameTime - this.startTime;
        return this._elapsedTime;
    }

    reset(startTime: number, expires: number) {
        this.startTime = startTime;
        this.expires = expires;
        // let sum = startTime + expires;
        this.start();
        return this;
    }
}
import { EventEmitter } from "events";

const axios = require('axios');
const { io } = require("socket.io-client");
const timesync = require('timesync');


export interface CognitiveHubLoginResponse {
    access_token: string;
    user_id: string;
    refresh_token: string;
}

export default class CognitiveHubClientController extends EventEmitter {

    private _serviceUrl: string;
    private _authUrl: string;
    private _username: string;
    private _password: string;
    private _accessToken: string | undefined;
    private _userId: string | undefined;
    private _refreshToken: string | undefined;

    private _socket: any;
    private _timesync: any;
    private _connected: boolean;

    constructor(serviceUrl: string, authUrl: string, username: string, password: string) {
        super();
        this._serviceUrl = serviceUrl;
        this._authUrl = authUrl;
        this._username = username;
        this._password = password;
        this._connected = false;
    }

    get connected(): boolean {
        return this._connected;
    }

    async login(): Promise<CognitiveHubLoginResponse> {
        console.log('CognitiveHubClientController: login', this._authUrl, this._username, this._password);
        return new Promise((resolve, reject) => {
            if (this._authUrl && this._username && this._password) {
                this._accessToken = '';
                this._userId = '';
                this._refreshToken = '';
                axios.post(this._authUrl, {
                    username: this._username,
                    password: this._password
                },
                    {
                        headers: { 'Content-Type': 'application/json' }
                    })
                    .then((response: any) => {
                        // console.log(response);
                        this._accessToken = response.data.access_token;
                        this._userId = response.data.user_id;
                        this._refreshToken = response.data.refresh_token;
                        resolve(response.data);
                    })
                    .catch((error: any) => {
                        console.log(error);
                        reject();
                    });

            } else {
                reject('Invalid authUrl, username and/or password.')
            }
        });
    }

    audioStart() {
        this._socket.emit('asrAudioStart');
    }

    audioEnd() {
        this._socket.emit('asrAudioEnd');
    }

    sendAudio(data: Buffer) {
        this._socket.emit('asrAudio', data);
    }

    async connect() {
        if (this._connected) {
            return
        }

        const loginResponse: CognitiveHubLoginResponse = await this.login();
        console.log('loginResponse', loginResponse);
        if (loginResponse && loginResponse.access_token && this._serviceUrl) {

            this._socket = io(this._serviceUrl, {
                path: '/socket-io/',
                extraHeaders: {
                    Authorization: `Bearer ${loginResponse.access_token}`,
                },
                reconnection: false,
            });

            // timesync

            this._timesync = timesync.create({
                server: this._socket,
                interval: 5000
            });

            this._timesync.on('sync', (state: string) => {
                // console.log('timesync: sync ' + state + '');
            });

            this._timesync.on('change', (offset: number) => {
                console.log('timesync: changed offset: ' + offset + ' ms');
            });

            this._timesync.send = function (socket: any, data: any, timeout: number): Promise<void> {
                //console.log('send', data);
                return new Promise(function (resolve, reject) {
                    if (socket) {
                        var timeoutFn = setTimeout(reject, timeout);
                        socket.emit('timesync', data, function () {
                            clearTimeout(timeoutFn);
                            resolve();
                        });
                    } else {
                        console.log('Not sending timesync event. socket is undefined.')
                        resolve()
                    }
                });
            };

            this._socket.on('timesync', (data: any) => {
                //console.log('receive', data);
                this._timesync.receive(null, data);
            });

            // socket messages

            this._socket.on("connect", () => {
                this._connected = true;
                console.log('socket connected:', this._socket.id)
            });

            this._socket.on('disconnect', () => {
                this._connected = true;
                console.log(`on disconnect. closing...`);
            });

            this._socket.on('message', function (data: any) {
                console.log(data.message);
            });

            this._socket.emit('message', 'CONNECTED');

            this._socket.on('asrSOS', function () {
                console.log(`asrSOS`);
            });

            this._socket.on('asrResult', function (data: any) {
                console.log(`asrResult`, data);
            });

            this._socket.on('asrEnded', (data: any) => {
                console.log(`asrEnded`, data);
                this.emit('asrEnded', data);
            });
        } else {
            throw new Error('Invalid or undefined access_token and/or serviceUrl.')
        }
    }

    disconnect() {
        this._connected = false;
        this._timesync.destroy();
        this._timesync = undefined;
        this._socket.close();
        this._socket = undefined;
    }
}
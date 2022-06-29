import { CognitiveServicesConfig, CognitiveServicesConfigOptions } from "cognitiveserviceslib"

export interface CognitiveHubOptions {
    serviceUrl: string;
    authUrl: string;
    username: string;
    password: string;
}

const defaultCognitiveHubOptions: CognitiveHubOptions = {
    serviceUrl: 'http://localhost:8000/',
    authUrl: 'http://localhost:8000/auth',
    username: '',
    password: '',
}

export interface AppSettingsOptions extends CognitiveServicesConfigOptions {
    CognitiveHub: CognitiveHubOptions
}

export default class AppSettings extends CognitiveServicesConfig {

    public CognitiveHub: CognitiveHubOptions = defaultCognitiveHubOptions;

    constructor(options?: AppSettingsOptions) {
        super();
        this.init(options);
    }

    init(options?: AppSettingsOptions): void {
        // console.log(`AppSettingsOptions: init`, options);
        if (options) {
            this.initWithData(options);
        } else if (this.loadFromLocalStorage()) {
            console.log(`loaded settings from local storage.`)
        } else {
            this.initWithData();
        }
    }

    initWithData(options: AppSettingsOptions | any = {}): void {
        console.log(`AppSettingsOptions: initWithData`, options);
        super.initWithData(options)

        if (options.CognitiveHub) {
            this.CognitiveHub = options.CognitiveHub;
        } else {
            this.CognitiveHub = defaultCognitiveHubOptions;
        }
    }

    // saveToLocalStorage(): boolean {
    //     const localStorage = window.localStorage;
    //     try {
    //         const dataText = JSON.stringify(this.json);
    //         localStorage.setItem(CognitiveServicesConfig.LOCAL_STORAGE_ITEM_NAME, dataText);
    //         return true;
    //     } catch (error) {
    //         console.log(`saveToLocalStorage:`, error);
    //         return false;
    //     }
    // }

    // loadFromLocalStorage(): boolean {
    //     let result = false;
    //     const localStorage = window ? window.localStorage : undefined;

    //     if (localStorage) {
    //         const settingsText: string | null = localStorage.getItem(CognitiveServicesConfig.LOCAL_STORAGE_ITEM_NAME);
    //         // console.log(`loadFromLocalStorage: `, settingsText);
    //         if (settingsText) {
    //             try {
    //                 const settings = JSON.parse(settingsText);
    //                 this.initWithData(settings as CognitiveServicesConfigOptions);
    //                 result = true
    //             } catch (error) {
    //                 console.log(`loadFromLocalStorage`, error);
    //             }
    //         }
    //     }
    //     return result;
    // }

    get json(): any {
        let json: any = {
            Microsoft: this.Microsoft,
            CognitiveHub: this.CognitiveHub,
        };
        return json;
    }

}
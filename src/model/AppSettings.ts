import { EventEmitter } from "events";

export interface AppSettingsOptions {
  authUrl: string;
  authApiKey: string;
  authUsername: string;
  authPassword: string;
  authScope: string;

  modelProjectId: string;
  baseApiUrl: string;

  dialogModelRef: string;
  dialogChannel: string;
  dialogLanguage: string;
  dialogLibrary: string;

  asrLanguage: string;
  asrClientCompany: string;
  asrClientUser: string;

  nluId: string;
  nluType: string;
  nluUri: string;

  ttsVoiceName: string;
  ttsSpeakingRatePercentage: number;
}

export default class AppSettings extends EventEmitter {

  public authUrl: string;
  public authApiKey: string;
  public authUsername: string;
  public authPassword: string;
  public authScope: string;

  public modelProjectId: string;
  public baseApiUrl: string;

  public dialogModelRef: string;
  public dialogChannel: string;
  public dialogLanguage: string;
  public dialogLibrary: string;

  public asrLanguage: string;
  public asrClientCompany: string;
  public asrClientUser: string;

  public nluId: string;
  public nluType: string;
  public nluUri: string;

  public ttsVoiceName: string;
  public ttsSpeakingRatePercentage: number;

  private _timestamp: number = 0;

  constructor(options?: AppSettingsOptions) {
    super();
    this.authUrl = '';
    this.authApiKey = '';
    this.authUsername = '';
    this.authPassword = '';
    this.authScope = '';
  
    this.modelProjectId = '';
    this.baseApiUrl = '';
  
    this.dialogModelRef = '';
    this.dialogChannel = '';
    this.dialogLanguage = '';
    this.dialogLibrary = '';
  
    this.asrLanguage = '';
    this.asrClientCompany = '';
    this.asrClientUser = '';
  
    this.nluId = '';
    this.nluType = '';
    this.nluUri = '';
  
    this.ttsVoiceName = '';
    this.ttsSpeakingRatePercentage = 50;

    this.init(options);
  }

  init(options?: AppSettingsOptions): void {
    if (options) {
      this.initWithData(options);
    } else if (this.loadFromLocalStorage()) {
      console.log(`loaded settings from local storage.`)
    } else {
      this.initWithData();
    }
  }

  initWithData(options?: AppSettingsOptions | any): void {
    options = options || {};
    this.authUrl = options.authUrl || '';
    this.authApiKey = options.authApiKey || '';
    this.authUsername = options.authUsername || '';
    this.authPassword = options.authPassword || '';
    this.authScope = options.authScope || 'nlu';
  
    this.modelProjectId = options.modelProjectId || '';
    this.baseApiUrl = options.baseApiUrl || '';
  
    this.dialogModelRef = options.dialogModelRef || '';
    this.dialogChannel = options.dialogChannel || 'default';
    this.dialogLanguage = options.dialogLanguage || 'eng-USA';
    this.dialogLibrary = options.dialogLibrary || 'default';
  
    this.asrLanguage = options.asrLanguage || 'eng-USA';
    this.asrClientCompany = options.asrClientCompany || 'Aardvark';
    this.asrClientUser = options.asrClientUser || 'Leslie';
  
    this.nluId = options.nluId || '';
    this.nluType = options.nluType || 'application/x-tbd';
    this.nluUri = options.nluUri || '';
  
    this.ttsVoiceName = options.ttsVoiceName || 'Zoe-Sc';
    this.ttsSpeakingRatePercentage = options.ttsSpeakingRatePercentage || 50;

    this._timestamp = options.timestamp || 0;
  }

  saveToLocalStorage(): boolean {
    const localStorage = window.localStorage;
    try {
      const dataText = JSON.stringify(this.json);
      localStorage.setItem('settings', dataText);
      return true;
    } catch (error) {
      console.log(`saveToLocalStorage:`, error);
      return false;
    }
  }

  loadFromLocalStorage(): boolean {
    const localStorage = window.localStorage;
    const settingsText: string | null = localStorage.getItem('settings');
    // console.log(`loadFromLocalStorage: `, settingsText);
    if (settingsText) {
      try {
        const settings = JSON.parse(settingsText);
        this.initWithData(settings as AppSettingsOptions);
        return true
      } catch (error) {
        console.log(`loadFromLocalStorage`, error);
        return false;
      }
    } else {
      return false;
    }
  }

  get json(): any {
    let json: any = {
      authUrl: this.authUrl,
      authApiKey: this.authApiKey,
      authUsername: this.authUsername,
      authPassword: this.authPassword,
      authScope: this.authScope,
    
      modelProjectId: this.modelProjectId,
      baseApiUrl: this.baseApiUrl,
    
      dialogModelRef: this.dialogModelRef,
      dialogChannel: this.dialogChannel,
      dialogLanguage: this.dialogLanguage,
      dialogLibrary: this.dialogLibrary,
    
      asrLanguage: this.asrLanguage,
      asrClientCompany: this.asrClientCompany,
      asrClientUser: this.asrClientUser,
    
      nluId: this.nluId,
      nluType: this.nluType,
      nluUri: this.nluUri,
    
      ttsVoiceName: this.ttsVoiceName,
      ttsSpeakingRatePercentage: this.ttsSpeakingRatePercentage,
    };
    return json;
  }

  get timestamp(): number {
    return this._timestamp;
  }
}
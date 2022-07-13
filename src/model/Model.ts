import Log from '../utils/Log';
import parentLog from './log';
import AudioFxManager from '../audio/AudioFxManager';
import { CognitiveServicesConfig, CognitiveServicesConfigOptions } from 'cognitiveserviceslib';
import AppSettings, { AppSettingsOptions } from './AppSettings';
import CognitiveHubClientController from './CognitiveHubClientController';

export default class Model {

  public log: Log;
  public settings: AppSettings;

  private _cognitiveHubClientController: CognitiveHubClientController | undefined;

  constructor() {
    this.log = parentLog.createChild('Model');
    this.settings = new AppSettings();
    AudioFxManager.Instance();
  }

  setAppSettings(settings: AppSettingsOptions): void {
    this.log.debug(`setAppSettings:`, settings);
    this.settings.init(settings);
    this.settings.saveToLocalStorage();
  }

  //// CognitiveHub

  getCognitiveHubClientController(reset: boolean = false): CognitiveHubClientController | undefined {
    if (reset) {
      if (this._cognitiveHubClientController) {
        this._cognitiveHubClientController.disconnect()
        this._cognitiveHubClientController = undefined
      }
    }
    if (this._cognitiveHubClientController) {
      return this._cognitiveHubClientController;
    } else {
      if (this.settings.CognitiveHub.authUrl && this.settings.CognitiveHub.username && this.settings.CognitiveHub.password) {
        this._cognitiveHubClientController = new CognitiveHubClientController(this.settings.CognitiveHub.serviceUrl, this.settings.CognitiveHub.authUrl, this.settings.CognitiveHub.username, this.settings.CognitiveHub.password);
        return this._cognitiveHubClientController;
      } else {
        return undefined
      }
    }
  }
}

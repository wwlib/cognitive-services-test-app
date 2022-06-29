import Log from '../utils/Log';
import parentLog from './log';
import EarconManager from '../audio/EarconManager';
import { CognitiveServicesConfig, CognitiveServicesConfigOptions } from 'cognitiveserviceslib';
import AppSettings, { AppSettingsOptions } from './AppSettings';
import CognitiveHubClientController from './CognitiveHubClientController';

export default class Model {

  public log: Log;
  public settings: AppSettings;
  public cognitiveHubClientController: CognitiveHubClientController | undefined;

  constructor() {
    this.log = parentLog.createChild('Model');
    this.settings = new AppSettings();
    EarconManager.Instance();
  }

  setAppSettings(settings: AppSettingsOptions): void {
    this.log.debug(`setAppSettings:`, settings);
    this.settings.init(settings);
    this.settings.saveToLocalStorage();
  }

  //// CognitiveHub

  getCognitiveHubClientController(): CognitiveHubClientController | undefined {
    if (this.cognitiveHubClientController) {
      return this.cognitiveHubClientController;
    } else {
      if (this.settings.CognitiveHub.authUrl && this.settings.CognitiveHub.username && this.settings.CognitiveHub.password) {
        this.cognitiveHubClientController = new CognitiveHubClientController(this.settings.CognitiveHub.serviceUrl, this.settings.CognitiveHub.authUrl, this.settings.CognitiveHub.username, this.settings.CognitiveHub.password);
        return this.cognitiveHubClientController;
      } else {
        return undefined
      }
    }
  }
}

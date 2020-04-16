import Log from '../utils/Log';
import parentLog from './log';
import AppSettings, { AppSettingsOptions } from "./AppSettings";
import EarconManager, { EarconTone } from '../audio/EarconManager';

export default class Model {

  public log: Log;
  public appSettings: AppSettings;

  constructor() {
    this.log = parentLog.createChild('Model');
    this.appSettings = new AppSettings();
    EarconManager.Instance();
  }

  setAppParams(params: AppSettingsOptions): void {
    this.log.debug(`setAppParams:`, params);
    this.appSettings.init(params);
    this.appSettings.saveToLocalStorage();
  }

}
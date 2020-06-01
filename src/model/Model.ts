import Log from '../utils/Log';
import parentLog from './log';
import EarconManager from '../audio/EarconManager';
import { CognitiveServicesConfig, CognitiveServicesConfigOptions } from 'cognitiveserviceslib';
export default class Model {

  public log: Log;
  public config: CognitiveServicesConfig;

  constructor() {
    this.log = parentLog.createChild('Model');
    this.config = new CognitiveServicesConfig();
    EarconManager.Instance();
  }

  setAppParams(params: CognitiveServicesConfigOptions): void {
    this.log.debug(`setAppParams:`, params);
    this.config.init(params);
    this.config.saveToLocalStorage();
  }

}
import { User } from '../models/api/user';
import { Configuratie } from '../models/config/configuratie';
import { HttpHelper } from '../util/http-helper';

class WebAppController {
  set loading(value: boolean) {
    if (value != this._loading) {
      dispatchEvent(new Event('loading-status-change'));
    }
    this._loading = value;
  }

  private _configuratie: Configuratie;
  private _user: User;
  private _loading: boolean;
  private _loadCounter: number = 0;

  async getConfig(): Promise<Configuratie> {
    if (!this._configuratie) {
      // Mock for standalone
      this._configuratie = {
        headerUuid: '11111111-1111-1111-1111-111111111111',
        footerUuid: '22222222-2222-2222-2222-222222222222',
        developmentMode: true,
        maxFileSize: 10000000
      };
      // this._configuratie = await HttpHelper.getAsyncTemp('/rest/webapp/configuratie');
    }
    return this._configuratie;
  }

  async getCurrentUser(): Promise<User> {
    if (!this._user) {
      // Mock for standalone
      this._user = {
        username: 'dev',
        displayName: 'Local Dev',
        authorities: []
      };
      // this._user = await HttpHelper.getAsyncTemp('/rest/webapp/currentUser');
    }
    return this._user;
  }

  getLoading(): boolean {
    return this._loading;
  }

  getLoadCounter(): number {
    return this._loadCounter;
  }

  private loadScreenHandling(value: boolean) {
    value ? (this._loadCounter += 1) : (this._loadCounter -= 1);
    if (this._loadCounter == 1) {
      dispatchEvent(new Event('loading-status-change'));
    }
    if (this._loadCounter == 0) {
      dispatchEvent(new Event('loading-status-change'));
      return;
    }

    if (this._loadCounter < 0) {
      this._loadCounter = 0;
      return;
    }
  }
}

const WEB_APP_CONTROLLER: WebAppController = new WebAppController();
export default WEB_APP_CONTROLLER;

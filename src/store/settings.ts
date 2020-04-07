import { RxHttp } from '@/assets/js/rx-http';
import { getMethodNameInSnackCase } from '@/assets/js/util';
import { Http } from '@/assets/js/http';
import { Settings } from '@/model/settings';
import { appStore } from '@/store/app';

//@ts-ignore
const JSONbig = require('json-bigint');
const BASE_URL = 'sys/user-settings/';

class SettingsStore {
  sysGetUserSettings(companyId: string) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      companyId,
    });
  }

  getUserSettings(controlId: string, menuPath: string) {
    return Http.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      menuPath,
      controlId,
    });
  }

  saveUserSettings(obj: Settings) {
    return Http.post(`${BASE_URL}save-or-update`, JSONbig.stringify(obj));
  }
}

export const settingsStore = new SettingsStore();

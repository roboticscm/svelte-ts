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
      companyId
    });
  }

  getUserSettings(controlId: string, menuPath = appStore.org.menuPath) {
    return Http.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      menuPath,
      controlId
    });
  }

  saveSettings(obj: Settings) {
    if (!obj.menuPath) {
      obj.menuPath = appStore.org.menuPath;
    }
    return Http.post(`${BASE_URL}save-or-update`, JSONbig.stringify(obj));
  }
}

export const settingsStore = new SettingsStore();

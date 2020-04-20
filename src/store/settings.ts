import { RxHttp } from '@/lib/js/rx-http';
import { getMethodNameInSnackCase } from '@/lib/js/util';
import { Http } from '@/lib/js/http';
import { Settings } from '@/model/settings';
import { appStore } from '@/store/app';
import { SJSON } from '@/lib/js/sjson';

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
    return Http.post(`${BASE_URL}save-or-update`, SJSON.stringify(obj));
  }
}

export const settingsStore = new SettingsStore();

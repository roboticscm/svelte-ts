import { Http } from '@/assets/js/http';
import { getMethodNameInSnackCase } from '@/assets/js/util';
const JSONbig = require('json-bigint');

const BASE_URL = 'sys/menu-control/';

class MenuControlStore {
  sysGetControlListByMenuPath(menuPath: string) {
    return Http.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      menuPath: menuPath,
    });
  }
  saveOrUpdateOrDelete(obj: any) {
    return Http.post(`${BASE_URL}${getMethodNameInSnackCase()}`, JSONbig.stringify(obj));
  }
}

export const menuControlStore = new MenuControlStore();

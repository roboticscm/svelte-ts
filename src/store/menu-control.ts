import { Http } from '@/lib/js/http';
import { getMethodNameInSnackCase } from '@/lib/js/util';
import { SJSON } from '@/lib/js/sjson';

const BASE_URL = 'sys/menu-control/';

class MenuControlStore {
  sysGetControlListByMenuPath(menuPath: string) {
    return Http.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      menuPath: menuPath,
    });
  }
  saveOrUpdateOrDelete(obj: any) {
    return Http.post(`${BASE_URL}${getMethodNameInSnackCase()}`, SJSON.stringify(obj));
  }
}

export const menuControlStore = new MenuControlStore();

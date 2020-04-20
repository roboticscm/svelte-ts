import { RxHttp } from '@/lib/js/rx-http';
import { getMethodNameInSnackCase } from '@/lib/js/util';

const BASE_URL = 'sys/role-control/';

class RoleControlStore {
  sysGetControlListByDepIdAndUserIdAndMenuPath(depId: any, menuPath: string) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      depId,
      menuPath,
    });
  }
}

export const roleControlStore = new RoleControlStore();

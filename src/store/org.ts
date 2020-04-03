import { RxHttp } from '@/assets/js/rx-http';
import { getMethodNameInSnackCase } from '@/assets/js/util';

const BASE_URL = 'sys/owner-org/';
class OrgStore {
  sysGetAvailableDepartmentTreeForMenu(menuId: any) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      menuId,
    });
  }

  sysGetDepartmentTreeByMenuId(menuId: any) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      menuId,
    });
  }
}

export const orgStore = new OrgStore();

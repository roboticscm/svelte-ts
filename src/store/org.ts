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

  sysGetRoledDepartmentListByUserId() {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      includeDeleted: false,
      includeDisabled: false,
    });
  }
}

export const orgStore = new OrgStore();

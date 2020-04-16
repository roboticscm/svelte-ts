import { RxHttp } from '@/assets/js/rx-http';
import { getMethodNameInSnackCase } from '@/assets/js/util';

const BASE_URL = 'sys/owner-org/';
export class OrgStore {
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

  sysGetOwnerOrgRoleTree() {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`);
  }

  sysGetHumanOrgTree(humanId: string) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      humanId,
    });
  }

  sysGetAssignedHumanOrgTree(humanId: string) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      humanId,
    });
  }

  static sysGetOwnerOrgTree() {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`);
  }
}

export const orgStore = new OrgStore();

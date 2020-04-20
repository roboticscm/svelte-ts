import { RxHttp } from '@/lib/js/rx-http';
import { getMethodNameInSnackCase } from '@/lib/js/util';

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

  static sysGetOwnerOrgTree(parentId: string = undefined) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      parentId,
    });
  }
}

export const orgStore = new OrgStore();

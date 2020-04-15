import { RxHttp } from '@/assets/js/rx-http';
import { getMethodNameInSnackCase } from '@/assets/js/util';

const BASE_URL = 'sys/role/';
export class RoleStore {
  static sysGetMenuRoleControlList(ownerOrgId: string, roleId: string) {
    return RxHttp.get(`sys/role-detail/${getMethodNameInSnackCase()}`, {
      ownerOrgId,
      roleId,
      includeDeleted: true,
      includeDisabled: true,
    });
  }

  static sysGetRoleListByOrgId(orgId: string) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      orgId,
      includeDeleted: true,
      includeDisabled: true,
    });
  }
}

export const roleStore = new RoleStore();

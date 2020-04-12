import { RxHttp } from '@/assets/js/rx-http';
import { getMethodNameInSnackCase } from '@/assets/js/util';

const BASE_URL = 'sys/role/';
export class RoleStore {
  static sysGetMenuRoleControlList(ownerOrgId: any, roleId: any) {
    return RxHttp.get(`sys/role-detail/${getMethodNameInSnackCase()}`, {
      ownerOrgId: ownerOrgId,
      roleId: roleId,
      includeDeleted: true,
      includeDisabled: true,
    });
  }
}

export const roleStore = new RoleStore();

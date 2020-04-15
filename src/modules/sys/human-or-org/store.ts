import { Http } from '@/assets/js/http';
import { getMethodNameInSnackCase } from '@/assets/js/util';
import { RxHttp } from '@/assets/js/rx-http';

const BASE_URL = 'sys/human-or-org/';

export class HumanOrOrgStore {
  static sysGetUserInfoById(userId: string) {
    return Http.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      userId,
    });
  }

  static sysGetUserListByOrgId(orgId: any) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      orgId: orgId,
      includeDeleted: false,
      includeDisabled: false,
    });
  }
}

export const humanOrOrgStore = new HumanOrOrgStore();

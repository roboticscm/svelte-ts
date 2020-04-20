import { Http } from '@/lib/js/http';
import { getMethodNameInSnackCase } from '@/lib/js/util';
import { RxHttp } from '@/lib/js/rx-http';

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

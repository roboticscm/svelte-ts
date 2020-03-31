import { Http } from '@/assets/js/http';
import { getMethodNameInSnackCase } from '@/assets/js/util';

const BASE_URL = 'sys/human-or-org/';

class HumanOrOrgStore {
  sysGetUserInfoById(userId: string) {
    return Http.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      userId,
    });
  }
}

export const humanOrOrgStore = new HumanOrOrgStore();

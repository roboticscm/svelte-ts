import { RxHttp } from '@/assets/js/rx-http';
import { getMethodNameInSnackCase } from '@/assets/js/util';

const BASE_URL = 'sys/owner-org/';

export default class Store {
  static sysGetCompanyList() {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`);
  }
}

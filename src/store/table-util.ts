import { RxHttp } from '@/assets/js/rx-http';
import { getMethodNameInSnackCase } from '@/assets/js/util';
import { SimpleListParam } from '@/model/base';

const BASE_URL = 'sys/table-util/';

class TableUtilStore {
  getSimpleList(param: SimpleListParam) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, param);
  }
}

export const tableUtilStore = new TableUtilStore();

import { RxHttp } from '@/assets/js/rx-http';
import { getMethodNameInSnackCase } from '@/assets/js/util';
import { SimpleListParam } from '@/model/base';

const BASE_URL = 'sys/table-util/';

class TableUtilStore {
  getSimpleList(param: SimpleListParam) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, param);
  }

  getOneById(tableName, id: string) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      tableName,
      id,
    });
  }

  softDeleteMany(tableName, deletedIds: string[]) {
    return RxHttp.delete(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      tableName,
      deletedIds: deletedIds.join(','),
    });
  }
}

export const tableUtilStore = new TableUtilStore();

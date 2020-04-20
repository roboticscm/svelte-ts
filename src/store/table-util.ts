import { RxHttp } from '@/lib/js/rx-http';
import { Http } from '@/lib/js/http';
import { getMethodNameInSnackCase } from '@/lib/js/util';
import { SimpleListParam } from '@/model/base';

const BASE_URL = 'sys/table-util/';

class TableUtilStore {
  getSimpleList(param: SimpleListParam) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, param);
  }

  getOneById(tableName: string, id: string) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      tableName,
      id,
    });
  }

  getAllColumnsOfTable(tableName: string) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      tableName,
    });
  }

  softDeleteMany(tableName, deletedIds: string[]) {
    return RxHttp.delete(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      tableName,
      deletedIds: deletedIds.join(','),
    });
  }

  hasAnyDeletedRecord(tableName: string, onlyMe: boolean) {
    return Http.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      tableName,
      onlyMe,
    });
  }

  getAllDeletedRecords(tableName: string, columns: string[], onlyMe: boolean) {
    return Http.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      tableName,
      columns: columns.map((it) => `t.${it}`).join(','),
      onlyMe,
    });
  }

  restoreOrForeverDelete(tableName: string, deleteIds: string, restoreIds: string) {
    return Http.delete(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      tableName,
      deleteIds,
      restoreIds,
    });
  }
}

export const tableUtilStore = new TableUtilStore();

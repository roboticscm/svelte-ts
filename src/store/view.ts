import { menuStore } from '@/store/menu';
import { T } from '@/assets/js/locale/locale';
import { StringUtil } from '@/assets/js/string-util';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { tableUtilStore } from '@/store/table-util';
import { App } from '@/assets/js/constants';
import { take, first, catchError, skip } from 'rxjs/operators';
import { AxiosResponse } from 'axios';
import { PayloadRes, TableColumn } from '@/model/base';
import gql from 'graphql-tag';

export class ViewStore {
  tableName: string;
  columns: string[] = ['name'];
  orderBy: string[] = ['updated_date desc, created_date desc, name'];
  page = 1;
  pageSize = App.DEFAULT_PAGE_SIZE;
  onlyMe = false;
  includeDisabled = true;
  fullCount: number;
  loading = false;
  dataList$ = new BehaviorSubject<any[]>([]);
  completeLoading$ = forkJoin([
    this.dataList$.pipe(
      skip(1),
      catchError((error) => of([])),
      first(),
    ),
  ]);

  constructor(public menuPath: string) {}

  getViewTitle = () => {
    return T(`COMMON.MENU.${menuStore.selectedData && menuStore.selectedData.menuName}`);
  };

  getViewName = () => {
    return StringUtil.toTitleCase(menuStore.selectedData && menuStore.selectedData.menuName);
  };

  getMenu = () => {
    return menuStore.selectedData;
  };

  getSimpleList = (textSearch = '') => {
    tableUtilStore
      .getSimpleList({
        tableName: this.tableName,
        columns: this.columns.join(','),
        orderBy: this.orderBy.join(','),
        textSearch: textSearch,
        page: this.page,
        pageSize: this.pageSize,
        onlyMe: this.onlyMe,
        includeDisabled: this.includeDisabled,
      })
      .pipe(take(1))
      .subscribe((res: AxiosResponse) => {
        const data: PayloadRes = res.data;
        this.dataList$.next(data.payload);
        this.fullCount = data.fullCount;
      });
  };

  createColumns = () => {
    return this.columns.map((it) => {
      return {
        name: it,
        title: T(`COMMON.LABEL.${it}`),
      };
    });
  };

  createQuerySubscription = () => {
    return gql`
      subscription LangSubscription {
        language {
          id
          locale
          name
        }
      }
    `;
  };
}

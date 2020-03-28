import { Language } from '@/modules/sys/language/model';
import { RxHttp } from '@/assets/js/rx-http';
import { tableUtilStore } from '@/store/table-util';
import { skip, take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

class Store {
  selectedData$ = new BehaviorSubject<Language>(null);

  getOneById(tableName: string, id: string) {
    tableUtilStore
      .getOneById(tableName, id)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (res.data && res.data.length > 0) {
            this.selectedData$.next(res.data[0]);
          }
        },
        error: (err) => {
          console.log(err);
          // TODO
        },
      });
  }
}

export const store = new Store();

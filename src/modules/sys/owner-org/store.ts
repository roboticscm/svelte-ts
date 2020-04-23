import { RxHttp } from '@/lib/js/rx-http';
import { getMethodNameInSnackCase } from '@/lib/js/util';
import { ViewStore } from '@/store/view';
import { OrgStore } from '@/store/org';
import { OwnerOrg } from '@/modules/sys/owner-org/model';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { T } from '@/lib/js/locale/locale';
import { skip, take } from 'rxjs/operators';

const BASE_URL = 'sys/owner-org/';

export default class Store {
  static orgType = [
    { id: 10000, name: T('COMMON.LABEL.COMPANY') },
    { id: 1000, name: T('COMMON.LABEL.BRANCH') },
    { id: 100, name: T('COMMON.LABEL.DEPARTMENT') },
    { id: 10, name: T('COMMON.LABEL.GROUP') },
  ];

  orgData$ = new BehaviorSubject<OwnerOrg[]>([]);
  completeLoading$ = forkJoin([this.orgData$.pipe(skip(1), take(1))]);
  constructor(public viewStore: ViewStore) {}
  static sysGetCompanyList() {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`);
  }

  loadOrgTree() {
    OrgStore.sysGetOwnerOrgTree().subscribe((res) => {
      this.orgData$.next(res.data);
    });
  }
}

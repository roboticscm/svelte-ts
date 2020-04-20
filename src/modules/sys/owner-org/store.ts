import { RxHttp } from '@/lib/js/rx-http';
import { getMethodNameInSnackCase } from '@/lib/js/util';
import { ViewStore } from '@/store/view';
import { OrgStore } from '@/store/org';
import { OwnerOrg } from '@/modules/sys/owner-org/model';
import { BehaviorSubject } from 'rxjs';

const BASE_URL = 'sys/owner-org/';

export default class Store {
  orgData$ = new BehaviorSubject<OwnerOrg[]>([]);
  constructor(public viewStore: ViewStore) {}
  static sysGetCompanyList() {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`);
  }

  loadOrgTree() {
    OrgStore.sysGetOwnerOrgTree().subscribe((res) => {
      console.log(res.data);
      this.orgData$.next(res.data);
    });
  }
}

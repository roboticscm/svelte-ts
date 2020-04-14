import { orgStore } from '@/store/org';
import { catchError, first, skip, take, withLatestFrom, zipAll } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, of, zip } from 'rxjs';
import { ViewStore } from '@/store/view';
import { RoleStore } from '@/store/role';
import { Role } from './model';
import {RxHttp} from "@/assets/js/rx-http";
import {getMethodNameInSnackCase} from "@/assets/js/util";

const BASE_URL = 'sys/role-detail/';
export class Store {
  roles$ = new BehaviorSubject<any[]>([]);
  selectedData$ = new BehaviorSubject<Role>(null);
  roleDetails$ = new BehaviorSubject<any[]>([]);
  dragEndSplitter$ = new BehaviorSubject<any>(null);
  constructor(public viewStore: ViewStore) {}

  completeLoading$ = forkJoin([
    this.roles$.pipe(
      skip(1),
      catchError((error) => of([])),
      first(),
    ),
  ]);

  loadRoleTree = () => {
    orgStore.sysGetOwnerOrgRoleTree().subscribe((res) => {
      this.roles$.next(res.data);
    });
  };

  loadRoleDetail = (orgId: string, roleId: string) => {
    RoleStore.sysGetMenuRoleControlList(orgId, roleId).subscribe((res) => {
      this.roleDetails$.next(res.data);
    });
  };

  saveOrUpdateOrDelete(roleId: any, roleDetailWithControls: any[]) {
    return RxHttp.post(
        `${BASE_URL}${getMethodNameInSnackCase()}`,
        JSON.stringify({
          roleId,
          roleDetailWithControls
        })
    );
  }
}

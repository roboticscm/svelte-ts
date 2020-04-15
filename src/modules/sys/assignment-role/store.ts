import { ViewStore } from '@/store/view';
import { RxHttp } from '@/assets/js/rx-http';
import { getMethodNameInSnackCase } from '@/assets/js/util';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, first, skip, zip } from 'rxjs/operators';
import { User } from '@/model/user';
import { OwnerOrg } from '@/modules/sys/owner-org/model';
import { orgStore } from '@/store/org';
import { HumanOrOrgStore } from '@/modules/sys/human-or-org/store';
import { RoleStore } from '@/store/role';
import { Role } from '@/modules/sys/role-detail/model';

const BASE_URL = 'sys/assignment-role/';
export class Store {
  dataList$ = new BehaviorSubject<User[]>([]);
  orgData$ = new BehaviorSubject<OwnerOrg[]>([]);
  userData$ = new BehaviorSubject<User[]>([]);
  roleData$ = new BehaviorSubject<Role[]>([]);

  completeLoading$ = forkJoin([
    this.dataList$.pipe(
      skip(1),
      catchError((error) => of([])),
      first(),
    ),
    this.orgData$.pipe(
      skip(1),
      catchError((error) => of([])),
      first(),
    ),
  ]);

  constructor(public viewStore: ViewStore) {}

  sysGetAllAssignmentRoleUserList() {
    RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      includeDeleted: false,
      includeDisabled: true,
    }).subscribe((res) => {
      this.dataList$.next(res.data);
      this.viewStore.fullCount$.next(20);
    });
  }

  loadOrgTree() {
    orgStore.sysGetOwnerOrgTree().subscribe((res) => {
      this.orgData$.next(res.data);
    });
  }

  loadUserList(orgId: string) {
    HumanOrOrgStore.sysGetUserListByOrgId(orgId).subscribe((res) => {
      this.userData$.next(res.data);
    });
  }

  loadRoleList(orgId: string) {
    RoleStore.sysGetRoleListByOrgId(orgId).subscribe((res) => {
      this.roleData$.next(res.data);
    });
  }

  static sysGetRoleListOfUsers(userIds: string) {
    return RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
      userIds,
      includeDeleted: false,
      includeDisabled: true,
    });
  }

  saveOrUpdateOrDelete(users: any[], roles: any[]) {
    return RxHttp.post(
      `${BASE_URL}${getMethodNameInSnackCase()}`,
      JSON.stringify({
        users,
        roles,
      }),
    );
  }
}

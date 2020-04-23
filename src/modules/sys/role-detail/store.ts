import { OrgStore, orgStore } from '@/store/org';
import { catchError, first, skip, take, withLatestFrom, zipAll } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, of, zip } from 'rxjs';
import { ViewStore } from '@/store/view';
import { RoleStore } from '@/store/role';
import { Role } from './model';
import { RxHttp } from '@/lib/js/rx-http';
import { getMethodNameInSnackCase } from '@/lib/js/util';
import { OwnerOrg } from '@/modules/sys/owner-org/model';

const BASE_URL = 'sys/role-detail/';
export class Store {
  roles$ = new BehaviorSubject<Role[]>([]);
  filterOrg$ = new BehaviorSubject<OwnerOrg[]>([]);
  selectedData$ = new BehaviorSubject<Role>(null);
  selectedOrg$ = new BehaviorSubject<any>(null);
  roleDetails$ = new BehaviorSubject<any[]>([]);
  dragEndSplitter$ = new BehaviorSubject<any>(null);
  needSelectRole$ = new BehaviorSubject<string>(null);
  hideBranchColumn$ = new BehaviorSubject<number>(0);
  hideDepartmentColumn$ = new BehaviorSubject<number>(0);
  resetColumn$ = new BehaviorSubject<number>(0);
  filterMenu$ = new BehaviorSubject<string[]>(undefined);

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

  static loadRoleDetail$ = (orgId: string, roleId: string) => {
    return RoleStore.sysGetMenuRoleControlList(orgId, roleId);
  };

  loadFilterOrgTree = (parentId: string = undefined) => {
    OrgStore.sysGetOwnerOrgTree(parentId).subscribe((res: any) => {
      this.filterOrg$.next(res.data);
    });
  };
  static loadFilterOrgTree$ = (parentId: string = undefined) => {
    return OrgStore.sysGetOwnerOrgTree(parentId);
  };
  saveOrUpdateOrDelete(roleId: any, roleDetailWithControls: any[]) {
    return RxHttp.post(
      `${BASE_URL}${getMethodNameInSnackCase()}`,
      JSON.stringify({
        roleId,
        roleDetailWithControls,
      }),
    );
  }
}

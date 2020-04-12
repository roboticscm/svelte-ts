import { orgStore } from '@/store/org';
import { catchError, first, skip, take, withLatestFrom, zipAll } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, of, zip } from 'rxjs';
import { ViewStore } from '@/store/view';
import { RoleStore } from '@/store/role';
export class Store {
  roles$ = new BehaviorSubject<any[]>([]);
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
}

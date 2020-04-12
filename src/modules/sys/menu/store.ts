import { orgStore } from '@/store/org';
import { catchError, first, skip, take, withLatestFrom, zipAll } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, of, zip } from 'rxjs';
import { ViewStore } from '@/store/view';

export class Store {
  constructor(public viewStore: ViewStore) {}
  availableDep$ = new BehaviorSubject<any[]>([]);
  assignedDep$ = new BehaviorSubject<any[]>([]);

  completeLoading$ = forkJoin([
    this.availableDep$.pipe(
      skip(1),
      catchError((error) => of([])),
      first(),
    ),
    this.viewStore.completeLoading$,
  ]);
  completeSelecting$ = zip(
    this.availableDep$.pipe(
      skip(1),
      catchError((error) => of([])),
    ),
    this.assignedDep$.pipe(
      skip(1),
      catchError((error) => of([])),
    ),
    this.viewStore.selectedData$.pipe(
      skip(1),
      catchError((error) => of([])),
    ),
  );

  loadAvailableDep(menuId: string) {
    return orgStore.sysGetAvailableDepartmentTreeForMenu(menuId);
  }

  loadAssignedDep(menuId: string) {
    return orgStore.sysGetDepartmentTreeByMenuId(menuId);
  }
}

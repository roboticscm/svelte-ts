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
    // .pipe(take(1))
    // .subscribe((res) => {
    //   this.availableDep$.next(res.data);
    // });
  }

  loadAssignedDep(menuId: string) {
    return orgStore.sysGetDepartmentTreeByMenuId(menuId);
    // .pipe(take(1))
    // .subscribe((res) => {
    //     setTimeout(()=> {
    //         this.assignedDep$.next(res.data);
    //     }, 5000);
    //
    // });
  }
}

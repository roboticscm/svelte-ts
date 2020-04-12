<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ViewStore } from '@/store/view';
  import { Store } from '../store';
  import { fromEvent, forkJoin, Observable, Subscription } from 'rxjs';
  import { switchMap, tap, filter } from 'rxjs/operators';
  import SimpleWorkList from '@/components/work-list/simple-work-list';
  import { SObject } from '@/assets/js/sobject';

  // Props
  export let view: ViewStore;
  export let store: Store;
  export let menuPath: string;
  export let callFrom: string;

  // Other vars
  const workListContainerId = `workList${view.getViewName()}Container`;
  const tableId = `workList${view.getViewName()}${callFrom.replace('/', '__')}Table`;
  let selectedId: string = undefined;
  let selectSub: Subscription;

  const doSelect = (ob$: Observable<any>) => {
    return ob$
      .pipe(
        filter((_) => selectedId !== undefined),
        tap((_) => view.loading$.next(true)),
        switchMap((_) =>
          forkJoin([
            view.getOneById(selectedId),
            store.loadAvailableDep(selectedId),
            store.loadAssignedDep(selectedId),
          ]),
        ),
      )
      .subscribe((res: any[]) => {
        view.selectedData$.next(SObject.convertFieldsToCamelCase(res[0].data[0]));
        store.availableDep$.next(res[1].data);
        store.assignedDep$.next(res[2].data);
        view.loading$.next(false);
        selectedId = undefined;
      });
  };

  const onSelection = (event) => {
    if (event.detail && event.detail.length > 0) {
      selectedId = event.detail[0].id;

      const change$ = new Observable((observer) => {
        observer.next(event);
      });
      selectSub = doSelect(change$);
    }
  };

  onMount(() => {
    // setTimeout(() => {
    //   const event$ = fromEvent(document.querySelector('#' + tableId), 'click');
    //   selectSub = doSelect(event$);
    // }, 500);
  });

  onDestroy(() => {
    if (selectSub) {
      selectSub.unsubscribe();
    }
  });
</script>

<section id={workListContainerId} class="view-left-main">
  <SimpleWorkList {view} {menuPath} {tableId} on:selection={onSelection} />
</section>
<div class="view-left-bottom" />

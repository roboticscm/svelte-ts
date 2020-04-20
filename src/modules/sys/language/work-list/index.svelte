<script lang="ts">
  import { onMount, createEventDispatcher, onDestroy } from 'svelte';
  import { ViewStore } from '@/store/view';
  import { fromEvent, forkJoin, Observable, Subscription } from 'rxjs';
  import { switchMap, tap, filter } from 'rxjs/operators';
  import SimpleWorkList from '@/components/work-list/simple-work-list';
  import { SObject } from '@/lib/js/sobject';

  // Props
  export let view: ViewStore;
  export let menuPath: string;
  export let callFrom: string;

  // Other vars
  const workListContainerId = `workList${view.getViewName()}Container`;
  const tableId = `workList${view.getViewName()}${callFrom.replace('/', '__')}Table`;
  let selectedId: string = undefined;
  const dispatch = createEventDispatcher();
  let selectSub: Subscription;

  const doSelect = (ob$: Observable<any>) => {
    return ob$
      .pipe(
        filter((_) => selectedId !== undefined),
        tap((_) => view.loading$.next(true)),
        switchMap((_) => forkJoin([view.getOneById(selectedId)])),
      )
      .subscribe((res: any[]) => {
        view.selectedData$.next(SObject.convertFieldsToCamelCase(res[0].data[0]));
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

      // dispatch('callback', event.detail[0].id);
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
  <!--  <HandsonWorkList on:selection={onSelection} {view} {workListContainerId} {tableId} {menuPath} />-->
  <SimpleWorkList on:selection={onSelection} {view} {tableId} {menuPath} />
</section>
<div class="view-left-bottom" />

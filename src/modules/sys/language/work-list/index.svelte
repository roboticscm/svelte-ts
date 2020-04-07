<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { ViewStore } from '@/store/view';
  // import HandsonWorkList from '@/components/work-list/handson-work-list';
  import { fromEvent, forkJoin } from 'rxjs';
  import { switchMap, tap, filter } from 'rxjs/operators';
  import SimpleWorkList from '@/components/work-list/simple-work-list';

  // Props
  export let view: ViewStore;
  export let menuPath: string;
  export let callFrom: string;

  // Other vars
  const workListContainerId = `workList${view.getViewName()}Container`;
  const tableId = `workList${view.getViewName()}${callFrom.replace('/', '__')}Table`;
  let selectedId: string = undefined;
  const dispatch = createEventDispatcher();

  const onSelection = (event) => {
    if (event.detail && event.detail.length > 0) {
      selectedId = event.detail[0].id;
      dispatch('callback', event.detail[0].id);
    }
  };

  onMount(() => {
    setTimeout(() => {
      fromEvent(document.querySelector('#' + tableId), 'click')
        .pipe(
          filter((_) => selectedId !== undefined),
          tap((_) => view.loading$.next(true)),
          switchMap((_) => forkJoin([view.getOneById(selectedId)])),
        )
        .subscribe((res: any[]) => {
          view.selectedData$.next(res[0].data[0]);
          view.loading$.next(false);
          selectedId = undefined;
        });
    }, 500);
  });
</script>

<section id={workListContainerId} class="view-left-main">
  <!--  <HandsonWorkList on:selection={onSelection} {view} {workListContainerId} {tableId} {menuPath} />-->
  <SimpleWorkList on:selection={onSelection} {view} {tableId} {menuPath} />
</section>
<div class="view-left-bottom" />

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ViewStore } from '@/store/view';
  import Store from '../store';
  import { fromEvent, forkJoin, Observable, Subscription } from 'rxjs';
  import { switchMap, tap, filter } from 'rxjs/operators';
  import TreeView from '@/components/ui/tree-view';
  import { SObject } from '@/lib/js/sobject';
  import { apolloClient } from '@/lib/js/hasura-client';

  // Props
  export let view: ViewStore;
  export let store: Store;
  export let menuPath: string;
  export let callFrom: string;

  // Other vars
  const workListContainerId = `workList${view.getViewName()}Container`;
  const treeId = `workList${view.getViewName()}${callFrom.replace('/', '__')}Tree`;
  let selectedId: string = undefined;
  let allColumnsSub, needSelectIdSub, needHighlightIdSub, selectDataSub: Subscription;
  let apolloClientList$: any;
  let treeRef: any;

  const { orgData$ } = store;

  // =========================SUBSCRIPTION===========================
  const subscription = () => {
    allColumnsSub = view.allColumns$.subscribe((cols) => {
      if (cols && cols.length > 0) {
        const query = view.createQuerySubscription();
        apolloClientList$ = apolloClient.subscribe({
          query,
        });
      }
    });

    needSelectIdSub = view.needSelectId$.subscribe((id: string) => {
      if (treeRef && id) {
        setTimeout(() => {
          treeRef.selectNodeById(id, true);
        }, 1000);
      }
    });

    needHighlightIdSub = view.needHighlightId$.subscribe((id: string) => {
      if (treeRef && id) {
        setTimeout(() => {
          treeRef.selectNodeById(id, false);
        }, 1000);
      }
    });

    selectDataSub = view.selectedData$.subscribe((data) => {
      if (data && treeRef) {
        treeRef.selectNodeById(data.id, false);
      } else if (treeRef) {
        treeRef && treeRef.clearSelection();
      }
    });
  };
  // =========================//SUBSCRIPTION===========================

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

  const reload = () => {
    store.loadOrgTree();
    view.checkDeletedRecord(false);
  };

  const onClickTree = (event: any) => {
    if (event.detail) {
      selectedId = event.detail.treeNode.id;
      const change$ = new Observable((observer) => {
        observer.next(event);
      });
      selectDataSub = doSelect(change$);
    }
  };

  onMount(() => {
    subscription();
    reload();
    // setTimeout(() => {
    //   const event$ = fromEvent(document.querySelector('#' + tableId), 'click');
    //   selectSub = doSelect(event$);
    // }, 500);
  });

  onDestroy(() => {
    needSelectIdSub.unsubscribe();
    needHighlightIdSub.unsubscribe();
    selectDataSub.unsubscribe();
    if (allColumnsSub) {
      allColumnsSub.unsubscribe();
    }
  });

  // =========================REACTIVE===========================
  let firstTimes = true;
  // @ts-ignore
  $: {
    // @ts-ignore
    const dataList = $apolloClientList$;
    if (dataList) {
      if (!firstTimes) {
        reload();
      }
      firstTimes = false;
    }
  }
  // =========================//REACTIVE===========================
</script>

<section id={workListContainerId} class="view-left-main">
  <TreeView bind:this={treeRef} data={$orgData$} id={treeId} on:click={onClickTree} />
</section>
<div class="view-left-bottom" />

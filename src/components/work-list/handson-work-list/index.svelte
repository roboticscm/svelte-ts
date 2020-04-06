<script lang="ts">
  import { onMount, onDestroy, SvelteComponent, createEventDispatcher } from 'svelte';
  import { fromEvent, Subscription } from 'rxjs';
  import { take } from 'rxjs/operators';
  import { apolloClient } from '@/assets/js/hasura-client';
  import { App } from '@/assets/js/constants';
  import { ViewStore } from '@/store/view';

  import Pagination from '@/components/ui/pagination/index.svelte';

  export let view: ViewStore;
  export let workListContainerId: string;
  export let menuPath: string;
  export let tableId: string;

  const columns = view.createWorkListColumnsForHandsonTable();
  const { dataList$, fullCount$ } = view;

  const dispatch = createEventDispatcher();

  let apolloClientList$: any;
  let tableRef: any;
  let pageRef: any;
  let needSelectIdSub, needHighlightIdSub, selectDataSub: Subscription;
  let TableComponent: SvelteComponent;
  let tableHeight: number;
  // =========================SUBSCRIPTION===========================
  const subscription = () => {
    const query = view.createQuerySubscription();
    apolloClientList$ = apolloClient.subscribe({
      query,
    });

    needSelectIdSub = view.needSelectId$.subscribe((id: string) => {
      if (tableRef && id) {
        setTimeout(() => {
          tableRef.selectRowById(id);
        }, 500);
      }
    });

    needHighlightIdSub = view.needHighlightId$.subscribe((id: string) => {
      if (tableRef && id) {
        tableRef.highlightRowById(id);
      }
    });

    selectDataSub = view.selectedData$.subscribe((data) => {
      if (data && tableRef) {
        const selectedId = tableRef.getFirstSelectedRowId();
        if (selectedId && selectedId.toString() !== data.id.toString()) {
          tableRef.highlightRowById(data.id);
        }
      } else if (tableRef) {
        tableRef && tableRef.deselectCell();
      }
    });
  };
  // =========================//SUBSCRIPTION===========================

  // =========================HELPER FUNCTION===========================
  const reload = () => {
    view.getSimpleList();
    tableRef && tableRef.deselectCell();
    view.checkDeletedRecord(false);
  };

  // =========================HELPER FUNCTION===========================

  // =========================WATCH===========================
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
  // =========================//WATCH===========================

  // =========================EVENT HANDLE===========================
  const onLoadPage = (event) => {
    view.pageSize = event.detail.pageSize;
    view.page = event.detail.page;
    reload();
  };

  const onPaginationInit = (event) => {
    view.pageSize = event.detail;
  };
  // =========================//EVENT HANDLE===========================

  // =========================HOOK===========================
  onMount(() => {
    subscription();
    pageRef.loadSettings().then(() => {
      reload();
    });

    tableHeight = window['$']('#' + workListContainerId).height() - 50;
    // import SelectableTable component
    import('@/components/ui/handson-table/index.svelte').then((res) => {
      // @ts-ignore
      TableComponent = res.default;
      console.log('loaded');
    });
  });

  onDestroy(() => {
    needSelectIdSub.unsubscribe();
    needHighlightIdSub.unsubscribe();
    selectDataSub.unsubscribe();
  });
  // =========================//HOOK===========================
</script>

{#if !TableComponent}
  {@html App.PROGRESS_BAR}
{/if}

<svelte:component
  this={TableComponent}
  {menuPath}
  bind:this={tableRef}
  on:selection
  {columns}
  data={$dataList$}
  id={tableId} />
<div style="margin-top: 1px;">
  <Pagination
    {menuPath}
    totalRecords={$fullCount$}
    smallSize={true}
    on:loadPage={onLoadPage}
    on:init={onPaginationInit}
    bind:this={pageRef} />
</div>

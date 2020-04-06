<script lang="ts">
  import { onMount, onDestroy, SvelteComponent } from 'svelte';
  import { fromEvent, Subscription } from 'rxjs';
  import { apolloClient } from '@/assets/js/hasura-client';

  import { ViewStore } from '@/store/view';

  import Pagination from '@/components/ui/pagination/index.svelte';
  import { skip } from 'rxjs/operators';

  export let view: ViewStore;
  export let workListContainerId: string;
  export let menuPath: string;
  export let tableId: string;

  const columns = view.createWorkListColumns();
  const { dataList$, fullCount$ } = view;

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
        }, 1000);
      }
    });

    needHighlightIdSub = view.needHighlightId$.subscribe((id: string) => {
      if (tableRef && id) {
        setTimeout(() => {
          tableRef.highlightRowById(id);
        }, 1000);
      }
    });

    selectDataSub = view.selectedData$.subscribe((data) => {
      if (data && tableRef) {
        tableRef.highlightRowById(data.id);
      } else if (tableRef) {
        tableRef && tableRef.unSelectAll();
      }
    });
  };
  // =========================//SUBSCRIPTION===========================

  // =========================HELPER FUNCTION===========================
  const reload = () => {
    view.getSimpleList();
    tableRef && tableRef.unSelectAll();
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
  // const onSelection = (event) => {
  //   if (event.detail && event.detail.length > 0) {
  //     view.loading$.next(true);
  //     view.getOneById(event.detail[0].id);
  //   }
  // };

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
    import('@/components/ui/selectable-table/index.svelte').then((res) => {
      // @ts-ignore
      TableComponent = res.default;
    });
  });

  onDestroy(() => {
    needSelectIdSub.unsubscribe();
    needHighlightIdSub.unsubscribe();
    selectDataSub.unsubscribe();
  });
  // =========================//HOOK===========================
</script>

<svelte:component
  this={TableComponent}
  startRowCount={(view.page - 1) * view.pageSize + 1}
  height={tableHeight + 'px'}
  bind:this={tableRef}
  on:selection
  {columns}
  {menuPath}
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

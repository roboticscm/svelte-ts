<script lang="ts">
  import { onMount, onDestroy, SvelteComponent } from 'svelte';
  import { fromEvent, Subscription } from 'rxjs';
  import { apolloClient } from '@/lib/js/hasura-client';
  import SelectableTable from '@/components/ui/selectable-table';
  import { ViewStore } from '@/store/view';

  import Pagination from '@/components/ui/pagination';
  import { skip } from 'rxjs/operators';

  export let view: ViewStore;
  export let menuPath: string;
  export let tableId: string;

  const columns = view.createWorkListColumns();
  const { dataList$, fullCount$ } = view;

  let apolloClientList$: any;
  let tableRef: any;
  let pageRef: any;
  let allColumnsSub, needSelectIdSub, needHighlightIdSub, selectDataSub: Subscription;

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
  });

  onDestroy(() => {
    needSelectIdSub.unsubscribe();
    needHighlightIdSub.unsubscribe();
    selectDataSub.unsubscribe();
    if (allColumnsSub) {
      allColumnsSub.unsubscribe();
    }
  });
  // =========================//HOOK===========================
</script>

<div style="height: calc(100% - 20px);">
  <SelectableTable
    startRowCount={(view.page - 1) * view.pageSize + 1}
    bind:this={tableRef}
    on:selection
    {columns}
    {menuPath}
    showRowNumber={true}
    data={$dataList$}
    id={tableId} />
</div>
<div style="margin-top: 1px;">
  <Pagination
    {menuPath}
    totalRecords={$fullCount$}
    smallSize={true}
    on:loadPage={onLoadPage}
    on:init={onPaginationInit}
    bind:this={pageRef} />
</div>

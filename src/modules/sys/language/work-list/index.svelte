<script lang="ts">
  import SelectableTable from '@/components/ui/selectable-table/index.svelte';
  import { ViewStore } from '@/store/view';
  import { onMount, onDestroy } from 'svelte';
  import { apolloClient } from '@/assets/js/hasura-client';
  import { store } from '../store';
  import { Subscription } from 'rxjs';
  import Pagination from '@/components/ui/pagination/index.svelte';

  export let view: ViewStore;

  const tableId = `workList${view.getViewName()}Table`;
  const workListContainerId = `workList${view.getViewName()}Container`;
  const columns = view.createColumns();
  const { dataList$, fullCount$ } = view;

  let apolloClient$: any;
  let tableRef: any;
  let pageRef: any;
  let needSelectIdSub, needHighlightIdSub: Subscription;

  const subscription = () => {
    const query = view.createQuerySubscription();
    apolloClient$ = apolloClient.subscribe({
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
  };

  const reload = () => {
    view.getSimpleList();
    tableRef.unSelectAll();
    view.checkDeletedRecord(false);
  };

  onMount(() => {
    subscription();
    pageRef.loadSettings().then(() => {
      reload();
    });
    console.log(window['$']('#' + workListContainerId).height());
  });

  onDestroy(() => {
    needSelectIdSub.unsubscribe();
    needHighlightIdSub.unsubscribe();
  });

  const onSelection = (event) => {
    if (event.detail && event.detail.length > 0) {
      view.loading$.next(true);
      store.getOneById(view.tableName, event.detail[0].id);
    }
  };

  let firstTimes = true;
  // @ts-ignore
  $: {
    // @ts-ignore
    const dataList = $apolloClient$;
    if (dataList) {
      if (!firstTimes) {
        reload();
      }
      firstTimes = false;
    }
  }

  store.selectedData$.subscribe((data) => {
    if (data && tableRef) {
      tableRef.highlightRowById(data.id);
    } else if (tableRef) {
      tableRef.unSelectAll();
    }
  });

  const onLoadPage = (event) => {
    view.pageSize = event.detail.pageSize;
    view.page = event.detail.page;
    reload();
  };

  const onPaginationInit = (event) => {
    view.pageSize = event.detail;
  };
</script>

<div id={workListContainerId} class="view-left-main">
  <SelectableTable height="500px" bind:this={tableRef} on:selection={onSelection} {columns} data={$dataList$} id ={tableId} />
  <div style="margin-top: 1px;">
    <Pagination
      totalRecords={$fullCount$}
      smallSize={true}
      on:loadPage={onLoadPage}
      on:init={onPaginationInit}
      bind:this={pageRef} />
  </div>
</div>
<div class="view-left-bottom" />

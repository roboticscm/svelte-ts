<script lang="ts">
  import { onMount, onDestroy, SvelteComponent } from 'svelte';
  import { fromEvent, Subscription } from 'rxjs';
  import { apolloClient } from '@/assets/js/hasura-client';
  import SelectableTable from '@/components/ui/selectable-table';
  import { ViewStore } from '@/store/view';
  import { TableColumn } from '@/model/base';
  import Pagination from '@/components/ui/pagination';
  import { skip } from 'rxjs/operators';
  import { T } from '@/assets/js/locale/locale';
  import { Store } from '../store';

  export let view: ViewStore;
  export let store: Store;
  export let menuPath: string;
  export let tableId: string;

  const columns: TableColumn[] = [
    {
      title: T('COMMON.LABEL.LAST_NAME'),
      name: 'lastName',
    },
    {
      title: T('COMMON.LABEL.FIRST_NAME'),
      name: 'firstName',
    },
    {
      title: T('COMMON.LABEL.USERNAME'),
      name: 'username',
    },
  ];
  const { fullCount$ } = view;
  const { dataList$ } = store;

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
    store.sysGetAllAssignmentRoleUserList();
    tableRef && tableRef.unSelectAll();
  };

  // =========================HELPER FUNCTION===========================

  // =========================WATCH===========================
  let firstTimes = true;
  // @ts-ignore
  // $: {
  //     // @ts-ignore
  //     const dataList = $apolloClientList$;
  //     if (dataList) {
  //         if (!firstTimes) {
  //             reload();
  //         }
  //         firstTimes = false;
  //     }
  // }
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
    // subscription();
    pageRef.loadSettings().then(() => {
      reload();
    });
  });

  onDestroy(() => {
    // needSelectIdSub.unsubscribe();
    // needHighlightIdSub.unsubscribe();
    // selectDataSub.unsubscribe();
    // if (allColumnsSub) {
    //     allColumnsSub.unsubscribe();
    // }
  });
  // =========================//HOOK===========================
</script>

<section class="view-left-main">
  <div style="height: calc(100% - 20px);">
    <SelectableTable
      startRowCount={(view.page - 1) * view.pageSize + 1}
      bind:this={tableRef}
      on:selection
      {columns}
      {menuPath}
      showRowNumber={false}
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
</section>
<section class="view-left-bottom" />

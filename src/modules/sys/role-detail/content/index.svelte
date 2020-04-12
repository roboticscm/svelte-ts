<script lang="ts">
  import { onMount } from 'svelte';
  import { T } from '@/assets/js/locale/locale';
  import { ViewStore } from '@/store/view';
  import { columns, nestedHeaders, makeMergeCells } from './helper';
  import { Store } from '../store';

  export let view: ViewStore;
  export let store: Store;

  const tableContainerId = view.getViewName() + 'TableContainerId';
  let excelGridRef: any;
  let ExcelGrid: any;

  let mergeCells: any[];
  const { roleDetails$, dragEndSplitter$ } = store;
  let useMergeCell = true;
  let tableHeight: string;

  $: if ($roleDetails$) {
    if (useMergeCell) {
      mergeCells = makeMergeCells($roleDetails$);
    }
    view.loading$.next(false);
  }

  const calcTableHeight = () => {
    const height = window['$']('#' + tableContainerId).height();
    tableHeight = `${height - 20}px`;
  };

  onMount(() => {
    calcTableHeight();
    import('@/components/ui/excel-grid/index.svelte').then((res) => (ExcelGrid = res.default));

    let resizeTimer;
    window['$'](window).on('resize', function(e) {
      clearTimeout(resizeTimer);
      calcTableHeight();
      resizeTimer = setTimeout(function() {
        excelGridRef && excelGridRef.refresh();
      }, 250);
    });
  });

  // @ts-ignore
  $: if ($dragEndSplitter$) {
    excelGridRef && excelGridRef.refresh();
  }
</script>

<!--Main content-->
<section id={tableContainerId} class="view-content-main">
  <svelte:component
    this={ExcelGrid}
    bind:this={excelGridRef}
    id={'roleControlGrid' + view.getViewTitle() + 'Id'}
    gridNestedHeaders={nestedHeaders}
    {columns}
    data={$roleDetails$}
    height={tableHeight}
    gridMergeCells={useMergeCell ? mergeCells : undefined}>
    <div slot="label">
      <span class="label">{T('SYS.LABEL.MENU')} - {T('SYS.LABEL.ROLE_CONTROL')}:</span>
    </div>
  </svelte:component>
</section>

<!--Form controller-->
<section class="view-content-bottom" />

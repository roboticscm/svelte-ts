<script lang="ts">
  import './selectable_table.js';
  import { BehaviorSubject } from 'rxjs';
  import { TableColumn } from '@/model/base';
  import { tick, createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';
  import { settingsStore } from '@/store/settings';
  import { T } from '@/assets/js/locale/locale';

  const dispatch = createEventDispatcher();
  // import { SObject } from '@/assets/js/sobject';
  // require('jquery-ui');
  // require('jquery-ui/ui/widgets/sortable');

  export let id: string;
  export let showHeader = true;
  export let columns: TableColumn[];
  export let data: any[];
  export let showRowNumber = true;
  export let startRowCount = 1;
  export let menuPath: string;

  let startRow: any = null;
  let selectedRows: number[] = [];

  onMount(() => {
    loadSettings();
  });

  const onSelectedRow = () => {
    // @ts-ignore
    let selectedRowsData = selectedRows.map((index) => data[index]);

    dispatch('selection', selectedRowsData);
  };

  const getTableId = () => {
    const jId: any = window['$']('#' + id);
    return jId;
  };

  const getFirstRowEle = () => {
    return document.querySelector(`#${id} tbody tr :first-child`);
  };
  const applyTable = () => {
    // selectedRows = [];

    getTableId().SelectableTable(
      {
        sort: true,
      },
      function(obj: any) {
        selectedRows = obj.rows;
        onSelectedRow();

        // register key for navigation
        startRow = document.querySelector(`#row_${obj.rows[0]}_Id :first-child`);
        if (startRow) {
          startRow.focus();
        }
        document.onkeydown = (e) => {
          checkKey(e);
        };
      },
    );
  };

  const selectAll = () => {
    getTableId().selectAll(true, function(obj: any) {
      selectedRows = obj.rows;
      onSelectedRow();
    });
  };

  export const unSelectAll = () => {
    getTableId().selectAll(false, function(obj: any) {
      selectedRows = obj.rows;
      onSelectedRow();
    });
  };

  const toggleSelection = () => {
    getTableId().toggleSelection(function(obj: any) {
      selectedRows = obj.rows;
      onSelectedRow();
    });
  };

  const findRowById = (id: any) => {
    for (let i = 0; i < data.length; i++) {
      if (id && data[i].id && id.toString() === data[i].id.toString()) {
        return i;
      }
    }

    return -1;
  };

  export const selectRowById = (id: any) => {
    const row = findRowById(id);
    if (row >= 0) {
      getTableId().selectRow(row, function(obj: any) {
        selectedRows = obj.rows;
        onSelectedRow();
      });
    }
  };

  export const highlightRowById = (id: any) => {
    const row = findRowById(id);
    if (row >= 0) {
      getTableId().selectRow(row, function(obj: any) {
        selectedRows = obj.rows;
      });
    }
  };

  const getSelectedData = () => {
    const result = selectedRows.map((index) => data[index]);
    return result;
  };

  function dotheneedful(sibling, row) {
    if (sibling != null) {
      sibling.focus();
      // let [, row] = sibling.id.split('_');
      // row = Number(row);
      getTableId().selectRow(row, function(obj: any) {
        selectedRows = obj.rows;
        onSelectedRow();
      });
      startRow = sibling;
    }
  }

  function checkKey(e) {
    e = e || window.event;
    if (e.code == 'ArrowUp') {
      let idx = startRow.cellIndex;

      let nextrow = startRow.parentElement && startRow.parentElement.previousElementSibling;
      console.log(startRow);
      if (nextrow != null) {
        let sibling = nextrow.cells[idx];
        let row = Number(sibling.id.split('_')[1]);
        if (row >= 0) {
          dotheneedful(sibling, row);
          // startingY += 200;
          // window.scrollTo(0, startingY);
        }
      }
    } else if (e.code == 'ArrowDown') {
      let idx = startRow.cellIndex;
      let nextrow = startRow.parentElement && startRow.parentElement.nextElementSibling;
      if (nextrow != null) {
        let sibling = nextrow.cells[idx];
        let row = Number(sibling.id.split('_')[1]);
        if (row < data.length) {
          dotheneedful(sibling, row);
          // startingY += 200;
          // window.scrollTo(0, startingY);
        }
      }
    }
    dispatch('keyup', { event: e, data: getSelectedData() });
  }

  export const focus = () => {
    // register key for navigation
    startRow = getFirstRowEle();
    startRow.focus();
    document.onkeydown = (e) => {
      checkKey(e);
    };

    getTableId().selectRow(0, function(obj: any) {
      selectedRows = obj.rows;
      onSelectedRow();
    });
  };

  const onClick = (event) => {
    dispatch('click', { event: event, data: getSelectedData() });
  };

  const selectRowByIndex = (rowIndex: number) => {
    getTableId().selectRow(rowIndex, function(obj: any) {
      selectedRows = obj.rows;
      onSelectedRow();
    });
  };

  // @ts-ignore
  $: if (data) {
    tick().then(() => {
      applyTable();
    });
    // setTimeout(()=> {
    //   applyTable();
    // }, 500);
  }

  const saveSettings = () => {
    const headerEle = window['$'](`#${id} thead tr th`);

    const keys = [];
    const values = [];

    headerEle &&
      headerEle.each(function(col) {
        keys.push(col);
        // @ts-ignore
        values.push(window['$'](this).width());
      });

    settingsStore.saveUserSettings({
      menuPath,
      controlId: id,
      keys,
      values,
    });
  };

  const loadSettings = () => {
    const headerEle = window['$'](`#${id} thead tr th`);

    settingsStore.getUserSettings(id, menuPath).then((res: any[]) => {
      headerEle.each(function(col) {
        if (res && res.length > 0) {
          const filter = res.filter((it) => it.key == col);
          if (filter && filter.length > 0) {
            // @ts-ignore
            window['$'](this).width(+filter[0].value);
          }
        }
      });
    });
  };

  const onMouseUpHeader = (event) => {
    saveSettings();
  };
</script>

<style lang="scss">

</style>

<div style="height: 100%; overflow: auto;">
  <slot name="label" />
  <span title={T('COMMON.LABEL.SELECT_ALL')}>
    <slot name="selectAll" {selectAll} />
  </span>

  <span title={T('COMMON.LABEL.UN_SELECT_ALL')}>
    <slot name="unSelectAll" {unSelectAll} />
  </span>

  <span title={T('COMMON.LABEL.TOGGLE_SELECTION')}>
    <slot name="toggleSelection" {toggleSelection} />
  </span>

  <table on:click|stopPropagation={onClick} {id} class="table">
    {#if showHeader}
      <thead>
        <tr on:mouseup={onMouseUpHeader}>
          {#if showRowNumber}
            <th title={T('COMMON.LABEL.ROW_NUMBER')} class="freeze">#</th>
          {/if}
          {#each columns as col, index}
            {#if col.type !== 'hidden'}
              <th title={col.title}>
                {@html col.title}
              </th>
            {/if}
          {/each}
        </tr>
      </thead>
    {/if}
    <tbody>
      {#each data as row, rowIndex}
        <tr id={'row_' + rowIndex + '_Id'}>
          {#if showRowNumber}
            <th id={`cell_${rowIndex}_${0}_${id}`} class="freeze row-number">{startRowCount + rowIndex}</th>
          {/if}
          {#each columns as col, colIndex}
            {#if col.type !== 'hidden'}
              <td title={row[col.name]} id={`cell_${rowIndex}_${colIndex}_${id}`}>
                {@html row[col.name]}
              </td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

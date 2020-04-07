<script lang="ts">
  import './selectable_table.js';
  import { BehaviorSubject } from 'rxjs';
  import { TableColumn } from '@/model/base';
  import { tick, createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';
  import { settingsStore } from '@/store/settings';

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
        startRow = document.querySelector(`#cell_${obj.rows[0]}_0_${id}`);
        startRow.focus();
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

  function dotheneedful(sibling) {
    if (sibling != null) {
      sibling.focus();
      startRow = sibling;
      let [, row] = sibling.id.split('_');
      row = Number(row);
      getTableId().selectRow(row, function(obj: any) {
        selectedRows = obj.rows;
        onSelectedRow();
      });
    }
  }

  function checkKey(e) {
    e = e || window.event;
    if (e.code == 'ArrowUp') {
      let idx = startRow.cellIndex;

      let nextrow = startRow.parentElement && startRow.parentElement.previousElementSibling;
      if (nextrow != null) {
        let sibling = nextrow.cells[idx];
        let [, row] = sibling.id.split('_');
        row = Number(row);

        if (row >= 0) {
          dotheneedful(sibling);
          // startingY += 200;
          // window.scrollTo(0, startingY);
        }
      }
    } else if (e.code == 'ArrowDown') {
      let idx = startRow.cellIndex;
      let nextrow = startRow.parentElement && startRow.parentElement.nextElementSibling;
      if (nextrow != null) {
        let sibling = nextrow.cells[idx];
        dotheneedful(sibling);
        // startingY -= 200;
        // window.scrollTo(0, startingY);
      }
    }
    dispatch('keyup', { event: e, data: getSelectedData() });
  }

  export const focus = () => {
    // register key for navigation
    startRow = document.querySelector(`#cell_0_0_${id}`);
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
  <table on:click|stopPropagation={onClick} {id} class="table">
    {#if showHeader}
      <thead>
        <tr on:mouseup={onMouseUpHeader}>
          {#if showRowNumber}
            <th class="freeze">#</th>
          {/if}
          {#each columns as col, index}
            <th>
              {@html col.title}
            </th>
          {/each}
        </tr>
      </thead>
    {/if}
    <tbody>
      {#each data as row, rowIndex}
        <tr>
          {#if showRowNumber}
            <th class="freeze row-number">{startRowCount + rowIndex}</th>
          {/if}
          {#each columns as col, colIndex}
            <td id={`cell_${rowIndex}_${colIndex}_${id}`}>
              {@html row[col.name]}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

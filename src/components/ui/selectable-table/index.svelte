<script lang="ts">
  import './selectable_table.js';
  import { BehaviorSubject } from 'rxjs';
  import { TableColumn } from '@/model/base';
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';

  const dispatch = createEventDispatcher();
  // import { SObject } from '@/assets/js/sobject';
  // require('jquery-ui');
  // require('jquery-ui/ui/widgets/sortable');

  export let id: string;
  export let fixedHeader = true;
  export let showHeader = true;
  export let columns: TableColumn[];
  export let data: any[];
  export let height: string = undefined; // in pixel

  let startRow: any = null;
  let selectedRows: number[] = [];

  onMount(() => {
    const tbodyEle: any = document.querySelector(`#${id} tbody`);
    // height must be in vh
    if (height) {
      tbodyEle.style.maxHeight = height;
    }
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
    startRow = null;
    selectedRows = [];

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
    return selectedRows.map((index) => data[index]);
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

      let nextrow = startRow.parentElement.previousElementSibling;
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
      let nextrow = startRow.parentElement.nextElementSibling;
      if (nextrow != null) {
        let sibling = nextrow.cells[idx];
        dotheneedful(sibling);
        // startingY -= 200;
        // window.scrollTo(0, startingY);
      }
    }
    dispatch('keyup', { event: e, data: getSelectedData() });
  }

  const focus = () => {
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
  $: {
    const _ = data;
    setTimeout(() => {
      applyTable();
    }, 500);
  }
</script>

<style lang="scss">

</style>

<div>
  <slot name="label" />

  <table on:click|stopPropagation={onClick} {id} class="table {fixedHeader ? 'table-scroll' : ''}">
    {#if showHeader}
      <thead>
        <tr>
          {#each columns as col}
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

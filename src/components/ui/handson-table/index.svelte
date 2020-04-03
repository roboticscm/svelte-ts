<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import Handsontable from 'handsontable';
  import { TableColumn } from '@/model/base';
  import { settingsStore } from '@/store/settings';

  export let id: string;
  export let data: any[];
  export let columns: TableColumn[];
  export let menuPath: string;

  const dispatch = createEventDispatcher();
  let highlightId: any = undefined;

  let tableInstance: any;
  onMount(() => {
    settingsStore.getUserSettings(id, menuPath).then((res) => {
      let colWidths = [];

      if (res && res.length > 0) {
        colWidths = res.map((it) => {
          return {
            col: +it.key,
            width: +it.value,
          };
        });
      }
      tableInstance = createTable(colWidths);
    });
  });

  const createTable = (colWidths: any[]) => {
    const container = document.querySelector(`#${id}`);
    return new Handsontable(container, {
      data,
      stretchH: 'all',
      width: '100%',
      height: 'calc(100% - 20px)',
      colHeaders: columns.map((c: TableColumn) => c.title),
      columns: columns.map((c: TableColumn) => {
        return { data: c.name };
      }),
      hiddenColumns: {
        columns: columns
          .map((c: TableColumn, index: number) => (c.hidden ? index : -1))
          .filter((idx: number) => idx > -1),
        indicators: false,
      },
      colWidths: (index: number) => {
        const filter = colWidths.filter((it) => it.col === index);
        if (filter && filter.length > 0) {
          return filter.map((it) => it.width)[0];
        }
      },
      rowHeaders: true,
      filters: true,
      dropdownMenu: true,
      outsideClickDeselects: false,
      licenseKey: 'non-commercial-and-evaluation',
      readOnly: true,
      manualColumnResize: true,
      manualRowMove: true,
      manualColumnMove: true,
      afterSelection: (row, column, row2, column2, preventScrolling, selectionLayerLevel) => {
        preventScrolling.value = true;
        dispatch('selection', getObjectData().slice(row, row2 + 1));
        clearHighlight();
      },
      afterColumnResize: saveOnColumnResize,
    });
  };

  const highlightRenderer = (instance, td, row, col, prop, value, cellProperties) => {
    td.style.fontWeight = 'bold';
    td.style.color = 'red';
    td.style.background = '#CEC';
  };

  const customCell = (row, col, prop) => {
    const cellProperties: any = {};
    if (highlightId) {
      const index = findRowIndexById(highlightId);
      if (index >= 0) {
        if (row === index) {
          cellProperties.renderer = highlightRenderer;
        }
      }
    }
    return cellProperties;
  };

  const saveOnColumnResize = (currentColumn: number, newSize: number) => {
    const keys = [];
    const values = [];

    for (let col = 0; col < columns.length; col++) {
      if (!columns[col].hidden) {
        keys.push(col);
        // values.push(tableInstance.getColWidth(col));
        values.push(tableInstance.view.wt.wtTable.getStretchedColumnWidth(col));
      }
    }

    settingsStore.saveSettings({
      controlId: id,
      menuPath,
      keys,
      values,
    });
  };
  const getObjectData = () => {
    const colData = tableInstance.getDataAtProp('id');
    return colData.map((id: any) => {
      return data.find((row: any) => row.id.toString() === id.toString());
    });
  };

  const findRowIndexById = (id: any) => {
    const colData = tableInstance.getDataAtProp('id');
    return colData.findIndex((it) => it.toString() === id.toString());
  };

  export const selectRowById = (id: any) => {
    clearHighlight();
    const rowIndex = findRowIndexById(id);
    tableInstance.selectRows(rowIndex, rowIndex);
  };

  export const getSelected = () => {
    return tableInstance.getSelected();
  };

  export const deselectCell = () => {
    if (tableInstance) {
      tableInstance.deselectCell();
      clearHighlight();
    }
  };

  export const highlightRowById = (id: any) => {
    highlightId = id;
    tableInstance.updateSettings({
      cells: customCell,
    });
  };

  export const clearHighlight = () => {
    highlightId = undefined;
    tableInstance.updateSettings({
      cells: customCell,
    });
  };

  export const getFirstSelectedRowId = () => {
    const selectedRows = getSelected();
    if (!selectedRows || selectedRows.length === 0) {
      return undefined;
    }
    const colData = tableInstance.getDataAtProp('id');
    return colData[selectedRows[0][0]];
  };

  // @ts-ignore
  $: {
    if (tableInstance) {
      tableInstance.loadData(data);
      clearHighlight();
    }
  }
</script>

<div {id} />

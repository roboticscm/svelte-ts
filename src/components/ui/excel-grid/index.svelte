<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import jexcel from 'jexcel';
  import { Settings } from '@/model/settings';
  import { UrlUtil } from '@/assets/js/url-util';
  import { Debug } from '@/assets/js/debug';
  import { settingsStore } from '@/store/settings';

  const dispatch = createEventDispatcher();

  export let id: string;
  export let fullWidth = true;
  export let columns: any[];
  export let data: any[];
  export let height = '70vh';
  export let gridMergeCells = {};
  export let menuPath: string;
  export let containerWidth: string;
  export let gridNestedHeaders = [];
  export let useInModal = true;
  export let mouseUp: any = undefined;

  let gridRef: any;

  let jExcelObj: any;
  let startTime = Date.now();

  let fireResizeEvent = true;

  const onWindowResize = (event) => {
    // const containerWidth = event.target.innerWidth;
    let now = Date.now();
    if (now - startTime > 100) {
      startTime = now;
    } else {
      return;
    }

    if (!jExcelObj) {
      return;
    }
    recalculateColumnWidth();
    columns.map((col: any, index: number) => {
      if (col.type !== 'hidden') {
        jExcelObj.setWidth(index, +col.width);
      }
    });
  };

  onMount(() => {
    if (!useInModal) {
      window.addEventListener('resize', onWindowResize);
    }
  });

  const onChanged = (instance: any, cell: any, x: any, y: any, value: any) => {
    dispatch('changed', { x, y, value });
  };

  // TODO: param not test
  const onBeforeChange = (instance: any, cell: any, x: any, y: any, value: any) => {
    dispatch('beforeChange', { x, y, value });
  };

  const recalculateColumnWidth = () => {
    const _containerWidth = window['$'](gridRef).width();

    const colIndexWidth = 60;
    if (_containerWidth <= colIndexWidth) {
      return;
    }
    if (fullWidth) {
      const beforeWidthSum = columns
        .map((it: any) => (it.type === 'hidden' ? 0 : it.width ? +it.width : 0))
        .reduce((w1: number, w2: number) => {
          return w1 + w2;
        }, 0);

      const ratio = (_containerWidth - colIndexWidth) / beforeWidthSum;

      columns.map((col: any) => {
        if (col.type !== 'hidden') {
          col.width = Math.round(ratio * col.width);
        }
        return col;
      });
    }
  };

  const createGrid = (data: any) => {
    if (!jExcelObj) {
      if (!id) {
        Debug.errorSection('Excel Grid', "Maybe you didn't set Id for this Grid");
        return;
      }
      if (!columns || columns.length === 0) {
        return;
      }

      const el: any = document.getElementById(id);
      if (!el) {
        return;
      }
      recalculateColumnWidth();
      jExcelObj = jexcel(el, {
        data: data,
        // editable: !disabled,
        columns: columns,
        updateTable: onUpdateTable,
        onchange: onChanged,
        onbeforechange: onBeforeChange,
        onbeforedeleterow: onBeforeDeleteRow,
        onselection: onSelection,
        tableOverflow: true,
        tableWidth: '100%',
        tableHeight: height,
        mergeCells: gridMergeCells,
        nestedHeaders: gridNestedHeaders,
        allowInsertRow: true,
        columnDrag: true,
        rowDrag: true,
        // contextMenu: function() {
        //   return false;
        // },
        onresizecolumn: (instance: any, col: number, width: number) => {
          recalculateColumnWidth();
          if (fireResizeEvent) {
            saveSettings(col, columns[col].width);
          }
        },
      });
      // jExcelObj.resetSelection(true);
      loadSettings();
    } else {
      jExcelObj.destroyMerged();
      jExcelObj.setData(data);
      for (let prop in gridMergeCells) {
        jExcelObj.setMerge(prop, gridMergeCells[prop][0], gridMergeCells[prop][1]);
      }
    }
  };

  export const getData = () => {
    return jExcelObj.getJson();
  };

  const saveSettings = (col: number, width: number) => {
    settingsStore.saveSettings({
      menuPath,
      controlId: id,
      keys: [col + ''],
      values: [width + ''],
    });
  };

  const loadSettings = () => {
    fireResizeEvent = false;
    settingsStore
      .getUserSettings(id, menuPath)
      .then((data) => {
        if (data) {
          data.map((item: any) => {
            let column = Number(item.key);
            let value = Number(item.value);
            if (jExcelObj) {
              if (fullWidth) {
                if (columns.length > column) {
                  columns[column].width = value;
                }
              } else {
                jExcelObj.setWidth(column, value);
              }
            }
          });

          if (fullWidth) {
            recalculateColumnWidth();
            columns.map((col: any, index: number) => {
              jExcelObj.setWidth(index, col.width);
            });
          }
        }
        fireResizeEvent = true;
      })
      .catch((error: any) => {
        fireResizeEvent = true;
        console.error(error);
      });
  };

  const getGridInstance = () => {
    return jExcelObj;
  };

  onDestroy(() => {
    window.removeEventListener('resize', onWindowResize);

    const ele = document.getElementById(id);
    if (ele) {
      jexcel.destroy(ele, true);
    }
  });

  onMount(() => {
    createGrid(data);
  });

  const onBeforeDeleteRow = (event) => {
    dispatch('beforeDeleteRow', event);
    return true;
  };

  const onUpdateTable = (el, cell, x, y, source, value, id) => {
    dispatch('updateTable', {
      el,
      cell,
      x,
      y,
      source,
      value,
      id,
    });
  };

  const onSelection = (element, x, y) => {
    dispatch('selection', { x, y });
  };

  const resizeGrid = (width: string) => {
    fireResizeEvent = false;
    let now = Date.now();
    if (now - startTime > 100) {
      startTime = now;
    } else {
      return;
    }

    if (!fullWidth || !jExcelObj) return;
    if (width) {
      recalculateColumnWidth();
      columns.map((col: any, index: number) => {
        if (col.type !== 'hidden') {
          jExcelObj.setWidth(index, +col.width);
        }
      });
    }
  };

  // @ts-ignore
  $: if (data) {
    createGrid(data);
  }

  // @ts-ignore
  $: resizeGrid(containerWidth);

  // @ts-ignore
  $: if (mouseUp) {
    const keys: string[] = [];
    const values: string[] = [];
    fireResizeEvent = true;
    columns.map((col, index) => {
      keys.push('col' + index);
      values.push(col.width);
    })
    settingsStore.saveSettings({
      menuPath,
      controlId: id,
      keys,
      values
    });
  }

</script>

<style lang="scss">
  .grid-content {
    display: flex;
    flex-direction: column;
    align-items: start;
  }
</style>

<div class="grid-content">
  <slot name="label" />
  <div bind:this={gridRef} style="width: 100%; height: 100%;" {id} />
</div>

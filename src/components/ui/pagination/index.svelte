<script lang="ts">
  import { T } from '@/assets/js/locale/locale';
  import { settingsStore } from '@/store/settings';
  import { createEventDispatcher } from 'svelte';
  import { App } from '@/assets/js/constants';

  const dispatch = createEventDispatcher();

  export let totalRecords: number;
  export let smallSize = false;
  export let autoLoad = false;
  export let showDisabledButton = true;
  export let showFirstLastButton = true;
  export let menuPath: string;

  const sizes = [3, 10, 20, 50, 100, 500, 1000, -1];
  let pageSize = sizes[0];
  let curPage = 1;

  let totalPages, prevStatus, firstStatus, nextStatus, lastStatus;
  // @ts-ignore
  $: totalPages = Math.ceil(totalRecords / pageSize);
  // @ts-ignore
  $: prevStatus = totalPages > 1 && curPage > 1;
  // @ts-ignore
  $: firstStatus = curPage > 2;
  // @ts-ignore
  $: nextStatus = totalPages > 1 && curPage < totalPages;
  // @ts-ignore
  $: lastStatus = curPage < totalPages - 1;

  const getPages = () => {
    const rows = [];
    for (let i = 0; i < totalPages - 1; i++) {
      rows.push({
        id: i + 1,
        value: `${i * pageSize + 1} - ${(i + 1) * pageSize}`,
      });
    }

    const i = totalPages - 1;

    rows.push({
      id: i + 1,
      value: `${i * pageSize + 1} - ${i * pageSize +
        (totalRecords % pageSize === 0 ? pageSize : totalRecords % pageSize)}`,
    });
    return rows;
  };

  export const loadSettings = () => {
    return new Promise((resolve, reject) => {
      settingsStore
        .getUserSettings('pageSizeSelectId', menuPath)
        .then((res: any) => {
          const filter = res.filter((it) => it.key === 'lastPageSize');
          if (filter.length > 0) {
            pageSize = +filter[0].value;
            dispatch('init', pageSize);
          } else {
            pageSize = App.DEFAULT_PAGE_SIZE;
          }
          resolve('ok');
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  if (autoLoad) {
    loadSettings();
  }

  const onPageSizeChange = (event) => {
    pageSize = +event.target.value;
    const totalPages = Math.ceil(totalRecords / pageSize);
    if (curPage > totalPages) {
      curPage = 1;
    }

    settingsStore.saveUserSettings({
      menuPath,
      controlId: 'pageSizeSelectId',
      keys: ['lastPageSize'],
      values: [`${pageSize}`],
    });
    requireLoadPage();
  };

  const requireLoadPage = () => {
    dispatch('loadPage', {
      page: curPage,
      pageSize,
    });
  };

  const onPageChange = (event) => {
    curPage = +event.currentTarget.value;

    requireLoadPage();
  };

  const jumpToPage = (page: number) => {
    if (page < 1) {
      page = 1;
    } else if (page > totalPages) {
      page = totalPages;
    }
    curPage = page;
    requireLoadPage();
  };
</script>

<style lang="scss">
  .pagination {
    & button {
      margin-left: 0;
      outline: none;
    }

    & select {
      outline: none;
    }
  }
</style>

{#if totalRecords > 0}
  <span class="pagination" style="white-space: nowrap;">
    {#if totalPages > 1}
      <span style="white-space: nowrap">
        <!--      first button-->
        {#if showFirstLastButton && (firstStatus || showDisabledButton)}
          <button
            title={T('COMMON.LABEL.FIRST')}
            disabled={!firstStatus}
            on:click={() => jumpToPage(1)}
            class={smallSize ? 'btn-small-info' : 'btn-info'}>
            ⇤
          </button>
        {/if}
        <!--      prev button-->
        {#if prevStatus || showDisabledButton}
          <button
            title={T('COMMON.LABEL.PREVIOUS')}
            disabled={!prevStatus}
            on:click={() => jumpToPage(curPage - 1)}
            class={smallSize ? 'btn-small-success' : 'btn-success'}>
            ←
          </button>
        {/if}
        <!--      page-->
        <select
          title={T('SYS.LABEL.RECORDS')}
          on:change={onPageChange}
          class={smallSize ? 'small-control-dropdown' : 'control-dropdown'}>
          {#each getPages() as page}
            <option selected={page.id === curPage} value={page.id}>{page.value}</option>
          {/each}
        </select>

        <!--      next button-->
        {#if nextStatus || showDisabledButton}
          <button
            title={T('COMMON.LABEL.NEXT')}
            disabled={!nextStatus}
            on:click={() => jumpToPage(curPage + 1)}
            class={smallSize ? 'btn-small-success' : 'btn-success'}>
            →
          </button>
        {/if}
        <!--     last button-->
        {#if showFirstLastButton && (lastStatus || showDisabledButton)}
          <button
            title={T('COMMON.LABEL.LAST')}
            disabled={!lastStatus}
            on:click={() => jumpToPage(totalPages)}
            class={smallSize ? 'btn-small-info' : 'btn-info'}>
            ⇥
          </button>
        {/if}
      </span>
    {/if}
    <select
      title={T('SYS.LABEL.PAGE_SIZE')}
      on:change={onPageSizeChange}
      bind:value={pageSize}
      class={smallSize ? 'small-control-dropdown' : 'control-dropdown'}>
      {#each sizes as size}
        <option value={size}>{size !== -1 ? size : T('SYS.LABEL.ALL')}</option>
      {/each}
    </select>
    <span title={T('COMMON.LABEL.TOTAL_RECORD')}>{'#' + totalRecords}</span>
    <!--     Default slot-->
    <slot />
  </span>
{/if}

<script lang="ts">
  import SelectableTable from '@/components/ui/selectable-table/index.svelte';
  import { ViewStore } from '@/store/view';
  import { onMount } from 'svelte';
  import { apolloClient } from '@/assets/js/hasura-client';
  import { store } from '../store';
  export let view: ViewStore;

  const id = `workList${view.getViewName()}Table`;
  const columns = view.createColumns();
  const { dataList$ } = view;
  let apolloClient$: any;

  const subscribe = () => {
    const query = view.createQuerySubscription();
    apolloClient$ = apolloClient.subscribe({
      query,
    });
  };

  const reload = () => {
    view.getSimpleList();
  };

  onMount(() => {
    subscribe();
  });

  const onSelection = (event) => {
    if (event.detail && event.detail.length > 0) {
      view.loading$.next(true);
      store.getOneById(view.tableName, event.detail[0].id);
    }
  };

  // @ts-ignore
  $: {
    // @ts-ignore
    const dataList = $apolloClient$;
    if (dataList) {
      reload();
    }
  }
</script>

<div id="workListContainer" class="view-left-main">
  <SelectableTable on:selection={onSelection} {columns} data={$dataList$} {id} />
  <div style="margin-top: 1px;">Paging</div>
</div>
<div class="view-left-bottom" />

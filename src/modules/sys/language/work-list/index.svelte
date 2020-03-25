<script lang="ts">
  import SelectableTable from '@/components/ui/selectable-table/index.svelte';
  import { ViewStore } from '@/store/view';
  import { onMount } from 'svelte';
  import { apolloClient } from '@/assets/js/hasura-client';

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
  const onceLoad = () => {
    reload();
  };

  const reload = () => {
    view.getSimpleList();
  };

  onMount(() => {
    subscribe();
    onceLoad();
  });

  // @ts-ignore
  $: {
    // @ts-ignore
    const _ = $apolloClient$;
    reload();
  }
</script>

<div id="workListContainer" class="view-left-main">
  <SelectableTable {columns} data={$dataList$} {id} />
  <div style="margin-top: 1px;">Paging</div>
</div>
<div class="view-left-bottom" />

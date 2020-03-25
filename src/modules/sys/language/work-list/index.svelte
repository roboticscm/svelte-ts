<script lang="ts">
import SelectableTable from '@/components/ui/selectable-table/index.svelte';
import {ViewStore} from '@/store/view';
import {onMount} from 'svelte';
import {apolloClient} from '@/assets/js/hasura-client';
import gql from 'graphql-tag';

export let view: ViewStore;

const id = `workList${view.getViewName()}Table`;;
const columns = view.createColumns();
let apolloClient$: any;

const subscribe = () => {
  const query = gql`
    subscription LangSubscription {
      language {
        id
        locale
        name
        sort
        updated_by
        updated_date
        disabled
        deleted_by
        deleted_date
      }
    }
  `
  apolloClient$ = apolloClient.subscribe({
    query
  });
}
const onceLoad = () => {
  reload();
}

const reload =() => {
  view.getSimpleList();
}

onMount(() => {
  subscribe();
  onceLoad();
})

let test: any;
$: {
  test = $apolloClient$
  reload();
}
</script>

<div id="workListContainer" class="view-left-main">
  <SelectableTable   {columns} data$ = {view.dataList$} {id}></SelectableTable>
  <div style="margin-top: 1px;">Paging</div>
</div>
<div class="view-left-bottom" />

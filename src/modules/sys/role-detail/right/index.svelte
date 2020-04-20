<script lang="ts">
  import { onMount } from 'svelte';
  import TreeView from '@/components/ui/tree-view';
  import { ViewStore } from '@/store/view';
  import { Store } from '../store';
  import { T } from '@/lib/js/locale/locale';

  export let view: ViewStore;
  export let store: Store;

  let roleTreeRef: any;

  const { isReadOnlyMode$ } = view;
  const { filterOrg$, selectedData$ } = store;

  const onClickRoleTree = (event: any) => {
    const treeNode: any = event.detail.treeNode;
    view.loading$.next(true);
    // @ts-ignore
    store.loadRoleDetail(treeNode.id, $selectedData$.id.replace('role', ''));
  };
</script>

<!--Main content-->
<section class="view-content-main">
  <TreeView
    on:click={onClickRoleTree}
    bind:this={roleTreeRef}
    id={'filterOrgTree' + view.getViewName() + 'Id'}
    data={$filterOrg$}>
    <div slot="label" class="label">{T('SYS.LABEL.FILTER_ORG')}:</div>
  </TreeView>
</section>

<!--Form controller-->
<section class="view-content-bottom" />

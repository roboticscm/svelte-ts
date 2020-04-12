<script lang="ts">
  import { onMount } from 'svelte';
  import TreeView from '@/components/ui/tree-view';
  import { ViewStore } from '@/store/view';
  import { Store } from '../store';
  import { T } from '@/assets/js/locale/locale';

  export let view: ViewStore;
  export let store: Store;

  let roleTreeRef: any;

  const { isReadOnlyMode$ } = view;
  const { roles$ } = store;

  const reload = () => {
    store.loadRoleTree();
  };

  onMount(() => {
    reload();
  });

  const extractRoleId = (node: any) => {
    if (node && node.id && node.id.includes('role')) {
      return node.id.replace('role', '');
    } else {
      return null;
    }
  };

  const extractOrgId = (node: any) => {
    if (node && node.pId && node.pId.includes('org')) {
      return node.pId.replace('org', '');
    } else {
      return null;
    }
  };

  const onClickRoleTree = (event) => {
    const orgId = extractOrgId(event.detail.treeNode);
    const roleId = extractRoleId(event.detail.treeNode);
    view.loading$.next(true);
    store.loadRoleDetail(orgId, roleId);
  };
</script>

<!--Main content-->
<section class="view-content-main">
  <TreeView
    on:click={onClickRoleTree}
    bind:this={roleTreeRef}
    id={'roleTree' + view.getViewName() + 'Id'}
    data={$roles$}
    disabled={$isReadOnlyMode$}>
    <div slot="label" class="label">{T('SYS.LABEL.AVAILABLE_ROLE')}:</div>
  </TreeView>
</section>

<!--Form controller-->
<section class="view-content-bottom" />

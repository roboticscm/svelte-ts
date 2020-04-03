<script lang="ts">
  import { onDestroy, tick, createEventDispatcher } from 'svelte';

  export let id: string;
  export let data: any[];
  export let disabled = false;
  export let isCheckableNode = false;

  const dispatch = createEventDispatcher();

  // @ts-ignore
  const noDataImage = require('../../../../public/images/no-data-found.png').default;

  const setFontCss = (treeId, treeNode) => {
    const body = document.querySelector('body[class^="theme-"]');
    let highlightColor = getComputedStyle(body as any)
      .getPropertyValue('--highlight-text-color')
      .trim();
    return treeNode.done === true ? { color: highlightColor } : {};
  };

  export const getTreeInstance = () => {
    return (window['$'] as any).fn.zTree.getZTreeObj(id);
  };

  export const selectNodeById = (id: any) => {
    const treeObj = getTreeInstance();
    if (treeObj && id) {
      const nodes = treeObj.getNodesByParam('id', id, null);
      if (nodes && nodes.length > 0) {
        treeObj.selectNode(nodes[0]);
      }
    }
  };

  export const getSelectedNode = () => {
    const treeObj = getTreeInstance();

    let nodes = treeObj && treeObj.getSelectedNodes();

    if (nodes && nodes.length > 0) {
      return nodes[0];
    } else {
      return undefined;
    }
  };

  export const getCheckedLeafIds = (checked: boolean) => {
    const treeObj = getTreeInstance();
    let nodes = treeObj && treeObj.getCheckedNodes(checked);

    if (nodes && nodes.length > 0) {
      return nodes.filter((node: any) => !node.isParent).map((node: any) => node.id);
    } else {
      return [];
    }
  };

  export const disableTree = (disable: boolean) => {
    const treeObj = getTreeInstance();

    const rootNodes = treeObj && treeObj.getNodes();
    if (rootNodes) {
      const nodes = treeObj.transformToArray(rootNodes);
      for (let i = 0, l = nodes.length; i < l; i++) {
        treeObj.setChkDisabled(nodes[i], disable);
      }
    }
  };

  export const cleanTree = () => {
    const treeObj = getTreeInstance();

    const rootNodes = treeObj && treeObj.getNodes();
    if (rootNodes) {
      const nodes = treeObj.transformToArray(rootNodes);
      for (let i = 0, l = nodes.length; i < l; i++) {
        treeObj.removeNode(nodes[i]);
      }
    }
  };

  // @ts-ignore
  $: {
    tick().then(() => disableTree(disabled));
  }

  // @ts-ignore
  $: {
    (window['$'] as any).fn.zTree.destroy(window['$']('#' + id));
    const setting = {
      check: {
        enable: isCheckableNode,
      },
      view: {
        fontCss: setFontCss,
      },
      data: {
        simpleData: {
          enable: true,
        },
      },
      callback: {
        onClick: (event: any, treeId: any, treeNode: any) => {
          event.preventDefault();
          dispatch('click', { event, treeId, treeNode });
        },
      },
    };
    (window['$'] as any).fn.zTree.init(window['$']('#' + id), setting, data);

    tick().then(() => disableTree(disabled));
  }

  onDestroy(() => {
    (window['$'] as any).fn.zTree.destroy(window['$']('#' + id));
  });
</script>

<style lang="scss">

</style>

<div class="tree-wrapper">
  <slot name="label" />
  <ul {id} class="tree ztree" />
  {#if !data || data.length === 0}
    <div class="no-data">
      <img src={noDataImage} alt="" />
    </div>
  {/if}
</div>

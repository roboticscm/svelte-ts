<script lang="ts">
  import { onDestroy, tick, createEventDispatcher } from 'svelte';

  export let id: string;
  export let data: any[];
  export let disabled = false;
  export let isCheckableNode = false;
  export let radioType: string = undefined;

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

  export const selectNodeById = (id: any, fireClickEvent = false) => {
    const treeObj = getTreeInstance();
    if (treeObj && id) {
      const nodes = treeObj.getNodesByParam('id', id, null);
      if (nodes && nodes.length > 0) {
        treeObj.selectNode(nodes[0]);
        if (fireClickEvent) {
          dispatch('click', { event: {}, treeId: id, treeNode: nodes[0] });
        }
      }
    }
  };

  export const checkNodeById = (id: any, fireClickEvent = false) => {
    for(let row of data) {
      if(row.id && id && row.id.toString() === id.toString()) {
        row.checked = true;
      } else {
        row.checked = false;
      }
    }
    data = [...data];
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

  export const getCheckedLeafIds = (checked = true) => {
    const treeObj = getTreeInstance();
    let nodes = treeObj && treeObj.getCheckedNodes(checked);

    if (nodes && nodes.length > 0) {
      return nodes.filter((node: any) => !node.isParent).map((node: any) => node.id.toString());
    } else {
      return [];
    }
  };

  export const getCheckedIds = (checked = true) => {
    const treeObj = getTreeInstance();
    let nodes = treeObj && treeObj.getCheckedNodes(checked);

    if (nodes && nodes.length > 0) {
      return nodes.map((node: any) => node.id.toString());
    } else {
      return [];
    }
  };

  export const hasCheckChild = (parentNode) => {
    const treeObj = getTreeInstance();

    const nodes = treeObj.transformToArray(parentNode);
    for (let i = 0, l = nodes.length; i < l; i++) {
      if (nodes[i].checked) {
        return true;
      }
    }
    return false;
  };

  export const getCheckedIdsParent = () => {
    const treeObj = getTreeInstance();

    const rootNodes = treeObj && treeObj.getNodes();
    const result = [];
    if (rootNodes) {
      const nodes = treeObj.transformToArray(rootNodes);
      for (let i = 0, l = nodes.length; i < l; i++) {
        if ((nodes[i].isParent && hasCheckChild(nodes[i])) || nodes[i].checked) {
          result.push(nodes[i].id.toString());
        }
      }
    }

    return result;
  };

  export const getCheckedNodes = (checked = true) => {
    const treeObj = getTreeInstance();
    return treeObj && treeObj.getCheckedNodes(checked);
  };

  export const getCheckedData = (checked = true) => {
    const checkedIds: any[] = getCheckedIds(true);
    if (!checkedIds) {
      return undefined;
    }

    return data.filter((it: any) => checkedIds.indexOf(it.id.toString()) >= 0);
  };

  export const getCheckedDataParent = (checked = true) => {
    const checkedIds: any[] = getCheckedIdsParent();
    if (!checkedIds) {
      return undefined;
    }

    return data.filter((it: any) => checkedIds.indexOf(it.id.toString()) >= 0);
  };

  export const disableTree = (disable: boolean) => {
    const treeObj = getTreeInstance();

    const rootNodes = treeObj && treeObj.getNodes();

    if (rootNodes) {
      const nodes = treeObj.transformToArray(rootNodes);
      for (let i = 0, l = nodes.length; i < l; i++) {
        // nodes[i].nocheck = disable;
        treeObj.setChkDisabled(nodes[i], disable);
      }
      // treeObj.refresh();
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
        enable: isCheckableNode || radioType,
        chkStyle: isCheckableNode ? 'checkbox' : radioType ? 'radio' : '',
        radioType,
        nocheckInherit: true,
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
          dispatch('click', { event, treeId, treeNode });
        },
        onCheck: (event: any, treeId: any, treeNode: any) => {
          dispatch('check', { event, treeId, treeNode });
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
  <ul {id} class="stree ztree" />
  {#if !data || data.length === 0}
    <div class="no-data">
      <img src={noDataImage} alt="" />
    </div>
  {/if}
</div>

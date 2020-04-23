<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import TreeView from '@/components/ui/tree-view';
  import { ViewStore } from '@/store/view';
  import { Store } from '../store';
  import { T } from '@/lib/js/locale/locale';
  import { OrgType } from '@/modules/sys/owner-org/model';
  import { forkJoin, fromEvent, Subscription, Observable } from 'rxjs';
  import { SObject } from '@/lib/js/sobject';
  import CheckList from '@/components/ui/input/check-list';
  import App from '@/App.svelte';
  import { switchMap, tap, filter, delay } from 'rxjs/operators';

  export let view: ViewStore;
  export let store: Store;

  let roleTreeRef: any;

  const { isReadOnlyMode$ } = view;
  // @ts-ignore
  const {
    roleDetails$,
    roles$,
    needSelectRole$,
    filterOrg$,
    hideBranchColumn$,
    hideDepartmentColumn$,
    resetColumn$,
    selectedData$,
    filterMenu$,
  } = store;

  let needSelectIdSub, selectRoleTreeSub, selectFilterOrgTreeSub: Subscription;

  let filterMenu: any[] = undefined;
  let selectedOrgId = undefined;
  let selectedFilterOrgId = undefined;
  let needResetColumn = false;
  let prevHideColumn: string;

  const roleTreeId = 'roleTree' + view.getViewName() + 'Id';
  const filterOrgTreeId = 'filterOrgTree' + view.getViewName() + 'Id';

  const reload = () => {
    store.loadRoleTree();
  };

  const doSelectRole = (ob$: Observable<any>) => {
    return ob$
      .pipe(
        filter((_) => selectedOrgId !== undefined),
        tap((_) => view.loading$.next(true)),
        switchMap((_) =>
          forkJoin([
            // @ts-ignore
            Store.loadRoleDetail$(selectedOrgId, $selectedData$.id.replace('role', '')),
            Store.loadFilterOrgTree$(selectedOrgId),
          ]),
        ),
      )
      .subscribe((res: any[]) => {
        roleDetails$.next(res[0].data);
        filterOrg$.next(res[1].data);
        view.loading$.next(false);
        selectedOrgId = undefined;
      });
  };

  const doSelectOrg = (ob$: Observable<any>) => {
    return ob$
      .pipe(
        delay(10),
        filter((_) => selectedFilterOrgId !== undefined),
        tap((_) => view.loading$.next(true)),
        switchMap((_) =>
          forkJoin([
            // @ts-ignore
            Store.loadRoleDetail$(selectedFilterOrgId, $selectedData$.id.replace('role', '')),
          ]),
        ),
      )
      .subscribe((res: any[]) => {
        roleDetails$.next(res[0].data);
        view.loading$.next(false);
        selectedFilterOrgId = undefined;
      });
  };

  onMount(() => {
    needSelectIdSub = view.needSelectId$.subscribe((id: string) => {
      if (roleTreeRef && id) {
        setTimeout(() => {
          roleTreeRef.selectNodeById(id, false);
        }, 500);
      }
    });

    reload();

    setTimeout(() => {
      const clickRoleTree$ = fromEvent(document.querySelector('#' + roleTreeId), 'click');
      selectRoleTreeSub = doSelectRole(clickRoleTree$);

      const clickFilterOrgTree$ = fromEvent(document.querySelector('#' + filterOrgTreeId), 'click');
      selectFilterOrgTreeSub = doSelectOrg(clickFilterOrgTree$);
    }, 500);
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

  const onClickRoleTree = (event: any) => {
    filterMenu$.next(undefined);
    const treeNode: any = event.detail.treeNode;

    if (treeNode.isParent) {
      store.selectedData$.next(null);
      return;
    }

    const orgId = extractOrgId(treeNode);
    selectedOrgId = orgId;
    const roleId = extractRoleId(treeNode);
    view.loading$.next(true);
    store.selectedData$.next({
      pId: orgId,
      id: roleId,
      name: treeNode.name,
    });

    if (needResetColumn) {
      store.resetColumn$.next(Date.now());
      needResetColumn = false;
    }
  };

  const onClickOrgTree = (event: any) => {
    needResetColumn = true;
    filterMenu$.next(undefined);
    const treeNode: any = event.detail.treeNode;
    selectedFilterOrgId = treeNode.id;
    if (treeNode.type === OrgType.Campany) {
      if (prevHideColumn !== 'com') {
        resetColumn$.next(Date.now());
      }
      prevHideColumn = 'com';
    } else if (treeNode.type === OrgType.Branch) {
      if (prevHideColumn !== 'bra') {
        hideBranchColumn$.next(Date.now());
      }
      prevHideColumn = 'bra';
    } else if (treeNode.type === OrgType.Department) {
      if (prevHideColumn !== 'dep') {
        hideDepartmentColumn$.next(Date.now());
      }
      prevHideColumn = 'dep';
    }

    store.selectedOrg$.next(treeNode);
  };

  // @ts-ignore
  $: if ($needSelectRole$) {
    // @ts-ignore
    roleTreeRef.selectNodeById($needSelectRole$, true);
  }

  // @ts-ignore
  $: {
    // @ts-ignore
    const menus = $roleDetails$.map((it: any) => {
      return {
        index: it.menuId.toString(),
        id: it.menuId.toString(),
        name: it.menuName,
        checked: true,
      };
    });
    filterMenu = SObject.distinctArrayObject(menus);
  }

  onDestroy(() => {
    needSelectIdSub.unsubscribe();
    if (selectRoleTreeSub) {
      selectRoleTreeSub.unsubscribe();
    }

    if (selectFilterOrgTreeSub) {
      selectFilterOrgTreeSub.unsubscribe();
    }
  });

  const onChangeFilterMenu = (event) => {
    filterMenu$.next(event.detail);
  };
</script>

<!--Main content-->
<section class="view-content-main">
  <TreeView id={roleTreeId} on:click={onClickRoleTree} bind:this={roleTreeRef} data={$roles$}>
    <div slot="label" class="label">{T('SYS.LABEL.AVAILABLE_ROLE')}:</div>
  </TreeView>

  <TreeView id={filterOrgTreeId} on:click={onClickOrgTree} data={$filterOrg$}>
    <div slot="label" class="label">{T('SYS.LABEL.FILTER_ORG')}:</div>
  </TreeView>

  <div style="max-height: 200px; overflow: auto;">
    <CheckList on:change={onChangeFilterMenu} data={filterMenu} id={'menuList' + view.getViewName() + 'Id'}>
      <div class="label">{T('COMMON.LABEL.FILTER_MENU')}:</div>
    </CheckList>
  </div>
</section>

<!--Form controller-->
<section class="view-content-bottom" />

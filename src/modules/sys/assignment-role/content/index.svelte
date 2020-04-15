<script lang="ts">
  import { onMount } from 'svelte';
  import TreeView from '@/components/ui/tree-view';
  import SelectableTable from '@/components/ui/selectable-table';
  import ExcelGrid from '@/components/ui/excel-grid';
  import { ViewStore } from '@/store/view';
  import { Store } from '../store';
  import { userColumns, roleColumns, applyAssignedRole } from './helper';
  import { T } from '@/assets/js/locale/locale';
  import Button from '@/components/ui/button';
  import { ButtonType } from '@/components/ui/button/types';
  import { take } from 'rxjs/operators';
  import SC from '@/components/set-common';

  export let view: ViewStore;
  export let store: Store;
  export let menuPath: string;

  const { orgData$, userData$, roleData$ } = store;

  let orgTreeViewRef: any;
  let userTableRef: any;
  let roleGridRef: any;
  let roleListRef: any;
  let scRef: any;

  const onOrgTreeClick = (event: any) => {
    const orgId = event.detail.treeNode.id;
    store.loadUserList(orgId);
    store.loadRoleList(orgId);
  };

  const onSelectionUser = (event) => {
    let selectedUsers = event.detail;
    if (selectedUsers.length === 0) {
      return;
    }

    view.loading$.next(true);
    Store.sysGetRoleListOfUsers(selectedUsers.map((it) => it.id).join(','))
      .pipe(take(1))
      .subscribe(
        (res: any) => {
          if (res.data) {
            // @ts-ignore
            roleData$.next(applyAssignedRole($roleData$, res.data));
          } else {
            // @ts-ignore
            roleData$.next(applyAssignedRole($roleData$, []));
          }
          view.loading$.next(false);
        },
        (error: Error) => {
          // @ts-ignore
          roleData$.next(applyAssignedRole($roleData$, []));
          scRef.snackbarRef().show(error.message);
          view.loading$.next(false);
        },
      );
  };

  onMount(() => {
    setTimeout(() => {
      // create check and button header
      roleGridRef.createToggleCheckHeader(1);
      roleGridRef.createToggleCheckHeader(4);
      roleGridRef.createCheckboxHeader(1);
      roleGridRef.createCheckboxHeader(4);
    }, 1000);
  });
</script>

<style lang="sass">

</style>

<SC {view} {menuPath} bind:this={scRef} />
<section class="view-content-main">
  <div class="row">
    <div class="default-border col-sm-24 col-md-8">
      <TreeView
        data={$orgData$}
        {menuPath}
        bind:this={orgTreeViewRef}
        id={'orgTreeView' + view.getViewName() + 'Id'}
        on:click={onOrgTreeClick}>
        <div slot="label">{T('COMMON.LABEL.ORG')}:</div>
      </TreeView>
    </div>

    <div class="default-border col-sm-24 col-md-8 px-sm-0 px-md-1 py-sm-1 py-md-0">
      <SelectableTable
        columns={userColumns}
        data={$userData$}
        {menuPath}
        bind:this={userTableRef}
        on:selection={onSelectionUser}
        id={'userTable' + view.getViewName() + 'Id'}>
        <span slot="label">{T('COMMON.LABEL.USER_LIST')}:</span>
        <span slot="selectAll" let:selectAll>
          <Button btnType={ButtonType.SelectAll} on:click={selectAll} />
        </span>

        <span slot="unSelectAll" let:unSelectAll>
          <Button btnType={ButtonType.UnSelectAll} on:click={unSelectAll} />
        </span>

        <span slot="toggleSelection" let:toggleSelection>
          <Button btnType={ButtonType.ToggleSelection} on:click={toggleSelection} />
        </span>
      </SelectableTable>
    </div>
    <div class="default-border col-sm-24 col-md-8 ">
      <ExcelGrid
        this.bind={roleListRef}
        columns={roleColumns}
        data={$roleData$}
        {menuPath}
        bind:this={roleGridRef}
        id={'roleGrid' + view.getViewName() + 'Id'}>
        <div slot="label">{T('COMMON.LABEL.ROLE_LIST')}:</div>
      </ExcelGrid>
    </div>
  </div>
</section>

<section class="view-content-bottom" />

<script lang="ts">
  import { onMount, tick, onDestroy } from 'svelte';
  import TreeView from '@/components/ui/tree-view';
  import SelectableTable from '@/components/ui/selectable-table';
  import ExcelGrid from '@/components/ui/excel-grid';
  import { ViewStore } from '@/store/view';
  import { Store } from '../store';
  import { userColumns, roleColumns, applyAssignedRole } from './helper';
  import { T } from '@/lib/js/locale/locale';
  import Button from '@/components/ui/button';
  import { ButtonType, ButtonId, ButtonPressed } from '@/components/ui/button/types';
  import { catchError, concatMap, switchMap, take, filter } from 'rxjs/operators';
  import SC from '@/components/set-common';
  import { fromEvent, zip, of, Observable } from 'rxjs';
  import { SObject } from '@/lib/js/sobject';
  import { fromPromise } from 'rxjs/internal-compatibility';
  import { Debug } from '@/lib/js/debug';

  export let view: ViewStore;
  export let store: Store;
  export let menuPath: string;

  const { isReadOnlyMode$, isUpdateMode$, saveRunning$ } = view;
  const { orgData$, userData$, roleData$, selectedUserRole$ } = store;

  const completeSelecting$ = zip(userData$, roleData$);

  let orgTreeViewRef: any;
  let userTableRef: any;
  let roleGridRef: any;
  let scRef: any;

  let beforeRoleData: any[];
  let dataChanged: any;
  let editedRoleData: any[];
  let selectedUser: any;
  let saveOrUpdateSub;

  const onOrgTreeClick = (event: any) => {
    const orgId = event.detail.treeNode.id;
    doOrgTreeClick(orgId.toString());
  };

  const doOrgTreeClick = (orgId: string) => {
    view.loading$.next(true);
    store.loadUserList(orgId);
    store.loadRoleList(orgId);
    selectedUser = null;
  };

  const onSelectionUser = (event) => {
    let selectedUsers = event.detail;
    if (selectedUsers.length === 0) {
      return;
    }

    view.isReadOnlyMode$.next(true);
    view.isUpdateMode$.next(true);
    selectedUser = selectedUsers[0];
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

          tick().then(() => {
            beforeRoleData = SObject.clone(roleGridRef.getData());
          });

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

  /**
   * Event handle for Edit button.
   * @param {event} Mouse click event.
   * @return {void}.
   */
  const onEdit = (event) => {
    // verify permission
    // @ts-ignore
    view.verifyEditAction(event.currentTarget.id, scRef, selectedUser.username).then((_) => {
      // just switch to edit mode
      isReadOnlyMode$.next(false);
    });
  };

  const onReset = () => {
    // check for data change
    editedRoleData = roleGridRef.getData();

    dataChanged = view.checkObjectArrayChange(beforeRoleData, SObject.clone(editedRoleData));

    if (dataChanged !== true) {
      scRef
        .confirmModalRef()
        .show(T('SYS.MSG.THE_DATA_HAS_BEEN_CHANGED') + '. ' + T('SYS.MSG.ARE_YOU_SURE_TO_RESET' + '?'))
        .then((buttonPressed: ButtonPressed) => {
          if (buttonPressed === ButtonPressed.OK) {
            doReset();
          }
        });
    } else {
      scRef.snackbarRef().showNoDataChange();
    }
  };

  const doReset = () => {
    if (selectedUser) {
      userTableRef.selectRowById(selectedUser.id);
    }
  };

  /**
   * Event handle for Config button.
   * @param {event} Mouse click event.
   * @return {void}.
   */
  const onConfig = (event) => {
    view.showViewConfigModal(event.currentTarget.id, scRef);
  };

  /**
   * Save or update form. Called by onSave and onUpdate event handle
   * @param {ob$} Observable event of the button click or shortcut key(fromEvent)
   * @return {void}.
   */
  const doSaveOrUpdate = (ob$: Observable<any>) => {
    saveOrUpdateSub = ob$
      .pipe(
        filter((_) => validate()) /* filter if form pass client validation */,
        concatMap((_) =>
          fromPromise(
            /* verify permission*/
            view.verifySaveAction(
              // @ts-ignore
              $isUpdateMode$ ? ButtonId.Update : ButtonId.Save,
              scRef,
            ),
          ).pipe(
            catchError((error) => {
              return of(error);
            }),
          ),
        ),
        filter((value) => value !== 'fail') /* filter if pass verify permission*/,
        switchMap((_) => {
          /* submit data to API server*/
          saveRunning$.next(true);
          // @ts-ignore
          return store.saveOrUpdateOrDelete(userTableRef.getSelectedData(), roleGridRef.getData()).pipe(
            catchError((error) => {
              return of(error);
            }),
          );
        }),
      )
      .subscribe({
        /* do something after form submit*/
        next: (res) => {
          if (res.response && res.response.data) {
            // if error
            if (res.response.data.message) {
              scRef.snackbarRef().showUnknownError(res.response.data.message);
            }
          } else {
            // success
            // @ts-ignore
            beforeRoleData = SObject.clone(editedRoleData);
            scRef.snackbarRef().showUpdateSuccess();
          }
          saveRunning$.next(false);
          store.sysGetAllAssignmentRoleUserList();
        },
        error: (error) => {
          Debug.errorSection('Assignment Role - doSaveOrUpdate', error);
          saveRunning$.next(false);
        },
      });
  };

  // ============================== CLIENT VALIDATION ==========================
  /**
   * Client validation and check for no data change.
   * @param {none}
   * @return {boolean}. true if all of things are valid, false: otherwise
   */
  const validate = () => {
    // client validation
    // @ts-ignore
    if (selectedUser == null) {
      scRef.snackbarRef.show(T('SYS.MSG.PLEASE_SELECT_AT_LEAST_ONE_USER'));
      return false;
    }
    // check for data change
    editedRoleData = roleGridRef.getData();

    dataChanged = view.checkObjectArrayChange(beforeRoleData, SObject.clone(editedRoleData), scRef.snackbarRef());

    if (dataChanged === true) {
      return false;
    }

    return true;
  };
  // ============================== //CLIENT VALIDATION ==========================

  onMount(() => {
    setTimeout(() => {
      // create check and button header
      roleGridRef.createToggleCheckHeader(1);
      roleGridRef.createToggleCheckHeader(4);
      roleGridRef.createCheckboxHeader(1);
      roleGridRef.createCheckboxHeader(4);
    }, 1000);
  });

  onDestroy(() => {
    if (saveOrUpdateSub) {
      saveOrUpdateSub.unsubscribe();
    }
  });

  // @ts-ignore
  $: {
    // @ts-ignore
    const selectedUserRole = $selectedUserRole$;
    if (selectedUserRole) {
      orgTreeViewRef.selectNodeById(selectedUserRole.defaultOwnerOrgId, true);

      setTimeout(() => {
        userTableRef.selectRowById(selectedUserRole.id);
      }, 100);
    }
  }

  // @ts-ignore
  $: if ($completeSelecting$) {
    view.loading$.next(false);
  }

  /**
   * Use save or update action directive. Register click event for Save / Update button
   * @param {none}
   * @return {void}.
   */
  const useSaveOrUpdateAction = {
    register(component: HTMLElement, param: any) {
      doSaveOrUpdate(fromEvent(component, 'click'));
    },
  };
</script>

<style lang="sass">

</style>

<SC {view} {menuPath} bind:this={scRef} />
<section class="view-content-main">
  <div class="row">
    <div class="default-border col-sm-24 col-md-8">
      <TreeView
        data={$orgData$}
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
        <span>{T('COMMON.LABEL.USER_LIST')}:</span>
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

<section class="view-content-bottom">
  {#if $roleData$ !== null}
    <Button btnType={ButtonType.Reset} on:click={onReset} />
  {/if}

  {#if view.isRendered(ButtonId.Edit, $isReadOnlyMode$ && $isUpdateMode$ && selectedUser !== null)}
    <Button btnType={ButtonType.Edit} on:click={onEdit} disabled={view.isDisabled(ButtonId.Edit)} />
  {/if}

  {#if view.isRendered(ButtonId.Update, !$isReadOnlyMode$ && $isUpdateMode$)}
    <Button
      action={useSaveOrUpdateAction}
      btnType={ButtonType.Update}
      disabled={view.isDisabled(ButtonId.Update, selectedUser == null)}
      running={$saveRunning$} />
  {/if}

  {#if view.isRendered(ButtonId.Config)}
    <Button btnType={ButtonType.Config} on:click={onConfig} disabled={view.isDisabled(ButtonId.Config)} />
  {/if}
</section>

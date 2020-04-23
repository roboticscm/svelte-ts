<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { T } from '@/lib/js/locale/locale';
  import { ViewStore } from '@/store/view';
  import {
    columns,
    nestedHeaders,
    nestedHeadersHideBranch,
    nestedHeadersHideBranchAndDep,
    makeMergeCells,
    calcTableHeight,
    preprocessData,
    getTableData,
    fillNullColor,
  } from './helper';
  import { Store } from '../store';
  import SC from '@/components/set-common';

  import { ButtonType, ButtonId } from '@/components/ui/button/types';
  import Button from '@/components/ui/button';
  import { catchError, concatMap, switchMap, filter } from 'rxjs/operators';
  import { fromEvent, of, Observable } from 'rxjs';
  import { fromPromise } from 'rxjs/internal-compatibility';
  import { SObject } from '@/lib/js/sobject';
  import { Debug } from '@/lib/js/debug';
  import { ButtonPressed } from '@/components/ui/button/types';

  export let view: ViewStore;
  export let store: Store;
  export let menuPath: string;

  // @ts-ignore
  const { hasAnyDeletedRecord$, deleteRunning$, saveRunning$, isReadOnlyMode$, isUpdateMode$ } = view;
  // @ts-ignore
  const {
    roleDetails$,
    dragEndSplitter$,
    selectedData$,
    needSelectRole$,
    selectedOrg$,
    hideBranchColumn$,
    hideDepartmentColumn$,
    resetColumn$,
    filterMenu$,
  } = store;
  let roleDetails: any[] = [];
  const tableContainerId = view.getViewName() + 'TableContainerId';
  let scRef: any;
  let excelGridRef: any;
  let ExcelGrid: any;

  let _nestedHeaders = nestedHeaders;
  let mergeCells: any = {};
  let useMergeCell = false;

  let tableHeight: string;
  let saveOrUpdateSub;

  let beforeData: any[];
  let dataChanged: any;
  let editedData: any[];

  // @ts-ignore
  $: if ($roleDetails$) {
    view.loading$.next(false);
  }

  // @ts-ignore
  $: if ($roleDetails$ && $roleDetails$.length > 0) {
    // @ts-ignore
    const filterMenu = $filterMenu$;
    if (!filterMenu) {
      // @ts-ignore
      roleDetails = $roleDetails$;
    } else {
      // @ts-ignore
      roleDetails = $roleDetails$.filter((item: any) => {
        return filterMenu.indexOf(item.menuId.toString()) >= 0;
      });
    }
    tick().then(() => {
      if (excelGridRef) {
        fillNullColor(roleDetails, excelGridRef);
        beforeData = SObject.clone(getTableData(excelGridRef));
      }
    });
  }

  // @ts-ignore
  $: if (useMergeCell) {
    // @ts-ignore
    mergeCells = makeMergeCells(roleDetails);
  } else {
    mergeCells = {};
  }
  /**
   * Event handle for Edit button.
   * @param {event} Mouse click event.
   * @return {void}.
   */
  const onEdit = (event) => {
    // verify permission
    // @ts-ignore
    view.verifyEditAction(event.currentTarget.id, scRef, $selectedData$.name).then((_) => {
      // just switch to edit mode
      isReadOnlyMode$.next(false);
    });
  };

  const onReset = () => {
    // check for data change
    editedData = getTableData(excelGridRef);

    dataChanged = view.checkObjectArrayChange(beforeData, SObject.clone(editedData));

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
    // @ts-ignore
    if ($selectedOrg$ && $selectedData$) {
      // @ts-ignore
      store.loadRoleDetail($selectedOrg$.id, $selectedData$.id);
      // @ts-ignore
    } else if ($selectedData$) {
      // @ts-ignore
      store.loadRoleDetail($selectedData$.pId, $selectedData$.id);
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

  const onChangeUseMerge = (event: any) => {
    setTimeout(() => {
      excelGridRef.refresh();
      tick().then(() => {
        if (excelGridRef) {
          // @ts-ignore

          fillNullColor(roleDetails, excelGridRef);

          beforeData = SObject.clone(getTableData(excelGridRef));
        }
      });
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
    if ($selectedData$ == null) {
      scRef.snackbarRef.show(T('SYS.MSG.PLEASE_SELECT_THE_ROLE_ON_THE_LEFT_TREE'));
      return false;
    }
    // check for data change
    editedData = getTableData(excelGridRef);

    dataChanged = view.checkObjectArrayChange(beforeData, SObject.clone(editedData), scRef.snackbarRef());

    if (dataChanged === true) {
      return false;
    }

    return true;
  };
  // ============================== //CLIENT VALIDATION ==========================

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
          const processedData = preprocessData(dataChanged, editedData);
          /* submit data to API server*/
          saveRunning$.next(true);
          // @ts-ignore
          return store.saveOrUpdateOrDelete($selectedData$.id, processedData).pipe(
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
            beforeData = SObject.clone(editedData);
            scRef.snackbarRef().showUpdateSuccess();
            // @ts-ignore
            if ($isUpdateMode$) {
              // @ts-ignore
              view.needSelectId$.next('role' + $selectedData$.id);
            }

            doReset();

            store.loadRoleTree();
          }
          saveRunning$.next(false);
        },
        error: (error) => {
          Debug.errorSection('Role Detail - doSaveOrUpdate', error);
          saveRunning$.next(false);
        },
      });
  };

  onMount(() => {
    tableHeight = calcTableHeight(tableContainerId);
    import('@/components/ui/excel-grid/index.svelte').then((res) => (ExcelGrid = res.default));

    let resizeTimer;
    window['$'](window).on('resize', function(e) {
      clearTimeout(resizeTimer);
      tableHeight = calcTableHeight(tableContainerId);
      resizeTimer = setTimeout(function() {
        excelGridRef && excelGridRef.refresh();
      }, 250);
    });

    createCheckboxesHeader();
  });

  const createCheckboxesHeader = (delay = 1000) => {
    setTimeout(() => {
      // checked
      excelGridRef.createCheckboxHeader(4, true);
      // private
      excelGridRef.createCheckboxHeader(7, true);
      // approve
      excelGridRef.createCheckboxHeader(9, true);

      // Render
      excelGridRef.createCheckboxHeader(12, true);
      // Disabled
      excelGridRef.createCheckboxHeader(13, true);
      // Confirm
      excelGridRef.createCheckboxHeader(14, true);
      // Require password
      excelGridRef.createCheckboxHeader(15, true);
    }, delay);
  };

  onDestroy(() => {
    if (saveOrUpdateSub) {
      saveOrUpdateSub.unsubscribe();
    }
  });

  // @ts-ignore
  $: if ($dragEndSplitter$) {
    excelGridRef && excelGridRef.refresh();
    createCheckboxesHeader();
  }

  // @ts-ignore
  $: {
    // @ts-ignore
    isReadOnlyMode$.next($selectedData$ !== null);
    // @ts-ignore
    isUpdateMode$.next($selectedData$ !== null);
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

  // @ts-ignore
  $: {
    // @ts-ignore
    if ($hideDepartmentColumn$) {
      columns[1].type = 'hidden';
      columns[3].type = 'hidden';
      _nestedHeaders = nestedHeadersHideBranchAndDep;
      tick().then(() => {
        excelGridRef && excelGridRef.refresh();
        createCheckboxesHeader(0);
      });
    }
  }

  // @ts-ignore
  $: {
    // @ts-ignore
    if ($hideBranchColumn$) {
      columns[1].type = 'hidden';
      columns[3].type = 'text';
      _nestedHeaders = nestedHeadersHideBranch;
      tick().then(() => {
        excelGridRef && excelGridRef.refresh();
        createCheckboxesHeader(0);
      });
    }
  }

  // @ts-ignore
  $: {
    // @ts-ignore
    if ($resetColumn$) {
      columns[1].type = 'text';
      columns[3].type = 'text';
      _nestedHeaders = nestedHeaders;
      tick().then(() => {
        excelGridRef && excelGridRef.refresh();
        createCheckboxesHeader(0);
      });
    }
  }
</script>

<!--Main content-->
<section id={tableContainerId} class="view-content-main">
  <!--Invisible Element-->
  <SC bind:this={scRef} {view} {menuPath} />
  <!--//Invisible Element-->

  <svelte:component
    this={ExcelGrid}
    {menuPath}
    bind:this={excelGridRef}
    id={'roleControlGrid' + view.getViewTitle() + 'Id'}
    gridNestedHeaders={_nestedHeaders}
    {columns}
    data={roleDetails}
    height={tableHeight}
    gridMergeCells={useMergeCell ? mergeCells : {}}>
    <div slot="label">
      <span class="label">{T('SYS.LABEL.MENU')} - {T('SYS.LABEL.ROLE_CONTROL')}:</span>
    </div>
  </svelte:component>
</section>

<!--Form controller-->
<section class="view-content-bottom">
  <input on:change={onChangeUseMerge} type="checkbox" bind:checked={useMergeCell} />
  <span style="color:var(--primary)">{T('SYS.LABEL.USE_MERGE_CELL')}</span>
  {#if $selectedData$ !== null}
    <Button btnType={ButtonType.Reset} on:click={onReset} />
  {/if}

  {#if view.isRendered(ButtonId.Edit, $isReadOnlyMode$ && $isUpdateMode$)}
    <Button btnType={ButtonType.Edit} on:click={onEdit} disabled={view.isDisabled(ButtonId.Edit)} />
  {/if}

  {#if view.isRendered(ButtonId.Update, !$isReadOnlyMode$ && $isUpdateMode$)}
    <Button
      action={useSaveOrUpdateAction}
      btnType={ButtonType.Update}
      disabled={view.isDisabled(ButtonId.Update, $selectedData$ == null)}
      running={$saveRunning$} />
  {/if}

  {#if view.isRendered(ButtonId.Config)}
    <Button btnType={ButtonType.Config} on:click={onConfig} disabled={view.isDisabled(ButtonId.Config)} />
  {/if}

</section>

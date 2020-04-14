<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { T } from '@/assets/js/locale/locale';
  import { ViewStore } from '@/store/view';
  import {
    columns,
    nestedHeaders,
    makeMergeCells,
    calcTableHeight,
    preprocessData,
    getTableData, fillNullColor
  } from './helper';
  import { Store } from '../store';
  import SC from '@/components/set-common';

  import { ButtonType, ButtonId } from '@/components/ui/button/types';
  import Button from '@/components/ui/button';
  import {catchError, concatMap, switchMap, filter} from "rxjs/operators";
  import {fromEvent, of, Observable} from "rxjs";
  import {fromPromise} from "rxjs/internal-compatibility";
  import {SObject} from "@/assets/js/sobject";
  import {Debug} from "../../../../assets/js/debug";

  export let view: ViewStore;
  export let store: Store;
  export let menuPath: string;

  // @ts-ignore
  const { hasAnyDeletedRecord$, deleteRunning$, saveRunning$, isReadOnlyMode$, isUpdateMode$ } = view;
  // @ts-ignore
  const { roleDetails$, dragEndSplitter$, selectedData$ } = store;

  const tableContainerId = view.getViewName() + 'TableContainerId';
  let scRef: any;
  let btnUpdateRef: any;
  let excelGridRef: any;
  let ExcelGrid: any;

  let mergeCells: any;

  let useMergeCell = true;
  let tableHeight: string;
  let saveOrUpdateSub;

  let beforeData: any[];
  let dataChanged: any;
  let editedData: any[];

  // @ts-ignore
  $: if ($roleDetails$) {
    // @ts-ignore
    tick().then(() => {
      if (excelGridRef) {
        // @ts-ignore
        fillNullColor($roleDetails$, excelGridRef);
        beforeData = SObject.clone(getTableData(excelGridRef));

      }
    });

    if (useMergeCell) {
      // @ts-ignore
      mergeCells = makeMergeCells($roleDetails$);
    }
    view.loading$.next(false);
  }

  /**
   * Event handle for Add New button.
   * @param {event} Mouse click event.
   * @return {void}.
   */
  const onAddNew = (event) => {
    // verify permission
    view.verifyAddNewAction(event.currentTarget.id, scRef).then((_) => {
      // if everything is OK, call the action
      // doAddNew();
    });
  };

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
    // getDiffRowObjectArray
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
          return store.saveOrUpdateOrDelete($selectedData$.id.replace('role', ''), processedData).pipe(
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
          }
          saveRunning$.next(false);
        },
        error: (error) => {
          Debug.errorSection('Menu - doSaveOrUpdate', error);
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
  });

  onDestroy(() => {
    if (saveOrUpdateSub) {
      saveOrUpdateSub.unsubscribe();
    }
  });

  // @ts-ignore
  $: if ($dragEndSplitter$) {
    excelGridRef && excelGridRef.refresh();
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
</script>

<!--Main content-->
<section id={tableContainerId} class="view-content-main">
  <!--Invisible Element-->
  <SC bind:this={scRef} {view} {menuPath} />
  <!--//Invisible Element-->

  <svelte:component
    this={ExcelGrid}
    bind:this={excelGridRef}
    id={'roleControlGrid' + view.getViewTitle() + 'Id'}
    gridNestedHeaders={nestedHeaders}
    {columns}
    data={$roleDetails$}
    height={tableHeight}
    gridMergeCells={useMergeCell ? mergeCells : undefined}>
    <div slot="label">
      <span class="label">{T('SYS.LABEL.MENU')} - {T('SYS.LABEL.ROLE_CONTROL')}:</span>
    </div>
  </svelte:component>
</section>

<!--Form controller-->
<section class="view-content-bottom">
  {#if view.isRendered(ButtonId.Edit, $isReadOnlyMode$ && $isUpdateMode$)}
    <Button btnType={ButtonType.Edit} on:click={onEdit} disabled={view.isDisabled(ButtonId.Edit)} />
  {/if}

  {#if view.isRendered(ButtonId.Update, !$isReadOnlyMode$ && $isUpdateMode$)}
    <Button
      action={useSaveOrUpdateAction}
      bind:this={btnUpdateRef}
      btnType={ButtonType.Update}
      disabled={view.isDisabled(ButtonId.Update, $selectedData$ == null)}
      running={$saveRunning$} />
  {/if}

  <!--  {#if view.isRendered(ButtonId.Delete, $isUpdateMode$)}-->
  <!--    <Button-->
  <!--            btnType={ButtonType.Delete}-->
  <!--            on:click={onDelete}-->
  <!--            disabled={view.isDisabled(ButtonId.Delete)}-->
  <!--            running={$deleteRunning$} />-->
  <!--  {/if}-->

  <!--  {#if view.isRendered(ButtonId.Config)}-->
  <!--    <Button btnType={ButtonType.Config} on:click={onConfig} disabled={view.isDisabled(ButtonId.Config)} />-->
  <!--  {/if}-->

  <!--  {#if view.isRendered(ButtonId.TrashRestore, $hasAnyDeletedRecord$)}-->
  <!--    <Button-->
  <!--            btnType={ButtonType.TrashRestore}-->
  <!--            on:click={onTrashRestore}-->
  <!--            disabled={view.isDisabled(ButtonId.TrashRestore)} />-->
  <!--  {/if}-->
</section>

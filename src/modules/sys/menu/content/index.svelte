<script lang="ts">
  import { tick, onMount, onDestroy } from 'svelte';
  import { catchError, concatMap, switchMap, filter, take, finalize } from 'rxjs/operators';
  import { fromEvent, of, Observable, EMPTY } from 'rxjs';
  import { fromPromise } from 'rxjs/internal-compatibility';

  import { T } from '@/lib/js/locale/locale';
  import Form from '@/lib/js/form/form';
  import { ViewStore } from '@/store/view';
  import { Menu } from '../model';
  import { SObject } from '@/lib/js/sobject';
  import { apolloClient } from '@/lib/js/hasura-client';
  import { ButtonPressed } from '@/components/ui/button/types';
  import { SDate } from '@/lib/js/sdate';
  import { ButtonType, ButtonId } from '@/components/ui/button/types';
  import { validation } from './validation';
  import { ModalType } from '@/components/ui/modal/types';
  import { StringUtil } from '@/lib/js/string-util';

  import Button from '@/components/ui/button';
  import NumberInput from '@/components/ui/input/number-input';
  import TextInput from '@/components/ui/input/text-input';
  import Checkbox from '@/components/ui/input/checkbox';
  import SC from '@/components/set-common';
  import SimpleImageSelector from '@/components/ui/simple-image-selector';
  import TreeView from '@/components/ui/tree-view';
  import { Store } from '../store';
  import { Debug } from '@/lib/js/debug';

  // Props
  export let view: ViewStore;
  export let store: Store;
  export let menuPath: string;

  // Observable
  // @ts-ignore
  const { selectedData$, hasAnyDeletedRecord$, deleteRunning$, saveRunning$, isReadOnlyMode$, isUpdateMode$ } = view;
  const { availableDep$, assignedDep$, completeSelecting$ } = store;

  // Refs
  let codeRef: any;
  let scRef: any;
  let btnSaveRef: any;
  let btnUpdateRef: any;
  let availableDepTreeRef: any;
  let assignedDepTreeRef: any;

  // Other vars
  let selectedData: Menu;
  let saveOrUpdateSub;
  /**
   * Reset form (reset input and errors)
   * @param {none}
   * @return {Form}. New Form
   */
  const resetForm = () => {
    return new Form({
      ...new Menu(),
    });
  };
  let form = resetForm();
  let beforeForm: Form;
  const saveUpdateUri = 'sys/menu/save-or-update';
  // ============================== EVENT HANDLE ==========================
  /**
   * Event handle for Add New button.
   * @param {event} Mouse click event.
   * @return {void}.
   */
  const onAddNew = (event) => {
    // verify permission
    view.verifyAddNewAction(event.currentTarget.id, scRef).then((_) => {
      // if everything is OK, call the action
      doAddNew();
    });
  };

  /**
   * Event handle for Edit button.
   * @param {event} Mouse click event.
   * @return {void}.
   */
  const onEdit = (event) => {
    // verify permission
    view.verifyEditAction(event.currentTarget.id, scRef, selectedData.name).then((_) => {
      // just switch to edit mode
      isReadOnlyMode$.next(false);
      tick().then(() => {
        // the moving focus to the first element
        codeRef.focus();
      });
    });
  };

  /**
   * Event handle for Delete button.
   * @param {event} Mouse click event.
   * @return {void}.
   */
  const onDelete = (event) => {
    // verify permission
    view.verifyDeleteAction(event.currentTarget.id, scRef, selectedData.name).then((_) => {
      // if everything is OK, call the action
      view.doDelete(selectedData.id, scRef.snackbarRef(), doAddNew);
    });
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
   * Event handle for Trash Restore button.
   * @param {event} Mouse click event.
   * @return {void}.
   */
  const onTrashRestore = (event) => {
    view.showTrashRestoreModal(event.currentTarget.id, false, scRef);
  };

  /**
   * Event handle for Select Image button.
   * @param {event} data of image.
   * @return {void}.
   */
  const onImageChange = (event: any) => {
    (form as any).iconData = event.detail;
  };
  // ============================== //EVENT HANDLE ==========================

  // ============================== CLIENT VALIDATION ==========================
  /**
   * Client validation and check for no data change.
   * @param {none}
   * @return {boolean}. true if all of things are valid, false: otherwise
   */
  const validate = () => {
    // client validation
    form.errors.errors = form.recordErrors(validation(form));
    if (form.errors.any()) {
      return false;
    }

    // check for data change

    (form as any).insertDepIds = availableDepTreeRef.getCheckedLeafIds(true);
    (form as any).deleteDepIds = assignedDepTreeRef.getCheckedLeafIds(false);
    // @ts-ignore
    if ($isUpdateMode$) {
      const dataChanged = view.checkObjectChange(beforeForm, SObject.clone(form), scRef.snackbarRef());
      if (!dataChanged) {
        return false;
      }
    }

    return true;
  };
  // ============================== //CLIENT VALIDATION ==========================

  // ============================== FUNCTIONAL ==========================
  /**
   * Add new add. Called by onAddNew event handle
   * @param {none}
   * @return {void}.
   */
  const doAddNew = () => {
    // reset status flag
    isReadOnlyMode$.next(false);
    isUpdateMode$.next(false);
    view.selectedData$.next(null);

    // reset form
    form = resetForm();

    store
      .loadAvailableDep(null)
      .pipe(take(1))
      .subscribe((res) => {
        availableDep$.next(res.data);
      });
    if (assignedDepTreeRef) {
      assignedDep$.next([]);
    }
    // moving focus to the first element after DOM updated
    tick().then(() => {
      codeRef.focus();
    });
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
          return form.post(saveUpdateUri).pipe(
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
            } else {
              form.errors.errors = form.recordErrors(res.response.data);
            }
          } else {
            // success
            // @ts-ignore
            if ($isUpdateMode$) {
              // update
              scRef.snackbarRef().showUpdateSuccess();
              view.needSelectId$.next(selectedData.id);
            } else {
              // save
              scRef.snackbarRef().showSaveSuccess();
              doAddNew();
            }
          }
          saveRunning$.next(false);
        },
        error: (error) => {
          Debug.errorSection('Menu - doSaveOrUpdate', error);
          saveRunning$.next(false);
        },
      });
  };

  const doSelect = (data: any) => {
    selectedData = data;
    if (selectedData) {
      isReadOnlyMode$.next(true);
      isUpdateMode$.next(true);
      form = new Form({
        ...selectedData,
        insertDepIds: [],
        deleteDepIds: [],
      });
      // save init value for checking data change
      beforeForm = SObject.clone(form);
    }
  };
  // ============================== //FUNCTIONAL ==========================

  // ============================== REACTIVE ==========================
  // Monitoring selected data from other users
  // When other users edit on the same data, display a confirmation of the change with the current user
  view.allColumns$.subscribe((cols) => {
    if (cols && cols.length > 0) {
      const query = view.createQuerySubscription(true);
      view.selectedData$
        .pipe(
          switchMap((it) => {
            console.log('??', it && it.id);
            if (!it) return EMPTY;
            return apolloClient.subscribe({
              query,
              variables: {
                id: it.id.toString(),
                updatedBy: localStorage.getItem('userId'),
              },
            });
          }),
        )
        .subscribe(async (res) => {
          // @ts-ignore
          view.doNotifyConflictData(form, res.data, selectedData.id, $isReadOnlyMode$, scRef);
        });
    }
  });

  // when user click on work list. load selected data to the right form
  const selectDataSub = view.selectedData$.subscribe((data) => {
    doSelect(data);
  });
  // ============================== //REACTIVE ==========================

  // ============================== HOOK ==========================
  /**
   * onMount Hook.
   * @param {none}
   * @return {void}.
   */
  onMount(() => {
    // reset form
    doAddNew();
    // Capture hot key (Ctrl - S) for save or update
    const controlS$ = fromEvent(document, 'keydown').pipe(
      filter((e: any) => {
        if (e.keyCode == 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
          e.preventDefault();
          // @ts-ignore
          if (!$isReadOnlyMode$) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }),
    );
    doSaveOrUpdate(controlS$);
  });

  /**
   * oDestroy Hook. Release subscription
   * @param {none}
   * @return {void}.
   */
  onDestroy(() => {
    selectDataSub.unsubscribe();
    if (saveOrUpdateSub) {
      saveOrUpdateSub.unsubscribe();
    }
  });

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
  // ============================== //HOOK ==========================
</script>

<style lang="scss">
  .image-container {
    height: 100px;
  }
  .menu-font-icon {
    font-size: 1.6rem !important;
  }
</style>

<!--Invisible Element-->
<SC bind:this={scRef} {view} {menuPath} />
<!--//Invisible Element-->

<!--Main content-->
<section class="view-content-main">
  <form class="form" on:keydown={(event) => form.errors.clear(event.target.name)}>
    <div class="row ">
      <div class="col-xs-24 col-lg-21">
        <div class="row">
          <!-- Code -->
          <div class="col-xs-24 col-sm-12">
            <div class="row">
              <div class="label text-sm-left text-xx-right col-sm-24 col-lg-8">{T('COMMON.LABEL.CODE')}:</div>
              <div class="col-sm-24 col-lg-16">
                <TextInput name="code" disabled={$isReadOnlyMode$} bind:value={form.code} bind:this={codeRef} />
                {#if form.errors.has('code')}
                  <span class="error">{form.errors.get('code')}</span>
                {/if}
              </div>
            </div>
          </div>
          <!-- //Code -->

          <!-- Name -->
          <div class="col-xs-24 col-sm-12 pl-xs-0 pl-sm-2 pl-md-0">
            <div class="row">
              <div class="label text-sm-left text-xx-right col-sm-24 col-lg-8">{T('COMMON.LABEL.NAME')}:</div>
              <div class="col-sm-24 col-lg-16">
                <TextInput name="name" disabled={$isReadOnlyMode$} bind:value={form.name} />
                {#if form.errors.has('name')}
                  <span class="error">{form.errors.get('name')}</span>
                {/if}
              </div>
            </div>
          </div>
          <!-- //Name -->
        </div>

        <div class="row">
          <!-- Path -->
          <div class="col-xs-24 col-sm-12">
            <div class="row">
              <div class="label text-sm-left text-xx-right col-sm-24 col-lg-8">{T('COMMON.LABEL.PATH')}:</div>
              <div class="col-sm-24 col-lg-16">
                <TextInput name="path" disabled={$isReadOnlyMode$} bind:value={form.path} />
                {#if form.errors.has('path')}
                  <span class="error">{form.errors.get('path')}</span>
                {/if}
              </div>
            </div>
          </div>
          <!-- //Path -->

          <!-- Font Icon -->
          <div class="col-xs-24 col-sm-12 pl-xs-0 pl-sm-2 pl-md-0">
            <div class="row">
              <div class="label text-sm-left text-xx-right col-sm-24 col-lg-8">
                <Checkbox name="useFontIcon" disabled={$isReadOnlyMode$} bind:checked={form.useFontIcon} />
                {T('COMMON.LABEL.FONT_ICON')}:
              </div>
              <div class="col-sm-24 col-lg-14">
                <div class="col-sm-24 col-lg-16">
                  <TextInput name="fontIcon" disabled={$isReadOnlyMode$} bind:value={form.fontIcon} />
                </div>
              </div>

              <div class="col-sm-24 col-lg-2 pl-md-0 pl-lg-1">
                {#if form.fontIcon && form.fontIcon.includes('<')}
                  <span class="menu-font-icon">
                    {@html form.fontIcon}
                  </span>
                {/if}
              </div>
            </div>
          </div>
          <!--  //Font Icon -->
        </div>

        <div class="row">
          <!--  Sort -->
          <div class="col-xs-24 col-sm-12">
            <div class="row">
              <div class="label text-sm-left text-xx-right col-sm-24 col-lg-8">{T('COMMON.LABEL.SORT')}:</div>
              <div class="col-sm-24 col-lg-16">
                <NumberInput name="sort" disabled={$isReadOnlyMode$} bind:value={form.sort} />
                {#if form.errors.has('sort')}
                  <span class="error">{form.errors.get('sort')}</span>
                {/if}
              </div>
            </div>
            <!--  //Sort -->
          </div>

          <!--  Disabled -->
          <div class="col-xs-24 col-sm-12 pl-xs-0 pl-sm-2 pl-md-0">
            <div class="row">
              <div class="col-sm-24 col-lg-8" />
              <div class="label col-sm-24 col-lg-16">
                <Checkbox disabled={$isReadOnlyMode$} name="disabled" bind:checked={form.disabled} />
                {T('COMMON.LABEL.DISABLED')}
              </div>
            </div>
          </div>
          <!-- //Disabled -->
        </div>
      </div>

      <!-- Image Selector -->
      <div class="image-container col-xs-24 col-lg-3 mt-xs-0 mt-sm-6 mt-md-0">
        <SimpleImageSelector
          id={view.getViewName() + 'ViewerId'}
          src={form.iconData}
          disabled={$isReadOnlyMode$}
          on:imageChange={onImageChange} />
      </div>
      <!--  //Image Selector -->
    </div>

    <!--  Department Tree -->
    <div class="row">
      <div class="default-border col-md-24 col-lg-12">
        <TreeView
          bind:this={availableDepTreeRef}
          id={'availableDepTree' + view.getViewName() + 'Id'}
          data={$availableDep$}
          disabled={$isReadOnlyMode$}
          isCheckableNode={true}>
          <div slot="label" class="label">{T('SYS.LABEL.AVAILABLE_DEPARTMENT')}:</div>
        </TreeView>
      </div>
      <div class="default-border col-md-24 col-lg-12 pl-md-0 pl-lg-1 pt-md-1 pt-lg-0">
        <TreeView
          bind:this={assignedDepTreeRef}
          id={'assignedDepTree' + view.getViewName() + 'Id'}
          data={$assignedDep$}
          disabled={$isReadOnlyMode$}
          isCheckableNode={true}>
          <div slot="label" class="label">{T('SYS.LABEL.ASSIGNED_DEPARTMENT')}:</div>
        </TreeView>
      </div>
    </div>
  </form>
</section>
<!--//Main content-->

<!--Form controller-->
<section class="view-content-bottom">
  {#if view.isRendered(ButtonId.AddNew)}
    <Button btnType={ButtonType.AddNew} on:click={onAddNew} disabled={view.isDisabled(ButtonId.AddNew)} />
  {/if}

  {#if view.isRendered(ButtonId.Save, !$isUpdateMode$)}
    <Button
      action={useSaveOrUpdateAction}
      bind:this={btnSaveRef}
      btnType={ButtonType.Save}
      disabled={view.isDisabled(ButtonId.Save, form.errors.any())}
      running={$saveRunning$} />
  {/if}

  {#if view.isRendered(ButtonId.Edit, $isReadOnlyMode$ && $isUpdateMode$)}
    <Button btnType={ButtonType.Edit} on:click={onEdit} disabled={view.isDisabled(ButtonId.Edit)} />
  {/if}

  {#if view.isRendered(ButtonId.Update, !$isReadOnlyMode$ && $isUpdateMode$)}
    <Button
      action={useSaveOrUpdateAction}
      bind:this={btnUpdateRef}
      btnType={ButtonType.Update}
      disabled={view.isDisabled(ButtonId.Update, form.errors.any())}
      running={$saveRunning$} />
  {/if}

  {#if view.isRendered(ButtonId.Delete, $isUpdateMode$)}
    <Button
      btnType={ButtonType.Delete}
      on:click={onDelete}
      disabled={view.isDisabled(ButtonId.Delete)}
      running={$deleteRunning$} />
  {/if}

  {#if view.isRendered(ButtonId.Config)}
    <Button btnType={ButtonType.Config} on:click={onConfig} disabled={view.isDisabled(ButtonId.Config)} />
  {/if}

  {#if view.isRendered(ButtonId.TrashRestore, $hasAnyDeletedRecord$)}
    <Button
      btnType={ButtonType.TrashRestore}
      on:click={onTrashRestore}
      disabled={view.isDisabled(ButtonId.TrashRestore)} />
  {/if}
</section>
<!--//Form controller-->

<script lang="ts">
  import { tick, onMount, onDestroy } from 'svelte';
  import { catchError, concatMap, switchMap, filter, take } from 'rxjs/operators';
  import { fromEvent, of, Observable, EMPTY } from 'rxjs';
  import { fromPromise } from 'rxjs/internal-compatibility';

  import { T } from '@/assets/js/locale/locale';
  import Form from '@/assets/js/form/form';
  import { ViewStore } from '@/store/view';
  import { Menu } from '../model';
  import { SObject } from '@/assets/js/sobject';
  import { apolloClient } from '@/assets/js/hasura-client';
  import { ButtonPressed } from '@/components/ui/button/types';
  import { SDate } from '@/assets/js/sdate';
  import { humanOrOrgStore } from '@/modules/sys/human-or-org/store';
  import { ButtonType, ButtonId } from '@/components/ui/button/types';
  import { validation } from './validation';
  import { ModalType } from '@/components/ui/modal/types';
  import { StringUtil } from '@/assets/js/string-util';

  import Button from '@/components/ui/button';
  import NumberInput from '@/components/ui/input/number-input';
  import TextInput from '@/components/ui/input/text-input';
  import Checkbox from '@/components/ui/input/checkbox';
  import ConfirmModal from '@/components/ui/modal/base';
  import ConfirmDeleteModal from '@/components/ui/modal/base';
  import ConfirmPasswordModal from '@/components/ui/modal/base';
  import ConfirmConflictDataModal from '@/components/modal/conflict-data-confirm';
  import ConfigModal from '@/components/modal/view-config';
  import TrashRestoreModal from '@/components/modal/trash-restore';
  import Snackbar from '@/components/ui/snackbar';
  import SimpleImageSelector from '@/components/ui/simple-image-selector';
  import TreeView from '@/components/ui/tree-view';
  import { Store } from '../store';
  import { Debug } from '@/assets/js/debug';

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
  let confirmModalRef: any;
  let confirmDeleteModalRef: any;
  let confirmPasswordModalRef: any;
  let snackbarRef: any;
  let configModalRef: any;
  let trashRestoreModalRef: any;
  let btnSaveRef: any;
  let btnUpdateRef: any;
  let confirmConflictDataModalRef: any;
  let availableDepTreeRef: any;
  let assignedDepTreeRef: any;

  // Other vars
  let selectedData: Menu;
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
  const query = view.createQuerySubscription(true);
  const saveUpdateUri = 'sys/menu/save-or-update';

  // ============================== EVENT HANDLE ==========================
  /**
   * Event handle for Add New button.
   * @param {event} Mouse click event.
   * @return {void}.
   */
  const onAddNew = (event) => {
    // verify permission
    view.verifyAddNewAction(event.currentTarget.id, confirmModalRef, confirmPasswordModalRef).then((_) => {
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
    view
      .verifyEditAction(event.currentTarget.id, confirmModalRef, confirmPasswordModalRef, selectedData.name)
      .then((_) => {
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
    view
      .verifyDeleteAction(event.currentTarget.id, confirmDeleteModalRef, confirmPasswordModalRef, selectedData.name)
      .then((_) => {
        // if everything is OK, call the action
        view.doDelete(selectedData.id, snackbarRef, doAddNew);
      });
  };

  /**
   * Event handle for Config button.
   * @param {event} Mouse click event.
   * @return {void}.
   */
  const onConfig = (event) => {
    view.showViewConfigModal(
      event.currentTarget.id,
      confirmModalRef,
      confirmPasswordModalRef,
      configModalRef,
      snackbarRef,
    );
  };

  /**
   * Event handle for Trash Restore button.
   * @param {event} Mouse click event.
   * @return {void}.
   */
  const onTrashRestore = (event) => {
    view.showTrashRestoreModal(
      event.currentTarget.id,
      false,
      confirmModalRef,
      confirmPasswordModalRef,
      trashRestoreModalRef,
      snackbarRef,
    );
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

  // ============================== HELPER ==========================
  /**
   * Get edited user detail, who edited this form in the same time with the current user
   * @param {userId} Id of the user.
   * @return {string}. template: <Last Name> <First Name> - [bold]<User Name>[/bold]
   */
  const getEditedUserDetail = async (userId: string) => {
    const user = await humanOrOrgStore.sysGetUserInfoById(userId);
    return `${user[0].lastName} ${user[0].firstName} - <b>${user[0].username} </b>`;
  };

  /**
   * Restructure the changed data.
   * @param {changedData} Object present for changed data.
   * @return {object}. {field: xxx, oldValue: xxx, newValue: xxx}
   */
  const restructureChangedData = (changedData: any) => {
    const result = [];
    for (let field in changedData) {
      result.push({
        field: T('COMMON.LABEL.' + StringUtil.toUpperCaseWithUnderscore(field)),
        oldValue: field.toLowerCase().includes('date')
          ? SDate.convertMilisecondToDateTimeString(changedData[field].oldValue)
          : changedData[field].oldValue,
        newValue: field.toLowerCase().includes('date')
          ? SDate.convertMilisecondToDateTimeString(changedData[field].newValue)
          : changedData[field].newValue,
      });
    }

    return result;
  };
  // ============================== //HELPER ==========================

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
      const dataChanged = view.checkObjectChange(beforeForm, SObject.clone(form), snackbarRef);
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
    ob$
      .pipe(
        filter((_) => validate()) /* filter if form pass client validation */,
        concatMap((_) =>
          fromPromise(
            /* verify permission*/
            view.verifySaveAction(
              // @ts-ignore
              $isUpdateMode$ ? ButtonId.Update : ButtonId.Save,
              confirmModalRef,
              confirmPasswordModalRef,
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
              snackbarRef.showUnknownError(res.response.data.message);
            } else {
              form.errors.errors = form.recordErrors(res.response.data);
            }
          } else {
            // success
            // @ts-ignore
            if ($isUpdateMode$) {
              // update
              snackbarRef.showUpdateSuccess();
              view.needSelectId$.next(selectedData.id);
            } else {
              // save
              snackbarRef.showSaveSuccess();
              doAddNew();
            }
          }
          saveRunning$.next(false);
        },
        error: (error) => {
          Debug.errorSection('Language - doSaveOrUpdate', error);
          saveRunning$.next(false);
        },
      });
  };
  // ============================== //FUNCTIONAL ==========================

  // ============================== REACTIVE ==========================
  // Monitoring selected data from other users
  // When other users edit on the same data, display a confirmation of the change with the current user
  view.selectedData$
    .pipe(
      switchMap((it) => {
        if (!it) return EMPTY;
        return apolloClient.subscribe({
          query,
          variables: {
            id: it.id,
            updatedBy: localStorage.getItem('userId'),
          },
        });
      }),
    )
    .subscribe(async (res) => {
      if (res.data.menu.length === 0) {
        return;
      }
      const hasuraObj = res.data.menu[0];
      delete hasuraObj.__typename;
      delete hasuraObj.id;
      const obj = SObject.clone(form);
      const formObj = {};
      for (const field in hasuraObj) {
        formObj[field] = obj[field];
      }

      const changed = view.checkObjectChange(formObj, hasuraObj);
      if (changed) {
        // @ts-ignore
        if (!$isReadOnlyMode$) {
          const editedUser = await getEditedUserDetail(hasuraObj.updatedBy);
          confirmConflictDataModalRef
            .show(restructureChangedData(changed), editedUser, hasuraObj.updatedDate)
            .then((buttonPressed: number) => {
              if (buttonPressed === ButtonPressed.OK) {
                view.needSelectId$.next(selectedData.id);
                setTimeout(() => {
                  isReadOnlyMode$.next(false);
                }, 1000);
              } else {
                view.needHighlightId$.next(selectedData.id);
              }
            });
        } else {
          view.needSelectId$.next(selectedData.id);
        }
      }
    });

  // when user click on work list. load selected data to the right form
  const selectDataSub = view.selectedData$.subscribe((data) => {
    selectedData = data;
    if (selectedData) {
      isReadOnlyMode$.next(true);
      isUpdateMode$.next(true);
      form = new Form({
        ...selectedData,
        insertDepIds: [],
        deleteDepIds: [],
      });

      form = SObject.convertFieldsToCamelCase(form);
      form.originalData = SObject.convertFieldsToCamelCase(form.originalData);
      // save init value for checking data change
      beforeForm = SObject.clone(form);
    }
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
<Snackbar bind:this={snackbarRef} />
<ConfirmConflictDataModal
  {menuPath}
  id={'conflictData' + view.getViewName() + 'Modal'}
  bind:this={confirmConflictDataModalRef} />
<ConfirmModal modalType={ModalType.Confirm} {menuPath} bind:this={confirmModalRef} />
<ConfirmDeleteModal
  id="mdConfirmDeleteModal"
  title={T('COMMON.LABEL.DELETE')}
  modalType={ModalType.Confirm}
  {menuPath}
  bind:this={confirmDeleteModalRef} />
<ConfirmPasswordModal modalType={ModalType.ConfirmPassword} {menuPath} bind:this={confirmPasswordModalRef} />
<ConfigModal
  {menuPath}
  subTitle={view.getViewTitle()}
  id={'configModal' + view.getViewName()}
  bind:this={configModalRef}
  containerWidth="500px" />
<TrashRestoreModal
  columns={view.trashRestoreColumns}
  {menuPath}
  subTitle={view.getViewTitle()}
  id={'trashRestoreModal' + view.getViewName()}
  bind:this={trashRestoreModalRef}
  containerWidth="600px" />
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

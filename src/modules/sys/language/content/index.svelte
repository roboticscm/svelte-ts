<script lang="ts">
  import { tick, onMount, onDestroy } from 'svelte';
  import {catchError, concatMap, switchMap, filter} from 'rxjs/operators';
  import { fromEvent, of, Observable, EMPTY } from 'rxjs';
  import { fromPromise } from 'rxjs/internal-compatibility';

  import { T } from '@/assets/js/locale/locale';
  import Form from '@/assets/js/form/form';
  import { ViewStore } from '@/store/view';
  import { Language } from '../model';
  import { SObject } from '@/assets/js/sobject';
  import { apolloClient } from '@/assets/js/hasura-client';
  import { ButtonPressed } from '@/components/ui/button/types';
  import { SDate } from '@/assets/js/sdate';
  import { humanOrOrgStore } from '@/modules/sys/human-or-org/store';
  import { ButtonType, ButtonId } from '@/components/ui/button/types';
  import { validation } from './validation';
  import { ModalType } from '@/components/ui/modal/types';

  import Button from '@/components/ui/button/index.svelte';
  import NumberInput from '@/components/ui/input/number-input/index.svelte';
  import TextInput from '@/components/ui/input/text-input/index.svelte';
  import ConfirmModal from '@/components/ui/modal/base/index.svelte';
  import ConfirmDeleteModal from '@/components/ui/modal/base/index.svelte';
  import ConfirmPasswordModal from '@/components/ui/modal/base/index.svelte';
  import ConfirmConflictDataModal from '@/components/modal/conflict-data-confirm/index.svelte';
  import ConfigModal from '@/components/modal/view-config/index.svelte';
  import TrashRestoreModal from '@/components/modal/trash-restore/index.svelte';
  import Snackbar from '@/components/ui/snackbar/index.svelte';
  import {StringUtil} from "@/assets/js/string-util";

  // Props
  export let view: ViewStore;
  export let menuPath: string;

  // Observable
  const selectedData$ = view.selectedData$;
  const hasAnyDeletedRecord$ = view.hasAnyDeletedRecord$;
  const deleteRunning$ = view.deleteRunning$;
  const saveRunning$ = view.saveRunning$;
  const isReadOnlyMode$ = view.isReadOnlyMode$;
  const isUpdateMode$ = view.isUpdateMode$;

  // Refs
  let nameRef: any;
  let confirmModalRef: any;
  let confirmDeleteModalRef: any;
  let confirmPasswordModalRef: any;
  let snackbarRef: any;
  let configModalRef: any;
  let trashRestoreModalRef: any;
  let btnSaveRef: any;
  let btnUpdateRef: any;
  let confirmConflictDataModalRef: any;

  // Other vars
  let selectedData: Language;
  let form = new Form({
    ...new Language(),
  });
  let beforeForm: Form;
  const query = view.createQuerySubscription(true);

  // ============================== EVENT HANDLE ==========================
  const onAddNew = (event) => {
    view.verifyAddNewAction(event.currentTarget.id, confirmModalRef, confirmPasswordModalRef).then((_) => {
      doAddNew();
    });
  };

  const onEdit = (event) => {
    view
      .verifyEditAction(event.currentTarget.id, confirmModalRef, confirmPasswordModalRef, selectedData.name)
      .then((_) => {
        isReadOnlyMode$.next(false);
        tick().then(() => {
          nameRef.focus();
        });
      });
  };

  const onDelete = (event) => {
    view
      .verifyDeleteAction(event.currentTarget.id, confirmDeleteModalRef, confirmPasswordModalRef, selectedData.name)
      .then((_) => {
        view.doDelete(snackbarRef, doAddNew);
      });
  };

  const onConfig = (event) => {
    view.showViewConfigModal(
      event.currentTarget.id,
      confirmModalRef,
      confirmPasswordModalRef,
      configModalRef,
      snackbarRef,
    );
  };

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
  // ============================== //EVENT HANDLE ==========================


  // ============================== HELPER ==========================
  const getEditedUser = async (userId: string) => {
    const user = await humanOrOrgStore.sysGetUserInfoById(userId);
    return `${user[0].lastName} ${user[0].firstName} - <b>${user[0].username} </b>`;
  };
  // ============================== //HELPER ==========================

  // ============================== CLIENT VALIDATION ==========================
  const validate = () => {
    form.errors.errors = form.recordErrors(validation(form));
    if (form.errors.any()) {
      return false;
    }

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
  const doAddNew = async () => {
    isReadOnlyMode$.next(false);
    isUpdateMode$.next(false);
    view.selectedData$.next(null);

    form = new Form({
      ...new Language(),
    });
    tick().then(() => {
      nameRef.focus();
    });
  };

  const doSaveOrUpdate = (ob$: Observable<any>) => {
    ob$
      .pipe(
        filter((_) => validate()),
        concatMap((_) =>
          fromPromise(
            view.verifySaveAction(
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
        filter((value) => value !== 'fail'),
        switchMap((_) => {
          saveRunning$.next(true);
          return form.post('sys/language/save-or-update').pipe(
            catchError((error) => {
              return of(error);
            }),
          );
        }),
      )
      .subscribe({
        next: (res) => {
          if (res.response && res.response.data) {
            // error
            if (res.response.data.message) {
              snackbarRef.showUnknownError(res.response.data.message);
            } else {
              form.errors.errors = form.recordErrors(res.response.data);
            }
          } else {
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
      if (res.data.language.length === 0) {
        return;
      }
      const hasuraObj = res.data.language[0];
      delete hasuraObj.__typename;
      delete hasuraObj.id;
      const obj = SObject.clone(form);
      const formObj = {};
      for (const field in hasuraObj) {
        formObj[field] = obj[field];
      }

      const changed = view.checkObjectChange(formObj, hasuraObj);
      if (changed) {
        if (!$isReadOnlyMode$) {
          const editedUser = await getEditedUser(hasuraObj.updatedBy);
          confirmConflictDataModalRef.show(formatChangedData(changed), editedUser, hasuraObj.updatedDate).then((buttonPressed: number) => {
            if (buttonPressed === ButtonPressed.OK) {
              view.needSelectId$.next(selectedData.id);
              setTimeout(() => {
                isReadOnlyMode$.next(false);
              }, 2500);
            } else {
              view.needHighlightId$.next(selectedData.id);
            }
          });
        } else {
          view.needSelectId$.next(selectedData.id);
        }
      }
    });

  const formatChangedData = (changedData: any) => {
    const result = [];
      for(let field in changedData) {
        result.push({
          field: T('COMMON.LABEL.' + StringUtil.toUpperCaseWithUnderscore(field)),
          oldValue: field.toLowerCase().includes('date') ? SDate.convertMilisecondToDateTimeString( changedData[field].oldValue) : changedData[field].oldValue,
          newValue: field.toLowerCase().includes('date') ? SDate.convertMilisecondToDateTimeString( changedData[field].newValue) : changedData[field].newValue,
        })
      }

      console.log(result);
      return result;
  }

  // when user click on work list. load selected data to the right form
  const selectDataSub = view.selectedData$.subscribe((data) => {
    selectedData = data;
    if (selectedData) {
      isReadOnlyMode$.next(true);
      isUpdateMode$.next(true);
      form = new Form({
        ...selectedData,
      });

      // save init value
      beforeForm = SObject.clone(form);
      view.loading$.next(false);
    }
  });
  // ============================== //REACTIVE ==========================

  // ============================== HOOK ==========================
  onMount(() => {
    doAddNew();

    // Capture hot key (Ctrl - S) for save or update
    const controlS$ = fromEvent(document, 'keydown').pipe(
      filter((e: any) => {
        if (e.keyCode == 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
          e.preventDefault();
          return true;
        } else {
          return false;
        }
      }),
    );
    doSaveOrUpdate(controlS$);
  });

  onDestroy(() => {
    selectDataSub.unsubscribe();
  });

  const useSaveOrUpdateAction = {
    register(component: HTMLElement, param: any) {
      doSaveOrUpdate(fromEvent(component, 'click'));
    },
  };
  // ============================== //HOOK ==========================
</script>

<Snackbar bind:this={snackbarRef} />
<ConfirmConflictDataModal id={'conflictData' + view.getViewName() + 'Modal'} bind:this={confirmConflictDataModalRef}></ConfirmConflictDataModal>
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

<!--<ConfirmModal type={ModalType.Alert} {menuPath} bind:this={modalRef} />-->
<div class="view-content-main">
  <form class="form" on:keydown={(event) => form.errors.clear(event.target.name)}>
    <div class="row ">
      <!-- Name -->
      <div class="col-xs-24 col-sm-8">
        <div class="row">
          <div class="label text-sm-left text-xx-right col-sm-24 col-lg-8">{T('COMMON.LABEL.NAME')}:</div>
          <div class="col-sm-24 col-lg-16">
            <TextInput name="name" disabled={$isReadOnlyMode$} bind:value={form.name} bind:this={nameRef} />
            {#if form.errors.has('name')}
              <span class="error">{form.errors.get('name')}</span>
            {/if}
          </div>
        </div>
      </div>
      <!-- // Name -->

      <!-- Locale -->
      <div class="col-xs-24 col-sm-8 pl-xs-0 pl-sm-2 pl-md-0">
        <div class="row">
          <div class="label text-sm-left text-xx-right col-sm-24 col-lg-8">{T('COMMON.LABEL.LOCALE')}:</div>
          <div class="col-sm-24 col-lg-16">
            <TextInput name="locale" disabled={$isReadOnlyMode$} bind:value={form.locale} />
            {#if form.errors.has('locale')}
              <span class="error">{form.errors.get('locale')}</span>
            {/if}
          </div>
        </div>
      </div>
      <!-- // Locale -->

      <!-- Sort -->
      <div class="col-xs-24 col-sm-8">
        <div class="row">
          <div class="label text-sm-left text-xx-right col-sm-24 col-lg-8">{T('COMMON.LABEL.SORT')}:</div>
          <div class="col-sm-24 col-lg-16">
            <NumberInput name="sort" disabled={$isReadOnlyMode$} bind:value={form.sort} />
            {#if form.errors.has('sort')}
              <span class="error">{form.errors.get('sort')}</span>
            {/if}
          </div>
        </div>
      </div>
      <!-- // Sort -->
    </div>
  </form>
</div>

<div class="view-content-bottom">
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
</div>

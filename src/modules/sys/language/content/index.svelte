<script lang="ts">
  import { T } from '@/assets/js/locale/locale';
  import Form from '@/assets/js/form/form';
  import { ViewStore } from '@/store/view';
  import { Language } from '../model';
  import Button from '@/components/ui/button/index.svelte';
  import { ButtonType, ButtonId } from '@/components/ui/button/types';
  import { validation } from './validation';
  import NumberInput from '@/components/ui/input/number-input/index.svelte';
  import TextInput from '@/components/ui/input/text-input/index.svelte';
  import ConfirmModal from '@/components/ui/modal/base/index.svelte';
  import ConfirmDeleteModal from '@/components/ui/modal/base/index.svelte';
  import ConfirmPasswordModal from '@/components/ui/modal/base/index.svelte';
  import ConfigModal from '@/components/modal/view-config/index.svelte';
  import TrashRestoreModal from '@/components/modal/trash-restore/index.svelte';
  import Snackbar from '@/components/ui/snackbar/index.svelte';
  import { ModalType } from '@/components/ui/modal/types';
  import { store } from '../store';
  import { catchError, concatMap, switchMap, filter } from 'rxjs/operators';
  import { from, fromEvent, fromEventPattern, of, Observable, EMPTY } from 'rxjs';
  import { SObject } from '@/assets/js/sobject';
  import { tick, onMount, onDestroy } from 'svelte';
  import { tableUtilStore } from '@/store/table-util';
  import { fromPromise } from 'rxjs/internal-compatibility';
  import { apolloClient } from '@/assets/js/hasura-client';
  import { ButtonPressed } from '@/components/ui/button/types';
  import { SDate } from '@/assets/js/sdate';
  import { humanOrOrgStore } from '@/modules/sys/human-or-org/store';

  export let view: ViewStore;
  export let menuPath: string;

  const selectedData$ = store.selectedData$;
  const hasAnyDeletedRecord$ = view.hasAnyDeletedRecord$;

  let nameRef: any;
  let confirmModalRef: any;
  let confirmDeleteModalRef: any;
  let confirmPasswordModalRef: any;
  let snackbarRef: any;
  let configModalRef: any;
  let trashRestoreModalRef: any;
  let btnSaveRef: any;
  let btnUpdateRef: any;
  let selectedData: Language;

  let form = new Form({
    ...new Language(),
  });

  let beforeForm: Form;

  const query = view.createQuerySubscription(true);

  const onAddNew = (event) => {
    view.verifyAddNewAction(event.currentTarget.id, confirmModalRef, confirmPasswordModalRef).then((_) => {
      doAddNew();
    });
  };

  let registerSaveEvent = false;
  const doAddNew = async () => {
    if (view.isReadOnlyMode) {
      registerSaveEvent = true;
    }
    view.isReadOnlyMode = false;
    view.isUpdateMode = false;
    store.selectedData$.next(null);

    form = new Form({
      ...new Language(),
    });
    tick().then(() => {
      nameRef.focus();
      if (registerSaveEvent) {
        doSaveOrUpdate(fromEvent(btnSaveRef.getTarget(), 'click'), btnSaveRef.getTarget().id);
        registerSaveEvent = false;
      }
    });
  };

  const validate = () => {
    form.errors.errors = form.recordErrors(validation(form));
    if (form.errors.any()) {
      return false;
    }

    if (view.isUpdateMode) {
      const dataChanged = view.checkObjectChange(beforeForm, SObject.clone(form), snackbarRef);
      if (!dataChanged) {
        return false;
      }
    }

    return true;
  };

  const doSaveOrUpdate = (ob$: Observable, id: string) => {
    console.log('????');
    ob$
      .pipe(
        filter((_) => validate()),
        concatMap((_) =>
          fromPromise(view.verifySaveAction(id, confirmModalRef, confirmPasswordModalRef)).pipe(
            catchError((error) => {
              return of(error);
            }),
          ),
        ),
        filter((value) => value !== 'fail'),
        switchMap((_) => {
          view.saveRunning = true;
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
            if (view.isUpdateMode) {
              // update
              snackbarRef.showUpdateSuccess();
              view.needSelectId$.next(selectedData.id);
            } else {
              // save
              snackbarRef.showSaveSuccess();
              doAddNew();
            }
          }
          view.saveRunning = false;
        },
      });
  };

  const onEdit = (event) => {
    view
      .verifyEditAction(event.currentTarget.id, confirmModalRef, confirmPasswordModalRef, selectedData.name)
      .then((_) => {
        view.isReadOnlyMode = false;
        tick().then(() => {
          nameRef.focus();
          doSaveOrUpdate(fromEvent(btnUpdateRef.getTarget(), 'click'), btnUpdateRef.getTarget().id);
        });
      });
  };

  const onDelete = (event) => {
    view
      .verifyDeleteAction(event.currentTarget.id, confirmDeleteModalRef, confirmPasswordModalRef, selectedData.name)
      .then((_) => {
        doDelete();
      });
  };

  const doDelete = () => {
    if (selectedData) {
      view.deleteRunning = true;
      tableUtilStore.softDeleteMany(view.tableName, [selectedData.id]).subscribe({
        next: (res) => {
          snackbarRef.showDeleteSuccess(res.data + ' ' + T('COMMON.LABEL.RECORD'));
        },
        error: (err: Error) => {
          snackbarRef.show(err.message);
        },
        complete: () => {
          doAddNew();
          view.deleteRunning = false;
        },
      });
    }
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

  const getMessageDetail = async (newData: Language, changed: any) => {
    const user = await humanOrOrgStore.sysGetUserInfoById(newData.updatedBy);

    return `
      ${T('SYS.MSG.THIS_FORM_EDITED_BY')}: ${user[0].lastName} ${user[0].firstName} - <b>${user[0].username} </b><br>
      ${T('COMMON.LABEL.AT')}: ${SDate.convertMilisecondToDateTimeString(newData.updatedDate)} <br>
      ${T('COMMON.LABEL.DETAIL')} : <br>
      ${JSON.stringify(changed)} <br>
      <hr>
      ${T('COMMON.MSG.DO_YOU_WANT_RELOADING_NEW_DATA')}?
    `;
  };

  store.selectedData$
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
        if (!view.isReadOnlyMode) {
          const msg = await getMessageDetail(hasuraObj, changed);
          confirmModalRef.show(msg).then((buttonPressed: number) => {
            if (buttonPressed === ButtonPressed.OK) {
              view.needSelectId$.next(selectedData.id);
              setTimeout(() => {
                view.isReadOnlyMode = false;
              }, 2000);
            } else {
              view.needHighlightId$.next(selectedData.id);
            }
          });
        } else {
          // view.needHighlightId$.next(selectedData.id);
          view.needSelectId$.next(selectedData.id);
        }
      }
    });

  const selectDataSub = store.selectedData$.subscribe((data) => {
    selectedData = data;
    if (selectedData) {
      view.isReadOnlyMode = true;
      view.isUpdateMode = true;
      form = new Form({
        ...selectedData,
      });

      // save init value
      beforeForm = SObject.clone(form);
      view.loading$.next(false);
    }
  });

  const captureCtrlS = (e) => {
    if (e.keyCode == 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
      e.preventDefault();

      if(view.isUpdateMode) {
        doSaveOrUpdate(of('1'), btnUpdateRef.getTarget().id);
      } else {
        doSaveOrUpdate(of('1'), btnSaveRef.getTarget().id);
      }
    }
  };

  onMount(() => {
    doAddNew();
    document.addEventListener('keydown', captureCtrlS, false);
    doSaveOrUpdate(fromEvent(btnSaveRef.getTarget(), 'click'), btnSaveRef.getTarget().id);
  });

  onDestroy(() => {
    selectDataSub.unsubscribe();
    document.removeEventListener('keydown', captureCtrlS);
  });

  const onSave = (event) => {
    // doSaveOrUpdate(of(event), btnSaveRef.getTarget().id);
  }
</script>

<Snackbar bind:this={snackbarRef} />
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
            <TextInput name="name" disabled={view.isReadOnlyMode} bind:value={form.name} bind:this={nameRef} />
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
            <TextInput name="locale" disabled={view.isReadOnlyMode} bind:value={form.locale} />
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
            <NumberInput name="sort" disabled={view.isReadOnlyMode} bind:value={form.sort} />
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

  {#if view.isRendered(ButtonId.Save, !view.isUpdateMode)}
    <Button
            on:click={onSave}
      bind:this={btnSaveRef}
      btnType={ButtonType.Save}
      disabled={view.isDisabled(ButtonId.Save, form.errors.any())}
      running={view.saveRunning} />
  {/if}

  {#if view.isRendered(ButtonId.Edit, view.isReadOnlyMode && view.isUpdateMode)}
    <Button btnType={ButtonType.Edit} on:click={onEdit} disabled={view.isDisabled(ButtonId.Edit)} />
  {/if}

  {#if view.isRendered(ButtonId.Update, !view.isReadOnlyMode && view.isUpdateMode)}
    <Button
      bind:this={btnUpdateRef}
      btnType={ButtonType.Update}
      disabled={view.isDisabled(ButtonId.Update, form.errors.any())}
      running={view.saveRunning} />
  {/if}

  {#if view.isRendered(ButtonId.Delete, view.isUpdateMode)}
    <Button
      btnType={ButtonType.Delete}
      on:click={onDelete}
      disabled={view.isDisabled(ButtonId.Delete)}
      running={view.deleteRunning} />
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

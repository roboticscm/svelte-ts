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
  import Snackbar from '@/components/ui/snackbar/index.svelte';
  import { ModalType } from '@/components/ui/modal/types';
  import { store } from '../store';
  import { take } from 'rxjs/operators';
  import { BehaviorSubject } from 'rxjs';
  import { SObject } from '@/assets/js/sobject';
  import { tick, onMount, onDestroy } from 'svelte';
  import { tableUtilStore } from '@/store/table-util';

  const selectedData$ = store.selectedData$;

  export let view: ViewStore;
  export let menuPath: string;

  let nameRef: any;
  let confirmModalRef: any;
  let confirmDeleteModalRef: any;
  let confirmPasswordModalRef: any;
  let snackbarRef: any;
  let configModalRef: any;
  let selectedData: Language;


  let form = new Form({
    ...new Language(),
  });

  const onAddNew = (event) => {
    view.verifyAddNewAction(event.currentTarget.id, confirmModalRef, confirmPasswordModalRef).then((_) => {
      doAddNew();
    });
  };

  const doAddNew = async () => {
    view.isReadOnlyMode = false;
    view.isUpdateMode = false;

    form = new Form({
      ...new Language(),
    });
    tick().then(() => nameRef.focus());
  };

  const onSave = (event: any) => {
    // client validation
    form.errors.record(validation(form));
    form.errors.errors = { ...form.errors.errors };
    if (form.errors.any()) {
      return;
    }

    view.verifyDeleteAction(event.currentTarget.id, confirmDeleteModalRef, confirmPasswordModalRef).then((_) => {
      doSaveOrUpdate();
    });
  };

  const doSaveOrUpdate = () => {
    view.saveRunning = true;
    console.log('saved');
    setTimeout(() => {
      view.saveRunning = false;
    }, 1000);
  };

  const onEdit = (event) => {
    view
      .verifyEditAction(event.currentTarget.id, confirmModalRef, confirmPasswordModalRef, selectedData.name)
      .then((_) => {
        view.isReadOnlyMode = false;
        tick().then(() => nameRef.focus());
      });
  };

  const onUpdate = (event) => {
    view
      .verifyUpdateAction(event.currentTarget.id, confirmModalRef, confirmPasswordModalRef, selectedData.name)
      .then((_) => {
        doSaveOrUpdate();
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
        }
      });
    }
  };

  const onConfig = (event) => {
    view.showViewConfigModal (event.currentTarget.id,
            confirmModalRef,
            confirmPasswordModalRef,
            configModalRef,
            snackbarRef
    )
  };
  const onTrashRestore = (event) => {};

  const selectDataSub = store.selectedData$.subscribe((data) => {
    selectedData = data;
    if (selectedData) {
      view.isReadOnlyMode = true;
      view.isUpdateMode = true;

      // save init value
      // beforeForm = SObject.clone(state.form);

      form = new Form({
        ...selectedData,
      });
      view.loading$.next(false);
    }
  });

  onMount(() => {
    nameRef.focus();
  });

  onDestroy(() => {
    selectDataSub.unsubscribe();
  });
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
<ConfigModal id={'modal' + menuPath} bind:this={configModalRef}></ConfigModal>
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
      btnType={ButtonType.Save}
      on:click={onSave}
      disabled={view.isDisabled(ButtonId.Save, form.errors.any())}
      running={view.saveRunning} />
  {/if}

  {#if view.isRendered(ButtonId.Edit, view.isReadOnlyMode && view.isUpdateMode)}
    <Button btnType={ButtonType.Edit} on:click={onEdit} disabled={view.isDisabled(ButtonId.Edit)} />
  {/if}

  {#if view.isRendered(ButtonId.Update, !view.isReadOnlyMode && view.isUpdateMode)}
    <Button
      btnType={ButtonType.Update}
      on:click={onUpdate}
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

  {#if view.isRendered(ButtonId.TrashRestore)}
    <Button
      btnType={ButtonType.TrashRestore}
      on:click={onTrashRestore}
      disabled={view.isDisabled(ButtonId.TrashRestore)} />
  {/if}
</div>

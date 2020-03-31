<script lang="ts">
  import Button from '@/components/ui/button/index.svelte';
  import { ButtonType, ButtonPressed } from '@/components/ui/button/types';
  import { ModalType, ModalId } from '@/components/ui/modal/types';
  import { createModal } from '../use-modal';
  import { onMount, createEventDispatcher, onDestroy } from 'svelte';
  import { StringUtil } from '@/assets/js/string-util';
  import { T } from '@/assets/js/locale/locale';
  import PasswordInput from '@/components/ui/input/password-input/index.svelte';
  import TextInput from '@/components/ui/input/text-input/index.svelte';
  import { appStore } from '@/store/app';
  import Form from '@/assets/js/form/form';
  import { getMethodNameInSnackCase } from '@/assets/js/util';
  import { catchError } from 'rxjs/operators';
  import { of } from 'rxjs';

  const dispatch = createEventDispatcher();
  export let id: string;
  export let title = '';
  export let fontIcon = '';
  export let iconData = '';
  export let showControlButton = true;
  export let menuPath: string;
  export let modalType: ModalType = ModalType.Custom;
  export let showOkButton = true;
  export let showCancelButton: boolean = undefined;
  export let showCloseButton = true;
  export let contentClass = 'modal-content';
  export let okButtonTitle: string = undefined;
  export let cancelButtonTitle: string = undefined;

  let modalWrapperRef: any;
  let modalRef: any;
  let passwordRef: any;

  const useModal = createModal(menuPath);

  const onResize = (event: any) => {
    if (modalRef) {
      useModal.state.width = modalRef.style.width;
      useModal.state.height = modalRef.style.height;
      dispatch('containerResize', {
        width: useModal.state.width,
        height: useModal.state.height,
      });
    }
  };

  // @ts-ignore
  const resizeObserver = new ResizeObserver(onResize);

  let form = new Form({
    username: appStore.user.username,
    password: '',
  });

  const onMouseUp = (event) => {
    useModal.saveModalState(modalRef);
  };

  export const show = (content: string = '') => {
    return new Promise((resolve, reject) => {
      useModal.state.content = content;
      useModal.state.resolve = resolve;
      form.reset();
      form = new Form({
        username: appStore.user.username,
        password: '',
      });
      if (passwordRef) {
        setTimeout(() => {
          passwordRef.focus();
        }, 200);
      }
      modalWrapperRef.classList.add('show-modal');
    });
  };

  const onCLose = () => {
    useModal.closeModal(modalWrapperRef, ButtonPressed.Close);
  };

  const onCancel = () => {
    useModal.closeModal(modalWrapperRef, ButtonPressed.Cancel);
  };

  const onOK = () => {
    useModal.closeModal(modalWrapperRef, ButtonPressed.OK);
  };

  onMount(() => {
    useModal.loadSettings(modalRef);
    useModal.dragElement(modalRef);
    resizeObserver.observe(modalRef);
  });

  onDestroy(() => {
    if (modalRef) {
      resizeObserver.unobserve(modalRef);
    }
  });

  function loginWithoutGenToken() {
    form
      .post(`sys/auth/${getMethodNameInSnackCase()}`)
      .pipe(
        catchError((error) => {
          return of(error);
        }),
      )
      .subscribe((res: any) => {
        if (res.response && res.response.data) {
          // error
          form.errors.errors = form.recordErrors(res.response.data);
        } else {
          if (useModal.state.resolve) {
            modalWrapperRef.classList.remove('show-modal');
            useModal.state.resolve(ButtonPressed.OK);
          }
        }
      });
  }

  export const getHeight = () => {
    return useModal.state.height;
  };

  const preset = (
    _id: string,
    _title: string,
    _fontIcon: string,
    _showCancelButton: boolean,
    _okButtonTitle: string = undefined,
    _cancelButtonTitle: string = undefined,
  ) => {
    if (StringUtil.isEmpty(id) && !StringUtil.isEmpty(_id)) {
      id = _id;
    }
    if (StringUtil.isEmpty(title) && !StringUtil.isEmpty(_title)) {
      title = T(`COMMON.LABEL.${_title}`);
    }
    if (StringUtil.isEmpty(fontIcon) && !StringUtil.isEmpty(_fontIcon)) {
      fontIcon = _fontIcon;
    }

    if (showCancelButton === undefined && _showCancelButton !== undefined) {
      showCancelButton = _showCancelButton;
    }

    if (okButtonTitle === undefined && _okButtonTitle !== undefined) {
      okButtonTitle = T(`COMMON.BUTTON.${_okButtonTitle}`);
    }

    if (cancelButtonTitle === undefined && _cancelButtonTitle !== undefined) {
      cancelButtonTitle = T(`COMMON.BUTTON.${_cancelButtonTitle}`);
    }
  };

  // @ts-ignore
  $: {
    switch (+modalType) {
      case ModalType.Alert:
        preset(ModalId.Alert, 'ALERT', '<i class="fa fa-exclamation-circle"></i>', false);
        break;

      case ModalType.Confirm:
        preset(ModalId.Confirm, 'CONFIRM', '<i class="fa fa-question-circle"></i>', true, 'YES', 'NO');
        break;

      case ModalType.ConfirmPassword:
        preset(ModalId.ConfirmPassword, 'CONFIRM_PASSWORD', '<i class="fa fa-key"></i>', true, 'YES', 'NO');
        break;

      case ModalType.InputText:
        preset(ModalId.InputText, 'INPUT_TEXT', '<i class="fab fa-adn"></i>', true);
        break;

      case ModalType.InputNumber:
        preset(ModalId.InputNumber, 'INPUT_NUMBER', '<i class="fa fa-sort-numeric-up"></i>', true);
        break;

      case ModalType.Custom:
        preset(undefined, undefined, undefined, true);
        break;
    }
  }
</script>

<style lang="scss">

</style>

<div bind:this={modalWrapperRef} class="modal-wrapper">
  <form on:submit|preventDefault={loginWithoutGenToken} on:keydown={(e) => form.errors.clear(e.currentTarget.name)}>
    <div bind:this={modalRef} {id} class="modal" on:mouseup={onMouseUp}>
      <div id={id + 'header'} class="modal-header">
        <div class="modal-title">
          <div>
            {#if fontIcon}
              {@html fontIcon}
            {/if}

            {#if iconData}
              <img src={iconData} alt="No Image" />
            {/if}
            {@html title}
          </div>
        </div>
        <div>
          {#if showCloseButton}
            <Button on:click={onCLose} btnType={ButtonType.CloseModal} />
          {/if}
        </div>
      </div>

      <div class={contentClass}>
        {@html useModal.state.content}

        {#if modalType === ModalType.ConfirmPassword}
          <div class="row">
            <div style="text-align: right;" class="label col-6">{T('COMMON.LABEL.USERNAME')}:</div>
            <div class="col-18">
              <TextInput name="username" bind:value={form.username} disabled={true} />
              {#if form.errors.has('username')}
                <div class="error">{form.errors.get('username')}</div>
              {/if}
            </div>
          </div>

          <div class="row">
            <div style="text-align: right;" class="label col-6">{T('COMMON.LABEL.PASSWORD')}:</div>
            <div class="col-18">
              <PasswordInput name="password" bind:value={form.password} bind:this={passwordRef} />
              {#if form.errors.has('password')}
                <div class="error">{form.errors.get('password')}</div>
              {/if}
            </div>
          </div>
        {/if}
        <slot />
      </div>

      {#if showControlButton}
        <div class="modal-controller" style={'text-align: ' + (showCancelButton ? 'right' : 'center')}>
          {#if showOkButton}
            {#if modalType === ModalType.ConfirmPassword}
              <Button type="submit" btnType={ButtonType.OkModal} title={okButtonTitle} />
            {:else}
              <Button on:click={onOK} btnType={ButtonType.OkModal} title={okButtonTitle} />
            {/if}
          {/if}
          {#if showCancelButton}
            <Button on:click={onCancel} btnType={ButtonType.CancelModal} title={cancelButtonTitle} />
          {/if}
        </div>
      {/if}
    </div>
  </form>
</div>

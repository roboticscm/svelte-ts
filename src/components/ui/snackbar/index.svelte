<script lang="ts">
  import { StringUtil } from '@/lib/js/string-util';
  import { T } from '@/lib/js/locale/locale';
  import { App } from '@/lib/js/constants';

  let snackbarRef: any;
  let msg: string;

  export const show = (_msg) => {
    msg = _msg;
    snackbarRef.classList.add('show-snackbar');
    setTimeout(() => {
      snackbarRef.classList.remove('show-snackbar');
    }, App.SNACKBAR_TIMEOUT);
  };

  export const showSaveSuccess = (extraMsg: string = '') => {
    show(T('SYS.MSG.SAVE_SUCCESS') + (StringUtil.isEmpty(extraMsg) ? '' : '. ' + extraMsg));
  };

  export const showDeleteSuccess = (extraMsg: string = '') => {
    show(T('SYS.MSG.DELETE_SUCCESS') + (StringUtil.isEmpty(extraMsg) ? '' : '. ' + extraMsg));
  };

  export const showUpdateSuccess = (extraMsg: string = '') => {
    show(T('SYS.MSG.UPDATE_SUCCESS') + (StringUtil.isEmpty(extraMsg) ? '' : '. ' + extraMsg));
  };

  export const showUnknownError = (extraMsg: string = '') => {
    show(T('SYS.MSG.UNKNOWN_ERROR') + (StringUtil.isEmpty(extraMsg) ? '' : '. ' + extraMsg));
  };

  export const showTrashEmpty = (extraMsg: string = '') => {
    show(T('SYS.MSG.TRASH_EMPTY') + (StringUtil.isEmpty(extraMsg) ? '' : '. ' + extraMsg));
  };

  export const showTrashRestoreSuccess = (extraMsg: string = '') => {
    show(T('SYS.MSG.TRASH_RESTORE_SUCCESS') + (StringUtil.isEmpty(extraMsg) ? '' : '. ' + extraMsg));
  };

  export const showNoDataChange = () => {
    show(T('SYS.MSG.NO_DATA_CHANGE'));
  };
</script>

<style lang="scss">

</style>

<div class="snackbar" bind:this={snackbarRef}>{msg}</div>

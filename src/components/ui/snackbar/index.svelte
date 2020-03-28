<script lang="ts">
  import { StringUtil } from '@/assets/js/string-util';
  import { T } from '@/assets/js/locale/locale';
  import { App } from '@/assets/js/constants';

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
</script>

<style lang="scss">

</style>

<div class="snackbar" bind:this={snackbarRef}>{msg}</div>

<script lang="ts">
  import { T } from '@/lib/js/locale/locale';
  import { ModalType } from '@/components/ui/modal/types';

  import ConfirmModal from '@/components/ui/modal/base';
  import ConfirmDeleteModal from '@/components/ui/modal/base';
  import ConfirmPasswordModal from '@/components/ui/modal/base';
  import ConfirmConflictDataModal from '@/components/modal/conflict-data-confirm';
  import ConfigModal from '@/components/modal/view-config';
  import TrashRestoreModal from '@/components/modal/trash-restore';
  import Snackbar from '@/components/ui/snackbar';
  import { ViewStore } from '@/store/view';

  // Props
  export let view: ViewStore;
  export let menuPath: string;

  // external
  let _confirmModalRef: any = undefined;
  let _confirmDeleteModalRef: any = undefined;
  let _confirmPasswordModalRef: any = undefined;
  let _snackbarRef: any = undefined;
  let _configModalRef: any = undefined;
  let _trashRestoreModalRef: any = undefined;
  let _confirmConflictDataModalRef: any = undefined;

  export const confirmModalRef = () => {
    return _confirmModalRef;
  };

  export const confirmDeleteModalRef = () => {
    return _confirmDeleteModalRef;
  };

  export const confirmPasswordModalRef = () => {
    return _confirmPasswordModalRef;
  };

  export const snackbarRef = () => {
    return _snackbarRef;
  };

  export const configModalRef = () => {
    return _configModalRef;
  };

  export const trashRestoreModalRef = () => {
    return _trashRestoreModalRef;
  };

  export const confirmConflictDataModalRef = () => {
    return _confirmConflictDataModalRef;
  };
</script>

<!--Invisible Element-->
<Snackbar bind:this={_snackbarRef} />
<ConfirmConflictDataModal
  {menuPath}
  id={'conflictData' + view.getViewName() + 'Modal'}
  bind:this={_confirmConflictDataModalRef} />
<ConfirmModal modalType={ModalType.Confirm} {menuPath} bind:this={_confirmModalRef} />
<ConfirmDeleteModal
  id="mdConfirmDeleteModal"
  title={T('COMMON.LABEL.DELETE')}
  modalType={ModalType.Confirm}
  {menuPath}
  bind:this={_confirmDeleteModalRef} />
<ConfirmPasswordModal modalType={ModalType.ConfirmPassword} {menuPath} bind:this={_confirmPasswordModalRef} />
<ConfigModal
  {menuPath}
  subTitle={view.getViewTitle()}
  id={'configModal' + view.getViewName()}
  bind:this={_configModalRef}
  containerWidth="500px" />
<TrashRestoreModal
  columns={view.trashRestoreColumns}
  {menuPath}
  subTitle={view.getViewTitle()}
  id={'trashRestoreModal' + view.getViewName()}
  bind:this={_trashRestoreModalRef}
  containerWidth="600px" />
<!--//Invisible Element-->

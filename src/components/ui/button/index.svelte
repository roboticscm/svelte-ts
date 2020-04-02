<script lang="ts">
  import { T } from '@/assets/js/locale/locale';
  import { StringUtil } from '@/assets/js/string-util';
  import { ButtonType, ButtonId } from './types';
  import { genUUID } from '@/assets/js/util';

  export let id: string = undefined;
  export let type = 'button';
  export let title = '';
  export let btnType = ButtonType.Custom;
  export let icon = '';
  export let className = '';
  export let disabled = false;
  export let running = false;
  export let action: any = undefined;

  let btnRef: any;
  export const getTarget = () => {
    return btnRef;
  };

  const preset = (_id: string, _title: string, _icon: string, _className: string) => {
    if (StringUtil.isEmpty(id) && !StringUtil.isEmpty(_id)) {
      id = _id;
    }
    if (StringUtil.isEmpty(title) && !StringUtil.isEmpty(_title)) {
      title = T(`COMMON.BUTTON.${_title}`);
    }
    if (StringUtil.isEmpty(icon) && !StringUtil.isEmpty(_icon)) {
      icon = _icon;
    }

    if (StringUtil.isEmpty(className) && !StringUtil.isEmpty(_className)) {
      className = _className;
    }
  };

  // @ts-ignore
  $: {
    switch (+btnType) {
      case ButtonType.AddNew:
        preset(ButtonId.AddNew, 'ADD_NEW', '<i class="fa fa-plus"></i>', 'btn-info');
        break;
      case ButtonType.Save:
        preset(ButtonId.Save, 'SAVE', '<i class="fa fa-save"></i>', 'btn-primary');
        break;
      case ButtonType.Delete:
        preset(ButtonId.Delete, 'DELETE', '<i class="fa fa-trash-alt"></i>', 'btn-danger');
        break;
      case ButtonType.Edit:
        preset(ButtonId.Edit, 'EDIT', '<i class="fa fa-edit"></i>', 'btn-success');
        break;
      case ButtonType.Update:
        preset(ButtonId.Update, 'UPDATE', '<i class="fa fa-save"></i>', 'btn-primary');
        break;
      case ButtonType.Config:
        preset(ButtonId.Config, 'CONFIG', '<i class="fa fa-cog"></i>', 'btn-normal');
        break;
      case ButtonType.TrashRestore:
        preset(ButtonId.TrashRestore, 'TRASH_RESTORE', '<i class="fa fa-trash-restore-alt"></i>', 'btn-success');
        break;
      case ButtonType.CloseModal:
        preset(undefined, undefined, '<i class="fa fa-times"></i>', 'btn-small-normal');
        break;
      case ButtonType.OkModal:
        preset(undefined, 'OK', '<i class="fa fa-check"></i>', 'btn-success');
        break;
      case ButtonType.CancelModal:
        preset(undefined, 'CANCEL', '<i class="fa fa-times"></i>', 'btn-danger');
        break;
      default:
    }
  }

  const useAction = (component, param) => {
    if (action) {
      action.register(component, param);
    }
  };
</script>

<button use:useAction bind:this={btnRef} {id} {type} class={className} {disabled} on:click>
  {#if running}
    <i class="fa fa-spinner fa-spin" />
  {:else}
    {@html icon}
  {/if}
  {title}
</button>

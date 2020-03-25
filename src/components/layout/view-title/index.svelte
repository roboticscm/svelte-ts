<script lang="ts">
  import { menuStore } from '@/store/menu';
  import { App } from '@/assets/js/constants';
  import { appStore } from '@/store/app';
  import { RoleMenu } from '@/modules/sys/menu/model';
  import { ViewStore } from '@/store/view';

  export let view: ViewStore;

  const viewTitle = view.getViewTitle();
  const selectedMenu = view.getMenu();

  document.title = App.NAME + ' - ' + viewTitle;
</script>

<div class="view-title">
  {#if selectedMenu}
    {#if !selectedMenu.useFontIcon && selectedMenu.iconData}
      <img src={selectedMenu.iconData} alt={selectedMenu.menuName} />
    {:else if selectedMenu.fontIcon}
      {@html selectedMenu.fontIcon}
    {:else}
      {@html App.DEFAULT_ICON}
    {/if}
  {/if}
  {viewTitle}
</div>

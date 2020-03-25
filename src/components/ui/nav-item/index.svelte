<script lang="ts">
  import { T } from '@/assets/js/locale/locale';
  import { settingsStore } from '@/store/settings';

  export let router: any;
  export let link: string;
  export let active: string;
  export let useFontIcon = false;
  export let fontIcon: string;
  export let iconData: string;
  export let menuName: string;
  export let path: string;

  // @ts-ignore
  $: name = T(`COMMON.MENU.${menuName}`);
  // @ts-ignore
  $: href = `/${path}`;

  const saveSettings = (menuPath: string) => {
    settingsStore.saveSettings({
      menuPath: 'system',
      controlId: 'mainNavBarId',
      keys: ['lastMenuPath'],
      values: [menuPath.startsWith('/') ? menuPath.slice(1) : menuPath],
    });
  };
</script>

<a {href} use:link={router} use:active={router} on:click={() => saveSettings(path)}>
  {#if !useFontIcon && iconData}
    <img src={iconData} alt={name} />
  {:else}
    <span>
      {@html fontIcon || '<i class="fa fa-bars"></i>'}
    </span>
  {/if}
  {name}
</a>

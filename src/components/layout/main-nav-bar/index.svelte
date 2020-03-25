<script lang="ts">
  import { menuStore, historyMenuStore } from '@/store/menu';
  import { appStore } from '@/store/app';
  import { Debug } from '@/assets/js/debug';
  import RouterLink from '@/components/ui/router-link/index.svelte';
  import { settingsStore } from '@/store/settings';
  import Page from 'page';

  const { dataList$ } = menuStore;
  const { navBarConfig$ } = appStore;

  let routerLink: any;
  let newPage = Page.create();

  const showPopup = () => {
    const ele: any = document.querySelector('#moreNavBarDropdown');
    ele.classList.add('show-dropdown');
  };

  const hidePopup = () => {
    const ele: any = document.querySelector('#moreNavBarDropdown');
    ele.classList.remove('show-dropdown');
  };

  const onNavigate = (event: any) => {
    hidePopup();
    saveSettings(event.detail);
    saveHistorySettings(event.detail);
  };

  const saveSettings = (menuPath: string) => {
    settingsStore.saveSettings({
      menuPath: 'system',
      controlId: 'mainNavBarId',
      keys: ['lastMenuPath'],
      values: [menuPath.startsWith('/') ? menuPath.slice(1) : menuPath],
    });
  };

  const saveHistorySettings = (menuPath: string) => {
    historyMenuStore
      .saveOrUpdate({
        menuPath: menuPath.startsWith('/') ? menuPath.slice(1) : menuPath,
        departmentId: appStore.org.departmentId,
      })
      .then(async (_) => {
        menuStore.sysGetRoledMenuListByUserIdAndDepId(appStore.org.departmentId);
      })
      .catch((error) => Debug.errorSection('Main Nav Bar - onItemClick', error));
  };
</script>

<style lang="scss">
  @import '../sass/sass/helpers/variables.scss';
  .more-dropdown-container {
    padding-left: $large-padding;
    padding-right: $large-padding;
    &:hover {
      background: var(--bg-secondary);
      outline: $default-border;
    }
  }

  .dropdown-context-text {
    line-height: var(--large-icon-size);
    font-size: 0.8rem;
  }
</style>

<div class="nav">
  {#each $dataList$.slice(0, $navBarConfig$.mainNavBarViewCount) as row}
    <RouterLink
      bind:this={routerLink}
      menuName={row.menuName}
      iconData={row.iconData}
      fontIcon={row.fontIcon}
      useFontIcon={row.useFontIcon}
      on:navigate={onNavigate}
      __path={'/' + row.path.replace('/', '--')}
      activeClass="active" />
  {/each}

  {#if $dataList$.length > $navBarConfig$.mainNavBarViewCount}
    <div class="more-dropdown-container" on:mouseover|stopPropagation={showPopup} on:mouseout={hidePopup}>
      <div>
        <i class="nav-bar-item__icon fa fa-angle-double-down" />
      </div>
      <div>...</div>
      <div id="moreNavBarDropdown" class="dropdown-content">
        {#each $dataList$.slice($navBarConfig$.mainNavBarViewCount, $navBarConfig$.mainNavBarViewCount + $navBarConfig$.historyNavBarViewCount) as row}
          <RouterLink
            bind:this={routerLink}
            menuName={row.menuName}
            iconData={row.iconData}
            fontIcon={row.fontIcon}
            useFontIcon={row.useFontIcon}
            on:navigate={onNavigate}
            __path={'/' + row.path.replace('/', '--')}
            activeClass="active" />
        {/each}
      </div>
    </div>
  {/if}
</div>

<script lang="ts">
  import { appStore } from '@/store/app';
  import { menuStore } from '@/store/menu';
  import { onMount, setContext } from 'svelte';
  import MainLayout from '@/components/layout/main-layout/index.svelte';
  import MainNavBar from '@/components/layout/main-nav-bar/index.svelte';
  import BranchDropdown from '@/components/layout/branch-dropdown/index.svelte';
  import ModulesDropdown from '@/components/layout/modules-dropdown/index.svelte';
  import UserProfiles from '@/components/layout/user-profiles/index.svelte';
  import HistoryNavBar from '@/components/layout/history-nav-bar/index.svelte';
  import SearchBar from '@/components/ui/input/search-bar/index.svelte';
  import { T } from '@/assets/js/locale/locale';
  import RouterView from '@/components/ui/router-view/index.svelte';
  import { skip, take } from 'rxjs/operators';
  let routerView: any;

  onMount(() => {
    if (routerView) {
      menuStore.dataList$.pipe(skip(1), take(1)).subscribe((_) => {
        routerView.show(appStore.org.menuPath);
      });
    }
  });

  const onSearch = (event: any) => {};
  const onRealtimeSearch = (event: any) => {};
</script>

<MainLayout>
  <nav slot="header">
    <div class="header-left">
      <BranchDropdown />
      <MainNavBar />
    </div>

    <div class="header-center w-100">
      <SearchBar
        on:search={onSearch}
        on:realtimeSearch={onRealtimeSearch}
        placeholder={T('SYS.MSG.WHAT_ARE_YOU_THINKING_ABOUT') + '?'} />
    </div>

    <div class="header-right">
      <!--      <HistoryNavBar />-->
      <div class="seperator" />
      <ModulesDropdown />
      <UserProfiles />
    </div>
  </nav>

  <div slot="default" style="height: 100%;">
    <RouterView bind:this={routerView} hashbang={false} />
  </div>
</MainLayout>

<script lang="ts">
  import { appStore } from '@/store/app';
  import { menuStore } from '@/store/menu';
  import { onMount, setContext } from 'svelte';
  import MainLayout from '@/components/layout/main-layout';
  import MainNavBar from '@/components/layout/main-nav-bar';
  import BranchDropdown from '@/components/layout/branch-dropdown';
  import ModulesDropdown from '@/components/layout/modules-dropdown';
  import UserProfiles from '@/components/layout/user-profiles';
  import HistoryNavBar from '@/components/layout/history-nav-bar';
  import SearchBar from '@/components/ui/input/search-bar';
  import { T } from '@/lib/js/locale/locale';
  import RouterView from '@/components/ui/router-view';
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
  <nav slot="header" class="layout-header">
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
      <ModulesDropdown id="moduleId" />
      <UserProfiles />
    </div>
  </nav>

  <div slot="default" style="height: 100%;">
    <RouterView bind:this={routerView} hashbang={false} />
  </div>
</MainLayout>

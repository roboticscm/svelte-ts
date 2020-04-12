<script lang="ts">
  import { scale } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { take } from 'rxjs/operators';

  import { App } from '@/assets/js/constants';
  import { ViewStore } from '@/store/view';

  import TwoColumnView from '@/components/layout/two-column-view';
  import WorkList from './work-list/index.svelte';
  import MainContent from './content/index.svelte';
  import ViewTitle from '@/components/layout/view-title';
  import ProgressBar from '@/components/ui/progress-bar';

  // Props
  export let showTitle = true;
  export let menuPath: string;
  export let fullControl: boolean;
  export let roleControls: [];
  export let callFrom = 'Self';
  export let showWorkList = true;

  // Init view
  const view = new ViewStore(menuPath);
  view.tableName = 'language';
  view.columns = ['id', 'name', 'locale', 'sort'];
  view.fullControl = fullControl;
  view.roleControls = roleControls;
  view.loading$.next(true);

  // ================= SUBSCRIPTION ========================
  const subscription = () => {
    view.completeLoading$.pipe(take(1)).subscribe((_) => {
      view.loading$.next(false);
    });
  };
  // ================= //SUBSCRIPTION ========================

  // ================= KOOK ========================
  onMount(() => {
    subscription();
  });

  export const getViewTitle = () => {
    return view.getViewTitle();
  };

  export const getMenuInfo$ = () => {
    return view.menuInfo$;
  };
  // ================= //KOOK ========================
</script>

<style lang="scss">

</style>

<ProgressBar loading$={view.loading$} />

{#if showTitle}
  <ViewTitle {view} />
{/if}
<TwoColumnView minLeftPane={!showWorkList} id={'mainLayout' + view.getViewName()} {showTitle} {menuPath}>
  <div style="height: 100%" slot="viewLeft">
    <WorkList {view} {menuPath} {callFrom} on:callback />
  </div>

  <div style="height: 100%" slot="default">
    <MainContent {view} {menuPath} />
  </div>
</TwoColumnView>

<script lang="ts">
  import { scale } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { take } from 'rxjs/operators';

  import { App } from '@/assets/js/constants';
  import { ViewStore } from '@/store/view';

  import TwoColumnView from '@/components/layout/two-column-view';
  import WorkList from './work-list/index.svelte';
  import MainContent from './content/index.svelte';
  import ViewTitle from '@/components/layout/view-title/index.svelte';
  import ProgressBar from '@/components/ui/progress-bar/index.svelte';

  export let showTitle = true;
  export let menuPath: string;
  export let fullControl: boolean;
  export let roleControls: [];

  let transition = App.USE_ANIMATION ? scale : () => {};
  const view = new ViewStore(menuPath);
  view.tableName = 'menu';
  view.columns = ['id', 'name', 'path', 'sort'];
  view.fullControl = fullControl;
  view.roleControls = roleControls;
  view.loading$.next(true);

  const subscription = () => {
    view.completeLoading$.pipe(take(1)).subscribe((_) => {
      view.loading$.next(false);
    });
  };

  onMount(() => {
    subscription();
  });
</script>

<style lang="scss">

</style>

<ProgressBar loading$={view.loading$} />

{#if showTitle}
  <ViewTitle {view} />
{/if}
<TwoColumnView id={'mainLayout' + view.getViewName()} {showTitle} {menuPath}>
  <div transition:transition style="height: 100%;" slot="viewLeft">
    <WorkList {view} {menuPath} />
  </div>
  <div transition:transition style="height: 100%;" slot="default">
    <MainContent {view} {menuPath} />
  </div>
</TwoColumnView>

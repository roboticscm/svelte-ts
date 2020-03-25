<script lang="ts">
  import TwoColumnView from '@/components/layout/two-column-view';
  import WorkList from './work-list/index.svelte';
  import MainContent from './content/index.svelte';
  import { scale } from 'svelte/transition';
  import ViewTitle from '@/components/layout/view-title/index.svelte';
  import { App } from '@/assets/js/constants';
  import { ViewStore } from '@/store/view';
  import { onMount } from 'svelte';
  import ProgressBar from '@/components/ui/progress-bar/index.svelte';
  import { take } from 'rxjs/operators';

  export let showTitle = true;
  export let menuPath: string;

  let transition = App.USE_ANIMATION ? scale : () => {};
  const view = new ViewStore(menuPath);
  view.tableName = 'language';
  view.columns = ['name', 'locale'];
  view.loading = true;

  const subscribe = () => {
    view.completeLoading$.pipe(take(1)).subscribe((_) => {
      view.loading = false;
    });
  };

  onMount(() => {
    subscribe();
  });
</script>

<style lang="scss">

</style>

<ProgressBar loading={view.loading} />

{#if showTitle}
  <ViewTitle {view} />
{/if}
<TwoColumnView id="sysLanguage" {showTitle}>
  <div transition:transition class="template-wrapper" slot="viewLeft">
    <WorkList {view} />
  </div>
  <div transition:transition class="template-wrapper" slot="viewContent">
    <MainContent {view} />
  </div>
</TwoColumnView>

<script lang="ts">
  import TwoColumnView from '@/components/layout/two-column-view';
  import WorkList from './work-list/index.svelte';
  import MainContent from './content/index.svelte';
  import { scale } from 'svelte/transition';
  import ViewTitle from '@/components/layout/view-title/index.svelte';
  import {App} from '@/assets/js/constants';
  import {ViewStore} from '@/store/view';
  import {onMount} from 'svelte';
  import ProgressBar from '@/components/ui/progress-bar/index.svelte';
  import {take} from 'rxjs/operators';
  import {pipe} from 'rxjs';


  export let showTitle = true;
  export let menuPath: string;

  let transition = App.USE_ANIMATION ? scale : ()=>{};
  const view = new ViewStore(menuPath);
  view.tableName='language';
  view.columns = ['id', 'name', 'locale'];

  const init = () => {
    view.loading = true;
  }

  const subscribe = () => {
    view.completeLoading$.pipe(take(1)).subscribe((_) => {
      view.loading = false;
    })
  }

  onMount(() => {
    init();
    subscribe();
  });
</script>

<style lang="scss">
</style>

<ProgressBar loading={view.loading}></ProgressBar>

{#if showTitle}
  <ViewTitle view={view}/>
{/if}
<TwoColumnView id="sysLanguage" showTitle={showTitle}>
  <div transition:transition class="template-wrapper" slot="viewLeft">
    <WorkList view={view} />
  </div>
  <div transition:transition class="template-wrapper" slot="viewContent">
    <MainContent view={view} />
  </div>
</TwoColumnView>

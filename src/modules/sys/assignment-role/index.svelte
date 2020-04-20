<script lang="ts">
  import { onMount } from 'svelte';
  import { take } from 'rxjs/operators';

  import { App } from '@/lib/js/constants';
  import { ViewStore } from '@/store/view';

  import TwoColumnView from '@/components/layout/two-column-view';
  import WorkList from './work-list/index.svelte';
  import MainContent from './content/index.svelte';
  import ViewTitle from '@/components/layout/view-title';
  import ProgressBar from '@/components/ui/progress-bar';
  import { Store } from './store';

  export let showTitle = true;
  export let menuPath: string;
  export let fullControl: boolean;
  export let roleControls: [];

  const view = new ViewStore(menuPath);
  const store = new Store(view);

  view.tableName = 'assignment_role';
  view.columns = ['id'];
  view.fullControl = fullControl;
  view.roleControls = roleControls;
  view.loading$.next(true);
  // view.loadTableMetaData();

  const subscription = () => {
    store.completeLoading$.subscribe((_) => {
      view.loading$.next(false);
    });
  };

  onMount(() => {
    store.loadOrgTree();
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
  <div style="height: 100%;" slot="viewLeft">
    <WorkList {view} {store} {menuPath} />
  </div>
  <div style="height: 100%;" slot="default">
    <MainContent {view} {store} {menuPath} />
  </div>
</TwoColumnView>

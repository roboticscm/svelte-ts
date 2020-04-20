<script lang="ts">
  import { onMount } from 'svelte';
  import { take } from 'rxjs/operators';

  import { App } from '@/lib/js/constants';
  import { ViewStore } from '@/store/view';

  import ThreeColumnView from '@/components/layout/three-column-view';
  import WorkList from './work-list/index.svelte';
  import MainContent from './content/index.svelte';
  import Right from './right/index.svelte';
  import ViewTitle from '@/components/layout/view-title';
  import ProgressBar from '@/components/ui/progress-bar';
  import { Store } from './store';

  export let showTitle = true;
  export let menuPath: string;
  export let fullControl: boolean;
  export let roleControls: [];

  const view = new ViewStore(menuPath);
  const store = new Store(view);

  view.tableName = 'role-detail';
  view.fullControl = fullControl;
  view.roleControls = roleControls;
  view.loading$.next(true);

  const subscription = () => {
    store.completeLoading$.pipe(take(1)).subscribe((_) => {
      view.loading$.next(false);
    });
  };

  onMount(() => {
    subscription();
  });

  const onDragEndSplitter = (event) => {
    store.dragEndSplitter$.next(event);
  };
</script>

<style lang="scss">

</style>

<ProgressBar loading$={view.loading$} />

{#if showTitle}
  <ViewTitle {view} />
{/if}
<ThreeColumnView on:dragEnd={onDragEndSplitter} id={'mainLayout' + view.getViewName()} {showTitle} {menuPath}>
  <div style="height: 100%;" slot="viewLeft">
    <WorkList {view} {store} />
  </div>
  <div style="height: 100%;" slot="default">
    <MainContent {view} {store} {menuPath} />
  </div>
  <div style="height: 100%;" slot="viewRight">
    <Right {view} {store} />
  </div>
</ThreeColumnView>

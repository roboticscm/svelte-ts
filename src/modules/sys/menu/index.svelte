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
  import { Store } from './store';

  export let showTitle = true;
  export let menuPath: string;
  export let fullControl: boolean;
  export let roleControls: [];

  let transition = App.USE_ANIMATION ? scale : () => {};
  const view = new ViewStore(menuPath);
  const store = new Store(view);

  view.tableName = 'menu';
  view.columns = ['id', 'name', 'path', 'sort'];
  view.fullControl = fullControl;
  view.roleControls = roleControls;
  view.loading$.next(true);

  const subscription = () => {
    store.completeLoading$.pipe(take(1)).subscribe((_) => {
      view.loading$.next(false);
    });
  };

  onMount(() => {
    store
      .loadAvailableDep(null)
      .pipe(take(1))
      .subscribe((res) => {
        store.availableDep$.next(res.data);
      });
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

<script lang="ts">
  import { scale } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { take } from 'rxjs/operators';

  import { App } from '@/lib/js/constants';
  import { ViewStore } from '@/store/view';
  import MainContent from './content/index.svelte';
  import ViewTitle from '@/components/layout/view-title';
  import ProgressBar from '@/components/ui/progress-bar';
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
  // view.loading$.next(true);
</script>

<style lang="scss">

</style>

<ProgressBar loading$={view.loading$} />

{#if showTitle}
  <ViewTitle {view} />
{/if}

<main class="view-container">
  <MainContent {view} {menuPath} />
</main>

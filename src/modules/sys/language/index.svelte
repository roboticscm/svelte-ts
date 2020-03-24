<script lang="ts">
  import TwoColumnView from '@/components/layout/two-column-view';
  import WorkList from './work-list/index.svelte';
  import MainContent from './content/index.svelte';
  import { scale } from 'svelte/transition';
  import ViewTitle from '@/components/layout/view-title/index.svelte';
  import {App} from '@/assets/js/constants';
  import {ViewStore} from '@/store/view';

  export let showTitle = true;
  export let menuPath: string;

  let transition = App.USE_ANIMATION ? scale : ()=>{};
  const view = new ViewStore(menuPath);

  console.log('aaaaaa')
</script>

<style lang="scss">
  @import '../sass/sass/helpers/variables.scss';
</style>

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

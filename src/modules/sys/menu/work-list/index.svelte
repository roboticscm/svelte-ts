<script lang="ts">
  import { ViewStore } from '@/store/view';

  import SimpleWorkList from '@/components/work-list/simple-work-list/index.svelte';

  // Props
  export let view: ViewStore;
  export let menuPath: string;

  // Other vars
  const workListContainerId = `workList${view.getViewName()}Container`;
</script>

<div id={workListContainerId} class="view-left-main">
  <SimpleWorkList {view} {workListContainerId} {menuPath} />
</div>
<div class="view-left-bottom" />

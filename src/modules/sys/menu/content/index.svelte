<script lang="ts">
  import { ViewStore } from '@/store/view';

  export let menuPath: string;
  export let view: ViewStore;

  console.log(menuPath);
  console.log(view);
</script>

<div class="view-content-main">Content</div>

<div class="view-content-bottom">Controller</div>

<script lang="ts">
  import NavItem from '@/components/ui/nav-item/index.svelte';
  import { menuStore } from '@/store/menu';

  const { dataList$ } = menuStore;
</script>

<div class="nav">
  {#each $dataList$ as row (row.id)}
    <NavItem {...row} } />
  {/each}
</div>

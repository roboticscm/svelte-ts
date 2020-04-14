<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    window['$']('#cc').combotree({
      onChange: () => {
        window['$']('#cc').combotree('setText', 'abc');
      },
    });
    window['$']('#cc').combotree('loadData', [{ id: 'CAM', text: 'Campuchia', children: null }]);
  });

  const onClick = () => {};
</script>

<input id="cc" value="01" />

<button on:click={onClick} />

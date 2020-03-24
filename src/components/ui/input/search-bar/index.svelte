<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let placeholder = '';
  let textfield;

  const dispatch = createEventDispatcher();

  const onSearch = () => {
    dispatch('search', textfield.value);
    textfield.focus();
  };

  const onRealtimeSearch = (event) => {
    if (event.code === 'Enter') {
      onSearch();
    } else if (event.code.startsWith('Key')) {
      dispatch('realtimeSearch', textfield.value);
    }
  };
</script>

<div class="search-bar-wrapper">
  <input class="form-control" on:keyup={onRealtimeSearch} bind:this={textfield} {placeholder} />
  <i class="fa fa-search" on:click={onSearch} />
</div>

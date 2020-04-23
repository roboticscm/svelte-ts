<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let placeholder = '';
  export let type = 'password';
  let inputRef;

  const dispatch = createEventDispatcher();

  const passwordClass = ['suntech-circle', 'suntech-asterisk', 'suntech-x', 'suntech-run', 'suntech-heart'];

  const onSearch = () => {
    dispatch('search', inputRef.value);
    inputRef.focus();
  };

  const onRealtimeSearch = (event) => {
    if (event.code === 'Enter') {
      onSearch();
    } else if (event.code.startsWith('Key')) {
      dispatch('realtimeSearch', inputRef.value);
    }
  };

  const onFocus = (event) => {
    inputRef.removeAttribute('readonly');
  };
</script>

<style>
  input[type='password'] {
    font-family: 'suntech-run';
    font-style: normal;
    font-weight: normal;
    speak: none;

    /* For safety - reset parent styles, that can break glyph codes*/
    font-variant: normal;
    text-transform: none;

    /* Font smoothing. That was taken from TWBS */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* Uncomment for 3D effect */
    /* text-shadow: 1px 1px 1px rgba(127, 127, 127, 0.3); */

    /* add spacing to better separate each image */
    letter-spacing: 2px;
  }

  .password-suntech-circle {
    font-family: 'suntech-circle';
  }

  .password-suntech-asterisk {
    font-family: 'suntech-asterisk';
  }

  .password-suntech-x {
    font-family: 'suntech-x';
  }

  .password-suntech-run {
    font-family: 'suntech-run';
  }

  .password-suntech-heart {
    font-family: 'suntech-heart';
  }
</style>

<div class="search-bar-wrapper">
  <input
    class="form-control"
    {type}
    on:focus={onFocus}
    on:keyup={onRealtimeSearch}
    bind:this={inputRef}
    {placeholder}
    autocomplete="off"
    readonly />
  <i class="fa fa-search" on:click={onSearch} />
</div>

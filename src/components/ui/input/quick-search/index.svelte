<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fromEvents } from '@/lib/js/rx';
  import { distinctUntilChanged, switchMap } from 'rxjs/operators';
  export let placeholder = '';
  export let action: any = undefined;

  let inputRef: any;

  const dispatch = createEventDispatcher();

  export const getTextSearch = () => {
    return inputRef.value;
  };

  const useAction = (component, param) => {
    if (action) {
      action.register(component, param);
    }
  };
</script>

<div class="quick-search-wrapper">
  <input use:useAction type="text" class="form-control" bind:this={inputRef} {placeholder} />
  <i class="fa fa-search" />
</div>

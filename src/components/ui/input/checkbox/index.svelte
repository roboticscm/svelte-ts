<script lang="ts">
  import { App } from '@/lib/js/constants';
  export let name: string;
  export let disabled = false;
  export let className = '';
  export let checked;

  let inputRef: any;
  export const focus = () => {
    if (inputRef) {
      inputRef.focus();
    }
  };
</script>

<input {name} type="checkbox" {disabled} class={className} bind:checked bind:this={inputRef} />

<script lang="ts">
  import { App } from '@/lib/js/constants';
  export let name: string;
  export let disabled = false;
  export let className = 'form-control';
  export let value;

  let inputRef: any;
  export const focus = () => {
    if (inputRef) {
      inputRef.focus();
    }
  };
</script>

<input {name} type="number" {disabled} class={className} bind:value bind:this={inputRef} />

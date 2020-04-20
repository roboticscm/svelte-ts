<script lang="ts">
  import { App } from '@/lib/js/constants';
  export let name: string;
  export let disabled = false;
  export let className = 'form-control';
  export let autocomplete = App.AUTO_COMPLETE;
  export let value;

  let inputRef: any;
  export const focus = () => {
    if (inputRef) {
      inputRef.focus();
    }
  };
</script>

<input {name} type="password" {disabled} class={className} bind:value {autocomplete} bind:this={inputRef} />

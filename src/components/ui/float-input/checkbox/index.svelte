<script lang="ts">
  export let name: string;
  export let text: string;
  export let disabled = false;
  export let className = '';
  export let checked = false;
  export let title = '';

  let inputRef: any;
  export const focus = () => {
    if (inputRef) {
      inputRef.focus();
    }
  };
</script>

<div class="floating-wrapper">
  <input
    {title}
    {name}
    type="checkbox"
    {disabled}
    class="{className} floating__input"
    bind:checked
    bind:this={inputRef} />
  <label>{text}</label>
</div>

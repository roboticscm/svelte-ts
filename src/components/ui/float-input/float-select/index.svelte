<script lang="ts">
  export let name: string;
  export let disabled = false;
  export let className = '';
  export let placeholder: string;
  export let checked: boolean = undefined;
  export let rightCheck: boolean = false;

  let inputRef: any;
  export const focus = () => {
    if (inputRef) {
      inputRef.focus();
    }
  };

  const onCheck = () => {
    inputRef && inputRef.focus();
  };
</script>

<div class="floating-wrapper">
  <select
    {name}
    {disabled}
    class="{checked !== undefined ? 'check' : ''}
    {rightCheck ? 'right' : ''}
    {className}"
    bind:this={inputRef} />
  <label class="floating__label" data-content={placeholder} />
  {#if checked !== undefined}
    <input class={rightCheck ? 'right' : ''} tabindex="-1" bind:checked type="checkbox" on:change={onCheck} />
  {/if}
  <i class="dropdown-icon fa fa-angle-down {rightCheck ? 'right' : ''}" />
</div>

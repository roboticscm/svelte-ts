<script lang="ts">
  import { App } from '@/lib/js/constants';
  export let name: string;
  export let disabled = false;
  export let className = '';
  export let autocomplete = App.AUTO_COMPLETE;
  export let value;
  export let placeholder: string;
  export let checked: boolean = undefined;
  export let rightCheck = false;
  export let title = '';
  export let checkTitle = '';

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
  <input
    {title}
    {name}
    type="search"
    {disabled}
    class="{checked !== undefined ? 'check' : ''}
    {rightCheck ? 'right' : ''}
    {className} floating__input"
    bind:value
    {autocomplete}
    bind:this={inputRef}
    {placeholder} />
  <label class="floating__label" data-content={placeholder} />
  {#if checked !== undefined}
    <input
      title={checkTitle}
      class={rightCheck ? 'right' : ''}
      tabindex="-1"
      bind:checked
      type="checkbox"
      on:change={onCheck} />
  {/if}
</div>

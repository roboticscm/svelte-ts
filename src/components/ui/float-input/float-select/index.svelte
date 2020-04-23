<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { T } from '@/lib/js/locale/locale';

  export let name: string;
  export let disabled = false;
  export let className = '';
  export let placeholder: string;
  export let checked: boolean = undefined;
  export let rightCheck: boolean = false;
  export let data: any[] = [];
  export let saveState = false;
  export let showAllItem = false;
  export let value: any = undefined;

  const dispatch = createEventDispatcher();

  let _selectedId = value;
  let inputRef: any;
  export const focus = () => {
    if (inputRef) {
      inputRef.focus();
    }
  };

  const onCheck = () => {
    inputRef && inputRef.focus();
  };

  const onChange = (event: any) => {
    // TODO Save state
    dispatch('change', event.target.value);
  };
</script>

<div class="floating-wrapper">
  <select
    on:change={onChange}
    bind:value
    {name}
    {disabled}
    class="{checked !== undefined ? 'check' : ''}
    {rightCheck ? 'right' : ''}
    {className}"
    bind:this={inputRef}>
    <option disabled selected={!saveState && _selectedId === undefined} value={-1}>
      {T('COMMON.MSG.PLEASE_SELECT_ONE')}
    </option>

    {#if showAllItem}
      <option value={undefined}>{'--- ' + T('COMMON.LABEL.ALL') + ' ---'}</option>
    {/if}

    {#each data as item}
      <option value={item.id} selected={item.id == _selectedId}>{item.name}</option>
    {/each}
  </select>
  <label class="floating__label" data-content={placeholder} />
  {#if checked !== undefined}
    <input class={rightCheck ? 'right' : ''} tabindex="-1" bind:checked type="checkbox" on:change={onCheck} />
  {/if}
  <i class="dropdown-icon fa fa-angle-down {rightCheck ? 'right' : ''}" />
</div>

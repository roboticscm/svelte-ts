<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { App } from '@/lib/js/constants';
  import { T } from '@/lib/js/locale/locale';
  import { SObject } from '../../../../lib/js/sobject';

  export let name: string;
  export let disabled = false;
  export let className = '';
  export let autocomplete = App.AUTO_COMPLETE;
  export let value;
  export let list: any[] = [];
  export let fullWidth = true;
  export let showAllItem = true;

  let inputRef: any;
  let dropdownContentRef: any;
  let selectedItem: any = {};
  let _list: any[];

  const dispatch = createEventDispatcher();

  // @ts-ignore
  $: if (list && list.length > 0) {
    _list = SObject.clone(list);
    _list.unshift({ id: '-1', name: 'ALL' });
    if (!selectedItem.id) {
      selectedItem.id = _list[0].id;
      selectedItem.name = _list[0].name;
    }
  } else {
    _list.unshift({ id: '-1', name: 'ALL' });
    selectedItem.id = undefined;
    selectedItem.name = '';
  }

  export const focus = () => {
    if (inputRef) {
      inputRef.focus();
    }
  };

  const showPopup = () => {
    const containerWidth = window['$']('.floating-filter-wrapper').width();
    if (fullWidth) {
      dropdownContentRef.style.width = `${containerWidth}px`;
    }
    dropdownContentRef.classList.add('show-dropdown');
  };

  const hidePopup = () => {
    dropdownContentRef.classList.remove('show-dropdown');
  };

  const onClickItem = (item: any) => {
    hidePopup();
    selectedItem = item;
    dispatch('itemChange', item.id);
  };
</script>

<style lang="scss">

</style>

<div class="floating-filter-wrapper">
  <input
    required
    {name}
    type="search"
    {disabled}
    class="floating-filter__input {className}"
    bind:value
    {autocomplete}
    bind:this={inputRef}
    placeholder={T('QTT.LABEL.' + selectedItem.name.toUpperCase().replace('#', '')) + ' ' + T('COMMON.LABEL.SEARCH')} />

  <label class="floating-filter__label" data-content={selectedItem.name} />
  <div class="floating-filter__select" on:mouseover|stopPropagation={showPopup} on:mouseout={hidePopup}>
    <span class="w-100">{selectedItem.name}</span>
    <i
      class="fa fa-angle-down"
      style="border-right: 1px solid rgba(0, 0, 0, 0.2); min-width: 15px; display: flex; flex-direction: column;
      justify-content: flex-end;" />
    <div bind:this={dropdownContentRef} class="{fullWidth ? '' : 'w-100'} filter-dropdown-content">
      {#each _list as item}
        <div
          on:click={() => onClickItem(item)}
          class="filter-dropdown-item {item.id.toString() === selectedItem.id.toString() ? 'filter-active-item' : ''}">
          {@html item.name}
        </div>
      {/each}
    </div>
  </div>
</div>

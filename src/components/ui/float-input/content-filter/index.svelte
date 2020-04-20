<script lang="ts">
  import {createEventDispatcher, onMount} from 'svelte';
  import { App } from '@/lib/js/constants';
  import {T} from '@/lib/js/locale/locale';
  import {SObject} from "@/lib/js/sobject";
  import SelectableTable from '@/components/ui/selectable-table';
  import {StringUtil} from "../../../../lib/js/string-util";

  export let name: string;
  export let disabled = false;
  export let className = '';
  export let autocomplete = App.AUTO_COMPLETE;
  export let value;
  export let list: any [] = [];
  export let fullWidth = true;
  export let showAllItem = true;
  export let menuPath: string;

  let inputRef: any;
  let dropdownContentRef: any;
  let selectedItem: any = {};
  let _list: any [];
  let markData: any [] = [];
  let tableRef: any;
  let dropdownFocused = false;
  let inputWrapperRef: any;
  let autoDropdownRef: any;

  const columns = [{
    name: 'id',
    type: 'hidden'
  },
    {
      name: 'name'
    }
  ];

  const dispatch = createEventDispatcher();

  // @ts-ignore
  $: if(list && list.length > 0) {
    _list = SObject.clone(list);
    _list.unshift({id: '-1', name: 'ALL'});
    if (!selectedItem.id) {
      selectedItem.id = _list[0].id;
      selectedItem.name = _list[0].name;
    }
  } else {
    _list.unshift({id: '-1', name: 'ALL'});
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
    if(fullWidth) {
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
  }

  const preSearch = (event) => {
    if (event.code === 'Escape') {
      hideAutoDropdown();
      return false;
    }

    if (!dropdownFocused && event.code === 'ArrowDown') {
      tableRef.focus();
      dropdownFocused = true;
      return false;
    } else if (event.code === 'ArrowDown') {
      return false;
    }

    if (event.code === 'Enter') {
      return false;
    }

    return true;
  };

  const onSearchInput = () => {

    hideAutoDropdown();
    if(inputRef.value.trim().length > 0) {
      dispatch('search', inputRef.value.trim());
    }
  }

  const onClickInput = () => {
    if(inputRef.value.trim().length > 0) {
      showAutoDropdown();
    }
  }

  const onKeyupInput = (event: any) => {
    if (!preSearch(event)) {
      return;
    }
    markData = _list.map((it: any) => {
      return {
        id: it.id,
        name: `<mark>${inputRef.value}</mark> in [${it.name}]`
      };
    })
    showAutoDropdown();
  }

  const selectItem = (data: any) => {
    if (data.length >= 0) {
      dispatch('itemChange', data[0].id);
      console.log(data[0]);
    }
  };

  const hideAutoDropdown = () => {
    dropdownFocused = false;
    autoDropdownRef.classList.remove('show-auto-dropdown');
  };

  const onTableClick = (event) => {
    selectItem(event.detail.data);
    hideAutoDropdown();
  };

  const onTableKeyup = (event: any) => {
    if (event.detail.event.code === 'Enter') {
      selectItem(event.detail.data);
      hideAutoDropdown();
    }
  };

  const showAutoDropdown = () => {
    autoDropdownRef.classList.add('show-auto-dropdown');
  };

  const hideOnLostFocus = () => {
    setTimeout(() => {
      if (document.activeElement !== inputRef) {
        if (StringUtil.isEmpty(inputRef.value)) {
          selectItem([
            {
              id: '',
              name: '',
            },
          ]);
        }
        hideAutoDropdown();
      }
    }, 300);
  };


  onMount(() => {
    inputWrapperRef && inputWrapperRef.addEventListener('focusout', hideOnLostFocus);
  });
</script>

<div class="floating-filter-wrapper" bind:this={inputWrapperRef}>
  <input
          on:keyup={onKeyupInput}
          on:click={onClickInput}
          on:search={onSearchInput}
          required
          {name}
          type="search"
          {disabled}
          class = "floating-filter__input {className}"
          bind:value
          {autocomplete}
          bind:this={inputRef}
          placeholder={T('QTT.LABEL.' + selectedItem.name.toUpperCase().replace("#", '')) + ' ' + T('COMMON.LABEL.SEARCH')} />

  <label class="floating-filter__label" data-content={selectedItem.name} />
  <div class="floating-filter__select" on:mouseover|stopPropagation={showPopup} on:mouseout={hidePopup}>
    <span class="w-100">{selectedItem.name}</span>
    <i class="fa fa-angle-down" style="border-right: 1px solid rgba(0, 0, 0, 0.2); min-width: 15px; display: flex; flex-direction: column; justify-content: flex-end;"> </i>
    <div bind:this={dropdownContentRef} class="{fullWidth ? '' : 'w-100'} filter-dropdown-content">
      {#each _list as item}
        <div on:click={() => onClickItem(item)} class="filter-dropdown-item {item.id.toString() === selectedItem.id.toString() ? 'filter-active-item' : ''}">
          {@html item.name}
        </div>
      {/each}
    </div>
  </div>

  <div bind:this={autoDropdownRef} style="height: 200px;" class="auto-dropdown">
    <SelectableTable
            on:click={onTableClick}
            on:keyup={onTableKeyup}
            bind:this={tableRef}
            data={markData}
            showRowNumber={false}
            {columns}
            {menuPath}
            showHeader={false} />
  </div>
</div>


<style lang="scss">

</style>
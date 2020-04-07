<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { T } from '@/assets/js/locale/locale';
  import { settingsStore } from '@/store/settings';
  import { Observable } from 'rxjs';

  export let id: string;
  export let data: any[];
  export let disabled = false;
  export let saveState = false;
  export let autoLoad = false;
  export let selectedId: string = undefined;
  export let showAllItem = false;
  export let menuPath: string;

  const dispatch = createEventDispatcher();

  let selectRef: any;
  let _selectedId = selectedId;

  const onChange = (event) => {
    _selectedId = event.target.value;
    settingsStore.saveUserSettings({
      menuPath,
      controlId: id,
      keys: ['lastSelected'],
      values: [_selectedId],
    });
    dispatch('change', _selectedId);
  };

  export const getSelectedId = () => {
    if (_selectedId) {
      return _selectedId;
    } else {
      return selectRef && selectRef.value;
    }
  };

  export const getSelectedName = () => {
    let selectedItem = getSelectedItem();
    if (selectedItem) {
      return selectedItem.name;
    } else {
      return null;
    }
  };

  export const getSelectedItem = () => {
    const selectedId = getSelectedId();
    const selectedItem = data.filter((item: any) => item.id == selectedId);
    if (selectedItem && selectedItem.length > 0) {
      return selectedItem[0];
    } else {
      return null;
    }
  };

  export const loadSettings = () => {
    return new Observable((observer) => {
      settingsStore
        .getUserSettings(id, menuPath)
        .then((res) => {
          if (res.length > 0) {
            if (res[0].key === 'lastSelected') {
              _selectedId = res[0].value;
            }
          }

          observer.next(res);
          observer.complete();
        })
        .catch((error) => observer.error(error));
    });
  };

  onMount(() => {
    if (autoLoad) {
      loadSettings();
    }
  });
</script>

<style lang="scss" scoped>

</style>

<select bind:this={selectRef} class="form-control-dropdown full-width" {id} on:change={onChange} {disabled}>
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

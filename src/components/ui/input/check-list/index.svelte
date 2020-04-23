<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { T } from '@/lib/js/locale/locale';
  import { settingsStore } from '@/store/settings';
  import { Observable } from 'rxjs';
  import { take } from 'rxjs/operators';
  import Button from '@/components/ui/button';
  import { ButtonType } from '@/components/ui/button/types';

  export let id: string;
  export let data: any[] = [];
  export let disabled = false;
  export let saveState = false;
  export let autoLoad = false;
  export let selectedId: string = undefined;
  export let menuPath: string;
  export let showButtons = true;

  const dispatch = createEventDispatcher();

  let selectRef: any;
  let _selectedId = selectedId;

  const onChange = (event) => {
    dispatch('change', getCheckedIds());
  };

  export const getCheckedIds = () => {
    const checkedItems = getCheckedItems();
    if (!checkedItems) {
      return [];
    }

    return checkedItems.map((it: any) => it.id);
  };

  export const getCheckedNames = () => {
    const checkedItems = getCheckedItems();
    if (!checkedItems) {
      return [];
    }

    return checkedItems.map((it: any) => it.name);
  };

  export const getCheckedItems = () => {
    const results: any[] = [];
    const checkList: any[] = selectRef.getElementsByTagName('input');
    for (const [index, item] of Array.from(checkList).entries()) {
      if (item.checked) {
        results.push(data[index]);
      }
    }

    return results;
  };

  onMount(() => {});

  const checkAll = (checked: boolean) => {
    const checkList: any[] = selectRef.getElementsByTagName('input');
    for (const [index, item] of Array.from(checkList).entries()) {
      if (checked === undefined) {
        item.checked = !item.checked;
      } else {
        item.checked = checked;
      }
      data[index].checked = item.checked;
    }
    dispatch('change', getCheckedIds());
  };
</script>

<style lang="scss" scoped>

</style>

<div>
  <slot />
</div>
{#if showButtons && data && data.length > 0}
  <div>
    <Button on:click={() => checkAll(true)} btnType={ButtonType.SelectAll} />
    <Button on:click={() => checkAll(false)} btnType={ButtonType.UnSelectAll} />
    <Button on:click={() => checkAll(undefined)} btnType={ButtonType.ToggleSelection} />
  </div>
{/if}
<ul style="padding: 0; list-style: none;" bind:this={selectRef} class="full-width" {id} on:change={onChange} {disabled}>
  {#each data as item}
    <li>
      <input type="checkbox" bind:checked={item.checked} />
      {item.name}
    </li>
  {/each}
</ul>

<script lang="ts">
import SelectableTable from '@/components/ui/selectable-table/index.svelte';
import {BehaviorSubject} from 'rxjs';
import {TableColumn} from '@/model/base';
import {ViewStore} from '@/store/view';

export let view: ViewStore;

let id = `workList${view.getViewName()}Table`;;

const columns$ = new BehaviorSubject<TableColumn[]>([
  {
    title: 'Col1',
    name: 'col1'
  },
  {
    title: 'Col2',
    name: 'col2'
  }
]);

const data$ = new BehaviorSubject<any[]>([
  {
    col1: '1',
    col2: '2'
  },
  {
    col1: '21',
    col2: '22'
  },
]);

</script>

<div id="workListContainer" class="view-left-main">
  <SelectableTable   {columns$} {data$} {id}></SelectableTable>
  <div style="margin-top: 1px;">Paging</div>
</div>
<div class="view-left-bottom" />

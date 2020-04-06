<script lang="ts">
  import Modal from '@/components/ui/modal/base/index.svelte';
  import { T } from '@/assets/js/locale/locale';

  export let id: string;
  export let subTitle: string;
  export let containerWidth: string;
  export let menuPath: string;
  export let columns: any[];

  let modalRef: any;
  let excelGridRef: any;
  let ExcelGridComponent: any;

  let height: string;
  let mouseUp: any;

  const createDynamicColumns = () => {
    const dynCols = [];
    columns.forEach((it) => {
      dynCols.push({
        type: 'text',
        title: T(`COMMON.LABEL.${it.toUpperCase()}`),
        name: it,
        width: 100,
        readOnly: true,
      });
    });
    return dynCols;
  };

  let data: any[];
  const fullColumns = [
    {
      type: 'hidden',
      name: 'id',
    },
    ...createDynamicColumns(),
    {
      type: 'text',
      title: T('COMMON.LABEL.DELETED_BY'),
      name: 'deletedBy',
      width: 160,
      readOnly: true,
    },
    {
      type: 'text',
      title: T('COMMON.LABEL.DELETED_DATE'),
      name: 'deletedDate',
      width: 80,
      readOnly: true,
    },
    {
      type: 'checkbox',
      title: T('COMMON.LABEL.RESTORE'),
      name: 'restore',
      width: 70,
    },
    {
      type: 'checkbox',
      title: T('COMMON.LABEL.FOREVER_DELETE'),
      name: 'foreverDelete',
      width: 70,
    },
  ];

  export const show = (_data: any[]) => {
    data = _data;
    const h = modalRef.getHeight().replace('px', '');
    height = `${h - 120}px`;
    return new Promise((resolve, reject) => {
      import('@/components/ui/excel-grid/index.svelte').then((res) => {
        ExcelGridComponent = res.default;
        resolve(modalRef.show());
      });
    });
  };

  const onResize = (event) => {
    containerWidth = event.detail.width;
  };

  const onMouseUp = () => {
    mouseUp = Date.now();
  };

  export const getData = () => {
    return excelGridRef.getData();
  };
</script>

<Modal
  defaultWidth={800}
  defaultHeight={400}
  on:containerResize={onResize}
  on:mouseUp={onMouseUp}
  {menuPath}
  contentClass="full-modal-content"
  fontIcon="<i class='fa fa-trash-restore-alt'></i>"
  title={T('COMMON.LABEL.TRASH_RESTORE') + ' - ' + subTitle}
  {id}
  bind:this={modalRef}>
  <svelte:component
    this={ExcelGridComponent}
    {mouseUp}
    {height}
    {menuPath}
    bind:this={excelGridRef}
    id={'grid' + id}
    columns={fullColumns}
    {data}
    {containerWidth}
    fullWidth={true}>
    <span slot="label" class="label">{T('COMMON.LABEL.CONTROL_LIST')}:</span>
  </svelte:component>
</Modal>

<script lang="ts">
  import { onMount, tick } from 'svelte';
  import Split from 'split-grid';
  import { applyLayout } from './helper';
  import { appStore } from '@/store/app';
  import { settingsStore } from '@/store/settings';

  onMount(async () => {
    Split({
      rowGutters: [
        {
          track: 1,
          element: document.querySelector('.layout-horizontal-gutter'),
        },
      ],
      onDrag: (direction: any, track: number, gridTemplateStyle: string) => {
        applyLayout();
      },
      onDragEnd: (direction: any, track: number) => {
        const gridEle: any = document.querySelector('.layout-container');
        const [headerHeight] = gridEle.style['grid-template-rows'].split(' ');
        settingsStore.saveSettings({
          menuPath: 'sys/main-layout',
          controlId: 'mainLayoutId',
          keys: ['lastHeaderHeight'],
          values: [headerHeight],
        });
      },
    });

    // apply main layout - header height
    const gridEle: any = document.querySelector('.layout-container');

    const unSub = appStore.theme$.subscribe((theme) => {
      if (theme) {
        gridEle.style['grid-template-rows'] = `${theme.headerHeight} 2px auto`;
      }
    });
    await tick();
    unSub.unsubscribe();

    applyLayout();
  });
</script>

<div class="layout-container">
  <div class="layout-header">
    <slot name="header">Header Section</slot>
  </div>
  <div class="layout-horizontal-gutter" />
  <div class="layout-content">
    <slot name="content">Content Section</slot>
  </div>
</div>

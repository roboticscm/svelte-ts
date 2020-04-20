<script lang="ts">
  import { onMount, tick } from 'svelte';
  import Split from 'split-grid';
  import { applyLayout } from './helper';
  import { appStore } from '@/store/app';
  import { settingsStore } from '@/store/settings';
  import {App} from '@/lib/js/constants';

  onMount(async () => {
    Split({
      rowSnapOffset: App.MIN_HEADER_HEIGHT,
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
        let [headerHeight] = gridEle.style['grid-template-rows'].split(' ');

        if (headerHeight && (+headerHeight.replace('px', '')) > App.MAX_HEADER_HEIGHT) {
          headerHeight = '100px';
          const gridEle: any = document.querySelector('.layout-container');
          gridEle.style['grid-template-rows'] = `${headerHeight} 2px auto`;
          applyLayout();

        }
        settingsStore.saveUserSettings({
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
  <div class="layout-header-wrapper">
    <slot name="header">Header Section</slot>
  </div>
  <div class="layout-horizontal-gutter" />
  <div class="layout-content">
    <slot>Content Section</slot>
  </div>
</div>

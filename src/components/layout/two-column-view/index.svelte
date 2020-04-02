<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Split from 'split-grid';
  import { applyLeftGutterState, leftCollapse } from './helper';
  import { GUTTER_WIDTH } from '@/assets/js/constants';
  import { settingsStore } from '@/store/settings';
  import { Settings } from '@/model/settings';

  export let showTitle: boolean = true;
  export let id: string = '';
  export let menuPath: string;

  let contentSplit: any;
  onMount(() => {
    setTimeout(() => {
      contentSplit = Split({
        columnGutters: [
          {
            track: 1,
            element: document.querySelector('.left-grid-vertical-gutter'),
          },
        ],
        onDragEnd: (direction: any, track: number) => {
          const gridEle: any = document.querySelector('.view-container-2-col');
          const [leftWidth] = gridEle.style['grid-template-columns'].split(' ');

          settingsStore.saveSettings(
            new Settings({
              menuPath: menuPath,
              controlId: `left${id}`,
              keys: ['lastLeftWidth'],
              values: [leftWidth],
            }),
          );
        },
      });

      const divElement = document.createElement('div');
      divElement.id = 'leftGutter';
      divElement.classList.add('left-gutter-more');

      divElement.addEventListener('click', () => {
        // leftGutterMore = leftCollapse(contentSplit, leftGutterMore, lastLeftContentWidth, delta);
        // saveSettingsSplitState(props.is, contentSplit.getSizes());
      });

      document.querySelector('.left-grid-vertical-gutter').appendChild(divElement);

      // loadSettings
      settingsStore.getUserSettings(`left${id}`, menuPath).then((res: any[]) => {
        const found = res.find((it) => it.key === 'lastLeftWidth');
        if (found) {
          const { value } = found;
          const containerEle: any = document.querySelector('.view-container-2-col');
          containerEle.style['grid-template-columns'] = `${value} ${GUTTER_WIDTH}px auto`;
        }
      });
    }, 500);
  });

  onDestroy(() => {
    if (contentSplit) {
      contentSplit.destroy();
    }
  });
</script>

<div class={showTitle ? 'view-container-2-col' : 'view-container-2-col-modal'}>
  <div class="view-left">
    <slot name="viewLeft" />
  </div>
  <div class="left-grid-vertical-gutter" />
  <div class="view-content">
    <slot />
  </div>
</div>

<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import Split from 'split-grid';
  import { GUTTER_WIDTH } from '@/lib/js/constants';
  import { settingsStore } from '@/store/settings';
  import { Settings } from '@/model/settings';

  export let showTitle: boolean = true;
  export let id: string = '';
  export let menuPath: string;
  export let minLeftPane = false;
  export let defaultLeftWidth = '250px';
  export let defaultRightWidth = '150px';

  const dispatch = createEventDispatcher();
  let contentSplit: any;

  const createSplit = () => {
    const divElement = document.createElement('div');
    divElement.id = 'leftGutter';
    divElement.classList.add('left-gutter-more');

    document.querySelector('.left-grid-vertical-gutter').appendChild(divElement);
    // loadSettings
    settingsStore.getUserSettings(`left${id}`, menuPath).then((res: any[]) => {
      let leftWidth = defaultLeftWidth;
      let filter = res.filter((it) => it.key === 'lastLeftWidth');
      if (filter.length > 0) {
        leftWidth = filter[0].value;
      }

      let rightWidth = defaultRightWidth;
      filter = res.filter((it) => it.key === 'lastRightWidth');
      if (filter.length > 0) {
        rightWidth = filter[0].value;
      }

      let containerEle: any;
      if (showTitle) {
        containerEle = document.querySelector('.view-container-3-col');
      } else {
        containerEle = document.querySelector('.view-container-3-col-modal');
      }
      containerEle.style['grid-template-columns'] = `${
        minLeftPane ? 0 : leftWidth
      } ${GUTTER_WIDTH}px auto ${GUTTER_WIDTH}px ${rightWidth}`;
    });

    return Split({
      columnGutters: [
        {
          track: 1,
          element: document.querySelector('.left-grid-vertical-gutter'),
        },
        {
          track: 3,
          element: document.querySelector('.right-grid-vertical-gutter'),
        },
      ],
      onDragEnd: (direction: any, track: number) => {
        let gridEle: any;
        if (showTitle) {
          gridEle = document.querySelector('.view-container-3-col');
        } else {
          gridEle = document.querySelector('.view-container-3-col-modal');
        }

        const split = gridEle.style['grid-template-columns'].split(' ');
        const leftWidth = split[0];
        const rightWidth = split[split.length - 1];

        settingsStore.saveUserSettings(
          new Settings({
            menuPath: menuPath,
            controlId: `left${id}`,
            keys: ['lastLeftWidth', 'lastRightWidth'],
            values: [leftWidth, rightWidth],
          }),
        );
        dispatch('dragEnd', track);
      },
    });
  };

  onMount(() => {
    contentSplit = createSplit();
  });

  onDestroy(() => {
    if (contentSplit) {
      contentSplit.destroy();
    }
  });
</script>

<main class={showTitle ? 'view-container-3-col' : 'view-container-3-col-modal'}>
  <div class="view-left">
    <slot name="viewLeft" />
  </div>
  <div class="left-grid-vertical-gutter" />
  <div class="view-content">
    <slot />
  </div>
  <div class="right-grid-vertical-gutter" />
  <div class="view-right">
    <slot name="viewRight" />
  </div>
</main>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Split from 'split-grid';
  import { GUTTER_WIDTH } from '@/assets/js/constants';
  import { settingsStore } from '@/store/settings';
  import { Settings } from '@/model/settings';

  export let showTitle: boolean = true;
  export let id: string = '';
  export let menuPath: string;
  export let minLeftPane = false;
  export let defaultLeftWidth = 260; // in pixel

  let contentSplit: any;

  const createSplit = () => {
    const divElement = document.createElement('div');
    divElement.id = 'leftGutter';
    divElement.classList.add('left-gutter-more');

    document.querySelector('.left-grid-vertical-gutter').appendChild(divElement);
    // loadSettings
    settingsStore.getUserSettings(`left${id}`, menuPath).then((res: any[]) => {
      const found = res.find((it) => it.key === 'lastLeftWidth');
      let leftWidth = defaultLeftWidth;
      if (found) {
        leftWidth = +found.value;
      }

      let containerEle: any;
      if (showTitle) {
        containerEle = document.querySelector('.view-container-2-col');
      } else {
        containerEle = document.querySelector('.view-container-2-col-modal');
      }
      containerEle.style['grid-template-columns'] = `${minLeftPane ? 0 : leftWidth} ${GUTTER_WIDTH}px auto`;
    });

    return Split({
      columnGutters: [
        {
          track: 1,
          element: document.querySelector('.left-grid-vertical-gutter'),
        },
      ],
      onDragEnd: (direction: any, track: number) => {
        let gridEle: any;
        if (showTitle) {
          gridEle = document.querySelector('.view-container-2-col');
        } else {
          gridEle = document.querySelector('.view-container-2-col-modal');
        }

        const [leftWidth] = gridEle.style['grid-template-columns'].split(' ');

        settingsStore.saveUserSettings(
          new Settings({
            menuPath: menuPath,
            controlId: `left${id}`,
            keys: ['lastLeftWidth'],
            values: [leftWidth],
          }),
        );
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

<main class={showTitle ? 'view-container-2-col' : 'view-container-2-col-modal'}>
  <div class="view-left">
    <slot name="viewLeft" />
  </div>
  <div class="left-grid-vertical-gutter" />
  <div class="view-content">
    <slot />
  </div>
</main>

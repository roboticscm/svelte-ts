<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';

  export let src: string;
  export let disabled = false;
  export let id: string;

  let fileRef: any;
  let imageRef: any;
  let imageViewerRef: any;

  const dispatch = createEventDispatcher();
  let data: string;

  const onSelectFile = (event) => {
    event.preventDefault();
    fileRef.click();
  };
  const onClearImage = (event) => {
    event.preventDefault();
    // @ts-ignore
    imageRef.src = require('../../../../public/images/no-image.png');
    data = undefined;
  };

  const onImageError = () => {
    // @ts-ignore
    imageRef.src = require('../../../../public/images/no-image.png');
  };

  // @ts-ignore
  $: dispatch('imageChange', data);
  // @ts-ignore
  $: data = src;
  // @ts-ignore
  $: {
    if (imageViewerRef) {
      if (disabled) {
        imageViewerRef.classList.remove('image-hover');
      } else {
        imageViewerRef.classList.add('image-hover');
      }
    }
  }

  onMount(() => {
    window['$'](`#${id}`).change(function(e) {
      for (let i = 0; i < (e.originalEvent.srcElement as any).files.length; i++) {
        const file = (e.originalEvent.srcElement as any).files[i];

        const reader = new FileReader();
        reader.onloadend = function() {
          imageRef.src = reader.result;
          data = imageRef.src;
        };
        reader.readAsDataURL(file);
      }
    });
  });
</script>

<style lang="scss">

</style>

<div class="image-viewer image-hover" bind:this={imageViewerRef}>
  <img on:error={onImageError} class="image" bind:this={imageRef} {src} alt="" />
  <input style="display: none;" type="file" {id} bind:this={fileRef} />
  <div class="overlap">
    <div class="overlap__content">
      <button type="button" class="btn-small-success" {disabled} on:click={onSelectFile}>
        <i class="fa fa-cloud-upload-alt" />
      </button>
      <button type="button" class="btn-small-danger" {disabled} on:click={onClearImage}>
        <i class="fa fa-times" />
      </button>
    </div>
  </div>
</div>

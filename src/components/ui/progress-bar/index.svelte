
{#if loading}
    <i  class="progress-bar {smallSize ? 'small-progress-bar' : ''} fa fa-spinner fa-spin"></i>
 {/if}

<script lang="ts">
  export let loading = false;
  export let smallSize = false;
};
</script>

<style lang="scss">

</style>

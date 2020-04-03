<script lang="ts">
  export let loading$: any;
  export let smallSize = false;
</script>

<style lang="scss">

</style>

{#if $loading$}
  <div class="progress-bar-wrapper">
    <i class="progress-bar {smallSize ? 'small-progress-bar' : ''} fa fa-spinner fa-spin" />
  </div>
{/if}

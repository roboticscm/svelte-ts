<script lang="ts">
  export let form: any;
  export let field: string;
  export let className = 'error';
</script>

{#if form.errors.has(field)}
  <span class={className}>{form.errors.get(field)}</span>
{/if}

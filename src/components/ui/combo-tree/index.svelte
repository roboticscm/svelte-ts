<script lang="ts">
    import {onMount} from 'svelte';

    onMount(() => {

        window['$']('#cc').combotree('setValues', [1,3,21,{id:73,text:'text73'}]);
    })
</script>

<select id="cc" class="easyui-combotree" style="width:100%;">
</select>
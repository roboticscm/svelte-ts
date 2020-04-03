<!--    <TreeView-->
<!--            bind:this={treeViewRef}-->
<!--            {disabled}-->
<!--            {id}-->
<!--            {data}-->
<!--            isCheckableNode={true}-->
<!--            on:click-->
<!--    >-->
<!--        <div slot="label" class="label">{T('SYS.LABEL.AVAILABLE_DEPARTMENT')}:</div>-->
<!--    </TreeView>-->

<!--<script lang="ts">-->
<!--    import {T} from '@/assets/js/locale/locale';-->
<!--    import {Debug} from '@/assets/js/debug';-->
<!--    import TreeView from '@/components/ui/tree-view/index.svelte';-->

<!--    export let data: any[];-->
<!--    export let id: string;-->
<!--    export let disabled = false;-->

<!--    let treeViewRef: any;-->

<!--    const selectNodeById = (id: any) => {-->
<!--        treeViewRef.selectNodeById(id);-->
<!--    };-->

<!--    const loadData = async (menuId: any) => {-->
<!--        return new Promise((resolve, reject) => {-->
<!--            orgStore-->
<!--                    .sysGetAvailableDepartmentTreeForMenu(menuId)-->
<!--                    .then((dt: any) => {-->
<!--                        state.data = dt;-->
<!--                        resolve(dt);-->
<!--                    })-->
<!--                    .catch((error: any) => {-->
<!--                        reject(error);-->
<!--                        Debug.errorSection('Available Department Tree Menu', error);-->
<!--                    });-->
<!--        });-->
<!--    };-->

<!--    const getCheckedLeafIds = (checked: boolean) => {-->
<!--        return treeViewRef.value.getCheckedLeafIds(checked);-->
<!--    };-->

<!--    const disableTree = (disable: boolean) => {-->
<!--        treeViewRef.value.disableTree(disable);-->
<!--    };-->


<!--</script>-->

<!--<style lang="scss"></style>-->

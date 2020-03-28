<script lang="ts">
    import Modal from '@/components/ui/modal/base/index.svelte';


    export let id: string;
    let modalRef: any;

    export const show = () => {
        return modalRef.show();
    }
</script>


<Modal {id} bind:this={modalRef}></Modal>
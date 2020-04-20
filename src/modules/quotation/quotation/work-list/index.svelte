<script lang="ts">
    import { ViewStore } from '@/store/view';
    import {T} from '@/lib/js/locale/locale';
    import Filter from '@/components/ui/float-input/filter';
    import ContentFilter from '@/components/ui/float-input/content-filter';
    import DatePicker from '@/components/ui/float-input/date-picker';

    export let view: ViewStore;

    let list = [
        {
            id: 'content',
            name: T('QTT.LABEL.CONTENT')
        },
        {
            id: 'customer',
            name: T('QTT.LABEL.CUSTOMER')
        },
        {
            id: 'seller',
            name: T('QTT.LABEL.SELLER')
        },
        {
            id: 'creator',
            name: T('QTT.LABEL.CREATOR')
        },
        {
            id: 'manufacturer',
            name: T('QTT.LABEL.MANUFACTURER')
        }
    ];

    let filter1Text = '';
    let filter2Text = '';
    let filter3Text = '';
    let filter1Id = '-1';
    let filter2Id = '-1';
    let filter3Id = '-1';

    // Other vars
    const workListContainerId = `workList${view.getViewName()}Container`;

    const onSearch = () => {
        console.log('filter1 ', filter1Id, filter1Text);
        console.log('filter2 ', filter2Id, filter2Text);
        console.log('filter3 ', filter3Id, filter3Text);
    }

    const onItemChangeFilter1 = (event: any) => {
        filter1Id = event.detail;
    }

    const onItemChangeFilter2 = (event: any) => {
        filter2Id = event.detail;
    }

    const onItemChangeFilter3 = (event: any) => {
        filter3Id = event.detail;
    }
</script>

<section id={workListContainerId} class="view-left-main">
    <DatePicker></DatePicker>
    <Filter on:itemChange={onItemChangeFilter1} list={list.filter(it => [filter2Id, filter3Id].indexOf(it.id.toString()) < 0)} name="filter1" bind:value={filter1Text}> </Filter>
    <Filter on:itemChange={onItemChangeFilter2} list={list.filter(it => [filter1Id, filter3Id].indexOf(it.id.toString()) < 0)} name="filter2" bind:value={filter2Text}> </Filter>
    <ContentFilter on:itemChange={onItemChangeFilter3} list={list.filter(it => [filter1Id, filter2Id].indexOf(it.id.toString()) < 0) } name="filter3" bind:value={filter3Text}> </ContentFilter>
    <button on:click={onSearch}>Test</button>
</section>
<div class="view-left-bottom" />
<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '@/components/ui/button';
  import { ButtonType } from '@/components/ui/button/types';
  import ViewWrapperModal from '@/components/modal/view-wrapper';
  import { T } from '@/assets/js/locale/locale';
  import { ViewStore } from '@/store/view';
  import { roleControlStore } from '@/store/role-control';
  import { appStore } from '@/store/app';
  import { string } from 'prop-types';
  import { take } from 'rxjs/operators';

  export let view: ViewStore;
  export let menuPath: string;

  let viewWrapperModalRef: any;
  let languageViewRef: any;

  let LanguageView: any = undefined;
  let langFullControl: boolean = undefined;
  let langRoleControls: any[] = [];

  const onAddNewLanguage = (event) => {
    viewWrapperModalRef.show().then((res) => {
      console.log(res);
    });
  };

  const loadLanguageView = () => {
    roleControlStore
      .sysGetControlListByDepIdAndUserIdAndMenuPath(appStore.org.departmentId, 'sys/language')
      .pipe(take(1))
      .subscribe((res) => {
        if (res.data.fullControl) {
          langFullControl = true;
        } else {
          langRoleControls = res.data;
        }
        import('@/modules/sys/language/index.svelte').then((res) => {
          LanguageView = res.default;
        });
      });
  };

  onMount(() => {
    loadLanguageView();
  });

  const langCallback = (event) => {
    // console.log(event);
  };

  let menuInfo$: any;
  $: {
    menuInfo$ = languageViewRef && languageViewRef.getMenuInfo$();
  }
</script>

<ViewWrapperModal
  menuInfo={$menuInfo$}
  title={languageViewRef && languageViewRef.getViewTitle()}
  defaultWidth={900}
  defaultHeight={500}
  bind:this={viewWrapperModalRef}
  {menuPath}
  id={'modalWrapper' + view.getViewName() + 'Id'}>
  <svelte:component
    this={LanguageView}
    bind:this={languageViewRef}
    showTitle={false}
    on:callback={langCallback}
    callFrom={menuPath}
    menuPath="sys/language"
    fullControl={langFullControl}
    roleControls={langRoleControls} />
</ViewWrapperModal>

<section class="view-content-main">Content</section>

<section class="view-content-bottom">
  <Button btnType={ButtonType.AddNew} title={T('COMMON.BUTTON.ADD_NEW_LANGUAGE')} on:click={onAddNewLanguage} />
</section>
export let menuPath: string; export let fullControl: boolean; export let roleControls: [];

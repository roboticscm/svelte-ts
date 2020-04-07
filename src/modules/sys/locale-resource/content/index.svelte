<script lang="ts">
  import { onMount, tick } from 'svelte';
  import Button from '@/components/ui/button';
  import { ButtonType } from '@/components/ui/button/types';
  import ViewWrapperModal from '@/components/modal/view-wrapper';
  import { T } from '@/assets/js/locale/locale';
  import { ViewStore } from '@/store/view';
  import { roleControlStore } from '@/store/role-control';
  import { appStore } from '@/store/app';
  import { string } from 'prop-types';
  import { distinctUntilChanged, skip, switchMap, take, tap, map, debounce } from 'rxjs/operators';
  import { forkJoin, fromEvent, Observable } from 'rxjs';
  import Select from '@/components/ui/input/select';
  import Autocomplete from '@/components/ui/input/autocomplete';
  import { Store } from '../store';
  import { settingsStore } from '@/store/settings';
  import { Debug } from '@/assets/js/debug';
  import QuickSearch from '@/components/ui/input/quick-search';
  import { TableColumn } from '@/model/base';
  import ProgressBar from '@/components/ui/progress-bar';
  import { StringUtil } from '@/assets/js/string-util';
  import { SObject } from '@/assets/js/sobject';
  import { fromEvents } from '@/assets/js/rx';
  import { markStringSearch } from '@/assets/js/util';
  import Pagination from '@/components/ui/pagination';

  export let view: ViewStore;
  export let menuPath: string;

  view.loading$.next(true);
  const store = new Store(view);

  const { usedLanguages$, companies$ } = store;

  let viewWrapperModalRef: any;
  let languageViewRef: any;
  let languageDropdownRef: any;
  let companyDropdownRef: any;
  let langCategoryAutoRef: any;
  let langTypeGroupAutoRef: any;
  let quickSearchRef: any;
  let languageGridRef: any;
  let ExcelGrid: any;

  let pageRef: any;
  const { fullCount$ } = view;

  let LanguageView: any = undefined;
  let tableHeight: string;
  let langFullControl: boolean = undefined;
  let langRoleControls: any[] = [];
  let data: any[] = [];
  let beforeData: any[] = [];
  let lang: any[] = [];

  let columns: TableColumn[] = [];

  const onAddNewLanguage = (event) => {
    viewWrapperModalRef.show().then((res) => {
      console.log(res);
    });
  };

  const loadLanguageView = () => {
    return new Promise((resolve, reject) => {
      roleControlStore
        .sysGetControlListByDepIdAndUserIdAndMenuPath(appStore.org.departmentId, 'sys/language')
        .pipe(take(1))
        .subscribe((res) => {
          if (res.data.fullControl) {
            langFullControl = true;
          } else {
            langRoleControls = res.data;
          }
          console.log(langFullControl, langRoleControls);
          import('@/modules/sys/language/index.svelte')
            .then((res) => {
              LanguageView = res.default;
              resolve('ok');
            })
            .catch((error) => reject(error));
        });
    });
  };

  const didSearch = (dt: any) => {
    view.fullCount$.next(dt.fullCount);
    //transform locale into column and add index to distinct object
    const _data = dt.payload;

    _data.map((item: any, index: number) => {
      item[item.locale] = item.value;
      item.index = index;
      delete item.value;
      return item;
    });

    // fill all missing locale value
    _data.map((item: any) => {
      lang.map((l: any) => {
        // eslint-disable-next-line no-prototype-builtins
        if (!item.hasOwnProperty(l.locale)) {
          const filter = _data.filter((d: any) => {
            return (
              d.category === item.category &&
              d.typeGroup === item.typeGroup &&
              d.key === item.key &&
              d.locale === l.locale
            );
          });
          if (filter.length > 0) {
            item[l.locale] = filter[0][l.locale];
          }
        }
        return l;
      });
      delete item.locale;

      return item;
    });

    //recalculate index
    _data.map((item: any) => {
      const filter = _data.filter((d: any) => {
        return d.category === item.category && d.typeGroup === item.typeGroup && d.key === item.key;
      });

      filter.map((it: any) => {
        it.index = item.index;
      });
    });

    // distinct array object
    const distinctObj = Array.from(new Set(_data.map((it: any) => it.index))).map((index) => {
      const ret = _data.find((s) => s.index === index);
      delete ret.index;
      return ret;
    });

    const temp = distinctObj;
    // add blank row at the end
    temp.push({});

    mark(quickSearchRef.getTextSearch(), SObject.clone(temp));
    view.loading$.next(false);
  };

  const getSearchParam = () => {
    const selectedCompanyId = companyDropdownRef && companyDropdownRef.getSelectedId();

    let selectedCategoryId = langCategoryAutoRef && langCategoryAutoRef.getSelectedId();
    const categoryText = langCategoryAutoRef && langCategoryAutoRef.getInputText();

    if (StringUtil.isEmpty(selectedCategoryId) && !StringUtil.isEmpty(categoryText)) {
      selectedCategoryId = categoryText;
    }

    let selectedTypeGroupId = langTypeGroupAutoRef && langTypeGroupAutoRef.getSelectedId();
    const typeGroupText = langTypeGroupAutoRef && langTypeGroupAutoRef.getInputText();

    if (StringUtil.isEmpty(selectedTypeGroupId) && !StringUtil.isEmpty(typeGroupText)) {
      selectedTypeGroupId = typeGroupText;
    }

    const textSearch = quickSearchRef && quickSearchRef.getTextSearch();

    return [selectedCompanyId, selectedCategoryId, selectedTypeGroupId, textSearch];
  };

  const doSearch = () => {
    const [selectedCompanyId, selectedCategoryId, selectedTypeGroupId, textSearch] = getSearchParam();
    view.loading$.next(true);
    Store.sysGetLocaleResourceByCompanyIdAndCatAndTypeGroup(
      selectedCompanyId,
      selectedCategoryId,
      selectedTypeGroupId,
      textSearch,
      view.page,
      view.pageSize,
    ).subscribe(
      (res: any) => {
        didSearch(res.data);
      },
      (error) => {
        Debug.errorSection('Load Locale Resource List', error);
        view.loading$.next(false);
      },
    );
  };

  const mark = (textSearch: string, source: any) => {
    beforeData = SObject.clone(source);
    data = SObject.clone(source).map((item: any) => {
      const markedCategory = markStringSearch(item.category, textSearch, true);
      const markedTypeGroup = markStringSearch(item.typeGroup, textSearch, true);
      const markedKey = markStringSearch(item.key, textSearch, true);
      const markedVi = markStringSearch(item['vi-VN'], textSearch, true);
      const markedEn = markStringSearch(item['en-EN'], textSearch, true);
      if (markedCategory !== item.category) {
        item.category = markedCategory;
      }
      if (markedTypeGroup !== item.typeGroup) {
        item.typeGroup = markedTypeGroup;
      }
      if (markedKey !== item.key) {
        item.key = markedKey;
      }
      if (markedVi !== item['vi-VN']) {
        item['vi-VN'] = markedVi;
      }
      if (markedEn !== item['en-EN']) {
        item['en-EN'] = markedEn;
      }
      return item;
    });
  };

  onMount(() => {
    store.sysGetUsedLanguages();
    store.getCompaniesList();

    const company$ = companyDropdownRef.loadSettings();
    const category$ = langCategoryAutoRef.loadSettings();
    const typeGroup$ = langTypeGroupAutoRef.loadSettings();

    forkJoin([company$, category$, typeGroup$]).subscribe(() => {
      pageRef.loadSettings().then(() => {
        doSearch();
      });
    });

    calcTableHeight(31);

    let resizeTimer;
    window['$'](window).on('resize', function(e) {
      clearTimeout(resizeTimer);
      calcTableHeight(0);
      resizeTimer = setTimeout(function() {
        languageGridRef && languageGridRef.refresh();
      }, 250);
    });

    loadLanguageView();
  });

  const calcTableHeight = (delta: number) => {
    const ele: any = document.querySelector('#languageGridContainer');
    tableHeight = window['$'](ele).height() - delta + 'px';
  };

  const langCallback = (event) => {
    // console.log(event);
  };

  let menuInfo$: any;
  // @ts-ignore
  $: {
    menuInfo$ = languageViewRef && languageViewRef.getMenuInfo$();
  }

  const onApplyLanguage = (event) => {
    let href = new URL((window as any).location.href);
    const selectedLangId = languageDropdownRef.getSelectedId();
    settingsStore
      .saveUserSettings({
        menuPath: 'system',
        controlId: 'localeResourceId',
        keys: ['lastLocaleResource'],
        values: [selectedLangId],
      })
      .then((_) => {
        localStorage.setItem('localeLanguage', selectedLangId);
        href.searchParams.set('localeLanguage', selectedLangId);
        (window as any).location.href = href;
      })
      .catch((error) => Debug.errorSection('onApplyLanguage', error));
  };

  const onSearch = (event) => {
    doSearch();
  };

  const doCategorySearch = (textSearch: string) => {
    return Store.sysGetUsedLangCategories(textSearch);
  };

  const doTypeGroupSearch = (textSearch: string) => {
    return Store.sysGetUsedLangTypeGroups(textSearch);
  };

  const onLangTableBeforeChange = (event) => {
    // if (!viewState.dataChange) {
    //   state.beforeData = languageGridRef.value.getData();
    //   viewState.dataChange = true;
    // }
  };

  const onLangTableBeforeDeleteRow = (event) => {
    // if (!viewState.dataChange) {
    //   state.beforeData = languageGridRef.value.getData();
    //   viewState.dataChange = true;
    // }
    return true;
  };

  const onLangTableUpdate = (event) => {
    // setTimeout(() => {
    //   const x = Number(event.x);
    //   if (x > 1) {
    //     if (viewState.isReadOnlyMode) {
    //       event.cell.classList.add('readonly');
    //     } else {
    //       event.cell.classList.remove('readonly');
    //     }
    //   }
    // });
  };

  Store.sysGetAllLanguages(false, false)
    .then((res: any) => {
      lang = res;
      columns = lang.map((item: any) => {
        return {
          type: 'text',
          title: item.name,
          name: item.locale,
          width: 100,
        };
      });

      columns.unshift({
        type: 'text',
        title: T('COMMON.LABEL.KEY'),
        name: 'key',
        width: 100,
      });
      columns.unshift({
        type: 'text',
        title: T('COMMON.LABEL.TYPE_GROUP'),
        name: 'typeGroup',
        width: 100,
        readOnly: true,
      });

      columns.unshift({
        type: 'text',
        title: T('COMMON.LABEL.CATEGORY'),
        name: 'category',
        width: 100,
        readOnly: true,
      });

      import('@/components/ui/excel-grid/index.svelte').then((res) => {
        ExcelGrid = res.default;
      });
    })
    .catch((error: any) => {
      Debug.errorSection('sysGetAllLanguages', error);
    });

  const doFilter = (events$: Observable<any>) => {
    events$
      .pipe(
        distinctUntilChanged((before: any, after: any) => {
          return before.value === after.value && after.type !== 'click';
        }),
        tap((event: string) => {
          view.loading$.next(true);
        }),
        switchMap((event) => {
          const [selectedCompanyId, selectedCategoryId, selectedTypeGroupId, textSearch] = getSearchParam();
          return Store.sysGetLocaleResourceByCompanyIdAndCatAndTypeGroup(
            selectedCompanyId,
            selectedCategoryId,
            selectedTypeGroupId,
            textSearch,
            view.page,
            view.pageSize,
          );
        }),
      )
      .subscribe({
        next: (res) => {
          didSearch(res.data);
          view.loading$.next(false);
        },
        error: (error) => {
          view.loading$.next(false);
        },
      });
  };

  const useFilterAction = {
    register(component: HTMLElement, param: any) {
      const events$ = fromEvents(component, 'keyup', 'click').pipe(
        map((event: any) => {
          return {
            type: event.type,
            value: event.target.value,
          };
        }),
      );
      doFilter(events$);
    },
  };

  const onLoadPage = (event) => {
    view.pageSize = event.detail.pageSize;
    view.page = event.detail.page;
    doSearch();
  };

  const onPaginationInit = (event) => {
    view.pageSize = event.detail;
  };
</script>

<style lang="scss">
  @import '../sass/sass/helpers/variables.scss';

  #languageGridContainer {
    border: $default-border;
    width: 100%;
  }
  .language-grid {
    height: calc(100% - 2.2rem * 2 - #{$footer_height});
  }
  .full-language-grid {
    /*overflow: auto;*/
    height: calc(100% - 2.2rem * 2 - 10px);
  }
</style>

<ProgressBar loading$={view.loading$} />
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
    showWorkList = {false}
    bind:this={languageViewRef}
    showTitle={false}
    on:callback={langCallback}
    callFrom={menuPath}
    menuPath="sys/language"
    fullControl={langFullControl}
    roleControls={langRoleControls} />
</ViewWrapperModal>

<section class="view-content-main">
  <!-- Change language -->
  <div class="row">
    <div class="col-xs-24 col-md-12 col-lg-7">
      <div class="row">
        <div class="label col-xs-24 sm-12 col-lg-10 text-xs-left text-xx-right">{T('COMMON.LABEL.LANGUAGE')}:</div>
        <div class="col-xs-24 sm-12 col-lg-14">
          <Select
            id={view.getViewName() + 'UsedLanguageSelectId'}
            {menuPath}
            saveState={true}
            data={$usedLanguages$}
            bind:this={languageDropdownRef} />
        </div>
      </div>
    </div>
    <div class="col-xs-24 col-md-12 col-lg-3">
      <Button btnType={ButtonType.Apply} on:click={onApplyLanguage} />
    </div>
  </div>
  <!-- //Change language -->

  <div class="row">
    <!-- Company -->
    <div class="col-xs-24 col-md-8 col-lg-7">
      <div class="row">
        <div class="label col-md-24 col-lg-10 text-md-left text-xx-right">{T('COMMON.LABEL.COMPANY')}:</div>
        <div class="col-md-24 col-lg-14">
          <Select
            id={view.getViewName() + 'CompanySelectId'}
            {menuPath}
            on:change={onSearch}
            saveState={true}
            data={$companies$}
            bind:this={companyDropdownRef} />
        </div>
      </div>
    </div>
    <!-- //Company -->
    <!-- Category -->
    <div class="col-xs-24 col-md-8 col-lg-7 pl-xs-0 pl-md-1 pl-lg-0">
      <div class="row">
        <div class="label col-md-24 col-lg-10 text-md-left text-xx-right">{T('COMMON.LABEL.CATEGORY')}:</div>
        <div class="col-md-24 col-lg-14">
          <Autocomplete
            columns={[{ name: 'name', title: 'Name', type: 'html' }]}
            searchFunc={doCategorySearch}
            id={view.getViewName() + 'CategoryAutoId'}
            {menuPath}
            bind:this={langCategoryAutoRef}
            saveState={true}
            on:change={onSearch} />
        </div>
      </div>
    </div>
    <!-- //Category -->

    <!-- Type Group -->
    <div class="col-xs-24 col-md-8 col-lg-7 pl-xs-0 pl-md-1 pl-lg-0">
      <div class="row">
        <div class="label col-md-24 col-lg-10 text-md-left text-xx-right">{T('COMMON.LABEL.TYPE_GROUP')}:</div>
        <div class="col-md-24 col-lg-14">
          <Autocomplete
            columns={[{ name: 'name' }]}
            searchFunc={doTypeGroupSearch}
            id={view.getViewName() + 'TypeGroupAutoId'}
            {menuPath}
            bind:this={langTypeGroupAutoRef}
            saveState={true}
            on:change={onSearch} />
        </div>
      </div>
    </div>
    <!-- //Type Group -->
    <!-- Search or Filter-->
    <div class="col-md-24 col-lg-3">
      <QuickSearch action={useFilterAction} bind:this={quickSearchRef} placeholder={T('COMMON.LABEL.FILTER') + '...'} />
    </div>
    <!-- //Search or Filter-->
  </div>
  <!--  Language Grid-->
  <div id="languageGridContainer" class="'row' {$fullCount$ > 0 ? 'language-grid' : 'full-language-grid'} ">
    <div class="col-24">
      <svelte:component
        this={ExcelGrid}
        id="languageGridId"
        bind:this={languageGridRef}
        {menuPath}
        {columns}
        {data}
        fullWidth={true}
        height={tableHeight}
        on:beforeChange={onLangTableBeforeChange}
        on:beforeDeleteRow={onLangTableBeforeDeleteRow}
        on:updateTable={onLangTableUpdate} />
    </div>
  </div>
  <!--  //Language Grid -->

  <div style="margin-top: 1px;">
    <Pagination
      {menuPath}
      totalRecords={$fullCount$}
      on:loadPage={onLoadPage}
      on:init={onPaginationInit}
      bind:this={pageRef} />

  </div>
</section>

<section class="view-content-bottom">
  <Button btnType={ButtonType.AddNew} title={T('COMMON.BUTTON.ADD_NEW_LANGUAGE')} on:click={onAddNewLanguage} />
</section>

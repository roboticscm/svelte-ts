<script lang="ts">
  import { App } from '@/assets/js/constants';
  import { T } from '@/assets/js/locale/locale';
  import { settingsStore } from '@/store/settings';
  import { menuStore } from '@/store/menu';
  import { appStore } from '@/store/app';
  import { orgStore } from '@/store/org';
  import DropdownItem from '@/components/ui/dropdown-item';

  export let id: string;

  let modules: any[] = [];
  let selectedDep: any = undefined;

  const onNavigate = (event: Event, departmentId: any) => {
    settingsStore
      .saveSettings({
        menuPath: 'system',
        controlId: id,
        keys: ['lastDepartmentId'],
        values: [departmentId + ''],
      })
      .then((_: any) => {
        // get last menu path of department
        menuStore.sysGetRoledMenuListByUserIdAndDepId(departmentId, false).subscribe((res: any) => {
          if (res.data.length > 0) {
            settingsStore.saveSettings({
              menuPath: 'system',
              controlId: 'mainNavBarId',
              keys: ['lastMenuPath'],
              values: [res.data[0].path],
            });
            location.href = '/' + res.data[0].path.replace('/', '--');
          }
        });
      });
  };

  const isSelectedItem = (moduleId: string): boolean => {
    return appStore.org.departmentId == moduleId;
  };

  const loadData = () => {
    orgStore.sysGetRoledDepartmentListByUserId().subscribe((res: any) => {
      modules = res.data;
      const filterDep = modules.filter((dep: any) => dep.departmentId == appStore.org.departmentId);
      if (filterDep.length > 0) {
        selectedDep = filterDep[0];
        appStore.org.selectedDepartment = selectedDep;
      }
    });
  };

  loadData();
</script>

<style lang="scss" scoped>

</style>

<div class="modules">
  <div>
    <div>
      {#if selectedDep}
        <DropdownItem
          inline={false}
          useFontIcon={selectedDep.depUseFontIcon}
          fontIcon={selectedDep.depFontIcon}
          iconData={selectedDep.depIconData}
          text={selectedDep.departmentName} />
      {:else}
        {@html App.PROGRESS_BAR}
      {/if}
    </div>
    <div class="modules__arrow">
      <i class="fa fa-angle-double-down" />
      <div class="right-dropdown-content">
        {#each modules as module, index}
          <DropdownItem
            on:click={(e) => onNavigate(e, module.departmentId)}
            useFontIcon={module.depUseFontIcon}
            fontIcon={module.depFontIcon}
            iconData={module.depIconData}
            text={module.departmentName}
            selected={isSelectedItem(module.departmentId)} />
        {/each}
      </div>
    </div>
  </div>
</div>

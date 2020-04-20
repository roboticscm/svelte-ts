<script lang="ts">
  import { logout } from '@/lib/js/security';
  import { API } from '@/lib/js/constants';
  import { T } from '@/lib/js/locale/locale';
  import { appStore } from '@/store/app';

  // import ThemeConfigModal from '@/components/modal/theme-config-modal/index.vue';
  const { user$ } = appStore;

  let user;
  // @ts-ignore
  $: user = $user$;

  const onLogout = (event) => {
    logout(API.API_SERVER);
  };

  const showUserProfiles = () => {
    hidePopup();
    // themeConfigModalRef.value.show();
  };
  const showPopup = () => {
    (document.querySelector('#userProfilesDropdown') as any).classList.add('show-dropdown');
  };

  const hidePopup = () => {
    (document.querySelector('#userProfilesDropdown') as any).classList.remove('show-dropdown');
  };
</script>

<style lang="scss">

</style>

<div style="height: 100%; display: flex; align-items: center;">
  <!--        <theme-config-modal ref="themeConfigModalRef" id="themeConfigModalId"> </theme-config-modal>-->
  {#if user}
    <div class="user-profiles" on:mouseover|stopPropagation={showPopup} on:mouseout={hidePopup}>

      {#if user.useFontIcon}
        <span class="user-profiles__icon">
          {@html user.fontIcon}
        </span>
      {:else if user.iconData}
        <img class="user-profiles__img" src={user.iconData} alt="" />
      {:else}
        <span class="user-profiles__icon">
          <i class="fa fa-camera" />
        </span>
      {/if}

      <div id="userProfilesDropdown" class="right-dropdown-content">
        <div class="user-profiles__fullname">{` ${user.username} - ${user.lastName} ${user.firstName}`}</div>
        <div on:click|stopPropagation={showUserProfiles} class="dropdown-item">
          <i class="fa fa-file-invoice" />
          {T('SYS.MENU.USER_PROFILES')}
        </div>
        <div on:click={onLogout} class="dropdown-item">
          <i class="fa fa-sign-out-alt" />
          {T('SYS.MENU.LOGOUT')}
        </div>
      </div>
    </div>
  {/if}
</div>

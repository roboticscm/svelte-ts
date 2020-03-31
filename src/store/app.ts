import { RxHttp } from '@/assets/js/rx-http';
import { BehaviorSubject } from 'rxjs';
import { User } from '@/model/user';
import { settingsStore } from '@/store/settings';
import { humanOrOrgStore } from '@/modules/sys/human-or-org/store';
import { getMethodNameInSnackCase } from '@/assets/js/util';
import { NavBarConfig } from '@/model/nav-bar-config';
import { menuStore } from '@/modules/sys/menu/store';
import { Menu, RoleMenu } from '@/modules/sys/menu/model';
import { take } from 'rxjs/operators';
import { T } from '@/assets/js/locale/locale';
import { StringUtil } from '@/assets/js/string-util';

class AppStore {
  user$ = new BehaviorSubject<User>(null);
  user: User;
  org$ = new BehaviorSubject<any>(null);
  org: any = {};

  theme$ = new BehaviorSubject<any>(null);

  navBarConfig$ = new BehaviorSubject<NavBarConfig>(new NavBarConfig());

  getCurrentUserInfo() {
    humanOrOrgStore
      .sysGetUserInfoById(null)
      .then((res: any) => {
        if (res.length > 0) {
          this.user = res[0];
          this.user$.next(res[0]);
        }
      })
      .catch((error) => this.user$.error(error));
  }

  getUserSettings(companyId: string) {
    settingsStore.sysGetUserSettings(companyId).subscribe(
      (res: any) => {
        const [companyId, departmentId, menuPath, lang, theme, alpha, headerHeight] = res.data.split('#');
        // org
        this.org = {
          companyId,
          departmentId,
          lang,
          menuPath,
        };
        this.org$.next({
          companyId,
          departmentId,
          lang,
        });

        // theme
        this.theme$.next({
          theme,
          alpha,
          headerHeight,
        });

        // nav bar config
        this.navBarConfig$.next({
          mainNavBarViewCount: 3,
          showSearchBar: true,
          showHistory: true,
          historyNavBarViewCount: 2,
        });
      },
      (error) => this.org$.error(error),
    );
  }
}

export const appStore = new AppStore();

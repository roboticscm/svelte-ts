import { RxHttp } from '@/lib/js/rx-http';
import { BehaviorSubject } from 'rxjs';
import { User } from '@/model/user';
import { settingsStore } from '@/store/settings';
import { HumanOrOrgStore, humanOrOrgStore } from '@/modules/sys/human-or-org/store';
import { getMethodNameInSnackCase } from '@/lib/js/util';
import { NavBarConfig } from '@/model/nav-bar-config';
import { Menu, RoleMenu } from '@/modules/sys/menu/model';
import { take } from 'rxjs/operators';
import { T } from '@/lib/js/locale/locale';
import { StringUtil } from '@/lib/js/string-util';

class AppStore {
  user$ = new BehaviorSubject<User>(null);
  user: User;
  org$ = new BehaviorSubject<any>(null);
  org: any = {};

  theme$ = new BehaviorSubject<any>(null);

  navBarConfig$ = new BehaviorSubject<NavBarConfig>(new NavBarConfig());

  getCurrentUserInfo() {
    HumanOrOrgStore.sysGetUserInfoById(null)
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

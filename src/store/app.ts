import { RxHttp } from '@/assets/js/rx-http';
import { BehaviorSubject } from 'rxjs';
import { User } from '@/model/user';
import { settingsStore } from '@/store/settings';
import { getMethodNameInSnackCase } from '@/assets/js/util';
import { NavBarConfig } from '@/model/nav-bar-config';
import {menuStore} from "@/modules/sys/menu/store";
import {Menu, RoleMenu} from "@/modules/sys/menu/model";
import {take} from "rxjs/operators";
import {T} from '@/assets/js/locale/locale';
import {StringUtil} from "@/assets/js/string-util";

const BASE_URL = 'sys/human-or-org/';

class AppStore {
  user$ = new BehaviorSubject<User>(null);

  org$ = new BehaviorSubject<any>(null);
  org: any = {};

  theme$ = new BehaviorSubject<any>(null);

  navBarConfig$ = new BehaviorSubject<NavBarConfig>(new NavBarConfig());

  sysGetUserInfoById() {
    RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`).subscribe(
      (res: any) => {
        if (res.data.length > 0) {
          this.user$.next(res.data[0]);
        } else {
          this.user$.next(null);
        }
      },
      (error) => this.user$.error(error)
    );
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
          menuPath
        };
        this.org$.next({
          companyId,
          departmentId,
          lang
        });

        // theme
        this.theme$.next({
          theme,
          alpha,
          headerHeight
        });

        // nav bar config
        this.navBarConfig$.next({
          mainNavBarViewCount: 3,
          showSearchBar: true,
          showHistory: true,
          historyNavBarViewCount: 2
        });
      },
      (error) => this.org$.error(error)
    );
  }
}

export const appStore = new AppStore();

import jQuery from 'jquery';
import 'jquery-ui';
(window as any).$ = jQuery;
(window as any).jQuery = jQuery;
import '../../sass/sass/index.scss';
import '@/assets/js/vendor/jquery.ztree.all';

import App from '@/App.svelte';

import Color, { getThemeColors } from '@/assets/js/color';
import { Debug } from '@/assets/js/debug';
import { UrlUtil } from '@/assets/js/url-util';
import { setHeader, getBrowserID, loginSuccess, logout } from './assets/js/security';
import { Token, API } from '@/assets/js/constants';
import { menuStore } from '@/store/menu';
import { sysGetLocaleResourceListByCompanyIdAndLocale } from './assets/js/locale/locale';
import { appStore } from '@/store/app';
import {take} from "rxjs/operators";

const applyAlphaColor = (alpha: number) => {
  Color.applyApha(getThemeColors(), alpha);
};

const loadMenuAndUserSettings = (companyId) => {
  menuStore.sysGetRoledMenuPathListByUserId();
  menuStore.menuPaths$.pipe(take(1)).subscribe(
    (_) => {
      appStore.sysGetUserInfoById();
      appStore.getUserSettings(companyId);

      // load last menu
      appStore.org$.subscribe((org) => {
        if (org) {
          menuStore.sysGetRoledMenuListByUserIdAndDepId(org.departmentId);
        }
      });

      // load last theme
      appStore.theme$.subscribe((theme: any) => {
        if (theme) {
          new App({
            target: document.body,
          });

          document.querySelector('body')!.classList.add(theme.theme);
          applyAlphaColor(theme.alpha);
        }
      });
    },
    (error) => {
      Debug.errorSection('Main App - menuStore.sysGetRoledMenuPathListByUserId', error);
    }
  );
};

const startApp = () => {
  const companyId = UrlUtil.getCompanyId();
  const locale = UrlUtil.getLanguage();
  if (!companyId) {
    logout(API.HOST_URL);
  }
  sysGetLocaleResourceListByCompanyIdAndLocale(companyId, locale)
    .then((_: any) => {
      // get token from uri and set token for request header
      const href = window.location.href.replace('#', '');
      const url = new URL(href);
      let sessionId = url.searchParams.get('sessionId') || '';

      sessionId = decodeURIComponent(sessionId).replace(/\r\n/g, '');

      if (sessionId !== '' && sessionId.includes(getBrowserID())) {
        setHeader(sessionId, url.searchParams.get('userId'));

        localStorage.setItem('userId', url.searchParams.get('userId') || '');
        localStorage.setItem('localeLanguage', locale);
        if (companyId!.includes('/')) {
          localStorage.setItem('companyId', companyId!.split('/')[0]);
        } else {
          localStorage.setItem('companyId', companyId!);
        }

        loginSuccess(sessionId);
        loadMenuAndUserSettings(companyId);
      } else {
        let savedToken = localStorage.getItem(Token.TOKEN_KEY);
        if (savedToken && savedToken.includes(getBrowserID())) {
          setHeader(localStorage.getItem(Token.TOKEN_KEY)!, localStorage.getItem('userId'));
          loginSuccess(localStorage.getItem(Token.TOKEN_KEY)!);
          loadMenuAndUserSettings(companyId);
        } else {
          logout(API.HOST_URL);
        }
      }
    })
    .catch((error: any) => {
      Debug.error('Load resource error. Exit app');
    });
};

startApp();
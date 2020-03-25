// @ts-ignore
import { Http } from '@/assets/js/http';

let I18N: any[] = [];

const TYPE_GROUPS = [
  'IMG',
  'TABLE',
  'LINK',
  'INFO',
  'WARN',
  'REPORT',
  'ERROR',
  'LABEL',
  'TITLE',
  'BUTTON',
  'TAB',
  'MENU',
  'MSG',
  'COLOR',
];

export const IMG: any = {};
TYPE_GROUPS.map((item: any) => {
  IMG[item] = {};
});

export const EMR: any = {};
TYPE_GROUPS.map((item: any) => {
  EMR[item] = {};
});

export const INV: any = {};
TYPE_GROUPS.map((item: any) => {
  INV[item] = {};
});

export const ACC: any = {};
TYPE_GROUPS.map((item: any) => {
  ACC[item] = {};
});

export const COMMON: any = {};
TYPE_GROUPS.map((item: any) => {
  COMMON[item] = {};
});

export const SYS: any = {};
TYPE_GROUPS.map((item: any) => {
  SYS[item] = {};
});

const CATEGORIES_MAP = new Map([
  ['IMG', IMG],
  ['EMR', EMR],
  ['INV', INV],
  ['ACC', ACC],
  ['SYS', SYS],
  ['COMMON', COMMON],
]);

export const convertLocaleResource = function() {
  for (let i = 0; i < I18N.length; i++) {
    if (I18N[i].category && CATEGORIES_MAP.has(I18N[i].category)) {
      initCategoryHelper(i, CATEGORIES_MAP.get(I18N[i].category));
    }
  }
};

function initCategoryTypeGroupHelper(i: number, categoryTypeGroup: any) {
  const key = I18N[i].key;
  if (key) {
    categoryTypeGroup[key] = I18N[i].value;
  }
}

function initCategoryHelper(i: number, category: any) {
  if (I18N[i].typeGroup && TYPE_GROUPS.find((item: any) => item === I18N[i].typeGroup)) {
    initCategoryTypeGroupHelper(i, category[I18N[i].typeGroup]);
  }
}

export const sysGetLocaleResourceListByCompanyIdAndLocale = (companyId: any, locale: string) => {
  const BASE_URL = 'sys/locale-resource/';
  return new Promise((resolve, reject) => {
    Http.get(`${BASE_URL}sys-get-locale-resource-list-by-company-id-and-locale`, {
      companyId,
      locale,
      includeDeleted: false,
      includeDisabled: false,
    })
      .then((res) => {
        I18N = res;
        convertLocaleResource();
        resolve(res);
      })
      .catch((error) => reject(error));
  });
};

const capitalize = (s: string) => {
  if (typeof s !== 'string' || s.length === 0) {
    return '';
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const defaultValue = (key: string) => {
  return key
    .split('_')
    .map((word: string) => {
      return capitalize(word.toLowerCase());
    })
    .join(' ');
};

export const T = (fullKey: string) => {
  if (fullKey.includes('.') && !fullKey.includes(' ')) {
    const split = fullKey.split('.');
    if (split.length === 3) {
      const [cate, type, key] = split;
      return CATEGORIES_MAP.get(cate)[type][key] || `#${defaultValue(key)}`;
    } else {
      return 'Invalid Key Format';
    }
  } else if (fullKey.includes(' ')) {
    return fullKey;
  } else {
    return COMMON.MSG[fullKey] || `#${fullKey}`;
  }
};

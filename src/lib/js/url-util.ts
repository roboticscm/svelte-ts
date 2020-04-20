import { StringUtil } from './string-util';

export class UrlUtil {
  public static getLanguage(): string {
    let href = new URL((window as any).location.href);
    let localeLanguage = href.searchParams.get('localeLanguage');
    if (!localeLanguage) {
      return localStorage.getItem('localeLanguage') || 'vi-VN';
    } else {
      return localeLanguage;
    }
  }

  public static getCompanyId(): string | null {
    let href = new URL((window as any).location.href);
    let companyId = href.searchParams.get('companyId');
    if (!companyId) {
      return localStorage.getItem('companyId');
    } else {
      return companyId;
    }
  }

  public static getMenuPathFromUrl() {
    let hash = (window as any).location.hash;
    if (hash.includes('#/')) {
      return hash.replace('#/', '');
    }
    return null;
  }

  public static convertToSnackCase(source: string) {
    return StringUtil.toSnackCase(source, '-');
  }

  public static updateUrlHash(menuPath: string) {
    let href = new URL((window as any).location.href);
    href.hash = '#/' + menuPath;
    (window as any).location = href.toString();
  }
}

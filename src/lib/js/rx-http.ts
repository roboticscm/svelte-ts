// @ts-ignore
import Axios from 'axios-observable';
import { API } from './constants';
import { SJSON } from '@/lib/js/sjson';

// @ts-ignore
import { Method } from 'axios';
// @ts-ignore
const JSONbig = require('json-bigint');

export class RxHttp {
  public static callApi(method: Method, url: string, params: any, jsonData: any) {
    let fullUrl: string | null = null;
    if (params) {
      fullUrl = `${API.BASE_URL}${url}${RxHttp.paramParser(params)}`;
    } else {
      fullUrl = `${API.BASE_URL}${url}`;
    }
    return Axios.request({
      url: fullUrl,
      method,
      data: jsonData,
      transformResponse: (res: any) => {
        if (res.includes('{') || res.includes('[')) {
          return SJSON.parse(res);
        } else {
          return res;
        }
      },
    });
  }

  public static get(url: string, params: any = null) {
    return RxHttp.callApi('get', url, params, null);
  }

  public static post(url: string, jsonData: string) {
    return RxHttp.callApi('post', url, null, jsonData);
  }

  public static delete(url: string, params: any = null) {
    return RxHttp.callApi('delete', url, params, null);
  }

  private static paramParser(paramObj: any) {
    if (!paramObj) {
      return '';
    }

    let paramsString = '?';
    for (let key in paramObj) {
      paramsString += `${key}=${encodeURIComponent(paramObj[key])}&`;
    }
    // remove last &
    return paramsString.substring(0, paramsString.length - 1);
  }
}

// @ts-ignore
const axios = require('axios');
import { API } from './constants';
// @ts-ignore
const JSONbig = require('json-bigint');

export class Http {
  public static async callApi(method: string, url: string, params: any, jsonData: any) {
    let fullUrl: string | null = null;
    if (params) {
      fullUrl = `${API.BASE_URL}${url}${Http.paramParser(params)}`;
    } else {
      fullUrl = `${API.BASE_URL}${url}`;
    }

    return new Promise<any>((resolve, reject) => {
      axios({
        url: fullUrl,
        method: method,
        data: jsonData,
        transformResponse: (res: any) => {
          if (res.includes('{') || res.includes('[')) {
            return JSONbig.parse(res);
          } else {
            return res;
          }
        },
      })
        .then((res: any) => {
          resolve(res.data);
        })
        .catch((error: any) => {
          console.error(error);
          if (error.response) {
            reject(error.response.data);
          } else {
            reject(error);
          }
        });
    });
  }

  public static async get(url: string, params: any = null) {
    return Http.callApi('get', url, params, null);
  }

  public static async post(url: string, jsonData: string) {
    return Http.callApi('post', url, null, jsonData);
  }

  public static async delete(url: string, params: any = null) {
    return Http.callApi('delete', url, params, null);
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

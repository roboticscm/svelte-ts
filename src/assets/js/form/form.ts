import Errors from './errors';
// @ts-ignore
import axios from 'axios';
import { API } from '../constants';
// @ts-ignore
const JSONbig = require('json-bigint');

export default class Form {
  originalData: any;
  public errors: Errors;
  autoReset: boolean;

  constructor(data: any, autoReset = true) {
    this.originalData = data;
    for (let field in data) {
      this[field] = data[field];
    }
    this.errors = new Errors();
    this.autoReset = autoReset;
  }

  data() {
    let data = {};
    for (let property in this.originalData) {
      data[property] = this[property];
    }
    return data;
  }

  reset() {
    if (this.autoReset) {
      for (let field in this.originalData) {
        if (typeof this[field] === 'number') {
          if (field === 'id') {
            this[field] = null;
          } else {
            this[field] = 0;
          }
        } else {
          this[field] = '';
        }
      }
    }
    this.errors.clearAll();
  }

  post(url: string) {
    return this.submit('post', url);
  }

  put(url: string) {
    return this.submit('put', url);
  }

  patch(url: string) {
    return this.submit('patch', url);
  }

  delete(url: string) {
    return this.submit('delete', url);
  }

  submit(requestType: string, url: string) {
    return new Promise((resolve, reject) => {
      axios[requestType](`${API.BASE_URL}${url}`, JSONbig.stringify(this.data()), {
        transformResponse: (res: any) => {
          if (res.includes('{') || res.includes('[')) {
            return JSONbig.parse(res);
          } else {
            return res;
          }
        },
      })
        .then((res: any) => {
          this.onSuccess(res.data);
          resolve(res.data);
        })
        .catch((error: any) => {
          this.onFail(error.response.data);
          reject(error.response.data);
        });
    });
  }

  onSuccess(data: any) {
    this.reset();
  }
  onFail(errors: Errors) {
    this.errors.record(errors);
  }
}

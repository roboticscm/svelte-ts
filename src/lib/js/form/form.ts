import { Errors } from './errors';
// @ts-ignore
import axios, { Method } from 'axios';
import { API } from '../constants';
import { RxHttp } from '@/lib/js/rx-http';
import { SJSON } from '@/lib/js/sjson';

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

  submit(requestType: Method, url: string) {
    return RxHttp.callApi(requestType, url, undefined, SJSON.stringify(this.data()));
  }

  recordErrors(errors: Errors) {
    this.errors.record(errors);
    return this.errors.errors;
  }
}

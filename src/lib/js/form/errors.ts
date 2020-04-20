import { Debug } from '../debug';
// @ts-ignore
import { T } from '@/lib/js/locale/locale';

export class Errors {
  public errors: any;
  constructor() {
    this.errors = {};
  }

  has(field: any) {
    return this.errors.hasOwnProperty(field);
  }

  any() {
    return Object.keys(this.errors).length > 0;
  }

  get(field: any) {
    if (this.errors[field]) {
      return `${T(this.errors[field])}`;
    } else {
      return '';
    }
  }

  record(errors: any) {
    this.errors = errors;
    // focus on first element raised error
    let firstError = Object.keys(this.errors)[0];
    if (firstError) {
      const el = document.getElementsByName(firstError)[0];
      if (el) {
        el.focus();
      } else {
        Debug.error(`Can not find element with id: ${firstError}`);
      }
    }
  }

  clear(field: any) {
    if (field) {
      delete this.errors[field];
      return;
    }

    this.errors = {};
  }

  clearAll() {
    this.errors = {};
  }
}

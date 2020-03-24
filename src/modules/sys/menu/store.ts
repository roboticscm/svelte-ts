import { RxHttp } from '@/assets/js/rx-http';
import { Http } from '@/assets/js/http';
import { BehaviorSubject } from 'rxjs';
import {skip, take} from 'rxjs/operators';
import {HistoryMenu, RoleMenu} from './model';
import { getMethodNameInSnackCase } from '@/assets/js/util';
import { Debug } from '@/assets/js/debug';
import {appStore} from "@/store/app";
// @ts-ignore
const JSONbig = require('json-bigint');

const BASE_URL = 'sys/menu/';
class MenuStore {

}
export const menuStore = new MenuStore();


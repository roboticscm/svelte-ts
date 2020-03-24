import { RxHttp } from '@/assets/js/rx-http';
import { Http } from '@/assets/js/http';
import { BehaviorSubject } from 'rxjs';
import {skip, take} from 'rxjs/operators';
import {HistoryMenu, RoleMenu} from '@/modules/sys/menu/model';
import { getMethodNameInSnackCase } from '@/assets/js/util';
import { Debug } from '@/assets/js/debug';
// @ts-ignore
const JSONbig = require('json-bigint');

const BASE_URL = 'sys/menu/';
class MenuStore {
    menuPaths$ = new BehaviorSubject<string[]>([]);
    dataList$ = new BehaviorSubject<RoleMenu[]>([]);
    selectedData$ = new BehaviorSubject<RoleMenu>(null);
    selectedData: RoleMenu = null;

    sysGetRoledMenuPathListByUserId() {
        RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
            includeDeleted: false,
            includeDisabled: false
        }).pipe(take(1)).subscribe(
            (res: any) => {
                this.menuPaths$.next(res.data.map((it: RoleMenu) => it.path));
            },
            (error) => Debug.errorSection('MenuStore - sysGetRoledMenuPathListByUserId', error)
        );
    }

    sysGetRoledMenuListByUserIdAndDepId(depId: any) {
        RxHttp.get(`${BASE_URL}${getMethodNameInSnackCase()}`, {
            depId,
            includeDeleted: false,
            includeDisabled: false
        }).subscribe(
            (res: any) => {
                this.dataList$.next(res.data);
                if (res.data.length > 0) {
                    this.selectedData = res.data[0];
                    this.selectedData$.next(res.data[0]);
                }
            },
            (error) => Debug.errorSection('MenuStore - sysGetRoledMenuListByUserIdAndDepId', error)
        );
    }

    setSelectedData (menuPath: string) {
        const path = menuPath.startsWith('/') ? menuPath.slice(1) : menuPath;
        this.dataList$.pipe(take(1)).subscribe((data: RoleMenu[]) => {
            const item = data.find((it) => it.path === path);
            if (item) {
                this.selectedData =item;
                this.selectedData$.next(item);
            }
        })
    }
}
export const menuStore = new MenuStore();

const BASE_URL_HISTORY = 'sys/menu-history/';
class HistoryMenuStore {
    saveOrUpdate(obj: HistoryMenu) {
        return Http.post(`${BASE_URL_HISTORY}${getMethodNameInSnackCase()}`, JSONbig.stringify(obj));
    }
}
export const historyMenuStore = new HistoryMenuStore();
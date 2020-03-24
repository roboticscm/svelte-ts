import {menuStore} from "@/store/menu";
import {T} from '@/assets/js/locale/locale';
import {StringUtil} from "@/assets/js/string-util";

export class ViewStore {
    constructor (public menuPath: string) {
    }

    getViewTitle = () => {
        return T(`COMMON.MENU.${menuStore.selectedData && menuStore.selectedData.menuName}`)
    }

    getViewName = () => {
        return StringUtil.toTitleCase(menuStore.selectedData && menuStore.selectedData.menuName);
    }

    getMenu = () => {
        return menuStore.selectedData
    }
}


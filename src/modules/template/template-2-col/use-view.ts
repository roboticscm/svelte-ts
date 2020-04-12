import { ViewStore } from '@/store/view';
import Form from '@/assets/js/form/form';
import { tick } from 'svelte';
import { fromEvent } from 'rxjs';
import { concatMap, filter, map, tap } from 'rxjs/operators';

export const useView = (view: ViewStore) => {
  const registerShortcutKey = () => {
    const controlS$ = fromEvent(document, 'keydown').pipe(
      // concatMap(() => view.isReadOnlyMode$),
      tap(console.log),
      filter((e: any) => {
        if (e.keyCode == 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
          e.preventDefault();
          // @ts-ignore
          // if (true) {
          //     return true;
          // } else {
          //     return false;
          // }
          return false;
        } else {
          return false;
        }
      }),
    );
    return controlS$;
  };
  return {
    registerShortcutKey,
  };
};

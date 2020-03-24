import { writable } from 'svelte/store';

export function createLanguageStore(initValue: any) {
  const { subscribe, update, set } = writable(initValue);

  const updateStore = () => {
    update(() => {
      initValue.point++;
      return initValue;
    });
  };

  return {
    updateStore,
    subscribe,
    update,
    set
  };
}

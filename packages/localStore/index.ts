import { StoreManager, Watcher } from "@reffect/core";

export const localstore = <Store extends object>(storeManager: StoreManager<Store>) => {
  const localStorageKey = `@reffect/store/${storeManager.name}`;
  const localStorageValue = localStorage.getItem(localStorageKey);
  if (localStorageValue !== null) {
    storeManager.initialState = JSON.parse(localStorageValue);
  }

  let lastStateSnapshot: object = {};
  let localStorageUpdateTimer: any = null;

  const watcher: Watcher<Store> = (partialUpdate, prevState, curState) => {
    clearTimeout(localStorageUpdateTimer);

    Object.assign(lastStateSnapshot, { ...curState, ...(partialUpdate || {}) });

    localStorageUpdateTimer = setTimeout(() => {
      localStorage.setItem(localStorageKey, JSON.stringify(lastStateSnapshot));
    }, 144);
  };

  storeManager.watch(watcher);
  return storeManager;
};

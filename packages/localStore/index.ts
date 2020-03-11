import { StoreManager, Watcher, Middleware } from "@reffect/core";

export const localstore: Middleware<any> = <Store extends object>(
  storeManager: StoreManager<Store>
) => {
  const localStorageKey = `@reffect/store/${storeManager.name}`;
  const localStorageValue = localStorage.getItem(localStorageKey);
  if (localStorageValue !== null) {
    storeManager.initialState = JSON.parse(localStorageValue);
  }

  const watcher: Watcher<Store> = (partialUpdate, prevState, curState) => {
    localStorage.setItem(
      localStorageKey,
      JSON.stringify({ ...curState, ...(partialUpdate || {}) })
    );
  };

  storeManager.watch(watcher);
  return storeManager;
};

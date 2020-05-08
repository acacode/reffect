import { StoreSubscriber, StoreType, StoreManager } from "@reffect/core";

export const localstore = <Store extends StoreType>(
  storeManager: StoreManager<Store>,
  store: Store,
  copy: (obj: object) => object,
) => {
  if (storeManager.name === "unknown") {
    throw `store should have unique name to use localstore middleware`;
  }

  const localStorageKey = `@reffect/store/${storeManager.name}`;
  const localStorageValue = localStorage.getItem(localStorageKey);

  if (localStorageValue !== null) {
    const parsed = JSON.parse(localStorageValue);
    storeManager.initialState = copy(parsed);
    Object.assign(store, parsed);
  }

  let localStorageUpdateTimer: any = null;

  const subscriber: StoreSubscriber<StoreType> = (partialUpdate, prevState, curState) => {
    clearTimeout(localStorageUpdateTimer);

    localStorageUpdateTimer = setTimeout(() => {
      localStorage.setItem(localStorageKey, JSON.stringify({ ...curState }));
    }, 144);
  };

  storeManager.subscribe(subscriber);

  return storeManager;
};

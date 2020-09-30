import { StoreSubscriber, StateType, Store } from "@reffect/core";

export const localstore = <State extends StateType>(store: Store<State>) => {
  if (store.name === "unknown") {
    throw `store should have unique name to use localstore middleware`;
  }

  const localStorageKey = `@reffect/store/${store.name}`;
  const localStorageValue = localStorage.getItem(localStorageKey);

  if (localStorageValue !== null) {
    const parsed = JSON.parse(localStorageValue);
    store.replace(parsed);
  }

  let localStorageUpdateTimer: any = null;

  const subscriber: StoreSubscriber<State> = nextState => {
    clearTimeout(localStorageUpdateTimer);

    // TODO: find way to configure this
    localStorageUpdateTimer = setTimeout(() => {
      localStorage.setItem(localStorageKey, JSON.stringify(nextState));
    }, 144);
  };

  store.subscribe(subscriber);

  return store;
};

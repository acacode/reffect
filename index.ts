type Action<A extends unknown[], R> = (...a: A) => R;
type SimpleAction<V, R> = (value: V) => R;
type Watcher<Store> = (partialUpdate: Partial<Store>) => void;
type StoreManager<Store> = {
  initialState: Store;
  partialUpdate: (store: Partial<Store>) => void;
  storeId: Symbol;
  watch: (watcher: Watcher<Store>) => void;
  unwatch: (watcher: Watcher<Store>) => void;
  snapshot: () => Store;
};
type Middleware<Store> = (
  storeManager: StoreManager<Store>,
  initialState: Store
) => void;

const createUid = () => Symbol("store_id");

const storeManagerKey = createUid();

export const getStoreManager = <Store>(store: Store): StoreManager<Store> =>
  store[storeManagerKey];

export const createStore = <Store>(
  initialState: Store,
  middlewares?: Middleware<Store>[]
): Store => {
  const watchers: Watcher<Store>[] = [];

  const storeManager: StoreManager<Store> = {
    initialState: { ...initialState },
    storeId: createUid(),
    partialUpdate: (storeUpdate: Partial<Store>) => {
      Object.assign(store, storeUpdate);
      watchers.forEach(watcher => watcher(storeUpdate));
    },
    watch: watcher => watchers.push(watcher),
    unwatch: watcher => {
      const index = watchers.indexOf(watcher);
      watchers[index] && watchers.splice(index, 1);
    },
    snapshot: () => ({ ...store })
  };

  (middlewares || []).forEach(middleware =>
    middleware(storeManager, initialState)
  );

  const store = Object.create({
    [storeManagerKey]: storeManager
  });

  return Object.assign(store, { ...initialState });
};

type StoreUpdate<Store, T> = keyof Partial<Store> extends keyof T
  ? T
  : Pick<Partial<Store>, keyof Store>;

export const action = <
  Store,
  A extends unknown[],
  T extends Promise<Partial<Store>> | Partial<Store>
>(
  store: Store,
  action: Action<
    A,
    T extends Promise<infer P>
      ? Promise<StoreUpdate<Store, P>>
      : StoreUpdate<Store, T>
  >
): Action<A, T> => {
  const { partialUpdate } = getStoreManager(store);

  return (...args: A): T => {
    const returnValue = action(...args) as T;

    if (returnValue instanceof Promise) {
      returnValue.then(value => {
        partialUpdate(value);
        return value;
      });
    } else {
      partialUpdate(returnValue as Partial<Store>);
    }

    return returnValue;
  };
};

export const simpleAction = <Store, K extends keyof Store>(
  store: Store,
  updateProperty: K
): SimpleAction<Store[K], Pick<Partial<Store>, K>> =>
  action(
    store,
    (value: Store[K]) =>
      ({
        [updateProperty]: value
      } as any)
  );

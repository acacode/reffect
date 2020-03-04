type AsyncUpdateOr<Store, T, OrCase> =
  T extends Promise<infer B> ?
    (keyof B extends keyof Store ? Promise<B> : Partial<Store>) :
    OrCase
type Action<A extends any[], R> = (...a: A) => R
type SimpleAction<K extends string, R> = (key: K) => R
type ActionReturnType<Store extends any> = Promise<Partial<Store>> | Partial<Store>
type Watcher<Store = any> = (partialUpdate: Partial<Store>) => void;
type StoreManager<Store = any> = {
  initialState: Store,
  partialUpdate: (store: Partial<Store>) => void;
  storeId: Symbol;
  watch: (watcher: Watcher<Store>) => void;
  unwatch: (watcher: Watcher<Store>) => void;
  snapshot: () => Store;
}
type Middleware<Store = any> = (storeManager: StoreManager<Store>, initialState: Store) => void;


const createUid = () => Symbol("store_id");

const storeManagerKey = createUid()

export const getStoreManager = <Store = any>(store: Store): StoreManager<Store> =>
  store[storeManagerKey]

export const createStore = <Store>(initialState: Store, middlewares?: Middleware[]): Store => {
  const watchers: Watcher<Store>[] = [];

  const storeManager: StoreManager<Store> = {
    initialState: { ...initialState },
    storeId: createUid(),
    partialUpdate: (storeUpdate: Partial<Store>) => {
      Object.assign(store, storeUpdate);
      watchers.forEach(watcher => watcher(storeUpdate))
    },
    watch: watcher => watchers.push(watcher),
    unwatch: watcher => {
      const index = watchers.indexOf(watcher);
      watchers[index] && watchers.splice(index, 1);
    },
    snapshot: () => ({ ...store })
  };

  (middlewares || []).forEach(middleware => middleware(storeManager, initialState));

  const store = Object.create({
    [storeManagerKey]: storeManager
  })

  return Object.assign(store, { ...initialState });
}

export const action = <
  Store extends any,
  A extends any[],
  T extends ActionReturnType<Store>,
>(
  store: Store,
  action: Action<A, AsyncUpdateOr<Store, T, T>>
): Action<A, T> => {
  const bindAction = action.bind(null);
  const storeManager = getStoreManager(store)

  const overrided = (...args: A) => {
    const returnValue = bindAction(...args)

    if (returnValue instanceof Promise) {
      returnValue.then(value => {
        storeManager.partialUpdate(value)
        return value;
      })
    } else {
      storeManager.partialUpdate(returnValue)
    }

    return returnValue;
  }

  return overrided as Action<A, T>;
}

export const simpleAction = <
  Store extends any,
  K extends keyof Store,
  T extends ActionReturnType<Store>,
>(
  store: Store,
  updateProperty: K
): SimpleAction<Store[K], T> =>
  action(store, (value: Store[K]) => ({ [updateProperty]: value }) as any)
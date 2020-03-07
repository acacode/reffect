type Action<A extends unknown[], R> = (...a: A) => R;
type Watcher<Store> = (partialUpdate: Partial<Store>) => void;
type StoreManager<Store> = {
  initialState: Partial<Store>;
  partialUpdate: (store: Partial<Store>) => void;
  storeId: Symbol;
  watch: (watcher: Watcher<Store>) => void;
  unwatch: (watcher: Watcher<Store>) => void;
};
type Middleware<Store> = (
  storeManager: StoreManager<Store>,
  initialState: Partial<Store>
) => void;
type StoreUpdate<Store, T> = Exclude<keyof T, keyof Store> extends never
  ? keyof T extends never
    ? Partial<Store>
    : T extends Partial<Store>
    ? Partial<Store>
    : T
  : never;

type UnknownArgs = unknown[] | [];

const createUid = () => Symbol("store_id");

const storeManagerKey = createUid();

export const getStoreManager = <Store>(store: Store): StoreManager<Store> => {
  if (!store[storeManagerKey]) throw new Error("Received wrong store");

  return store[storeManagerKey];
};

export const createStore = <Store>(
  initialState: Partial<Store>,
  middlewares?: Middleware<Store>[]
): Store => {
  const watchers: Watcher<Store>[] = [];

  const storeManager: StoreManager<Store> = {
    initialState: { ...initialState },
    storeId: createUid(),
    partialUpdate: (storeUpdate: Partial<Store>) => {
      if (storeUpdate) {
        Object.assign(store, storeUpdate);
        watchers.forEach(watcher => watcher(storeUpdate));
      }
    },
    watch: watcher => watchers.push(watcher),
    unwatch: watcher => {
      const index = watchers.indexOf(watcher);
      watchers[index] && watchers.splice(index, 1);
    }
  };

  (middlewares || []).forEach(middleware =>
    middleware(storeManager, initialState)
  );

  const store = Object.create({
    [storeManagerKey]: storeManager
  });

  return Object.assign(store, { ...initialState });
};

/**
 * **Simple action**
 * Action which allows to update store without any other manipulations
 *
 * @example
 * const updateApples = action(store)
 * updateApples({
 *  apples: [1,2,3,4],
 *  someOtherStoreKey: 22,
 * })
 */
export function action<
  Store extends object,
  D extends Partial<Store> = Partial<Store>
>(store: Store): Action<[D], D>;

/**
 * **Property action**
 * Action which update store property
 *
 * @example
 * const updateApples = action(store, "apples")
 * updateApples([1,2,3,4])
 */
export function action<
  Store extends object,
  P extends keyof Store = keyof Store
>(store: Store, property: P): Action<[Store[P]], void>;

/**
 * **Standard action**
 * Synchronous store update
 *
 * @example
 * const updateApples = action(store, apples => ({ apples })
 * updateApples([1,2,3,4])
 */
export function action<
  Store extends object,
  Input extends UnknownArgs = UnknownArgs,
  Update extends Partial<Store> = Partial<Store>
>(
  store: Store,
  action: Action<Input, StoreUpdate<Store, Update> | void>
): Action<Input, void>;

/**
 * **Async action**
 * Asynchronous store update
 *
 * @example
 * const updateApples = action(store, async apples => {
 *  const responseApples = await api.updateApples(apples)
 *
 *  return {
 *    apples: responseApples
 *  }
 * })
 * updateApples([1,2,3,4])
 */
export function action<
  Store extends object,
  Input extends UnknownArgs = UnknownArgs,
  Update extends Partial<Store> = Partial<Store>
>(
  store: Store,
  asyncAction: Action<Input, Promise<StoreUpdate<Store, Update> | void>>
): Action<Input, Promise<void>>;

export function action<Store extends object>(
  store: Store,
  param: any = null
): any {
  const { partialUpdate } = getStoreManager(store);

  return <A extends UnknownArgs>(...args: A): any => {
    let update: any = void 0;

    if (args.length === 1 && !param && typeof args[0] === "object") {
      update = args[0];
    } else if (args.length === 1 && store.hasOwnProperty(param)) {
      update = { [param]: args[0] };
    } else {
      update = param(...args);
    }

    if (update instanceof Promise) {
      return update.then(value => {
        partialUpdate(value);
      });
    } else {
      partialUpdate(update as Partial<Store>);
    }
  };
}

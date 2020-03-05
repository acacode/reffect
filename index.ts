type Action<A extends unknown[], R> = (...a: A) => R;
type Watcher<Store> = (partialUpdate: Partial<Store>) => void;
type StoreManager<Store> = {
  initialState: Store;
  partialUpdate: (store: Partial<Store>) => void;
  storeId: Symbol;
  watch: (watcher: Watcher<Store>) => void;
  unwatch: (watcher: Watcher<Store>) => void;
};
type Middleware<Store> = (
  storeManager: StoreManager<Store>,
  initialState: Store
) => void;
type StoreUpdate<Store, T> = Exclude<keyof T, keyof Store> extends never
  ? T extends Partial<Store>
    ? Partial<Store>
    : T
  : never;
type ActionReturn<Store, T> = Exclude<keyof T, keyof Store> extends never
  ? T
  : never;

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
 * Standard action
 */
export function action<
  Store extends object,
  Input extends unknown[] | [],
  Update extends Partial<Store>
>(
  store: Store,
  action: Action<Input, StoreUpdate<Store, Update>>
): Action<Input, ActionReturn<Store, Update>>;
/**
 * Async action
 */
export function action<
  Store extends object,
  Input extends unknown[] | [],
  Update extends Partial<Store>
>(
  store: Store,
  asyncAction: Action<Input, Promise<StoreUpdate<Store, Update>>>
): Action<Input, Promise<ActionReturn<Store, Update>>>;
/**
 * Property action
 */
export function action<Store extends object, P extends keyof Store>(
  store: Store,
  property: P
): Action<[Store[P]], Pick<Store, P>>;
/**
 * Simple action
 */
export function action<Store extends object, D = Partial<Store>>(
  store: Store
): Action<[D], D>;
export function action<Store extends object>(
  store: Store,
  param: any = null
): any {
  const { partialUpdate } = getStoreManager(store);

  return <InnerArgs extends unknown[] | [], InnerReturnType>(
    ...args: InnerArgs
  ): InnerReturnType => {
    let patch: any = void 0;

    if (args.length === 1 && !param && typeof args[0] === "object") {
      patch = args[0];
    } else if (args.length === 1 && store.hasOwnProperty(param)) {
      patch = { [param]: args[0] };
    } else {
      patch = param(...args);
    }

    if (patch instanceof Promise) {
      patch.then(value => {
        partialUpdate(value);
        return value;
      });
    } else {
      partialUpdate(patch as Partial<Store>);
    }

    return patch;
  };
}

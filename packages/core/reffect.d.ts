declare type Action<A extends unknown[], R> = (...a: A) => R;
declare type Subscriber<Store> = (partialUpdate: Partial<Store>, prevState: Store, curState: Store) => void;
declare type StoreManager<Store> = {
  name: string;
  initialState: Partial<Store>;
  partialUpdate: (store: Partial<Store>) => void;
  storeId: Symbol;
  subscribe: (subscriber: Subscriber<Store>) => void;
  unsubscribe: (subscriber: Subscriber<Store>) => void;
};
declare type EffectManager = {
  state: EffectState | null;
  subscribe: (subscriber: (state: EffectState) => void) => void;
  unsubscribe: (subscriber: (state: EffectState) => void) => void;
};
declare type Middleware<Store extends object> = (
  storeManager: StoreManager<Store>,
  initialState: Partial<Store>,
) => StoreManager<Store>;
declare type StoreUpdate<Store, T> = Exclude<keyof T, keyof Store> extends never
  ? keyof T extends never
    ? Partial<Store>
    : T extends Partial<Store>
    ? Partial<Store>
    : T
  : never;
declare const enum EffectState {
  Pending = "pending",
  Done = "done",
  Fail = "fail",
}
declare type UnknownArgs = unknown[] | [];
declare function getManager<ManagingValue extends object | Action<unknown[], unknown>>(
  value: ManagingValue,
): ManagingValue extends Action<unknown[], unknown> ? EffectManager : StoreManager<ManagingValue>;
declare function createStore<Store extends object>(
  initialState?: Partial<Store>,
  middlewares?: Middleware<Store>[],
): Store;
declare function createStore<Store extends object>(
  storeName?: string,
  initialState?: Partial<Store>,
  middlewares?: Middleware<Store>[],
): Store;
declare function createStore<Store extends object>(
  initialState?: Partial<Store>,
  storeName?: string,
  middlewares?: Middleware<Store>[],
): Store;
/**
 * **Simple effect**
 * Action which allows to update store without any other manipulations
 *
 * @example
 * const updateApples = effect(store)
 * updateApples({
 *  apples: [1,2,3,4],
 *  someOtherStoreKey: 22,
 * })
 */
declare function effect<Store extends object, Update extends Partial<Store> = Partial<Store>>(
  store: Store,
): Action<[Update], void>;
/**
 * **Property effect**
 * Action which update store property
 *
 * @example
 * const updateApples = effect(store, "apples")
 * updateApples([1,2,3,4])
 */
declare function effect<Store extends object, P extends keyof Store = keyof Store>(
  store: Store,
  property: P,
): Action<[Store[P]], void>;
/**
 * **Standard effect**
 * Synchronous store update
 *
 * @example
 * const updateApples = effect(store, apples => ({ apples })
 * updateApples([1,2,3,4])
 */
declare function effect<
  Store extends object,
  InputArgs extends UnknownArgs = UnknownArgs,
  Update extends Partial<Store> = Partial<Store>
>(store: Store, effect: Action<InputArgs, StoreUpdate<Store, Update> | void>): Action<InputArgs, void>;
/**
 * **Async effect**
 * Asynchronous store update
 *
 * @example
 * const updateApples = effect(store, async apples => {
 *  const responseApples = await api.updateApples(apples)
 *
 *  return {
 *    apples: responseApples
 *  }
 * })
 * updateApples([1,2,3,4])
 */
declare function effect<
  Store extends object,
  InputArgs extends UnknownArgs = UnknownArgs,
  Update extends Partial<Store> = Partial<Store>
>(
  store: Store,
  asyncAction: Action<InputArgs, Promise<StoreUpdate<Store, Update> | void>>,
): Action<InputArgs, Promise<void>>;

export { Action, EffectManager, EffectState, Middleware, StoreManager, Subscriber, createStore, effect, getManager };

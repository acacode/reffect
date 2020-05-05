import { createPubSub, copy } from "./utils";
import { reffectKey } from "./manage";

export type StoreType = object;
export type StoreSubscriber<Store> = (partialUpdate: Partial<Store>, previousState: Store, currentState: Store) => void;
export type StoreManager<Store extends StoreType> = {
  name: string;
  initialState: Partial<Store>;
  partialUpdate: (store: Partial<Store>) => void;
  storeId: Symbol;
  subscribe: (subscriber: StoreSubscriber<Store>) => () => void;
};

/**
 * middleware function type
 */
export type StoreMiddleware<Store extends StoreType> = (
  storeManager: StoreManager<Store>,
  initialState: Partial<Store>,
) => StoreManager<Store>;

/**
 * Create a store
 *
 * @param initialState partial store initial state
 * @param middlewares list of middlewares (functions)
 *
 * @example
 * store({ foo: "bar" }, [middleware1, middleware2])
 */
export function store<Store extends StoreType>(
  initialState?: Partial<Store>,
  middlewares?: StoreMiddleware<Store>[],
): Store;
/**
 * Create a store
 *
 * @param storeName name of store
 * @param initialState partial store initial state
 * @param middlewares list of middlewares (functions)
 *
 * @example
 * store("store-name", { foo: "bar" }, [middleware1, middleware2])
 */
export function store<Store extends StoreType>(
  storeName?: string,
  initialState?: Partial<Store>,
  middlewares?: StoreMiddleware<Store>[],
): Store;
/**
 * Create a store
 *
 * @param initialState partial store initial state
 * @param storeName name of store
 * @param middlewares list of middlewares (functions)
 *
 * @example
 * store({ foo: "bar" }, "store-name", [middleware1, middleware2])
 */
export function store<Store extends StoreType>(
  initialState?: Partial<Store>,
  storeName?: string,
  middlewares?: StoreMiddleware<Store>[],
): Store;

export function store<Store extends StoreType>(
  param1?: any,
  param2?: any,
  middlewares?: StoreMiddleware<Store>[],
): Store {
  // defining what param is storeName and what is initialState
  const [storeName, initialState] =
    typeof param1 === "string"
      ? [param1, param2]
      : Array.isArray(param2)
      ? (middlewares = param2) && [null, param1]
      : [param2, param1];

  const [publish, subscribe] = createPubSub<StoreSubscriber<Store>, [Partial<Store>, Store, Store]>();

  const storeManager: StoreManager<Store> = {
    initialState: copy(initialState || {}),
    name: storeName || "unknown",
    storeId: Symbol("store_id"),
    // this method do update store
    partialUpdate: (storeUpdate: Partial<Store>) => {
      if (storeUpdate) {
        const prevState = copy(store);
        Object.assign(store, copy(storeUpdate));
        publish(copy(storeUpdate), prevState, copy(store));
      }
    },
    subscribe,
  };

  const store = Object.create({
    [reffectKey]: (middlewares || []).reduce(
      (storeManager, middleware) => middleware(storeManager, initialState),
      storeManager,
    ),
  });

  return Object.assign(store, copy(storeManager.initialState));
}

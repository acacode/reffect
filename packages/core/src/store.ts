import { createPubSub, copy, assign } from "./utils";
import { reffectKey } from "./manage";

export type StoreType = object;
export type StoreSubscriber<Store> = (partialUpdate: Partial<Store>, previousState: Store, currentState: Store) => void;
export type StoreManager<Store extends StoreType> = {
  name: string;
  initialState: Partial<Store>;
  state: Store;
  partialUpdate: (store: Partial<Store>) => void;
  storeId: Symbol;
  subscribe: (subscriber: StoreSubscriber<Store>) => () => void;
};

/**
 * middleware function type
 */
export type StoreMiddleware<Store extends StoreType> = (store: Store, copy: (data: object) => object) => Store;

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
      : param2 instanceof Array
      ? (middlewares = param2) && [null, param1]
      : [param2, param1];

  const [publish, subscribe] = createPubSub<StoreSubscriber<Store>>();

  const store = assign(
    Object.create({
      [reffectKey]: {
        initialState: copy(initialState || {}),
        name: storeName || "unknown",
        storeId: Symbol(),
        // this method do update store
        partialUpdate: (storeUpdate: Partial<Store>) => {
          if (storeUpdate) {
            const prevState = copy(store);
            assign(store, storeUpdate);
            publish(copy(storeUpdate), prevState, copy(store));
          }
        },
        subscribe,
      },
    }),
    initialState,
  );

  return (middlewares || []).reduce<Store>((store, middleware) => middleware(store, copy) as Store, store);
}

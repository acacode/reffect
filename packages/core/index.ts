const reffectKey = Symbol("reffect_key");

export type Action<A extends unknown[], R> = (...a: A) => R;
export type StoreSubscriber<Store> = (partialUpdate: Partial<Store>, previousState: Store, currentState: Store) => void;
export type EffectSubscriber = (state: EffectState) => void;
export type StoreManager<Store> = {
  name: string;
  initialState: Partial<Store>;
  partialUpdate: (store: Partial<Store>) => void;
  storeId: Symbol;
  subscribe: (subscriber: StoreSubscriber<Store>) => () => void;
};
export type EffectManager = {
  state: EffectState | null;
  subscribe: (subscriber: EffectSubscriber) => () => void;
};
export type StoreMiddleware<Store extends object> = (
  storeManager: StoreManager<Store>,
  initialState: Partial<Store>,
) => StoreManager<Store>;
type StoreUpdate<Store, T> = Exclude<keyof T, keyof Store> extends never
  ? keyof T extends never
    ? Partial<Store>
    : T extends Partial<Store>
    ? Partial<Store>
    : T
  : never;

export const enum EffectState {
  Pending = "pending",
  Done = "done",
  Fail = "fail",
}

type UnknownArgs = unknown[] | [];

export function manage<ManagingValue extends object | Action<unknown[], unknown>>(
  value: ManagingValue,
): ManagingValue extends Action<unknown[], unknown> ? EffectManager : StoreManager<ManagingValue> {
  if (!value || !value[reffectKey]) console.error("received wrong value", value);
  return value[reffectKey];
}

export function store<Store extends object>(
  initialState?: Partial<Store>,
  middlewares?: StoreMiddleware<Store>[],
): Store;

export function store<Store extends object>(
  storeName?: string,
  initialState?: Partial<Store>,
  middlewares?: StoreMiddleware<Store>[],
): Store;

export function store<Store extends object>(
  initialState?: Partial<Store>,
  storeName?: string,
  middlewares?: StoreMiddleware<Store>[],
): Store;

export function store<Store extends object>(param1?: any, param2?: any, middlewares?: StoreMiddleware<Store>[]): Store {
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
      (storeManager, middleware) => middleware(storeManager, param1),
      storeManager,
    ),
  });

  return Object.assign(store, copy(storeManager.initialState));
}

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
export function effect<Store extends object, Update extends Partial<Store> = Partial<Store>>(
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
export function effect<Store extends object, P extends keyof Store = keyof Store>(
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
export function effect<
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
export function effect<
  Store extends object,
  InputArgs extends UnknownArgs = UnknownArgs,
  Update extends Partial<Store> = Partial<Store>
>(
  store: Store,
  asyncAction: Action<InputArgs, Promise<StoreUpdate<Store, Update> | void>>,
): Action<InputArgs, Promise<void>>;

export function effect<Store extends object>(store: Store, param: any = null): any {
  const { partialUpdate } = manage(store);
  const [publish, subscribe] = createPubSub<EffectSubscriber, [EffectState]>();

  const effectManager: EffectManager = {
    state: null,
    subscribe,
  };

  const updateActionState = (state: EffectState) => {
    effectManager.state = state;
    publish(state);
  };

  const action = <A extends UnknownArgs>(...args: A): any => {
    let update: any = void 0;

    updateActionState(EffectState.Pending);

    // defining what update case it is
    if (args.length === 1 && !param && isObject(args[0])) {
      // effect(store)({ param: "value" })
      update = args[0];
    } else if (args.length === 1 && store.hasOwnProperty(param)) {
      // effect(store, "param")("value")
      update = { [param]: args[0] };
    } else {
      // effect(store, () => ({ param: "value" }))
      // effect(store, async () => ({ param: "value" }))
      update = param(...args);
    }

    if (update instanceof Promise) {
      update
        .then(updateData => {
          partialUpdate(updateData);
          updateActionState(EffectState.Done);
        })
        .catch(e => {
          updateActionState(EffectState.Fail);
          throw e;
        });
    } else {
      try {
        partialUpdate(update);
      } catch (e) {
        updateActionState(EffectState.Fail);
        throw e;
      }
      updateActionState(EffectState.Done);
    }
  };

  action[reffectKey] = effectManager;

  return action;
}

const isObject = (obj: unknown): obj is object => typeof obj === "object";

const copy = (data: object): any => {
  if (null == data || !isObject(data)) return data;
  if (data instanceof Date) return new Date(data.getTime());
  if (data instanceof Array) return data.map(copy);

  var newObject = {};
  for (var key in data) {
    newObject[key] = isObject(data[key]) ? copy(data[key]) : data[key];
  }
  return newObject;
};

const createPubSub = <Subscriber extends Function, PubArgs extends unknown[]>() => {
  const subscribers: Subscriber[] = [];

  return [
    (...args: PubArgs) => {
      subscribers.forEach(subscriber => subscriber(...args));
    },
    (subscriber: Subscriber) => {
      const index = subscribers.push(subscriber) - 1;

      return () => {
        subscribers.splice(index, 1);
      };
    },
  ] as const;
};

import { StoreType } from "./store";
import { manage, reffectKey } from "./manage";
import { createPubSub, isObject, copy } from "./utils";
import { Func, UnknownArgs } from "./extraTypes";

const effectState = {
  pending: "pending",
  done: "done",
  fail: "fail",
} as const;
export type EffectState = null | typeof effectState[keyof typeof effectState];

export type EffectAction<Store extends StoreType, InputArgs extends UnknownArgs, ReturnValue = void> = Func<
  InputArgs,
  ReturnValue
> &
  EffectInternal<Store>;

export type EffectManager<Store extends StoreType, EffectArgs extends UnknownArgs = UnknownArgs> = {
  args: EffectArgs;
  state: EffectState;
  value: Partial<Store> | Error | void;
  subscribe: (
    subscriber: (state: EffectState, value: Partial<Store> | Error | void, args?: EffectArgs) => void,
  ) => () => void;
};

/**
 * WARNING!
 * only for additional typings of effect's action
 * used for effect manager
 */
export type EffectInternal<Store extends StoreType> = {
  /** WARNING! this property is not exist. used only for typings. */
  __storeType__: Store;
};

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
export function effect<Store extends StoreType, Update extends Partial<Store> = Partial<Store>>(
  store: Store,
): EffectAction<Store, [Update]>;
/**
 * **Property effect**
 * Action which update store property
 *
 * @example
 * const updateApples = effect(store, "apples")
 * updateApples([1,2,3,4])
 */
export function effect<Store extends StoreType, StorePropertyName extends keyof Store = keyof Store>(
  store: Store,
  property: StorePropertyName,
): EffectAction<Store, [Store[StorePropertyName]]>;
/**
 * **Standard\Async effect**
 * Synchronous\Asynchronous store update
 *
 * @example
 * const updateApples = effect(store, apples => ({ apples })
 * updateApples([1,2,3,4])
 */
export function effect<
  Store extends StoreType,
  StoreUpdate extends Partial<Store> | void | Promise<Partial<Store>> | Promise<void>,
  InputArgs extends UnknownArgs = UnknownArgs
>(
  store: Store,
  action: Func<InputArgs, StoreUpdate>,
): EffectAction<Store, InputArgs, ReturnType<typeof action> extends Promise<unknown> ? Promise<void> : void>;
export function effect<Store extends StoreType>(store: Store, param: any = null): any {
  const { partialUpdate } = manage(store);

  const [updateActionState, subscribe] = createPubSub<
    (state: EffectState, value: Partial<Store> | Error | void, args?: unknown[]) => void
  >();

  subscribe((state: EffectState, value: EffectManager<Store>["value"], args) => {
    effectManager.state = state;
    effectManager.value = value instanceof Error ? value : copy(value);
    if (args) {
      effectManager.args = args;
    }
  });

  const effectManager: EffectManager<Store> = {
    args: [],
    state: null,
    value: void 0,
    subscribe,
  };

  const action = <A extends UnknownArgs>(...args: A): any => {
    let update: any = void 0;

    updateActionState(effectState.pending, void 0, args);

    try {
      // defining what update case it is
      if (typeof param === "function") {
        // effect(store, () => ({ param: "value" }))
        // effect(store, async () => ({ param: "value" }))
        update = param(...args);
      } else if (param) {
        // effect(store, "param")("value")
        update = { [param]: args[0] };
      } else if (isObject(args[0])) {
        // effect(store)({ param: "value" })
        update = args[0];
      }
    } catch (e) {
      updateActionState(effectState.fail, e);
      throw e;
    }

    if (update instanceof Promise) {
      return update
        .then(updateData => {
          partialUpdate(updateData);
          updateActionState(effectState.done, updateData);
        })
        .catch(e => {
          updateActionState(effectState.fail, e);
          throw e;
        });
    } else {
      partialUpdate(update);
      updateActionState(effectState.done, update);
    }
  };

  action[reffectKey] = effectManager;

  return action;
}

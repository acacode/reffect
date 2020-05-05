import { StoreType } from "./store";
import { manage, reffectKey } from "./manage";
import { createPubSub, isObject } from "./utils";

export const enum EffectState {
  Pending = "pending",
  Done = "done",
  Fail = "fail",
}
export type EffectSubscriber = (state: EffectState) => void;
export type EffectStateChangeCases<Store extends StoreType> =
  | [EffectState.Pending, UnknownArgs]
  | [EffectState.Done, Partial<Store>]
  | [EffectState.Fail, Error];
export type EffectManager<Store extends StoreType> = {
  state: EffectStateChangeCases<Store>[0] | null;
  value: EffectStateChangeCases<Store>[1] | null;
  subscribe: (subscriber: EffectSubscriber) => () => void;
};

/** effect's declaration */
export type Action<A extends unknown[], R> = (...a: A) => R;

type StoreUpdate<Store, T> = Exclude<keyof T, keyof Store> extends never
  ? keyof T extends never
    ? Partial<Store>
    : T extends Partial<Store>
    ? Partial<Store>
    : T
  : never;

type UnknownArgs = unknown[] | [];

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
): Action<[Update], void>;

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
): Action<[Store[StorePropertyName]], void>;

/**
 * **Standard effect**
 * Synchronous store update
 *
 * @example
 * const updateApples = effect(store, apples => ({ apples })
 * updateApples([1,2,3,4])
 */
export function effect<
  Store extends StoreType,
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
  Store extends StoreType,
  InputArgs extends UnknownArgs = UnknownArgs,
  Update extends Partial<Store> = Partial<Store>
>(
  store: Store,
  asyncAction: Action<InputArgs, Promise<StoreUpdate<Store, Update> | void>>,
): Action<InputArgs, Promise<void>>;

export function effect<Store extends StoreType>(store: Store, param: any = null): any {
  const { partialUpdate } = manage(store);
  const [updateActionState, subscribe] = createPubSub<EffectSubscriber, EffectStateChangeCases<Store>>(
    (state: EffectState, value) => {
      effectManager.state = state;
      effectManager.value = value;
    },
  );

  const effectManager: EffectManager<Store> = {
    state: null,
    value: [],
    subscribe,
  };

  const action = <A extends UnknownArgs>(...args: A): any => {
    let update: any = void 0;

    updateActionState(EffectState.Pending, args);

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
          updateActionState(EffectState.Done, updateData);
        })
        .catch(e => {
          updateActionState(EffectState.Fail, e);
          throw e;
        });
    } else {
      try {
        partialUpdate(update);
      } catch (e) {
        updateActionState(EffectState.Fail, e);
        throw e;
      }
      updateActionState(EffectState.Done, update);
    }
  };

  action[reffectKey] = effectManager;

  return action;
}

import { StateType, Store } from "./store";
import { createPubSub } from "./utils";

export const EFFECT_STATE = {
  pending: "pending",
  done: "done",
  fail: "fail",
} as const;

export const enum EffectState {
  Pending = "pending",
  Done = "done",
  Fail = "fail",
}

type EffectSubscribe = (state: EffectState) => void;
type EffectUnsubscribe = () => void;

export interface EffectAction<State extends StateType, InputArgs extends unknown[], ReturnType extends unknown = void> {
  (...args: InputArgs): ReturnType;

  effectName?: string;
  state: EffectState | null;
  subscribe: (subscriber: EffectSubscribe) => EffectUnsubscribe;
}

/**
 * WARNING!
 * only for additional typings of effect's action
 * used for effect manager
 */
export type EffectInternal<State extends StateType> = {
  /** WARNING! this property is not exist. used only for typings. */
  __stateType__: State;
};

interface EffectBaseConfig<State extends StateType, Args extends unknown[]> {
  name?: string;
  store: Store<State>;
  /** when action ends successfully */
  finalize?: (state: State, ...args: Args) => void | Promise<void>;
  failure?: (e: Error, state: State, ...args: Args) => void | Promise<void>;
}

interface EffectActionConfig<
  State extends StateType,
  Args extends unknown[],
  ReturnType extends void | State | Promise<State>
> extends EffectBaseConfig<State, Args> {
  action: (state: State, ...args: Args) => ReturnType;
}
export function effect<
  State extends StateType,
  Args extends unknown[],
  ReturnType extends void | State | Promise<State>
>(config: EffectActionConfig<State, Args, ReturnType>): EffectAction<State, Args> {
  const { store, name, failure, finalize } = config;
  const [publish, subscribe] = createPubSub<EffectSubscribe>();

  subscribe((state: EffectState) => {
    action.state = state;
  });

  const action: EffectAction<State, Args> = (...args: Args): Promise<void> | void => {
    let nextState: void | State | Promise<State> = void 0;

    publish(EffectState.Pending);

    try {
      nextState = config.action(store.state, ...args);
    } catch (e) {
      publish(EffectState.Fail);
      if (failure) {
        failure(e, store.state, ...args);
      } else {
        throw e;
      }
    }

    if (nextState instanceof Promise) {
      return nextState
        .then(nextState => {
          store.set(nextState);
          publish(EffectState.Done);
          finalize && finalize(store.state, ...args);
        })
        .catch(e => {
          publish(EffectState.Fail);
          if (failure) {
            failure(e, store.state, ...args);
          } else {
            throw e;
          }
        });
    } else {
      store.set(nextState);
      publish(EffectState.Done);
    }
  };

  action.effectName = name;
  action.state = null;
  action.subscribe = subscribe;

  return action;
}

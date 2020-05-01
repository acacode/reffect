import { useReducer, useEffect, useLayoutEffect, useState } from "react";
import { getManager, EffectState, Action } from "@reffect/core";

const useIsomorphicEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const reducer = (state: any, newState: any) => ({ ...newState });

export const useStore = <Store extends object>(store: Store): Store => {
  const [state, setState] = useReducer(reducer, store);

  useIsomorphicEffect(() => {
    const subscriber = () => setState(store);
    const { subscribe, unsubscribe } = getManager(store);

    subscribe(subscriber);
    return () => unsubscribe(subscriber);
  }, []);

  return state;
};

export const useEffectState = (effect: Action<unknown[], unknown>) => {
  const [state, setState] = useState<EffectState | null>(null);

  useIsomorphicEffect(() => {
    const subscriber = (state: EffectState) => setState(state);
    const { subscribe, unsubscribe } = getManager(effect);

    subscribe(subscriber);
    return () => unsubscribe(subscriber);
  }, []);

  return {
    pending: state === EffectState.Pending,
    fail: state === EffectState.Fail,
    done: state === EffectState.Done,
  };
};

import { useReducer, useEffect, useLayoutEffect, useState } from "react";
import { getManager, EffectState } from "@reffect/core";

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

export const useEffectState = (effect: (...args: unknown[]) => unknown) => {
  const [state, setState] = useState<EffectState | null>(null);

  useIsomorphicEffect(() => {
    const subscriber = (state: EffectState) => setState(state);
    const { subscribe, unsubscribe } = getManager(effect);

    subscribe(subscriber);
    return () => unsubscribe(subscriber);
  }, []);

  return {
    loading: state === EffectState.Loading,
    error: state === EffectState.Error,
    success: state === EffectState.Success,
  };
};

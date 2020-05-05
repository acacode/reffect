import { useEffect, useLayoutEffect, useState, useReducer } from "react";
import { manage, EffectState, StoreType, Action } from "@reffect/core";

const useIsomorphicEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const reducer = (state: any, newState: any) => ({ ...newState });

export const useStore = <Store extends StoreType>(store: Store): Store => {
  const [state, setState] = useReducer(reducer, store);

  useIsomorphicEffect(() => manage(store).subscribe(() => setState(store)), []);

  return state;
};

export const useEffectState = (effect: Action<unknown[], unknown>) => {
  const [state, setState] = useState<EffectState | null>(null);

  useIsomorphicEffect(() => manage(effect).subscribe(state => setState(state)), []);

  return {
    pending: state === EffectState.Pending,
    fail: state === EffectState.Fail,
    done: state === EffectState.Done,
  };
};

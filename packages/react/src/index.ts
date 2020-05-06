import { useEffect, useLayoutEffect, useState, useReducer } from "react";
import { manage, EffectState, StoreType, EffectManagingType } from "@reffect/core";

const useIsomorphicEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const reducer = (state: any, newState: any) => ({ ...newState });

export const useStore = <Store extends StoreType>(store: Store): Store => {
  const [state, setState] = useReducer(reducer, store);

  useIsomorphicEffect(() => manage(store).subscribe(() => setState(store)), []);

  return state;
};

export const useEffectState = <Effect extends EffectManagingType>(effect: Effect) => {
  const [state, setState] = useState<EffectState>(null);

  useIsomorphicEffect(() => manage(effect).subscribe(state => setState(state)), []);

  return {
    pending: state === "pending",
    fail: state === "fail",
    done: state === "done",
  };
};

import { useEffect, useLayoutEffect, useState } from "react";
import { manage, EffectState, Action } from "@reffect/core";

const useIsomorphicEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export const useStore = <Store extends object>(store: Store): Store => {
  const [state, setState] = useState<Store>(store);

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

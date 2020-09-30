import { useState } from "react";
import { EffectState, StateType, EffectAction } from "@reffect/core";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export const useEffectState = <State extends StateType>(effect: EffectAction<State, any>) => {
  const [state, setState] = useState<EffectState | null>(null);

  useIsomorphicLayoutEffect(() => {
    let isMount = true;
    const unsubscribe = effect.subscribe(state => isMount && setState(state));
    return () => {
      isMount = false;
      unsubscribe();
    };
  }, []);

  return {
    pending: state === EffectState.Pending,
    fail: state === EffectState.Fail,
    done: state === EffectState.Done,
  };
};

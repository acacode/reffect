import { useState } from "react";
import { manage, EffectManagingType, EffectState } from "@reffect/core";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export const useEffectState = <Effect extends EffectManagingType>(effect: Effect) => {
  const [state, setState] = useState<EffectState>(null);

  useIsomorphicLayoutEffect(() => {
    let isMount = true;
    const unsubscribe = manage(effect).subscribe(state => isMount && setState(state));
    return () => {
      isMount = false;
      unsubscribe();
    };
  }, []);

  return {
    pending: state === "pending",
    fail: state === "fail",
    done: state === "done",
  };
};

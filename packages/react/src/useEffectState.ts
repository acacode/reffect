import { useState } from "react";
import { manage, EffectManagingType, EffectState } from "@reffect/core";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export const useEffectState = <Effect extends EffectManagingType>(effect: Effect) => {
  const [state, setState] = useState<EffectState>(null);

  useIsomorphicLayoutEffect(() => manage(effect).subscribe(state => setState(state)), []);

  return {
    pending: state === "pending",
    fail: state === "fail",
    done: state === "done",
  };
};

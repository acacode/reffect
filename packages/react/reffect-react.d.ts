import { Action } from "@reffect/core";

declare const useStore: <Store extends object>(store: Store) => Store;
declare const useEffectState: (
  effect: Action<unknown[], unknown>,
) => {
  pending: boolean;
  fail: boolean;
  done: boolean;
};

export { useEffectState, useStore };

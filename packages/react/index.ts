import { useReducer, useEffect, useLayoutEffect } from "react";
import { getStoreManager } from "@reffect/core";

const useIsomorphicEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const reducer = (state: any, newState: any) => ({ ...newState });

export const useStore = <Store = any>(store: Store): Store => {
  const [state, triggerUpdate] = useReducer(reducer, store);

  useIsomorphicEffect(() => {
    const watcher = () => triggerUpdate(store);
    const { watch, unwatch } = getStoreManager(store);

    watch(watcher);
    return () => unwatch(watcher);
  }, []);

  return state;
};

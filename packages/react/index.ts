import { useReducer, useEffect, useLayoutEffect } from "react";
import { manageStore } from "@reffect/core";

const useIsomorphicEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const reducer = (state: any, newState: any) => ({ ...newState });

export const useStore = <Store extends object>(store: Store): Store => {
  const [state, triggerUpdate] = useReducer(reducer, store);

  useIsomorphicEffect(() => {
    const subscriber = () => triggerUpdate(store);
    const { subscribe, unsubscribe } = manageStore(store);

    subscribe(subscriber);
    return () => unsubscribe(subscriber);
  }, []);

  return state;
};

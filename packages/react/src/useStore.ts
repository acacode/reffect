import { useReducer } from "react";
import { manage, StoreType } from "@reffect/core";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

const reducer = (state: any, newState: any) => ({ ...newState });

export const useStore = <Store extends StoreType>(store: Store): Store => {
  const [state, setState] = useReducer(reducer, store);

  useIsomorphicLayoutEffect(() => {
    let isMount = true;
    const unsubscribe = manage(store).subscribe(() => isMount && setState(store));
    return () => {
      isMount = false;
      unsubscribe();
    };
  }, []);

  return state;
};

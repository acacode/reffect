import { useReducer } from "react";
import { manage, StoreType } from "@reffect/core";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

const reducer = (state: any, newState: any) => ({ ...newState });

export const useStore = <Store extends StoreType>(store: Store): Store => {
  const [state, setState] = useReducer(reducer, store);

  useIsomorphicLayoutEffect(() => manage(store).subscribe(() => setState(store)), []);

  return state;
};

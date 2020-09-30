import { useReducer, Reducer } from "react";
import { StateType, Store } from "@reffect/core";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

const reducer = (state: any, newState: any) => newState;

export const useStore = <State extends StateType>(store: Store<State>): State => {
  const [state, setState] = useReducer<Reducer<State, State>>(reducer, store.state);

  useIsomorphicLayoutEffect(() => {
    let isMount = true;
    const unsubscribe = store.subscribe(() => isMount && setState(store.state));
    return () => {
      isMount = false;
      unsubscribe();
    };
  }, []);

  return state;
};

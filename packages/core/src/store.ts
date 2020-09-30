import { UnionToIntersection } from "./extraTypes";
import { createPubSub, shallowCopy } from "./utils";

export type StateType = unknown;
export type StoreSubscriber<State> = (nextState: State, currentState: State) => void;
export interface Store<State extends StateType> {
  name: string;
  readonly initialState: State;
  readonly state: State;
  set: (store: State | void) => void;
  replace: (store: State) => void;
  subscribe: (subscriber: StoreSubscriber<State>) => () => void;
  reset: VoidFunction;
  clone: () => Store<State>;
}

export type ModifiedStore<State extends StateType, Modifier extends StoreModifier<State>> = Store<State> &
  UnionToIntersection<ReturnType<Modifier>>;

export type StoreModifier<State extends StateType> = <S extends State>(store: Store<S>) => Store<S>;

export interface StoreConfiguration<
  State extends StateType,
  Modifier extends StoreModifier<State> = StoreModifier<State>
> {
  /** Initial state of the store */
  initialState: State extends object ? Partial<State> : State;
  /** Name of the store */
  name?: string;
  /** Middlewares */
  modifiers?: Modifier[];
}

/**
 * Create a store
 *
 * @example
 * const fruits = store({
 *  initialState: { apples: [] },
 *  name: "store-name",
 *  modifiers: [middleware1, middleware2],
 * })
 *
 * fruits.apples
 */
export function createStore<State extends StateType, Modifier extends StoreModifier<State> = StoreModifier<State>>({
  initialState,
  name,
  modifiers = [],
}: StoreConfiguration<State, Modifier>): ModifiedStore<State, Modifier> {
  const [publish, subscribe] = createPubSub<StoreSubscriber<State>>();
  let state = shallowCopy(initialState) as State;

  const store: Store<State> = {
    get initialState() {
      return shallowCopy(initialState) as State;
    },
    name: name || "unknown",
    get state() {
      return shallowCopy(state);
    },
    // this method do update store
    set: (nextState: State | void) => {
      if (nextState) {
        publish(nextState, store.state);
        state = nextState;
      }
    },
    replace: (nextState: State) => {
      state = nextState;
    },
    subscribe,
    reset: () => store.set(store.initialState),
    clone: () => createStore({ initialState, name, modifiers }),
  };

  return (modifiers || []).reduce((store, modifier) => modifier<State>(store), store) as ModifiedStore<State, Modifier>;
}

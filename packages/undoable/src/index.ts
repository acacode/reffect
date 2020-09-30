import { store, effect, StoreModifier, StateType, Store } from "@reffect/core";

type Undoable<State extends StateType> = {
  history: Store<History<State>>;
  undo: VoidFunction;
  redo: VoidFunction;
};

export type History<State extends StateType> = {
  past: State[];
  present: State;
  future: State[];
};

export const undoable = <State extends StateType>(
  wrappedStore: Store<State>,
  modifiers?: StoreModifier<History<State>>[],
  limit = 15,
): Undoable<State> => {
  let updateFromUndoable = false;
  const storeHistory = store<History<State>>({
    initialState: {
      past: [],
      present: wrappedStore.initialState as State,
      future: [],
    },
    name: `${wrappedStore.name}/@HISTORY`,
    modifiers,
  });

  const undoRedo = (isRedo?: boolean): History<State> | void => {
    const historyState = storeHistory.state;
    const historyArray = historyState[isRedo ? "future" : "past"];
    if (historyArray.length) {
      const sliced = historyArray.slice();
      const present = sliced[isRedo ? "shift" : "pop"]();
      if (present) {
        updateFromUndoable = true;
        wrappedStore.set(present);
        return {
          present,
          future: isRedo ? sliced : [historyState.present, ...historyState.future],
          past: isRedo ? [...historyState.past, historyState.present] : sliced,
        };
      }
    }
  };

  wrappedStore.subscribe((nextState, currState) => {
    if (updateFromUndoable) {
      updateFromUndoable = false;
    } else {
      const pastLength = storeHistory.state.past.length;

      storeHistory.set({
        present: nextState,
        future: storeHistory.state.future.length ? [] : storeHistory.state.future,
        past: [...storeHistory.state.past.slice(+(pastLength >= limit), pastLength), currState],
      });
    }
  });

  return {
    undo: effect({
      name: `${wrappedStore.name}/@HISTORY/@UNDO`,
      store: storeHistory,
      action: () => undoRedo(),
    }),
    redo: effect({
      name: `${wrappedStore.name}/@HISTORY/@REDO`,
      store: storeHistory,
      action: () => undoRedo(true),
    }),
    history: storeHistory,
  };
};

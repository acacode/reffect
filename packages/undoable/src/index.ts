import { StoreType, manage, store, effect, StoreMiddleware } from "@reffect/core";

type Undoable<Store extends StoreType> = {
  history: StoreHistory<Store>;
  undo: VoidFunction;
  redo: VoidFunction;
};

export type StoreHistory<Store extends StoreType> = {
  past: Store[];
  present: Store;
  future: Store[];
};

export const undoable = <Store extends StoreType>(
  storeRef: Store,
  middlewares?: StoreMiddleware<StoreHistory<Store>>[],
  size = 15,
): Undoable<Store> => {
  let updateFromUndoable = false;
  const storeRefManager = manage(storeRef);
  const storeHistory = store<StoreHistory<Store>>(
    {
      past: [],
      present: storeRefManager.initialState as Store,
      future: [],
    },
    `${storeRefManager.name}-history`,
    middlewares,
  );

  const undoRedo = (isRedo?: boolean): Partial<StoreHistory<Store>> | void => {
    const historyArray = storeHistory[isRedo ? "future" : "past"];
    if (historyArray.length) {
      const sliced = historyArray.slice();
      const present = sliced[isRedo ? "shift" : "pop"]();
      if (present) {
        updateFromUndoable = true;
        storeRefManager.partialUpdate(present);
        return {
          present,
          future: isRedo ? sliced : [storeHistory.present, ...storeHistory.future],
          past: isRedo ? [...storeHistory.past, storeHistory.present] : sliced,
        };
      }
    }
  };

  storeRefManager.subscribe((partialUpdate, prevState, currState) => {
    if (updateFromUndoable) {
      updateFromUndoable = false;
    } else {
      const pastLength = storeHistory.past.length;

      manage(storeHistory).partialUpdate({
        present: currState,
        future: storeHistory.future.length ? [] : storeHistory.future,
        past: [...storeHistory.past.slice(+(pastLength >= size), pastLength), prevState],
      });
    }
  });

  return {
    undo: effect(storeHistory, () => undoRedo()),
    redo: effect(storeHistory, () => undoRedo(true)),
    history: storeHistory,
  };
};

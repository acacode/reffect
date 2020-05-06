import { StoreType, manage } from "@reffect/core";

type Undoable = {
  undo: VoidFunction;
  redo: VoidFunction;
};

export const undoable = <Store extends StoreType>(store: Store, undoSize: number = 10): Undoable => {
  const storeManager = manage(store);

  const past: Store[] = [];
  let present: Store = storeManager.initialState as Store;
  const future: Store[] = [];

  storeManager.subscribe((partialUpdate, prevState, currState) => {
    if (past.length >= undoSize) {
      past.shift();
    }
    past.push(prevState);
    present = currState;
  });

  const undo = () => {
    if (past.length) {
      const lastPast = past.pop();
      if (lastPast) {
        future.push(present);
        present = lastPast;
        storeManager.partialUpdate(present);
      }
    }
  };

  const redo = () => {
    if (future.length) {
      const firstFuture = future.shift();
      if (firstFuture) {
        past.push(present);
        present = firstFuture;
        storeManager.partialUpdate(present);
      }
    }
  };

  return {
    undo,
    redo,
  };
};

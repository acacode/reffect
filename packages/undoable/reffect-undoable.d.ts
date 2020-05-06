declare type Undoable = {
  undo: VoidFunction;
  redo: VoidFunction;
};
declare const undoable: <Store extends object>(store: Store, undoSize?: number) => Undoable;

export { undoable };

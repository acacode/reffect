import { StateType, Store } from "@reffect/core";

const equals = (obj1: unknown, obj2: unknown): obj1 is typeof obj2 => {
  if (obj1 === obj2) return true;
  if (Array.isArray(obj1) || Array.isArray(obj2)) return false;
  if (!(obj1 instanceof Object) || !(obj2 instanceof Object)) return false;
  if (obj1.constructor !== obj2.constructor) return false;

  for (const property in obj1) {
    if (obj1.hasOwnProperty(property) && (!obj2.hasOwnProperty(property) || !equals(obj1[property], obj2[property])))
      return false;
  }

  for (const property in obj2) {
    if (obj2.hasOwnProperty(property) && !obj1.hasOwnProperty(property)) return false;
  }
  return true;
};

export const strictUpdate = <State extends StateType>(store: Store<State>) => {
  const originalPartialUpdate = store.set;

  store.set = (nextState: State | void) => {
    if (nextState && !equals(store, nextState)) {
      originalPartialUpdate(nextState);
    }
  };

  return store;
};

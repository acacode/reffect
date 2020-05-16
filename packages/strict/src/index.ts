import { StoreType, manage } from "@reffect/core";

const equals = (obj1: object, obj2: object): obj1 is typeof obj2 => {
  if (obj1 === obj2) return true;
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

export const strictUpdate = <Store extends StoreType>(store: Store, copy: (obj: object) => object) => {
  const storeManager = manage(store);
  const originalPartialUpdate = storeManager.partialUpdate;

  storeManager.partialUpdate = (storeUpdate: Partial<Store>) =>
    storeUpdate &&
    !equals(store, copy({ ...storeManager.state, ...storeUpdate })) &&
    originalPartialUpdate(storeUpdate);

  return store;
};

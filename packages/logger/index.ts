import { Middleware, StoreManager, Watcher } from "@reffect/core";

export const logger: Middleware<any> = <Store extends object>(
  storeManager: StoreManager<Store>
) => {
  if (process.env.NODE_ENV === "development") {
    console.log(
      `store "${storeManager.name}" initialize`,
      storeManager.initialState
    );

    const watcher: Watcher<Store> = partialUpdate => {
      console.log(`store "${storeManager.name}" update`, partialUpdate);
    };

    storeManager.watch(watcher);
  }
  return storeManager;
};

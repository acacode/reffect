import { StoreManager } from "@reffect/core";

declare const localstore: <Store extends object>(storeManager: StoreManager<Store>) => StoreManager<Store>;

export { localstore };

import { StoreManager } from "@reffect/core";

declare const logger: <Store extends object>(storeManager: StoreManager<Store>) => StoreManager<Store>;

export { logger };

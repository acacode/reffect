import { StoreType, StoreManager } from "./store";
import { EffectManager, EffectInternal } from "./effect";

export const reffectKey = Symbol("reffect_key");

export type EffectManagingType = Function & EffectInternal<object>;

/**
 * @param effect effect ref which created via `effect()` function
 * @returns effect manager
 */
export function manage<Effect extends EffectManagingType>(
  effect: Effect,
): EffectManager<Effect["$storeType"], Effect extends (...inputArgs: infer T) => void ? T : never>;
/**
 * @param store store ref which created via `store()` function
 * @returns store manager
 */
export function manage<Store extends StoreType>(store: Store): StoreManager<Store>;
export function manage(value: StoreType | Function) {
  if (!value || !value[reffectKey]) console.error("received wrong value", value);
  return value[reffectKey];
}

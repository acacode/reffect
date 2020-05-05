import { StoreType, StoreManager } from "./store";
import { Action, EffectManager } from "./effect";

export const reffectKey = Symbol("reffect_key");

export function manage<ManagingValue extends StoreType | Action<unknown[], unknown>>(
  value: ManagingValue,
): ManagingValue extends Action<unknown[], unknown> ? EffectManager<ManagingValue> : StoreManager<ManagingValue> {
  if (!value || !value[reffectKey]) console.error("received wrong value", value);
  return value[reffectKey];
}

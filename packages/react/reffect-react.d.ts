declare const useStore: <Store extends object>(store: Store) => Store;
declare const useEffectState: (
  effect: (...args: unknown[]) => unknown,
) => {
  loading: boolean;
  error: boolean;
  success: boolean;
};

export { useEffectState, useStore };

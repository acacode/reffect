export const shallowCopy = <V extends unknown>(value: V): V => {
  if (!value || typeof value !== "object" || value instanceof Function) return value;
  if (value instanceof Date) return new Date(value.getTime()) as V;
  if (Array.isArray(value)) return [...value] as V;

  return { ...(value as object) } as V;
};

export const createPubSub = <Subscriber extends (...args: any[]) => void>() => {
  const subscribers: Subscriber[] = [];

  return [
    (...args: Parameters<Subscriber>) => {
      subscribers.forEach(subscriber => subscriber(...args));
    },
    (subscriber: Subscriber) => {
      const index = subscribers.push(subscriber) - 1;

      return () => {
        subscribers.splice(index, 1);
      };
    },
  ] as const;
};

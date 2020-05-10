export const isObject = (obj: unknown): obj is object => typeof obj === "object";

export const assign = <T1 extends object, T2 extends object>(obj1: T1, obj2: T2): T1 & T2 =>
  Object.assign(obj1, copy(obj2));

export const copy = (data: any): any => {
  if (null == data || !isObject(data)) return data;
  if (data instanceof Date) return new Date(data.getTime());
  if (data instanceof Array) return data.map(copy);

  const newObject = {};
  for (const key in data) {
    newObject[key] = isObject(data[key]) ? copy(data[key]) : data[key];
  }
  return newObject;
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

export const isObject = (obj: unknown): obj is object => typeof obj === "object";

export const copy = (data: any): any => {
  if (null == data || !isObject(data)) return data;
  if (data instanceof Date) return new Date(data.getTime());
  if (data instanceof Array) return data.map(copy);

  var newObject = {};
  for (var key in data) {
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

export const isObject = (obj: unknown): obj is object => typeof obj === "object";

export const copy = (data: object): any => {
  if (null == data || !isObject(data)) return data;
  if (data instanceof Date) return new Date(data.getTime());
  if (data instanceof Array) return data.map(copy);

  var newObject = {};
  for (var key in data) {
    newObject[key] = isObject(data[key]) ? copy(data[key]) : data[key];
  }
  return newObject;
};

export const createPubSub = <Subscriber extends Function, PubArgs extends unknown[]>(
  callback?: (...args: PubArgs) => void,
) => {
  const subscribers: Subscriber[] = [];

  return [
    (...args: PubArgs) => {
      callback && callback(...args);
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

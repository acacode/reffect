import { StoreSubscriber, StoreType, manage } from "@reffect/core";

export const logger = <Store extends StoreType>(store: Store) => {
  if (process.env.NODE_ENV === "development") {
    const storeManager = manage(store);

    const log = (component: string, event: string, additionalOutput: unknown[] = []) => {
      const beatifyComponentLabel = Array(20)
        .fill(" ")
        .map((char, i) => component[i] || char)
        .join("");
      console.groupCollapsed(
        `🛠️ %c@reffect/%c${beatifyComponentLabel}`,
        "color:#5777ff; padding: 0 0 0 4px;font-weight: bold;",
        "color:#ff2318; margin-right: 2px;font-weight: bold",
        `[${event}]`,
      );
      console.log(...additionalOutput);
      console.groupCollapsed("%ctrace:", "color:#7e7e7e; font-weight: normal;");
      console.trace("");
      console.groupEnd();
      console.groupEnd();
    };

    log(`store/${storeManager.name}`, "initialize", ["initial state: ", storeManager.initialState]);

    const subscriber: StoreSubscriber<StoreType> = (partialUpdate, prevState, curState) => {
      log(`store/${storeManager.name}`, "store update", [
        "payload:        ",
        partialUpdate,
        "\r\nprevious state: ",
        prevState,
        "\r\ncurrrent state: ",
        curState,
      ]);
    };

    storeManager.subscribe(subscriber);
  }
  return store;
};

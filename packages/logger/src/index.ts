import { StoreSubscriber, StateType, Store } from "@reffect/core";

export const logger = <State extends StateType>(store: Store<State>) => {
  if (process.env.NODE_ENV === "development") {
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

    log(`store/${store.name}`, "initialize", ["initial state: ", store.initialState]);

    const subscriber: StoreSubscriber<StateType> = (nextState, currState) => {
      log(`store/${store.name}`, "store update", ["\r\nnext state: ", nextState, "\r\ncurrent state: ", currState]);
    };

    store.subscribe(subscriber);
  }
  return store;
};

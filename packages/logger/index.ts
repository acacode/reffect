import { StoreManager, Watcher, Middleware } from "@reffect/core";

export const logger: Middleware<any> = <Store extends object>(
  storeManager: StoreManager<Store>
) => {
  if (process.env.NODE_ENV === "development") {
    const log = (
      component: string,
      event: string,
      additionalOutput: any[] = []
    ) => {
      const beatifyComponentLabel = Array(14)
        .fill(" ")
        .map((char, i) => component[i] || char)
        .join("");
      console.groupCollapsed(
        `🛠️ %c@reffect/%c${beatifyComponentLabel}`,
        "color:#5777ff; padding: 0 0 0 4px;font-weight: bold;",
        "color:#ff2318; margin-right: 2px;font-weight: bold",
        `[${event}]`
      );
      console.log(...additionalOutput);
      console.groupCollapsed("%ctrace:", "color:#7e7e7e; font-weight: normal;");
      console.trace("");
      console.groupEnd();
      console.groupEnd();
    };

    log(`store/${storeManager.name}`, "initialize", [
      "initial state: ",
      { ...storeManager.initialState }
    ]);

    const watcher: Watcher<Store> = (
      partialUpdate: any,
      prevState: any,
      curState: any
    ) => {
      log(`store/${storeManager.name}`, "store update", [
        "payload:        ",
        partialUpdate,
        "\r\nprevious state: ",
        prevState,
        "\r\ncurrrent state: ",
        { ...curState, ...(partialUpdate || {}) }
      ]);
    };

    storeManager.watch(watcher);
  }
  return storeManager;
};

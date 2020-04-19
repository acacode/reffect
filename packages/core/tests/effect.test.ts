import { createStore, effect, Middleware } from "..";
import * as chai from "chai";

const { expect } = chai;

describe("effect()", () => {
  const initialState = { foo: "bar", baz: [1, 2, 3], bar: "bar" };
  const storeName = "store-name";
  const middlewares: Middleware<typeof initialState>[] = [storeManager => storeManager];

  let store: typeof initialState;

  beforeEach(() => {
    store = createStore(initialState, storeName, middlewares);
  });

  it("should return void function", () => {
    expect(effect(store, () => ({ bar: "22" }))()).to.equal(undefined);
  });

  it("should update store without action", () => {
    const updateStore = effect(store);
    updateStore({ bar: "22" });
    expect(store).to.deep.equal({ ...initialState, bar: "22" });
  });

  it("should be able to only one store property", () => {
    const updateStore = effect(store, "bar");
    updateStore("22");
    expect(store).to.deep.equal({ ...initialState, bar: "22" });
  });

  it("should be able to update store via action", () => {
    const updateStore = effect(store, (barValue: string) => ({ bar: barValue }));
    updateStore("22");
    expect(store).to.deep.equal({ ...initialState, bar: "22" });
  });

  it("should be able to update store via actions combination", () => {
    const updateBar = effect(store, "bar");
    const updateStore = effect(store, (barValue: string) => updateBar(barValue));
    updateStore("22");
    expect(store).to.deep.equal({ ...initialState, bar: "22" });
  });

  it("should be able to work with async actions", async () => {
    const asyncUpdateStore = effect(store, async () => await { bar: "23" });
    await asyncUpdateStore();
    expect(store).to.deep.equal({ ...initialState, bar: "23" });
  });
});

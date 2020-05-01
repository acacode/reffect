import { store, effect, StoreMiddleware } from "..";
import * as chai from "chai";

const { expect } = chai;

describe("effect()", () => {
  const initialState = { foo: "bar", baz: [1, 2, 3], bar: "bar" };
  const storeName = "store-name";
  const middlewares: StoreMiddleware<typeof initialState>[] = [storeManager => storeManager];

  let testStore: typeof initialState;

  beforeEach(() => {
    testStore = store(initialState, storeName, middlewares);
  });

  it("should return void function", () => {
    expect(effect(testStore, () => ({ bar: "22" }))()).to.equal(undefined);
  });

  it("should update store without action", () => {
    const updateStore = effect(testStore);
    updateStore({ bar: "22" });
    expect(testStore).to.deep.equal({ ...initialState, bar: "22" });
  });

  it("should be able to only one store property", () => {
    const updateStore = effect(testStore, "bar");
    updateStore("22");
    expect(testStore).to.deep.equal({ ...initialState, bar: "22" });
  });

  it("should be able to update store via action", () => {
    const updateStore = effect(testStore, (barValue: string) => ({ bar: barValue }));
    updateStore("22");
    expect(testStore).to.deep.equal({ ...initialState, bar: "22" });
  });

  it("should be able to update store via actions combination", () => {
    const updateBar = effect(testStore, "bar");
    const updateStore = effect(testStore, (barValue: string) => updateBar(barValue));
    updateStore("22");
    expect(testStore).to.deep.equal({ ...initialState, bar: "22" });
  });

  it("should be able to work with async actions", async () => {
    await effect(testStore, async () => ({ bar: "23" }))();
    expect(testStore).to.deep.equal({ ...initialState, bar: "23" });
  });
});

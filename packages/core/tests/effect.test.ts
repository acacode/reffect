import { store, effect, StoreMiddleware } from "../src";
import * as chai from "chai";

const { expect } = chai;

describe("effect()", () => {
  const initialState = { foo: "bar", baz: [1, 2, 3], bar: "bar" };
  const storeName = "store-name";
  const middlewares: StoreMiddleware<typeof initialState>[] = [store => store];

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

  it("should be able to update store via actions combination (deep)", () => {
    const partialUpdate = effect(testStore);
    const updateBar = effect(testStore, "bar");
    const updateFoo = effect(testStore, "foo");
    const updateBaz = effect(testStore, (baz?: number[]) => partialUpdate({ baz, foo: testStore.foo + testStore.bar }));

    updateBar("barbarian");
    updateFoo("foobarbarian");
    updateBaz([6, 6, 6]);
    partialUpdate({ baz: [...testStore.baz, testStore.bar.length] });
    expect(testStore).to.deep.equal({
      ...initialState,
      bar: "barbarian",
      foo: "foobarbarianbarbarian",
      baz: [6, 6, 6, "barbarian".length],
    });
  });

  it("should be able to work with async actions", async () => {
    const updateBar = effect(testStore, async () => ({ bar: "23" }));
    await updateBar();
    expect(testStore).to.deep.equal({ ...initialState, bar: "23" });
  });

  it("should be able to work with async actions (+input params)", async () => {
    const updateBar = effect(testStore, async (bar: string) => ({ bar }));
    await updateBar("23");
    expect(testStore).to.deep.equal({ ...initialState, bar: "23" });
  });
});

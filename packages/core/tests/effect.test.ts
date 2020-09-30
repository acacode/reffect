import { store, effect, StoreModifier, Store } from "../src";
import * as chai from "chai";

const { expect } = chai;

describe("effect()", () => {
  const initialState = { foo: "bar", baz: [1, 2, 3], bar: "bar" };
  const storeName = "store-name";
  const modifiers: StoreModifier<typeof initialState>[] = [store => store];

  let testStore: Store<typeof initialState>;

  beforeEach(() => {
    testStore = store({
      name: storeName,
      modifiers,
      initialState,
    });
  });

  it("should return void function", () => {
    const testEffect = effect({
      store: testStore,
      action: state => ({ ...state, bar: "22" }),
    });

    expect(testEffect()).to.equal(undefined);
  });
  it("should be able to update store via action", () => {
    const testEffect = effect({
      store: testStore,
      action: (state, bar: string) => ({ ...state, bar }),
    });
    testEffect("22");
    expect(testStore.state).to.deep.equal({ ...initialState, bar: "22" });
  });

  it("should be able to update store via actions combination", () => {
    const testEffect1 = effect({
      store: testStore,
      action: (state, bar: string) => ({ ...state, bar }),
    });
    const testEffect2 = effect({
      store: testStore,
      action: (state, bar: string) => testEffect1(bar),
    });
    testEffect2("22");
    expect(testStore.state).to.deep.equal({ ...initialState, bar: "22" });
  });

  it("should be able to work with async actions", async () => {
    const testEffect1 = effect({
      store: testStore,
      action: async state => ({ ...state, bar: "23" }),
    });

    await testEffect1();

    expect(testStore.state).to.deep.equal({ ...initialState, bar: "23" });
  });

  it("should be able to work with async actions (+input params)", async () => {
    const testEffect1 = effect({
      store: testStore,
      action: async (state, bar: string) => ({ ...state, bar }),
    });

    await testEffect1("23");

    expect(testStore.state).to.deep.equal({ ...initialState, bar: "23" });
  });
});

import { createStore } from "..";
import { expect } from "chai";

describe("createStore()", () => {
  const initialState = { foo: "bar", baz: [1, 2, 3], bar: "bar" };
  const storeName = "store-name";
  const middlewares = [];

  const initializeCases = [
    ["only initial state", [initialState]],
    ["initial state + store name", [initialState, storeName]],
    ["store name + initial state", [storeName, initialState]],
    ["store name + initial state + middlewares", [storeName, initialState, middlewares]],
    ["initial state + store name + middlewares", [initialState, storeName, middlewares]],
  ] as const;

  initializeCases.forEach(([caseName, inputArgs]) => {
    describe(caseName, () => {
      let store: object;

      beforeEach(() => {
        store = createStore(...(inputArgs as any));
      });

      it("return value should be equal to initial state", () => {
        expect(store).to.deep.equal(initialState);
      });
    });
  });
});

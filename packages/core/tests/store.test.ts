import { store, StoreMiddleware, StoreType, manage } from "../src";
import * as chai from "chai";
import * as spies from "chai-spies";
chai.use(spies);

const { spy, expect } = chai;

describe("store()", () => {
  const initialState = { foo: "bar", baz: [1, 2, 3], bar: "bar" };
  const storeName = "store-name";
  const middlewares: StoreMiddleware<typeof initialState>[] = [];

  const initializeCases = [
    ["only initial state", [initialState]],
    ["initial state + store name", [initialState, storeName]],
    ["store name + initial state", [storeName, initialState]],
    ["store name + initial state + middlewares", [storeName, initialState, middlewares]],
    ["initial state + store name + middlewares", [initialState, storeName, middlewares]],
  ] as const;

  initializeCases.forEach(([caseName, inputArgs]) => {
    describe(caseName, () => {
      let testStore: object;

      beforeEach(() => {
        testStore = store(...(inputArgs as any));
      });

      it("return value should be equal to initial state", () => {
        expect(testStore).to.deep.equal(initialState);
      });
    });
  });

  describe("middlewares", () => {
    it("should call middleware when create a store", () => {
      const middlewareSpy = spy();
      const middleware = <Store extends StoreType>(store: Store) => {
        middlewareSpy();
        return store;
      };
      store({ foo: "bar", bar: "baz" }, storeName, [middleware]);
      expect(middlewareSpy).to.been.called.once;
    });
    it("should be able to mutate store manager", () => {
      const middleware = <Store extends StoreType>(store: Store) => {
        const manager = manage(store);
        manager.partialUpdate = () => ({});
        return store;
      };
      const testStore = store({ foo: "bar", bar: "baz" }, storeName, [middleware]);
      manage(testStore).partialUpdate({ foo: "baz" });
      expect(testStore).to.deep.equal({ foo: "bar", bar: "baz" });
    });
    it("should be able to store state", () => {
      const middleware = <Store extends StoreType>(store: Store) => ({
        ...store,
        newProp: "value",
      });
      const testStore = store({ foo: "bar", bar: "baz" }, storeName, [middleware]);
      expect(testStore).to.deep.equal({ foo: "bar", bar: "baz", newProp: "value" });
    });
  });
});

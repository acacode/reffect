import { store, StoreModifier, StateType } from "../src";
import * as chai from "chai";
import * as spies from "chai-spies";
import { Store, StoreConfiguration } from "../src/store";
chai.use(spies);

const { spy, expect } = chai;

describe("store()", () => {
  const initialState = { foo: "bar", baz: [1, 2, 3], bar: "bar" };
  type State = typeof initialState;
  const storeName = "store-name";
  const modifiers: StoreModifier<typeof initialState>[] = [];

  const initializeCases: { caseName: string; configuration: StoreConfiguration<State> }[] = [
    {
      caseName: "with initial state",
      configuration: { initialState },
    },
    {
      caseName: "with initial state and store name",
      configuration: { initialState, name: storeName },
    },
    {
      caseName: "with store name and initial state and modifiers",
      configuration: { name: storeName, initialState, modifiers },
    },
  ];

  initializeCases.forEach(({ caseName, configuration }) => {
    describe(caseName, () => {
      let testStore: Store<object>;

      beforeEach(() => {
        testStore = store(configuration) as Store<object>;
      });

      it("return value should be equal to initial state", () => {
        expect(testStore.state).to.deep.equal(initialState);
      });
    });
  });

  describe("modifiers", () => {
    it("should call middleware when create a store", () => {
      const middlewareSpy = spy();
      const middleware = <State extends StateType>(store: State) => {
        middlewareSpy();
        return store;
      };
      store({
        initialState: { foo: "bar", bar: "baz" },
        name: storeName,
        modifiers: [middleware],
      });
      expect(middlewareSpy).to.been.called.once;
    });
    it("should be able to mutate store manager", () => {
      const middleware = <State extends StateType>(store: Store<State>) => {
        store.set = () => {};
        return store;
      };
      const testStore = store({
        initialState: { foo: "bar", bar: "baz" },
        name: storeName,
        modifiers: [middleware],
      });
      testStore.set({ bar: "bad", foo: "baz" });
      expect(testStore.state).to.deep.equal({ foo: "bar", bar: "baz" });
    });
    it("should be able to store state", () => {
      const middleware = <State extends Record<string, string>>(store: Store<State>) => {
        store.set({
          ...store.state,
          newProp: "value",
        });

        return store;
      };
      const testStore = store({
        initialState: { foo: "bar", bar: "baz" },
        name: storeName,
        modifiers: [middleware],
      });
      expect(testStore.state).to.deep.equal({ foo: "bar", bar: "baz", newProp: "value" });
    });
  });
});

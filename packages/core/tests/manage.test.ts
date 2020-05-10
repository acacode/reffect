import {
  store,
  manage,
  StoreManager,
  StoreMiddleware,
  effect,
  EffectManager,
  EffectState,
  StoreType,
  EffectAction,
} from "../src";
import * as chai from "chai";
import * as spies from "chai-spies";
chai.use(spies);

const { spy, expect } = chai;

describe("manage()", () => {
  describe("stores", () => {
    const initialState = { foo: "bar", baz: [1, 2, 3], bar: "bar" };
    const storeName = "store-name";
    const middlewares: StoreMiddleware<typeof initialState>[] = [store => store];

    let testStore: typeof initialState;
    let testStoreManager: StoreManager<object>;

    let spyFunc: () => void;

    beforeEach(() => {
      testStore = store(initialState, storeName, middlewares);
      testStoreManager = manage(testStore);
      spyFunc = spy();
    });

    it(`should have store name`, () => {
      expect(testStoreManager.name).to.equal(storeName);
    });

    it(`should have initial state`, () => {
      expect(testStoreManager.initialState).to.deep.equal(initialState);
    });

    it(`should not mutate initial state after update`, () => {
      testStore.baz.push(2);
      expect(testStoreManager.initialState).to.deep.equal(initialState);
    });

    it(`should not mutate initial state after update (partialUpdate)`, () => {
      testStoreManager.partialUpdate({ bar: "baz" });
      expect(testStoreManager.initialState).to.deep.equal(initialState);
    });

    it("should update state via storeManager.partialUpdate()", () => {
      testStoreManager.partialUpdate({ barbaz: "barbaz" });
      expect(testStore).to.deep.equal({ ...initialState, barbaz: "barbaz" });
    });

    it("should be able to subscribe on store changes", done => {
      const update = { test: "test1" };
      testStoreManager.subscribe(partialUpdate => {
        expect(partialUpdate).to.deep.equal(update);
        done();
      });
      testStoreManager.partialUpdate({ ...update });
    });

    it("should be able to unsubscribe from store changes", done => {
      const unsubscribe = testStoreManager.subscribe(spyFunc);

      testStoreManager.partialUpdate({ test: "test1" });
      unsubscribe();
      testStoreManager.partialUpdate({ test2: "test2" });

      expect(spyFunc).to.have.been.called.once;
      done();
    });
  });

  describe("effects", () => {
    let testStore: StoreType;
    let testEffect: EffectAction<typeof testStore, [string?]>;
    let testEffectManager: EffectManager<object, [(string | undefined)?]>;
    // let spyFunc: () => void;

    beforeEach(() => {
      testStore = store({ foo: "bar " });
      testEffect = effect(testStore, (foo?: string) => ({ foo }));
      testEffectManager = manage(testEffect);
      // spyFunc = spy();
    });

    it(`should have state`, () => {
      expect(testEffectManager.state).to.equal(null);
    });

    it(`should change state after call effect`, () => {
      testEffect();
      expect(testEffectManager.state).to.equal("done");
    });

    it(`should have last return update (empty last return update)`, () => {
      expect(testEffectManager.value).to.deep.equal(void 0);
    });

    it(`should change last return update value`, () => {
      testEffect();
      expect(testEffectManager.value).to.deep.equal({ foo: undefined });
    });

    it(`should contains last input args`, () => {
      testEffect("faz");
      expect(testEffectManager.args).to.deep.equal(["faz"]);
    });

    describe("subscribe()", () => {
      it(`sync done cycle`, () => {
        const fullEffectStateCycle: EffectState[] = [testEffectManager.state];
        const unsubscribe = testEffectManager.subscribe(state => fullEffectStateCycle.push(state));
        testEffect("faz");
        unsubscribe();
        expect(fullEffectStateCycle).to.deep.equal([null, "pending", "done"]);
      });
      it(`sync fail cycle`, () => {
        testEffect = effect(testStore, (foo?: string) => {
          let voidValue = (undefined as any) as object;
          return { foo: voidValue["value"] + foo };
        });
        testEffectManager = manage(testEffect);

        const fullEffectStateCycle: EffectState[] = [testEffectManager.state];
        const unsubscribe = testEffectManager.subscribe(state => fullEffectStateCycle.push(state));
        try {
          testEffect("faz");
        } catch (e) {}
        unsubscribe();
        expect(fullEffectStateCycle).to.deep.equal([null, "pending", "fail"]);
      });
      it(`async done cycle`, async () => {
        testEffect = effect(testStore, async (foo?: string) => ({ foo }));
        testEffectManager = manage(testEffect);

        const fullEffectStateCycle: EffectState[] = [testEffectManager.state];
        const unsubscribe = testEffectManager.subscribe(state => fullEffectStateCycle.push(state));
        await testEffect("faz");
        unsubscribe();
        expect(fullEffectStateCycle).to.deep.equal([null, "pending", "done"]);
      });
      it(`async fail cycle`, async () => {
        const testFailEffect = effect(testStore, async (foo?: string) => {
          let voidValue = (undefined as any) as object;
          return { foo: voidValue["value"] + foo };
        });
        const testFailEffectManager = manage(testFailEffect);

        const fullEffectStateCycle: EffectState[] = [testFailEffectManager.state];
        const unsubscribe = testFailEffectManager.subscribe(state => fullEffectStateCycle.push(state));

        try {
          await testFailEffect("faz");
        } catch (e) {
          unsubscribe();
          expect(fullEffectStateCycle).to.deep.equal([null, "pending", "fail"]);
        }
      });
    });
    // it(`should have initial state`, () => {
    //   expect(testEffectManager.initialState).to.deep.equal(initialState);
    // });

    // it(`should not mutate initial state after update`, () => {
    //   testStore.baz.push(2);
    //   expect(testEffectManager.initialState).to.deep.equal(initialState);
    // });

    // it(`should not mutate initial state after update (partialUpdate)`, () => {
    //   testEffectManager.partialUpdate({ bar: "baz" });
    //   expect(testEffectManager.initialState).to.deep.equal(initialState);
    // });

    // it("should update state via storeManager.partialUpdate()", () => {
    //   testEffectManager.partialUpdate({ barbaz: "barbaz" });
    //   expect(testStore).to.deep.equal({ ...initialState, barbaz: "barbaz" });
    // });

    // it("should be able to subscribe on store changes", done => {
    //   const update = { test: "test1" };
    //   testEffectManager.subscribe(partialUpdate => {
    //     expect(partialUpdate).to.deep.equal(update);
    //     done();
    //   });
    //   testEffectManager.partialUpdate({ ...update });
    // });

    // it("should be able to unsubscribe from store changes", done => {
    //   const unsubscribe = testEffectManager.subscribe(spyFunc);

    //   testEffectManager.partialUpdate({ test: "test1" });
    //   unsubscribe();
    //   testEffectManager.partialUpdate({ test2: "test2" });

    //   expect(spyFunc).to.have.been.called.once;
    //   done();
    // });
  });
});

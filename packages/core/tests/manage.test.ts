import { store, manage, StoreManager, StoreMiddleware } from "..";
import * as chai from "chai";
import * as spies from "chai-spies";
chai.use(spies);

const { spy, expect } = chai;

describe("manage()", () => {
  const initialState = { foo: "bar", baz: [1, 2, 3], bar: "bar" };
  const storeName = "store-name";
  const middlewares: StoreMiddleware<typeof initialState>[] = [storeManager => storeManager];

  let testStore: typeof initialState;
  let testStoreManager: StoreManager<object>;

  beforeEach(() => {
    testStore = store(initialState, storeName, middlewares);
    testStoreManager = manage(testStore);
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
    const subscriberSpy = spy();
    const unsubscribe = testStoreManager.subscribe(subscriberSpy);

    testStoreManager.partialUpdate({ test: "test1" });
    unsubscribe();
    testStoreManager.partialUpdate({ test2: "test2" });

    expect(subscriberSpy).to.have.been.called.once;
    done();
  });
});

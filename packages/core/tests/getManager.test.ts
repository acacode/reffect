import { createStore, getManager, StoreManager, Middleware } from "..";
import * as chai from "chai";
import * as spies from "chai-spies";
chai.use(spies);

const { spy, expect } = chai;

describe("getManager()", () => {
  const initialState = { foo: "bar", baz: [1, 2, 3], bar: "bar" };
  const storeName = "store-name";
  const middlewares: Middleware<typeof initialState>[] = [storeManager => storeManager];

  let store: typeof initialState;
  let storeConfig: StoreManager<object>;

  beforeEach(() => {
    store = createStore(initialState, storeName, middlewares);
    storeConfig = getManager(store);
  });

  it(`should have store name`, () => {
    expect(storeConfig.name).to.equal(storeName);
  });

  it(`should have initial state`, () => {
    expect(storeConfig.initialState).to.deep.equal(initialState);
  });

  it(`should not mutate initial state after update`, () => {
    store.baz.push(2);
    expect(storeConfig.initialState).to.deep.equal(initialState);
  });

  it(`should not mutate initial state after update (partialUpdate)`, () => {
    storeConfig.partialUpdate({ bar: "baz" });
    expect(storeConfig.initialState).to.deep.equal(initialState);
  });

  it("should update state via storeManager.partialUpdate()", () => {
    storeConfig.partialUpdate({ barbaz: "barbaz" });
    expect(store).to.deep.equal({ ...initialState, barbaz: "barbaz" });
  });

  it("should be able to subscribe on store changes", done => {
    const update = { test: "test1" };
    storeConfig.subscribe(partialUpdate => {
      expect(partialUpdate).to.deep.equal(update);
      done();
    });
    storeConfig.partialUpdate({ ...update });
  });

  it("should be able to unsubscribe from store changes", done => {
    const subscriberSpy = spy();
    storeConfig.subscribe(subscriberSpy);

    storeConfig.partialUpdate({ test: "test1" });
    storeConfig.unsubscribe(subscriberSpy);
    storeConfig.partialUpdate({ test2: "test2" });

    expect(subscriberSpy).to.have.been.called.once;
    done();
  });
});

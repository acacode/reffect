# 1.5.0

### Features:

1. Subscriptions on effects via `manage(effect)`. Now subscriber also can watch for return action's value and input arguments.

### Fixes:

1. Fix bug with typings when created async effect is not return `Promise<T>` type (if store have type `object`)
2. Typings of sync/async effects

# 1.4.1

### Minor:

1. Fix README

# 1.4.0

### Breaking changes:

1. rename `createStore` to `store`
2. rename `manageStore` to `manage`
3. remove `subscribe` from store manager. Now `subscribe()` returns unsubscribe function
4. _[Internal]_ rename types `Subscriber -> StoreSubscriber`, `Middleware -> StoreMiddleware`
5. _[Internal]_ rename internal key value `Symbol("store_id") -> Symbol("reffect_key")`

### Features:

1. Effects have execution states (`"done"`, `"pending"`, `"fail"`)
2. Ability to subscribe on changes of execution state of the effect
3. Generating `d.ts` file

# 1.2.1

### Internal:

1. Add unit tests

# 1.2.0

### Breaking changes:

1. Rename `watch` , `unwatch` to `subscribe` and `unsubscribe`
2. Rename type `Watcher` to `Subscriber`
3. All store partial updates will been copied before update original store

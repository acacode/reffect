# 1.2.1

Internal:

1. Add unit tests

# 1.2.0

Breaking changes:

1. Rename `watch` , `unwatch` to `subscribe` and `unsubscribe`
2. Rename type `Watcher` to `Subscriber`
3. All store partial updates will been copied before update original store

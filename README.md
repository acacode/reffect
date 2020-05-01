<div align="center">

[![reffect logo](https://raw.githubusercontent.com/acacode/reffect/master/assets/reffect.png)](https://github.com/acacode/reffect)  
[![npm](https://img.shields.io/npm/v/@reffect/core?style=flat-square&color=blue)](https://www.npmjs.com/package/@reffect/core)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@reffect/core?style=flat-square&color=blue)](https://bundlephobia.com/result?p=@reffect/core)
[![license](https://img.shields.io/github/license/acacode/reffect?style=flat-square&color=blue)](https://github.com/acacode/reffect)

<div align="left">

Reffect — is a declarative and reactive multi-store state manager for JavaScript/TypeScript applications inspired by [Reatom](https://github.com/artalar/reatom) and [Effector](https://github.com/zerobias/effector)

## Packages

- [`@reffect/core`](https://github.com/acacode/reffect/tree/master/packages/core) - main features (creating stores and effects)  
  [![npm](https://img.shields.io/npm/v/@reffect/core?style=flat-square&color=blue)](https://www.npmjs.com/package/@reffect/core) [![npm bundle size](https://img.shields.io/bundlephobia/minzip/@reffect/core?style=flat-square&color=blue)](https://bundlephobia.com/result?p=@reffect/core)
- [`@reffect/react`](https://github.com/acacode/reffect/tree/master/packages/react) - bindings for [React](https://github.com/facebook/react)  
  [![npm](https://img.shields.io/npm/v/@reffect/react?style=flat-square&color=blue)](https://www.npmjs.com/package/@reffect/react) [![npm bundle size](https://img.shields.io/bundlephobia/minzip/@reffect/react?style=flat-square&color=blue)](https://bundlephobia.com/result?p=@reffect/react)
- [`@reffect/logger`](https://github.com/acacode/reffect/tree/master/packages/logger) - store middleware which log each store update  
  [![npm](https://img.shields.io/npm/v/@reffect/logger?style=flat-square&color=blue)](https://www.npmjs.com/package/@reffect/logger) [![npm bundle size](https://img.shields.io/bundlephobia/minzip/@reffect/logger?style=flat-square&color=blue)](https://bundlephobia.com/result?p=@reffect/logger)
- [`@reffect/localstore`](https://github.com/acacode/reffect/tree/master/packages/localstore) - store middleware which synchronize store with local storage key  
  [![npm](https://img.shields.io/npm/v/@reffect/localstore?style=flat-square&color=blue)](https://www.npmjs.com/package/@reffect/localstore) [![npm bundle size](https://img.shields.io/bundlephobia/minzip/@reffect/localstore?style=flat-square&color=blue)](https://bundlephobia.com/result?p=@reffect/localstore)

## Examples

Simple counter

```ts
import { store, effect, manage } from "@reffect/core";

const counter = store({ value: 0 });

const plus = effect(counter, (num: number) => ({ value: counter.value + num }));
const plus10 = effect(counter, () => plus(10));

const unsubscribe = manage(counter).subscribe((update, prevState, currState) =>
  console.log(update, prevState, currState),
);

plus(10);
plus10();

console.log(counter.value); // 20
```

Async effects

```ts
import { store, effect, manage } from "@reffect/core";
import { logger } from "@reffect/logger";

export const usersStore = store("users-store", { list: [] }, [logger]);

export const getUsers = effect(usersStore, async () => {
  const allUsers = await api.getAllUsers();

  return {
    list: allUsers,
  };
});

getUsers(); // Promise<void>
```

React usage

```tsx
import React from "react";
import { usersStore, getUsers } from "./above-example.ts";
import { useStore, useEffectState } from "@reffect/react";

export const UsersList = () => {
  const users = useStore(usersStore);
  const { loading, done, error } = useEffectState(getUsers);

  return (
    <ul>
      {!loading && done && users.list.map(user => <li>{user.name}</li>)}
      {loading && "Loading..."}
      {error && "Error!"}
    </ul>
  );
};
```

## How it works

![Data flow diagram](https://raw.githubusercontent.com/acacode/reffect/master/assets/diagram.png)

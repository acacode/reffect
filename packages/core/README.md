<div align="center">

[![reffect logo](https://raw.githubusercontent.com/acacode/reffect/master/assets/reffect.png)](https://github.com/acacode/reffect)  
[![npm](https://img.shields.io/npm/v/@reffect/core?style=flat-square&color=blue)](https://www.npmjs.com/package/@reffect/core)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@reffect/core?style=flat-square&color=blue)](https://bundlephobia.com/result?p=@reffect/core)
[![license](https://img.shields.io/github/license/acacode/reffect?style=flat-square&color=blue)](https://github.com/acacode/reffect)

<div align="left">

Reffect — is a declarative and reactive multi-store state manager for JavaScript/TypeScript applications inspired by [Reatom](https://github.com/artalar/reatom) and [Effector](https://github.com/zerobias/effector)

# @reffect/core

Package which contains main features of [`Reffect`](https://github.com/acacode/reffect)

## Brief docs

`Reffect` have stores and effects:

1. Stores - it is simple JavaScript objects whose values are state of store.
2. Effects - it is functions which creates via `effect(store, effectDeclaration)`.  
   Effect declaration can be `function`, `property name of store state`, or just `void`.

Also `Reffect` have export `manageStore(store)` which gives extra features for additional packages(like subscribe on store changes, partial update)

## How to use

Create a store

```ts
import { createStore } from "@reffect/core";

type KeyboardsState = {
  list: Keyboard[];
  selected?: Keyboard;
};

const keyboards = createStore<KeyboardsState>({ list: [] });

// keyboards.list -> []
// Object.keys(keyboards) -> ["list"]
```

Create a store effects

Simple property update

```ts
import { effect } from "@reffect/core";

const setKeyboards = effect(keyboards, "list");

// setKeyboards([{ name: "keyboard1" }]) // void
```

Custom store update

```ts
import { effect } from "@reffect/core";

const selectKeyboard = effect(keyboards, keyboardId => {
  return {
    selected: keyboards.find(keyboard => keyboard.id === keyboardId),
  };
});

// selectKeyboard(1) // void
```

Custom async store update

```ts
import { effect } from "@reffect/core";

const getKeyboards = effect(keyboards, async () => {
  const keyboardsList = await api.getKeyboards();

  return {
    list: keyboardsList,
  };
});

// or more beauty
const getKeyboards = effect(keyboards, async () => setKeyboards(await api.getKeyboards));
```

And just simple store update

```ts
const updateKeyboards = effect(keyboards);

// updateKeyboards({ list: [], selected: null })
```

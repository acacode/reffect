<div align="center">

[![reffect logo](https://raw.githubusercontent.com/acacode/reffect/master/assets/reffect.png)](https://github.com/acacode/reffect)  
[![npm](https://img.shields.io/npm/v/@reffect/react?style=flat-square&color=blue)](https://www.npmjs.com/package/@reffect/react)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@reffect/react?style=flat-square&color=blue)](https://bundlephobia.com/result?p=@reffect/react)
[![license](https://img.shields.io/github/license/acacode/reffect?style=flat-square&color=blue)](https://github.com/acacode/reffect)

<div align="left">

Reffect — is a declarative and reactive multi-store state manager for JavaScript/TypeScript applications inspired by [Reatom](https://github.com/artalar/reatom) and [Effector](https://github.com/zerobias/effector)

# @reffect/react

bindings (hooks) for [`React`](https://github.com/facebook/react)

Hooks:

`useStore(store)` - returns actual store state  
`useEffectState(effect)` - returns effect's state flags (`{ pending: boolean, fail: boolean, done: boolean }`)

## How to use

```tsx
import React from "react";
import { useStore, useEffectState } from "@reffect/react";
import { keyboardsStore, selectKeyboard, getAllKeyboards } from "path/to/store";
// keyboardsStore it is store created via `createStore()`
// selectKeyboard it is effect created via `effect()`
// getAllKeyboards it is async effect created via `effect()`

const KeyboardsData = () => {
  const { list } = useStore(keyboardsStore);
  const { pending } = useEffectState(getAllKeyboards);

  useEffect(() => {
    getAllKeyboards();
  }, []);

  return (
    <div>
      {pending && <div>Loading</div>}
      {!pending &&
        list.map(keyboard => (
          <div key={keyboard.id} onClick={() => selectKeyboard(keyboard.id)}>
            {keyboard.name}
          </div>
        ))}
    </div>
  );
};
```

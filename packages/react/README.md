<div align="center">

[![reffect logo](https://raw.githubusercontent.com/acacode/reffect/master/assets/reffect.png)](https://github.com/acacode/reffect)  
[![npm](https://img.shields.io/npm/v/@reffect/react?style=flat-square&color=blue)](https://www.npmjs.com/package/@reffect/react)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@reffect/react?style=flat-square&color=blue)](https://bundlephobia.com/result?p=@reffect/react)
[![license](https://img.shields.io/github/license/acacode/reffect?style=flat-square&color=blue)](https://github.com/acacode/reffect)

<div align="left">

Reffect — is a declarative and reactive multi-store state manager for JavaScript/TypeScript applications inspired by [Reatom](https://github.com/artalar/reatom) and [Effector](https://github.com/zerobias/effector)

# @reffect/react

React bindings for [`Reffect`](https://github.com/acacode/reffect)

## How to use

```tsx
import React from "react";
import { useStore } from "@reffect/react";
import { keyboardsStore, selectKeyboard } from "path/to/store";
// keyboardsStore it is store created via `createStore()`
// selectKeyboard it is effect created via `effect()`

const KeyboardsData = () => {
  const { list } = useStore(keyboardsStore);

  return (
    <div>
      {list.map(keyboard => (
        <div key={keyboard.id} onClick={() => selectKeyboard(keyboard.id)}>
          {keyboard.name}
        </div>
      ))}
    </div>
  );
};
```

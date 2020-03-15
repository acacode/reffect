<div align="center">

[![reffect logo](https://raw.githubusercontent.com/acacode/reffect/master/assets/reffect.png)](https://github.com/acacode/reffect)  
[![npm](https://img.shields.io/npm/v/@reffect/localstore?style=flat-square&color=blue)](https://www.npmjs.com/package/@reffect/localstore)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@reffect/localstore?style=flat-square&color=blue)](https://bundlephobia.com/result?p=@reffect/localstore)
[![license](https://img.shields.io/github/license/acacode/reffect?style=flat-square&color=blue)](https://github.com/acacode/reffect)

<div align="left">

Reffect — is a declarative and reactive multi-store state manager for JavaScript/TypeScript applications inspired by [Reatom](https://github.com/artalar/reatom) and [Effector](https://github.com/zerobias/effector)

# @reffect/localstore

Store middleware for [`Reffect`](https://github.com/acacode/reffect)

## How to use

```ts
import { createStore } from "@reffect/core";
import { localstore } from "@reffect/localstore";

const keyboards = createStore({ list: [] }, [localstore]);
```

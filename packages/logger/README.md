<div align="center">

[![reffect logo](https://raw.githubusercontent.com/acacode/reffect/master/assets/reffect.png)](https://github.com/acacode/reffect)  
[![npm](https://img.shields.io/npm/v/@reffect/logger?style=flat-square&color=blue)](https://www.npmjs.com/package/@reffect/logger)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@reffect/logger?style=flat-square&color=blue)](https://bundlephobia.com/result?p=@reffect/logger)
[![license](https://img.shields.io/github/license/acacode/reffect?style=flat-square&color=blue)](https://github.com/acacode/reffect)

<div align="left">

Reffect — is a declarative and reactive multi-store state manager for JavaScript/TypeScript applications inspired by [Reatom](https://github.com/artalar/reatom) and [Effector](https://github.com/zerobias/effector)

# @reffect/logger

Store middleware for [`Reffect`](https://github.com/acacode/reffect)

## How to use

```ts
import { store } from "@reffect/core";
import { logger } from "@reffect/logger";

const projectsStore = store({ projects: [] }, "projects", [logger]);

// ...
```

## How it looks

![example-image](./assets/logger-example.jpg)

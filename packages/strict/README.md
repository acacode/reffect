<div align="center">

[![reffect logo](https://raw.githubusercontent.com/acacode/reffect/master/assets/reffect.png)](https://github.com/acacode/reffect)  
[![npm](https://img.shields.io/npm/v/@reffect/strict?style=flat-square&color=blue)](https://www.npmjs.com/package/@reffect/strict)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@reffect/strict?style=flat-square&color=blue)](https://bundlephobia.com/result?p=@reffect/strict)
[![license](https://img.shields.io/github/license/acacode/reffect?style=flat-square&color=blue)](https://github.com/acacode/reffect)

<div align="left">

Reffect — is a declarative and reactive multi-store state manager for JavaScript/TypeScript applications inspired by [Reatom](https://github.com/artalar/reatom) and [Effector](https://github.com/zerobias/effector)

# @reffect/strict

Store middleware for [`Reffect`](https://github.com/acacode/reffect)

## How to use

```ts
import { store, effect } from "@reffect/core";
import { strictUpdate } from "@reffect/logger";

const projectsStore = store({ projects: [] }, "projects", [strictUpdate]);

const setProjects = effect(projectsStore, "projects");
// ...

setProjects(["foo", "bar"]); // state of projectsStore will update to { projects: ["foo", "bar"] }
setProjects(["foo", "bar"]); // state of projectsStore won't update because new state and current are equals
```

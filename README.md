# reistore - Relational Mutable State Manager
Make state managers greate again!

1. Fastest initialization compare to redux
2. Native SSR support, shared initialization part between requests
3. Unified api for objects, arrays and maps
4. Batches and possible undo / redo
5. You need "Reducer" only when need to describe store relationships
6. Fastest mutation speed compare to redux
7. Supports module architecture

[![Travis](https://img.shields.io/travis/Wroud/reistore.svg)](https://travis-ci.org/Wroud/reistore)
[![codecov](https://codecov.io/gh/Wroud/reistore/branch/master/graph/badge.svg)](https://codecov.io/gh/Wroud/reistore)
[![GitHub issues](https://img.shields.io/github/issues/Wroud/reistore.svg)](https://github.com/Wroud/reistore/issues)
[![GitHub license](https://img.shields.io/github/license/Wroud/reistore.svg)](https://github.com/Wroud/reistore/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/reistore.svg?style=flat-square)](https://www.npmjs.com/package/reistore)
[![npm downloads](https://img.shields.io/npm/dm/reistore.svg?style=flat-square)](https://www.npmjs.com/package/reistore)

## Install
```
npm i reistore
```

## Examples
* [Todo](https://codesandbox.io/s/github/Wroud/reistore-react/tree/master/examples/ts)
* [SSR](https://codesandbox.io/s/github/Wroud/reistore-react/tree/master/examples/ssr)

## Usage
### Simple
```js
import { 
  createStore,
  buildSchema
} from "reistore";

const store = createStore(); // you can pass initial state here by first argument
const { schema: { counter } } = buildSchema()
  .field("counter", () => 0); // add field `counter` with default value `0`

store.subscribe((state, changes) => {
  if(changes.some(change => change.in(counter))) { // check is counter value changed
    console.log("Counter value: ", state.counter);
  }
});
// or you can subscribe directly to counter changes
store.subscribe(
  (state, change) => {
    console.log("Counter value: ", change.value);
  },
  counter
)

store.set(counter, 1);
// > Counter value: 1
// > Counter value: 1
const value = store.state.counter;
// value = 1
```

### Arrays and Maps
Reistore provide unified api for working with array and map structures in store.
```js
import { 
  createStore,
  buildSchema
} from "reistore";

const store = createStore(); // you can pass initial state here by first argument
const { schema: { name, friends, skills } } = buildSchema()
  .field("name", () => "Alex")
  .array("friends", undefined, () => ["Josie", "Max"])
  .map("skills", b =>
    b.field("started", () => "12.03.1990")
    .field("level", () => "noob"),
    () => (new Map()).set("wakeboarding", { level: "master", started: "12.03.1998"})
  );

store.set(name, "Jon");
store.set(friends(0), "Max");
store.set(friends(1), "Frodo");
store.set(skills("sleeping"), { level: "grandmaster", started: "from born" });
const value = store.state;
/*
  {
    name: "Jon",
    friends: ["Max", "Frodo"],
    skills: Map {
      "wakeboarding" => { level: "master", started: "12.03.1998"},
      "sleeping" => { level: "grandmaster", started: "from born" }
    }
  }
*/

store.get(friends([0, 1]));
/*
  ["Max", "Frodo"]
*/

store.get(skills(["sleeping", "wakeboarding"], skill => skill.level))
/*
  ["grandmaster", "master"]
*/
```

### Batch API
You also can use batch api for executing series of commands.
Subscribers was executed once after `batch`.
```js
import {
  createStore,
  buildSchema
} from "reistore";

const store = createStore();
const { schema: { counter } } = buildSchema()
  .field("counter", () => 0);

store.batch(instructor => {
  instructor.set(counter, 1);
  instructor.set(counter, 2);

  console.log(store.state.counter);
  // value = 2

  instructor.set(counter, 3);
});

console.log(store.get(counter)); // same as store.state.counter
// value = 3
```

### Min-Max transform
```js
import {
  createStore,
  createSchema,
  buildSchema
} from "reistore";

const { schema: { min, max } } = buildSchema()
  .field("min", () => 0)
  .field("max", () => 0);

function transformator(change, { state, set, apply }) {
  apply(change); // apply change to state
  if (state.min > state.max) {
    set(max, change.value); // apply change to max if min > max
  } else if (state.max < state.min) {
    set(min, change.value); // apply change to max if max < min
  }
}
const store = createStore(undefined, transformator);

store.set(min, 1);
console.log(store.state);
// { min: 1, max: 1 }

store.set(max, v => v - 10);
console.log(store.state);
// { min: -9, max: -9 }

store.set(min, -15);
// { min: -15, max: -9 }
console.log(store.state);
```

### Scope
```js
import {
  createStore,
  createSchema,
  createScope,
  buildSchema
} from "reistore";

const { schema: { sum, scope } } = buildSchema()
  .field("sum", () => 0)
  .node("scope", b =>
    b.field("min")
    .field("max"),
    () => ({
      min: 0,
      max: 0
    })
  );
const schema = createSchema();

function transformator(change, { state, scope: scopeState, set, apply }) {
  if (change.in(scope.min) && change.value > scopeState.max) { // if changed min and new value(min) > state.scope.max 
    set(scope.max, change.value);
  } else if (change.in(scope.max) && change.value < scopeState.min) { // if changed max and new value(max) < state.scope.min
    set(scope.min, change.value);
  }
  apply(change); // apply change to state
  set(sum, state.scope.max + state.scope.min); // update sum
}
createScope(schema, scope, transformator);
const store = createStore(schema);

store.set(scope.min, 1);
console.log(store.get(scope));
// { min: 1, max: 1 }
console.log(store.state);
// { sum: 2, scope: { min: 1, max: 1 } }
```


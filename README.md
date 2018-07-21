# reistore - Relational Immutable State Manager
Make state managers greate again!

1. Faster initialization compare to redux
2. Native SSR support
3. Transactions
4. You need "Reducer" only when need to describe store relationships
5. Comparable speed with redux
6. Supports module architecture

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
    Path
} from "reistore";

const initState = {
    counter: 0
};
const store = createStore(undefined, initState);
const counter = Path.create(f => f.counter);

store.subscibe((state, changes) => {
  if(changes.some(path => path.includes(counter))) {
    console.log("Counter value: ", state.counter);
  }
});

store.set(counter, 1);
// > Counter value: 1
const value = store.state.counter;
// value = 1
```
### Batch API
You also can use batch api for executing series of commands.
Batch always faster when you need execute more then one command.
```js
import {
  createStore,
  Path
} from "reistore";

const initState = {
  counter: 0
};
const store = createStore(undefined, initState);
const counter = Path.create(f => f.counter);

store.batch(instructor => {
  store.set(counter, 1);
  instructor.set(counter, 2);

  console.log(store.state.counter);
  // value = 0

  store.set(counter, 3);
});

console.log(store.state.counter);
// value = 3
```
### Injection API
You also can use injection API that give you access to state in batch and access to store modification.
```js
import {
  createStore,
  Path
} from "reistore";

const initState = {
  counter: 0
};
const store = createStore(undefined, initState);
const counter = Path.create(f => f.counter);

store.batch(instructor => {
  instructor.set(counter, 1);
  instructor.inject((state, instructor) => {
    console.log(state.counter);
    // value = 1
    instructor.set(counter, state.counter + 1);
  });

  console.log(store.state.counter);
  // value = 0

  instructor.set(counter, v => v + 3);
});

console.log(store.state.counter);
// value = 5
```
### Min-Max transform
```js
import {
  createStore,
  createSchema,
  Path
} from "reistore";

const initState = {
  min: 0,
  max: 0
};
const path = {
  min: Path.create(f => f.min),
  max: Path.create(f => f.max)
}
function* transformator(change, {state, set}) {
  yield change; // apply change to state
  if (state.min > state.max) {
    yield set(path.max, change.value); // apply change to max if min > max
  } else if (state.max < state.min) {
    yield set(path.min, change.value); // apply change to max if max < min
  }
}
const store = createStore(undefined, initState, transformator);

store.set(path.min, 1);
console.log(store.state);
// { min: 1, max: 1 }

store.set(path.max, v => v - 10);
console.log(store.state);
// { min: -9, max: -9 }

store.set(path.min, -15);
// { min: -15, max: -9 }
console.log(store.state);
```

### Scope
```js
import {
  createStore,
  createSchema,
  createScope,
  Path
} from "reistore";

const initState = {
  sum: 0
};
const scopeInitState = {
  min: 0,
  max: 0
}
const schema = createSchema(initState);

function* transformator(change, {state, set, scope}) {
  if (change.in(path.min) && change.value > scope().max) { // if changed min and new value(min) > state.scope.max 
    yield set(path.max, change.value);
  } else if (change.in(path.max) && change.value < scope().min) { // if changed max and new value(max) < state.scope.min
    yield set(path.min, change.value);
  }
  yield change; // apply change to state
  yield set(path.sum, state.scope.max + state.scope.min); // update sum
}
const scope = createScope(schema, f => f.scope, scopeInitState, transformator);
const path = {
  sum: Path.create(f => f.sum),
  min: scope.joinPath(f => f.min),
  max: scope.joinPath(f => f.max)
}
const store = createStore(schema);

store.set(path.min, 1);
console.log(scope.getState(store));
// { min: 1, max: 1 }
console.log(store.state);
// { sum: 2, scope: { min: 1, max: 1 } }
```


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
### Transaction API
You also can use transaction api for executing series of commands, transaction can be undone.
Transaction always faster when you need execute more then one command.
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

store.beginTransaction();
store.set(counter, 1);
store.set(counter, 2);

console.log(store.state.counter);
// value = 0

store.set(counter, 3);
store.flush();

console.log(store.state.counter);
// value = 3

store.beginTransaction();
store.set(counter, 1);
store.set(counter, 2);
store.set(counter, 3);
store.undoTransaction();

console.log(store.state.counter);
// value = 3
```
### Injection API
You also can use injection API that give you access to state in transaction and access to store modification.
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

store.beginTransaction();
store.set(counter, 1);
store.inject((state, instructor) => {
  console.log(state.counter);
  // value = 1
  instructor.set(counter, state.counter + 1);
});

console.log(store.state.counter);
// value = 0

store.set(counter, v => v + 3);
store.flush();

console.log(store.state.counter);
// value = 5
```
### Min-Max transform
```js
import {
  createStore,
  createSchema,
  Path,
  Instructor
} from "reistore";

const initState = {
  min: 0,
  max: 0
};
const path = {
  min: Path.create(f => f.min),
  max: Path.create(f => f.max)
}
function* transformer(instruction, is, getState) {
  yield instruction;
  if (is(path.min) && getState().min > getState().max) {
    yield Instructor.createSet(path.max, instruction.value);
  } else if (is(path.max) && getState().max < getState().min) {
    yield Instructor.createSet(path.min, instruction.value);
  }
}
const store = createStore(undefined, initState, transformer);

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
  Path,
  Instructor
} from "reistore";

const initState = {
  sum: 0
};
const scopeInitState = {
  min: 0,
  max: 0
}
const schema = createSchema(initState);

function* transformer(instruction, is, getState, storeState) {
  if (is(path.min) && instruction.value > getState().max) {
    yield Instructor.createSet(path.max, instruction.value);
  } else if (is(path.max) && instruction.value < getState().min) {
    yield Instructor.createSet(path.min, instruction.value);
  }
  yield instruction;
  yield Instructor.createSet(path.sum, storeState.scope.max + storeState.scope.min);
}
const scope = createScope(schema, f => f.scope, scopeInitState, transformer);
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


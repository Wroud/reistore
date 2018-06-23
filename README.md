# reistore - Relational Immutable State Manager
Make state managers greate again!

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
const counter = Path.fromSelector(f => f.counter);

store.set(counter, 1);
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
const counter = Path.fromSelector(f => f.counter);

store.beginTransaction();
store.set(counter, 1);
store.set(counter, 2);

const value = store.state.counter;
// value = 0

store.set(counter, 3);
store.flush();

const value = store.state.counter;
// value = 3

store.beginTransaction();
store.set(counter, 1);
store.set(counter, 2);
store.set(counter, 3);
store.undoTransaction();

const value = store.state.counter;
// value = 3
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
    min: Path.fromSelector(f => f.min),
    max: Path.fromSelector(f => f.max)
}
function* transformer(instruction, is, state) {
    if(is(path.min) && instruction.value > state.max) {
        yield Instructor.createSet(path.max, instruction.value);
    } else if(is(path.max) && instruction.value < state.min) {
        yield Instructor.createSet(path.min, instruction.value);
    }
    yield instruction;
}
const schema = createSchema(transformer);
const store = createStore(schema, initState);

store.set(path.min, 1);
const state = store.state;
// { min: 1, max: 1 }

store.set(path.max, v => v - 10);
const state = store.state;
// { min: -9, max: -9 }

store.set(path.min, -15);
const state = store.state;
// { min: -15, max: -10 }
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
    scope: {
        min: 0,
        max: 0
    }
};
const schema = createSchema();
const store = createStore(schema, initState);

function* transformer(instruction, is, state, storeState) {
    if(is(path.min) && instruction.value > state.max) {
        yield Instructor.createSet(path.max, instruction.value);
    } else if(is(path.max) && instruction.value < state.min) {
        yield Instructor.createSet(path.min, instruction.value);
    }
    yield instruction;
}
const scope = createScope(schema, f => f.scope, transformer);
const path = {
    min: scope.path.join(f => f.min),
    max: scope.path.join(f => f.max)
}

store.set(path.min, 1);
const state = scope.getState(store);
// { min: 1, max: 1 }
const storeState = store.state;
// { scope: { min: 1, max: 1 } }
```


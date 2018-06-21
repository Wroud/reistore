const { createStore, combineReducers } = require("redux");
const { createStore: efStore, createEvent: efAction } = require("effector");
const { Store, StoreSchema, Scope, Path } = require("../lib");
const { InstructionType } = require("../lib/enums/InstructionType");

const initCounterStore = {
    scope: {
        counter: 0
    }
};
const initNormalizedState = {
    news: [],
    show: []
};

const iterations = 100000;
suite("immutable noop", function () {
    set('iterations', iterations);
    bench("create", function () {
        const store = {
            scope: {
                counter: 0
            }
        };
    });
    let store = initCounterStore;
    bench("modify", function () {
        store = {
            ...store,
            scope: {
                ...store.scope,
                counter: 1
            }
        };
    });
});
suite("redux", function () {
    set('iterations', iterations);
    bench("create", function () {
        const store = createStore((d = null) => d);
        const action = { type: "any" };
    });
    let storeModify = createStore((state = initCounterStore) => ({
        ...state,
        scope: {
            ...state.scope,
            counter: 1
        }
    }));
    storeModify.subscribe(() => { });

    bench("modify", function () {
        storeModify.dispatch({ type: "init" });
    });

    function counterReducer(state = initCounterStore, action) {
        switch (action.type) {
            case 'INCREMENT':
                return {
                    ...state,
                    scope: {
                        ...state.scope,
                        counter: state.scope.counter + 1
                    }
                };
            case 'DECREMENT':
                return {
                    ...state,
                    scope: {
                        ...state.scope,
                        counter: state.scope.counter - 1
                    }
                };
            default:
                return state;
        }
    }

    const storeCounter = createStore(counterReducer);
    storeCounter.subscribe(() => { });

    bench("counter reducer", function () {
        storeCounter.dispatch({ type: 'INCREMENT' });
        storeCounter.dispatch({ type: 'DECREMENT' });
    });

    function normalizedReducer(state = initNormalizedState, action) {
        switch (action.type) {
            case 'add':
                return {
                    ...state,
                    news: [...state.news, action.payload],
                    show: [...state.show, action.payload.id]
                };
            case 'delete':
                return {
                    ...state,
                    news: state.news.filter(a => a.id !== action.payload),
                    show: state.show.filter(id => id !== action.payload)
                };
            default:
                return state;
        }
    }

    const storeNormalized = createStore(normalizedReducer);
    storeNormalized.subscribe(() => { });
    bench("normalized state", function () {
        for (let i = 0; i < 10; i++) {
            storeNormalized.dispatch({ type: 'add', payload: { id: i, text: "some news text" + i } });
        }
        for (let i = 9; i >= 0; i--) {
            storeNormalized.dispatch({ type: 'delete', payload: i });
        }
    });
});

suite("reistate", function () {
    set('iterations', iterations);
    bench("create", function () {
        const schema = new StoreSchema();
        const store = new Store(schema);
        Path.fromSelector(f => f.scope);
    });
    const path = Path.fromSelector(f => f.scope.counter);
    const storeModify = new Store(new StoreSchema(), initCounterStore);
    storeModify.updateHandler.subscribe(() => { });
    bench("modify", function () {
        storeModify.instructor.set(path, 1);
    });

    const storeCounter = new Store(new StoreSchema(), initCounterStore);
    storeCounter.updateHandler.subscribe(() => { });
    bench("counter reducer", function () {
        storeCounter.instructor.set(path, storeCounter.state.scope.counter + 1);
        storeCounter.instructor.set(path, storeCounter.state.scope.counter - 1);
    });

    const newsPath = Path.fromSelector(f => f.news);
    const showPath = Path.fromSelector(f => f.show);
    const schemaNormalized = new StoreSchema();
    const storeNormalized = new Store(schemaNormalized, initNormalizedState);
    storeNormalized.updateHandler.subscribe(() => { });
    schemaNormalized.transformator = (i, is, transformer, s) => {
        if (is(newsPath)) {
            if (i.type === InstructionType.add) {
                transformer.add(showPath, i.value.id);
            } else {
                transformer.remove(showPath, i.index);
            }
            transformer.applyInstruction();
        }
    };
    bench("normalized state", function () {
        for (let i = 0; i < 10; i++) {
            storeNormalized.instructor.add(newsPath, { id: i, text: "some news text" + i });
        }
        for (let i = 9; i >= 0; i--) {
            storeNormalized.instructor.remove(newsPath, i);
        }
    });
});

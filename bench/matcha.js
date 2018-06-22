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
    news: {},
    show: []
};
const normalizedCount = 10;

const iterations = 1000;
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
        store.subscribe(() => { });
        const action = { type: "any" };
    });
    let storeModify = createStore((state = { ...initCounterStore }) => ({
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

    function counterReducer(state = { ...initCounterStore }, action) {
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

    function normalizedReducer(state = { ...initNormalizedState }, action) {
        switch (action.type) {
            case 'add':
                return {
                    ...state,
                    news: { ...state.news, [action.payload.id]: action.payload },
                    show: [...state.show, action.payload.id]
                };
            case 'delete':
                const { [action.payload]: _, ...newNews } = state.news;
                return {
                    ...state,
                    news: newNews,
                    show: state.show.filter(id => id !== action.payload)
                };
            default:
                return state;
        }
    }

    const storeNormalized = createStore(normalizedReducer);
    storeNormalized.subscribe(() => { });
    bench("normalized state", function () {
        for (let i = 0; i < normalizedCount; i++) {
            storeNormalized.dispatch({ type: 'add', payload: { id: i, text: "some news text" + i } });
        }
        for (let i = normalizedCount - 1; i >= 0; i--) {
            storeNormalized.dispatch({ type: 'delete', payload: i });
        }
    });
});

suite("reistate", function () {
    set('iterations', iterations);
    const schema = new StoreSchema();
    bench("create", function () {
        const store = new Store(schema);
        store.updateHandler.subscribe(() => { });
        Path.fromSelector(f => f.scope);
    });
    const path = Path.fromSelector(f => f.scope.counter);
    const storeModify = new Store(new StoreSchema(), { ...initCounterStore });
    storeModify.updateHandler.subscribe(() => { });
    bench("modify", function () {
        storeModify.instructor.set(path, 1);
    });

    const storeCounter = new Store(new StoreSchema(), { ...initCounterStore });
    storeCounter.updateHandler.subscribe(() => { });
    // const deepPath = Path.fromSelector(f => f.scope.s.s.s.counter);
    bench("counter reducer", function () {
        storeCounter.instructor.set(path, storeCounter.state.scope.counter + 1);
        storeCounter.instructor.set(path, storeCounter.state.scope.counter - 1);
    });
    // bench("counter reducer deep", function () {
    //     storeCounter.instructor.set(deepPath, 1);
    //     storeCounter.instructor.set(deepPath, 1);
    // });

    const newsPath = Path.fromSelector(f => f.news);
    const showPath = Path.fromSelector(f => f.show);
    const schemaNormalized = new StoreSchema();
    schemaNormalized.transformator = (i, is, transformer, s) => {
        if (is(newsPath)) {
            if (i.type === InstructionType.add) {
                transformer.add(showPath, i.value.id);
            } else {
                transformer.remove(showPath, i.index);
            }
        }
        transformer.applyInstruction();
    };

    const storeNormalized = new Store(schemaNormalized, { ...initNormalizedState });
    storeNormalized.updateHandler.subscribe(() => { });
    bench("normalized state", function () {
        for (let i = 0; i < normalizedCount; i++) {
            storeNormalized.instructor.add(newsPath, { id: i, text: "some news text" + i }, i);
        }
        for (let i = normalizedCount - 1; i >= 0; i--) {
            storeNormalized.instructor.remove(newsPath, i);
        }
    });
});

const {
    createStore: ecS,
    createEvent,
    createEffect,
    createStoreObject
} = require("effector");

suite("effector", function () {
    set('iterations', iterations);
    bench("create", function () {
        const changeText = createEvent('change todo text');
        const store = ecS({})
            .on(changeText, (_, val) => val);
        store.subscribe(() => { });
    });
    const changeText = createEvent('change todo text');
    const store = ecS(0)
        .on(changeText, (_, val) => val);
    store.subscribe(() => { });
    bench("modify", function () {
        changeText(1);
    });

    const increment = createEvent('increment');
    const decrement = createEvent('decrement');
    const storeConter = ecS(0)
        .on(increment, val => val++)
        .on(decrement, val => val--);
    storeConter.subscribe(() => { });
    const scopedCounter = createStoreObject({ scope: storeConter });

    bench("counter reducer", function () {
        increment();
        decrement();
    });

    const addNews = createEvent('add');
    const removeNews = createEvent('remove');
    const storeNormalized = ecS({ ...initNormalizedState })
        .on(addNews, ({ news, show }, payload) => ({
            news: { ...news, [payload.id]: payload },
            show: [...show, payload.id]
        }))
        .on(removeNews, ({ news, show }, payload) => {
            const { [payload]: _, ...newNews } = news;
            return {
                news: newNews,
                show: show.filter(id => id !== payload)
            };
        });
    storeNormalized.subscribe(() => { });
    bench("normalized state", function () {
        for (let i = 0; i < normalizedCount; i++) {
            addNews({ id: i, text: "some news text" + i });
        }
        for (let i = normalizedCount - 1; i >= 0; i--) {
            removeNews(i);
        }
    });
    const addNews2 = createEvent('add');
    const removeNews2 = createEvent('remove');
    const storeNews = ecS({})
        .on(addNews2, (state, payload) => ({ ...state, [payload.id]: payload }))
        .on(removeNews2, (state, payload) => {
            const { [payload]: _, ...newNews } = state;
            return newNews;
        });
    const storeShow = ecS([])
        .on(addNews2, (state, news) => [...state, news.id])
        .on(removeNews2, (state, id) => state.filter(cid => cid !== id));
    const storeNormalized2 = createStoreObject({ news: storeNews, show: storeShow });
    storeShow.subscribe(() => { });
    bench("normalized state two stores", function () {
        for (let i = 0; i < normalizedCount; i++) {
            addNews2({ id: i, text: "some news text" + i });
        }
        for (let i = normalizedCount - 1; i >= 0; i--) {
            removeNews2(i);
        }
    });
});

const { path, immutablePreset, mutablePreset } = require("../../pathon/es");
suite("pathon", function () {
    set('iterations', iterations);
    bench("create", function () {
        const rootPath = path('root', {}, immutablePreset);
    });
    const rootPath = path('root', { ...initCounterStore }, immutablePreset);
    const counterPath = rootPath.path('scope').path('counter');
    rootPath.watch(state => state);
    bench("modify", function () {
        counterPath.set(0);
    });
    bench("counter reducer", function () {
        counterPath.set(counterPath.get() + 1);
        counterPath.set(counterPath.get() - 1);
    });

    const newsExamplePath = path(
        "news-example",
        { ...initNormalizedState },
        immutablePreset
    );
    newsExamplePath.watch(state => state);

    const addNews = ({ id, text }) => {
        const state = newsExamplePath.get();
        newsExamplePath.set({
            news: { ...state.news, [id]: text },
            show: [...state.show, id]
        });
    };

    const deleteNews = (id) => {
        const state = newsExamplePath.get();
        const { [id]: _, ...news } = state.news;
        newsExamplePath.set({
            news,
            show: state.show.filter(element => element !== id)
        });
    };
    bench("normalized state", function () {
        for (let i = 0; i < normalizedCount; i++) {
            addNews({ id: i, text: "some news text" + i });
        }
        for (let i = normalizedCount - 1; i >= 0; i--) {
            deleteNews(i);
        }
    });

    const deepExampleInitialState = {
        scope3: { scope2: { scope1: { scope0: { counter: 0 } } } }
    };

    const deepExamplePath = path(
        "deep-example",
        deepExampleInitialState,
        immutablePreset
    );
    const increment = () => {
        const counterPath = deepExamplePath
            .path("scope3")
            .path("scope2")
            .path("scope1")
            .path("scope0")
            .path("counter");
        counterPath.set(counterPath.get() + 1);
    };
    const decrement = () => {
        const counterPath = deepExamplePath
            .path("scope3")
            .path("scope2")
            .path("scope1")
            .path("scope0")
            .path("counter");
        counterPath.set(counterPath.get() - 1);
    };
    deepExamplePath.watch(state => state);
    bench("counter reducer deep", function () {
        increment();
        decrement();
    });
});
suite("pathon mutable", function () {
    set('iterations', iterations);
    bench("create", function () {
        const rootPath = path('root', {}, mutablePreset);
    });
    const rootPath = path('root', { ...initCounterStore }, mutablePreset);
    const counterPath = rootPath.path('scope').path('counter');
    rootPath.watch(state => state);
    bench("modify", function () {
        counterPath.set(0);
    });
    bench("counter reducer", function () {
        counterPath.set(counterPath.get() + 1);
        counterPath.set(counterPath.get() - 1);
    });

    const newsExamplePath = path(
        "news-example",
        { ...initNormalizedState },
        mutablePreset
    );
    newsExamplePath.watch(state => state);

    const addNews = ({ id, text }) => {
        const state = newsExamplePath.get();
        // console.log(state);
        newsExamplePath.set({
            news: { ...state.news, [id]: text },
            show: [...state.show, id]
        });
    };

    const deleteNews = (id) => {
        const state = newsExamplePath.get();
        const { [id]: _, ...news } = state.news;
        newsExamplePath.set({
            news,
            show: state.show.filter(element => element !== id)
        });
    };
    bench("normalized state", function () {
        for (let i = 0; i < 10; i++) {
            addNews({ id: i, text: "some news text" + i });
        }
        for (let i = 9; i >= 0; i--) {
            deleteNews(i);
        }
    });

    const deepExampleInitialState = {
        scope3: { scope2: { scope1: { scope0: { counter: 0 } } } }
    };

    const deepExamplePath = path(
        "deep-example",
        deepExampleInitialState,
        mutablePreset
    );
    const increment = () => {
        const counterPath = deepExamplePath
            .path("scope3")
            .path("scope2")
            .path("scope1")
            .path("scope0")
            .path("counter");
        counterPath.set(counterPath.get() + 1);
    };
    const decrement = () => {
        const counterPath = deepExamplePath
            .path("scope3")
            .path("scope2")
            .path("scope1")
            .path("scope0")
            .path("counter");
        counterPath.set(counterPath.get() - 1);
    };
    deepExamplePath.watch(state => state);
    bench("counter reducer deep", function () {
        increment();
        decrement();
    });
});
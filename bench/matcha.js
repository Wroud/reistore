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
const deepState = {
    scope0: {
        scope1: {
            scope2: {
                scope3: {
                    scope4: {
                        counter: 0
                    }
                }
            }
        }
    }
}
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
    const { counterReducer, modifyReducer, normalizedReducer, deepCounterReducer } = require("./reduxReducers");
    const initStore = (reducer) => {
        const store = createStore(reducer);
        store.subscribe(() => { });
        return store;
    }
    bench("create", function () {
        const store = createStore((d = null) => d);
        store.subscribe(() => { });
        const action = { type: "any" };
    });
    let storeModify = initStore(modifyReducer(initCounterStore));
    bench("modify", function () {
        storeModify.dispatch({ type: "init" });
    });
    const storeCounter = initStore(counterReducer(initCounterStore));
    bench("counter reducer", function () {
        storeCounter.dispatch({ type: 'INCREMENT' });
        storeCounter.dispatch({ type: 'DECREMENT' });
    });
    const deepCounter = initStore(deepCounterReducer(deepState));
    bench("counter reducer deep", function () {
        storeCounter.dispatch({ type: 'INCREMENT' });
        storeCounter.dispatch({ type: 'DECREMENT' });
        storeCounter.getState();
    });
    const storeNormalized = initStore(normalizedReducer(initNormalizedState));
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
    const initStore = (state) => {
        const store = new Store(new StoreSchema(), { ...state });
        store.updateHandler.subscribe(() => { });
        return store;
    }
    bench("create", function () {
        const store = new Store(schema);
        store.updateHandler.subscribe(() => { });
        Path.fromSelector(f => f.scope);
    });
    const path = Path.fromSelector(f => f.scope.counter);
    const storeModify = initStore(initCounterStore);
    bench("modify", function () {
        storeModify.instructor.set(path, 1);
    });

    const storeCounter = initStore(initCounterStore);
    bench("counter reducer", function () {
        storeCounter.instructor.set(path, storeCounter.state.scope.counter + 1);
        storeCounter.instructor.set(path, storeCounter.state.scope.counter - 1);
    });
    const storeDeepCounter = initStore(deepState);
    const deepPath = Path.fromSelector(f => f.scope0.scope1.scope2.scope3.scope4.counter);
    bench("counter reducer deep", function () {
        storeDeepCounter.instructor.set(deepPath, 1);
        storeDeepCounter.instructor.set(deepPath, 1);
        storeDeepCounter.state;
    });

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
    const initStore = (state) => {
        const store = ecS(state);
        store.subscribe(() => { });
        return store;
    }
    bench("create", function () {
        const changeText = createEvent('change todo text');
        const store = ecS({})
            .on(changeText, (_, val) => val);
        store.subscribe(() => { });
    });
    const simpleEvent = createEvent('change todo text');
    const store = initStore(0)
        .on(simpleEvent, (_, val) => val);
    bench("modify", function () {
        simpleEvent(1);
    });

    const increment = createEvent('increment');
    const decrement = createEvent('decrement');
    const storeConter = initStore(0)
        .on(increment, val => val++)
        .on(decrement, val => val--);
    const scopedCounter = createStoreObject({ scope: storeConter });

    bench("counter reducer", function () {
        increment();
        decrement();
    });
    const increment2 = createEvent('increment');
    const decrement2 = createEvent('decrement');
    const storeDeepConter = initStore(0)
        .on(increment2, val => val++)
        .on(decrement2, val => val--);
    const scoped5Counter = createStoreObject({ counter: storeDeepConter });
    const scoped4Counter = createStoreObject({ scope4: scoped5Counter });
    const scoped3Counter = createStoreObject({ scope3: scoped4Counter });
    const scoped2Counter = createStoreObject({ scope2: scoped3Counter });
    const scoped1Counter = createStoreObject({ scope1: scoped2Counter });
    const scoped0Counter = createStoreObject({ scope0: scoped1Counter });
    store.subscribe(() => { });

    bench("counter reducer deep", function () {
        increment2();
        decrement2();
        scoped0Counter.getState();
    });

    const addNews = createEvent('add');
    const removeNews = createEvent('remove');
    const storeNormalized = initStore(initNormalizedState)
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
    const storeShow = initStore([])
        .on(addNews2, (state, news) => [...state, news.id])
        .on(removeNews2, (state, id) => state.filter(cid => cid !== id));
    const storeNormalized2 = createStoreObject({ news: storeNews, show: storeShow });
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

    const deepExamplePath = path(
        "deep-example",
        { ...deepState },
        immutablePreset
    );
    const increment = () => {
        const counterPath = deepExamplePath
            .path("scope0")
            .path("scope1")
            .path("scope2")
            .path("scope3")
            .path("scope4")
            .path("counter");
        counterPath.set(counterPath.get() + 1);
    };
    const decrement = () => {
        const counterPath = deepExamplePath
            .path("scope0")
            .path("scope1")
            .path("scope2")
            .path("scope3")
            .path("scope4")
            .path("counter");
        counterPath.set(counterPath.get() - 1);
    };
    deepExamplePath.watch(state => state);
    bench("counter reducer deep", function () {
        increment();
        decrement();
        deepExamplePath.get();
    });

    const newsExamplePath = path(
        "news-example",
        { ...initNormalizedState },
        immutablePreset
    );
    newsExamplePath.watch(state => state);

    const addNews = (news) => {
        const state = newsExamplePath.get();
        newsExamplePath.set({
            news: { ...state.news, [news.id]: news },
            show: [...state.show, news.id]
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

    const deepExamplePath = path(
        "deep-example",
        { ...deepState },
        mutablePreset
    );
    const increment = () => {
        const counterPath = deepExamplePath
            .path("scope0")
            .path("scope1")
            .path("scope2")
            .path("scope3")
            .path("scope4")
            .path("counter");
        counterPath.set(counterPath.get() + 1);
    };
    const decrement = () => {
        const counterPath = deepExamplePath
            .path("scope0")
            .path("scope1")
            .path("scope2")
            .path("scope3")
            .path("scope4")
            .path("counter");
        counterPath.set(counterPath.get() - 1);
    };
    deepExamplePath.watch(state => state);
    bench("counter reducer deep", function () {
        increment();
        decrement();
        deepExamplePath.get();
    });

    const newsExamplePath = path(
        "news-example",
        { ...initNormalizedState },
        mutablePreset
    );
    newsExamplePath.watch(state => state);

    const addNews = ({ id, text }) => {
        const state = newsExamplePath.get();
        state.news[id] = { id, text };
        state.show.push(id);
        newsExamplePath.set(state);
    };

    const deleteNews = (id) => {
        const state = newsExamplePath.get();
        delete state.news[id];
        state.show = state.show.filter(element => element !== id);
        newsExamplePath.set(state);
    };
    bench("normalized state", function () {
        for (let i = 0; i < 10; i++) {
            addNews({ id: i, text: "some news text" + i });
        }
        for (let i = 9; i >= 0; i--) {
            deleteNews(i);
        }
    });
});
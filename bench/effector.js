const {
    createStore: ecS,
    createEvent,
    createEffect,
    createStoreObject
} = require("effector");

const efSuite = (iterations, initCounterStore, deepState, initNormalizedState, normalizedCount) => {
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
};
module.exports.efSuite = efSuite;

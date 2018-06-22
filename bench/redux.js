const { createStore } = require("redux");
const { counterReducer, modifyReducer, normalizedReducer, deepCounterReducer } = require("./reduxReducers");

const reduxSuite = (iterations, initCounterStore, deepState, initNormalizedState, normalizedCount) => {
    suite("redux", function () {
        set('iterations', iterations);
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
};
module.exports.reduxSuite = reduxSuite;

import { createStore } from "redux";
import { createSelector } from 'reselect';
import { counterReducer, modifyReducer, normalizedReducer, deepCounterReducer } from "./reduxReducers";

export const reduxSuite = ({ iterations, normalizedCount, initState, helpers: { createHeavySubscriber } }) => {
    const initStore = (reducer) => {
        const store = createStore(reducer);
        store.subscribe(() => { });
        return store;
    };
    return {
        name: "redux",
        benchmarks: [
            {
                name: "create",
                bench() {
                    return () => {
                        const store = createStore((d = undefined) => d);
                        store.subscribe(() => { });
                        const action = { type: "any" };
                    }
                }
            },
            {
                name: "modify",
                bench() {
                    const store = initStore(modifyReducer(initState.counter));
                    return () => store.dispatch({ type: "init" });
                }
            },
            {
                name: "counter reducer",
                bench() {
                    const store = initStore(counterReducer(initState.counter));
                    return () => {
                        store.dispatch({ type: "INCREMENT" });
                        store.dispatch({ type: "DECREMENT" });
                        store.dispatch({ type: "INCREMENT" });
                        store.dispatch({ type: "DECREMENT" });
                    };
                }
            },
            {
                name: "counter reducer deep",
                bench() {
                    const store = initStore(deepCounterReducer);
                    return () => {
                        store.dispatch({ type: "INCREMENT" });
                        store.dispatch({ type: "DECREMENT" });
                        store.dispatch({ type: "INCREMENT" });
                        store.dispatch({ type: "DECREMENT" });
                        store.getState();
                    };
                }
            },
            {
                name: "normalized state",
                bench() {
                    const store = initStore(normalizedReducer(initState.normalized));
                    return () => {
                        for (let i = 0; i < normalizedCount; i++) {
                            store.dispatch({ type: 'add', payload: { id: i, text: "some news text" + i } });
                        }
                        for (let i = normalizedCount - 1; i >= 0; i--) {
                            store.dispatch({ type: 'delete', payload: i });
                        }
                    }
                }
            },
            {
                name: "normalized with subscribers",
                bench() {
                    const store = createStore(normalizedReducer(initState.normalized));
                    const { heavySubscriber } = createHeavySubscriber();

                    const add = id => ({ type: 'add', payload: { id: id, text: 'some news text' + id } });
                    const mod = id => ({ type: 'modify', payload: { id, text: Math.random().toString() } });
                    const newsSelector = createSelector((state: any) => state.news, _ => _);
                    for (let i = 0; i < normalizedCount; i++) {
                        store.dispatch(add(i));
                        const itemSelector = createSelector(newsSelector, news => news[i]);
                        const memorizedSubcriber = createSelector(itemSelector, heavySubscriber);
                        store.subscribe(() => memorizedSubcriber(store.getState()));
                    }
                    return () => {
                        for (let i = 0; i < normalizedCount; i++) {
                            store.dispatch(mod(i));
                        }
                    };
                }
            }
        ]
    };
};

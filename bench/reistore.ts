import { createStore, createSchema, createScope, Path, ISchema, IPath, IStore, IStoreInstructor } from "../src";
import { InstructionType } from "../src/enums/InstructionType";

export const reistoreSuite = ({ iterations, normalizedCount, initState, helpers: { createHeavySubscriber } }) => {

    const initStore = (state) => {
        return createStore(createSchema({ ...state }))
            .subscribe(() => { });
    };
    return {
        name: "reistore",
        after() {
        },
        benchmarks: [
            {
                name: "create",
                bench() {
                    const schema = createSchema({});
                    return () => {
                        const store = createStore(schema)
                            .subscribe(() => { });
                        Path.create<any, any>(f => f.scope);
                    }
                }
            },
            {
                name: "modify",
                bench() {
                    const counter = Path.create<any, any>(f => f.scope.counter);
                    const store = initStore(initState.counter);
                    return () => {
                        store.set(counter, 1);
                    }
                }
            },
            {
                name: "counter",
                bench() {
                    const counter = Path.create<any, any>(f => f.scope.counter);
                    const store = initStore(initState.counter);
                    return () => {
                        store.batch(store => {
                            store.set(counter, v => v + 1);
                            store.set(counter, v => v - 1);
                            store.set(counter, v => v + 1);
                            store.set(counter, v => v - 1);
                        });
                    };
                }
            },
            {
                name: "counter with inject",
                bench() {
                    const counter = Path.create<any, any>(f => f.scope.counter);
                    const store = initStore(initState.counter);
                    return () => {
                        store.batch(store => {
                            store.inject(({ scope: { counter: value } }, inject) => {
                                inject.set(counter, value - 1);
                                inject.set(counter, value + 1);
                                inject.set(counter, value - 1);
                                inject.set(counter, value + 1);
                            });
                        });
                    };
                }
            },
            {
                name: "counter deep",
                bench() {
                    const deepSchema = createSchema({ ...initState.deepCounter });
                    const scopeSchema = createScope(deepSchema, f => f.scope0.scope1.scope2.scope3.scope4);

                    const counter = scopeSchema.joinPath(f => f.counter);
                    const store = createStore(deepSchema)
                        .subscribe(() => { });

                    return () => {
                        store.batch(store => {
                            store.set(counter, v => v + 1);
                            store.set(counter, v => v - 1);
                            store.set(counter, v => v + 1);
                            store.set(counter, v => v - 1);
                        });
                    };
                }
            },
            {
                name: "normalized",
                bench() {
                    function* transformer(change, { add, remove }) {
                        if (change.in(newsScope.path)) {
                            if (change.type === InstructionType.add) {
                                yield add(showArgPath, change.value.id);
                            } else if (change.type === InstructionType.remove) {
                                yield remove(showScope.path, change.index);
                            }
                        }
                        yield change;
                    }
                    const schemaNormalized = createSchema(initState.normalized, transformer);
                    const newsScope = createScope(schemaNormalized, (f: any) => f.news);
                    const showScope = createScope(schemaNormalized, (f: any) => f.show);
                    const newsArgPath = newsScope.joinPath(f => f["{}"]);
                    const showArgPath = showScope.joinPath(f => f["{}"]);
                    const store = createStore(schemaNormalized)
                        .subscribe(() => { });

                    return () => {
                        store.batch(store => {
                            for (let i = 0; i < normalizedCount; i++) {
                                store.add(newsArgPath, { id: i, text: "some news text" + i }, i);
                            }
                            for (let i = normalizedCount - 1; i >= 0; i--) {
                                store.remove(newsScope.path, i);
                            }
                        });
                    }
                }
            },
            {
                name: "normalized with subscribers",
                bench() {

                    function* transformer(change, { add, remove }) {
                        if ((change.type === InstructionType.add
                            || change.type === InstructionType.remove)
                            && change.in(newsScope.path)) {
                            if (change.type === InstructionType.add) {
                                yield add(showArgPath, change.value.id);
                            } else if (change.type === InstructionType.remove) {
                                yield remove(showScope.path, change.index);
                            }
                        }
                        yield change;
                    }
                    const schemaNormalized = createSchema(initState.normalized, transformer);
                    const newsScope = createScope(schemaNormalized, (f: any) => f.news);
                    const showScope = createScope(schemaNormalized, (f: any) => f.show);
                    const newsArgPath = newsScope.joinPath(f => f["{}"]);
                    const textPathreal = newsArgPath.join(f => f.text);
                    const showArgPath = showScope.joinPath(f => f["{}"]);
                    const store = createStore(schemaNormalized)
                        .subscribe(() => { });

                    const { heavySubscriber } = createHeavySubscriber();
                    store.batch(batch => {
                        for (let i = 0; i < normalizedCount; i++) {
                            batch.add(newsArgPath, { id: i, text: "some news text" + i }, i);
                            const hi = [i];
                            store.subscribe((state, changes) => {
                                if (changes.some(path => path.in(textPathreal, hi))) {
                                    heavySubscriber();
                                }
                            });
                        }
                    });
                    return () => {
                        for (let i = 0; i < normalizedCount; i++) {
                            store.set(textPathreal, Math.random().toString(), i);
                        }
                    };
                }
            }
        ]
    };
    // suite("reistore mutable", function () {
    //     set('iterations', iterations);
    //     const initStore = (state) => {
    //         return createStore(createSchema({ ...state }), undefined, undefined, false)
    //             .subscribe(() => { });
    //     };
    //     const schema = createSchema({});
    //     bench("create", function () {
    //         const store = createStore(schema, undefined, undefined, false)
    //             .subscribe(() => { });
    //         Path.create(f => f.scope);
    //     });
    //     const counter = Path.create(f => f.scope.counter);
    //     const storeModify = initStore(initState.counter);
    //     bench("modify", function () {
    //         storeModify.set(counter, 1);
    //     });
    //     const storeCounter = initStore(initState.counter);
    //     bench("counter reducer", function () {
    //         storeCounter.batch(store => {
    //             store.set(counter, v => v + 1);
    //             store.set(counter, v => v - 1);
    //             store.set(counter, v => v + 1);
    //             store.set(counter, v => v - 1);
    //         });
    //     });
    //     const storeInject = initStore(initState.counter);
    //     bench("counter reducer with inject", function () {
    //         storeInject.batch(store => {
    //             store.inject(({ scope: { counter: value } }, inject) => {
    //                 inject.set(counter, value - 1);
    //                 inject.set(counter, value + 1);
    //                 inject.set(counter, value - 1);
    //                 inject.set(counter, value + 1);
    //             });
    //         });
    //     });
    //     const deepSchema = createSchema({ ...initState.deepCounter });
    //     const storeDeepCounter = createStore(deepSchema, undefined, undefined, false)
    //         .subscribe(() => { });
    //     const counterPath = Path.create(f => f.scope0.scope1.scope2.scope3.scope4.counter);
    //     bench("counter reducer deep", function () {
    //         storeDeepCounter.batch(store => {
    //             store.set(counterPath, v => v + 1);
    //             store.set(counterPath, v => v - 1);
    //             store.set(counterPath, v => v + 1);
    //             store.set(counterPath, v => v - 1);
    //         });
    //     });

    //     function* transformer(change, { add, remove }) {
    //         if (change.in(newsScope.path)) {
    //             if (change.type === InstructionType.add) {
    //                 yield add(showArgPath, change.value.id);
    //             } else if (change.type === InstructionType.remove) {
    //                 yield remove(showScope.path, change.index);
    //             }
    //         }
    //         yield change;
    //     }
    //     const schemaNormalized = createSchema(initState.normalized, transformer);
    //     const newsScope = createScope(schemaNormalized, f => f.news);
    //     const showScope = createScope(schemaNormalized, f => f.show);
    //     const newsArgPath = newsScope.path.join(f => f["{}"]);
    //     const showArgPath = showScope.path.join(f => f["{}"]);

    //     const storeNormalized = createStore(schemaNormalized, undefined, undefined, false)
    //         .subscribe(() => { });
    //     bench("normalized state", function () {
    //         storeNormalized.batch(store => {
    //             for (let i = 0; i < normalizedCount; i++) {
    //                 store.add(newsArgPath, { id: i, text: "some news text" + i }, i);
    //             }
    //             for (let i = normalizedCount - 1; i >= 0; i--) {
    //                 store.remove(newsScope.path, i);
    //             }
    //         });
    //     });
    // });
};

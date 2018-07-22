import { createStore, createSchema, createScope, Path, InstructionType } from "../../src";

export const reistoreSuite = ({ variables: { normalizedCount }, initState, helpers: { subscribeChecker } }) => {
    const initStore = (state) => {
        return createStore(createSchema({ ...state }))
            .subscribe(() => { });
    };
    return {
        name: "reistore",
        after() {
        },
        benchmarks: [
            // {
            //     name: "create",
            //     bench() {
            //         const schema = createSchema({});
            //         return () => {
            //             const store = createStore(schema)
            //                 .subscribe(() => { });
            //             Path.create<any, any>(f => f.scope);
            //         }
            //     }
            // },
            // {
            //     name: "modify",
            //     bench() {
            //         const counter = Path.create<any, any>(f => f.scope.counter);
            //         const store = initStore(initState.counter());
            //         return () => {
            //             store.set(counter, 1);
            //         }
            //     }
            // },
            // {
            //     name: "counter",
            //     bench() {
            //         const counter = Path.create<any, any>(f => f.scope.counter);
            //         const store = initStore(initState.counter());
            //         return () => {
            //             store.batch(store => {
            //                 store.set(counter, v => v + 1);
            //                 store.set(counter, v => v - 1);
            //                 store.set(counter, v => v + 1);
            //                 store.set(counter, v => v - 1);
            //             });
            //         };
            //     }
            // },
            // {
            //     name: "counter with inject",
            //     bench() {
            //         const counter = Path.create<any, any>(f => f.scope.counter);
            //         const store = initStore(initState.counter());
            //         return () => {
            //             store.batch(store => {
            //                 store.inject(({ scope: { counter: value } }, inject) => {
            //                     inject.set(counter, value - 1);
            //                     inject.set(counter, value + 1);
            //                     inject.set(counter, value - 1);
            //                     inject.set(counter, value + 1);
            //                 });
            //             });
            //         };
            //     }
            // },
            // {
            //     name: "counter deep",
            //     bench() {
            //         const deepSchema = createSchema(initState.deepCounter());
            //         const scopeSchema = createScope(deepSchema, f => f.scope0.scope1.scope2.scope3.scope4);

            //         const counter = scopeSchema.joinPath(f => f.counter);
            //         const store = createStore(deepSchema)
            //             .subscribe(() => { });

            //         return () => {
            //             store.batch(store => {
            //                 store.set(counter, v => v + 1);
            //                 store.set(counter, v => v - 1);
            //                 store.set(counter, v => v + 1);
            //                 store.set(counter, v => v - 1);
            //             });
            //         };
            //     }
            // },
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
                    const schemaNormalized = createSchema(initState.normalized(), transformer);
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
                name: "normalized modify",
                bench() {
                    const schemaNormalized = createSchema(initState.normalized());
                    const newsScope = createScope(schemaNormalized, (f: any) => f.news);
                    const newsArgPath = newsScope.joinPath(f => f["{}"]);
                    const textPathreal = newsArgPath.join(f => f.text);

                    const store = createStore(schemaNormalized);

                    store.batch(batch => {
                        for (let i = 0; i < normalizedCount; i++) {
                            batch.add(newsArgPath, { id: i, text: "some news text" + i }, i);
                        }
                    });
                    let invokeCount = 0;
                    return () => {
                        for (let i = 0; i < normalizedCount; i++) {
                            store.set(textPathreal, Math.random().toString(), i);
                        }
                        invokeCount += normalizedCount;
                    };
                }
            },
            {
                name: "normalized modify with subscribers",
                bench() {
                    const schemaNormalized = createSchema(initState.normalized());
                    const newsScope = createScope(schemaNormalized, (f: any) => f.news);
                    const newsArgPath = newsScope.joinPath(f => f["{}"]);
                    const textPathreal = newsArgPath.join(f => f.text);
                    const store = createStore(schemaNormalized);

                    const { subscriber, getCalls } = subscribeChecker();
                    store.batch(batch => {
                        for (let i = 0; i < normalizedCount; i++) {
                            batch.add(newsArgPath, { id: i, text: "some news text" + i }, i);
                            store.subscribe((state, changes) => {
                                const isChanged = changes.length === 1
                                    ? changes[0].in(textPathreal, false, i)
                                    : changes.some(change => change.in(textPathreal, false, i));
                                if (isChanged) {
                                    subscriber();
                                }
                            });
                        }
                    });
                    let invokeCount = 0;
                    return {
                        bench: () => {
                            for (let i = 0; i < normalizedCount; i++) {
                                store.set(textPathreal, Math.random().toString(), i);
                            }
                            invokeCount += normalizedCount;
                        },
                        onComplete: () => {
                            console.log(getCalls(), invokeCount);
                            if (getCalls() < invokeCount) {
                                throw new Error(`subscriber called: ${getCalls()}/${invokeCount}`);
                            }
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

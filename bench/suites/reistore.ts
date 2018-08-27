import { createStore, createSchema, buildSchema, InstructionType } from "../../src";
import { ICounterState, IDeepCounterState } from "stmbenchmarks/lib/interfaces/IState";

export const reistoreSuite = ({ variables: { normalizedCount }, initState, helpers: { subscribeChecker } }) => {
    const initStore = (state) => {
        return createStore(state, createSchema())
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
                    const schema = createSchema();
                    return () => {
                        const store = createStore(schema)
                            .subscribe(() => { });
                        buildSchema().field("value" as never);
                    }
                }
            },
            {
                name: "modify",
                bench() {
                    const { schema: { scope: { counter } } } = buildSchema<ICounterState>()
                        .node("scope", b =>
                            b.field("counter", () => 0 as number)
                        );
                    const store = initStore(initState.counter());
                    return () => {
                        store.set(counter, 1);
                    }
                }
            },
            {
                name: "counter",
                bench() {
                    const { schema: { scope: { counter } } } = buildSchema<ICounterState>()
                        .node("scope", b =>
                            b.field("counter", () => 0 as number)
                        );
                    const store = initStore(initState.counter());
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
                name: "counter deep",
                bench() {
                    const { schema } = buildSchema<IDeepCounterState>()
                        .node("scope0", b =>
                            b.node("scope1", b =>
                                b.node("scope2", b =>
                                    b.node("scope3", b =>
                                        b.node("scope4", b =>
                                            b.field("counter", () => 0 as number)
                                        )
                                    )
                                )
                            )
                        );
                    const counter = schema.scope0.scope1.scope2.scope3.scope4.counter;
                    const store = createStore(initState.deepCounter())
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
                    const { schema } = buildSchema<any>()
                        .map("news")
                        .array("show");
                    const store = createStore(
                        { news: new Map(), show: [] },
                        undefined,
                        (change, transformer) => {
                            if (change.node.in(schema.news(), false)) {
                                if (change.type === InstructionType.add) {
                                    transformer.add(schema.show(store.get(schema.show).length), change.value.id);
                                } else if (change.type === InstructionType.remove) {
                                    var news = change.node.get(transformer.state);
                                    var ind = store.get(schema.show).indexOf(news.id);
                                    transformer.remove(schema.show(ind));
                                }
                            }
                            transformer.apply(change);
                        });
                    store.subscribe(() => { });

                    return () => {
                        store.batch(store => {
                            for (let i = 0; i < normalizedCount; i++) {
                                store.add(schema.news(i), { id: i, text: "some news text" + i });
                            }
                            for (let i = normalizedCount - 1; i >= 0; i--) {
                                store.remove(schema.news(i));
                            }
                        });
                    }
                }
            },
            {
                name: "normalized modify",
                bench() {
                    const { schema } = buildSchema<any>()
                        .map("news")
                        .array("show");
                    const store = createStore(
                        { news: new Map(), show: [] },
                        undefined,
                        (change, transformer) => {
                            if (change.node.in(schema.news(), false)) {
                                if (change.type === InstructionType.add) {
                                    transformer.add(schema.show(store.get(schema.show).length), change.value.id);
                                } else if (change.type === InstructionType.remove) {
                                    var news = change.node.get(transformer.state);
                                    var ind = store.get(schema.show).indexOf(news.id);
                                    transformer.remove(schema.show(ind));
                                }
                            }
                            transformer.apply(change);
                        });
                    store.subscribe(() => { });
                    store.batch(store => {
                        for (let i = 0; i < normalizedCount; i++) {
                            store.add(schema.news(i), { id: i, text: "some news text" + i });
                        }
                    });
                    let invokeCount = 0;
                    return () => {
                        for (let i = 0; i < normalizedCount; i++) {
                            store.set(schema.news(i, s => s.text), Math.random().toString());
                        }
                        invokeCount += normalizedCount;
                    };
                }
            },
            {
                name: "normalized modify with subscribers",
                bench() {
                    const { subscriber, getCalls } = subscribeChecker();

                    const { schema } = buildSchema<any>()
                        .map("news")
                        .array("show");
                    const store = createStore(
                        { news: new Map(), show: [] },
                        undefined,
                        (change, transformer) => {
                            if (change.node.in(schema.news(), false)) {
                                if (change.type === InstructionType.add) {
                                    transformer.add(schema.show(store.get(schema.show).length), change.value.id);
                                } else if (change.type === InstructionType.remove) {
                                    var news = change.node.get(transformer.state);
                                    var ind = store.get(schema.show).indexOf(news.id);
                                    transformer.remove(schema.show(ind));
                                }
                            }
                            transformer.apply(change);
                        });
                    store.subscribe(() => { });
                    store.batch(batch => {
                        for (let i = 0; i < normalizedCount; i++) {
                            let adr = schema.news(i);
                            batch.add(adr, { id: i, text: "some news text" + i });
                            store.subscribe((state, changes) => {
                                const isChanged = changes.length === 1
                                    ? changes[0].in(adr, false)
                                    : changes.some(change => change.in(adr, false));
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
                                store.set(schema.news(i, s => s.text), Math.random().toString());
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

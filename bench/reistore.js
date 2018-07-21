const { createStore, createSchema, createScope, Path, Instructor } = require("../lib");
const { InstructionType } = require("../lib/enums/InstructionType");

const reistoreSuite = (iterations, initCounterStore, deepState, initNormalizedState, normalizedCount) => {
    suite("reistore", function () {
        set('iterations', iterations);
        const initStore = (state) => {
            return createStore(createSchema({ ...state }))
                .subscribe(() => { });
        };
        const schema = createSchema({});
        bench("create", function () {
            const store = createStore(schema)
                .subscribe(() => { });
            Path.create(f => f.scope);
        });
        const counter = Path.create(f => f.scope.counter);
        const storeModify = initStore(initCounterStore);
        bench("modify", function () {
            storeModify.set(counter, 1);
        });
        const storeCounter = initStore(initCounterStore);
        bench("counter reducer", function () {
            storeCounter.batch(store => {
                store.set(counter, v => v + 1);
                store.set(counter, v => v - 1);
                store.set(counter, v => v + 1);
                store.set(counter, v => v - 1);
            });
        });
        const storeInject = initStore(initCounterStore);
        bench("counter reducer with inject", function () {
            storeInject.batch(store => {
                store.inject(({ scope: { counter: value } }, inject) => {
                    inject.set(counter, value - 1);
                    inject.set(counter, value + 1);
                    inject.set(counter, value - 1);
                    inject.set(counter, value + 1);
                });
            });
        });
        const deepSchema = createSchema({ ...deepState });
        const storeDeepCounter = createStore(deepSchema)
            .subscribe(() => { });
        const scopeSchema = createScope(deepSchema, f => f.scope0.scope1.scope2.scope3.scope4);
        const counterPath = scopeSchema.joinPath(f => f.counter);
        bench("counter reducer deep", function () {
            storeDeepCounter.batch(store => {
                store.set(counterPath, v => v + 1);
                store.set(counterPath, v => v - 1);
                store.set(counterPath, v => v + 1);
                store.set(counterPath, v => v - 1);
            });
        });

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
        const schemaNormalized = createSchema(initNormalizedState, transformer);
        const newsScope = createScope(schemaNormalized, f => f.news);
        const showScope = createScope(schemaNormalized, f => f.show);
        const newsArgPath = newsScope.joinPath(f => f["{}"]);
        const showArgPath = showScope.joinPath(f => f["{}"]);

        const storeNormalized = createStore(schemaNormalized)
            .subscribe(() => { });
        bench("normalized state", function () {
            storeNormalized.batch(store => {
                for (let i = 0; i < normalizedCount; i++) {
                    store.add(newsArgPath, { id: i, text: "some news text" + i }, i);
                }
                for (let i = normalizedCount - 1; i >= 0; i--) {
                    store.remove(newsScope.path, i);
                }
            });
        });
    });
    suite("reistore mutable", function () {
        set('iterations', iterations);
        const initStore = (state) => {
            return createStore(createSchema({ ...state }), undefined, undefined, false)
                .subscribe(() => { });
        };
        const schema = createSchema({});
        bench("create", function () {
            const store = createStore(schema, undefined, undefined, false)
                .subscribe(() => { });
            Path.create(f => f.scope);
        });
        const counter = Path.create(f => f.scope.counter);
        const storeModify = initStore(initCounterStore);
        bench("modify", function () {
            storeModify.set(counter, 1);
        });
        const storeCounter = initStore(initCounterStore);
        bench("counter reducer", function () {
            storeCounter.batch(store => {
                store.set(counter, v => v + 1);
                store.set(counter, v => v - 1);
                store.set(counter, v => v + 1);
                store.set(counter, v => v - 1);
            });
        });
        const storeInject = initStore(initCounterStore);
        bench("counter reducer with inject", function () {
            storeInject.batch(store => {
                store.inject(({ scope: { counter: value } }, inject) => {
                    inject.set(counter, value - 1);
                    inject.set(counter, value + 1);
                    inject.set(counter, value - 1);
                    inject.set(counter, value + 1);
                });
            });
        });
        const deepSchema = createSchema({ ...deepState });
        const storeDeepCounter = createStore(deepSchema, undefined, undefined, false)
            .subscribe(() => { });
        const counterPath = Path.create(f => f.scope0.scope1.scope2.scope3.scope4.counter);
        bench("counter reducer deep", function () {
            storeDeepCounter.batch(store => {
                store.set(counterPath, v => v + 1);
                store.set(counterPath, v => v - 1);
                store.set(counterPath, v => v + 1);
                store.set(counterPath, v => v - 1);
            });
        });

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
        const schemaNormalized = createSchema(initNormalizedState, transformer);
        const newsScope = createScope(schemaNormalized, f => f.news);
        const showScope = createScope(schemaNormalized, f => f.show);
        const newsArgPath = newsScope.path.join(f => f["{}"]);
        const showArgPath = showScope.path.join(f => f["{}"]);

        const storeNormalized = createStore(schemaNormalized, undefined, undefined, false)
            .subscribe(() => { });
        bench("normalized state", function () {
            storeNormalized.batch(store => {
                for (let i = 0; i < normalizedCount; i++) {
                    store.add(newsArgPath, { id: i, text: "some news text" + i }, i);
                }
                for (let i = normalizedCount - 1; i >= 0; i--) {
                    store.remove(newsScope.path, i);
                }
            });
        });
    });
};
module.exports.reistoreSuite = reistoreSuite;

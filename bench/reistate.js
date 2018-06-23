const { Store, StoreSchema, createScope, Path, Instructor } = require("../lib");
const { InstructionType } = require("../lib/enums/InstructionType");

const reistateSuite = (iterations, initCounterStore, deepState, initNormalizedState, normalizedCount) => {
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
            storeCounter.beginTransaction();
            storeCounter.instructor.set(path, v => v + 1);
            storeCounter.instructor.set(path, v => v - 1);
            storeCounter.flush();
        });
        const deepSchema = new StoreSchema();
        const storeDeepCounter = new Store(deepSchema, { ...deepState });
        storeDeepCounter.updateHandler.subscribe(() => { });
        const scopeSchema = createScope(deepSchema, Path.fromSelector(f => f.scope0.scope1.scope2.scope3.scope4));
        const counterPath = scopeSchema.path.join(Path.fromSelector(f => f.counter));
        bench("counter reducer deep", function () {
            storeDeepCounter.beginTransaction();
            storeDeepCounter.instructor.set(counterPath, v => v + 1);
            storeDeepCounter.instructor.set(counterPath, v => v - 1);
            storeDeepCounter.flush();
        });

        function* transformer(instruction, is, state) {
            if (is(newsScope.path)) {
                if (instruction.type === InstructionType.add) {
                    yield Instructor.createAdd(showArgPath, instruction.value.id);
                } else if (instruction.type === InstructionType.remove) {
                    yield Instructor.createRemove(showScope.path, [], instruction.index);
                }
            }
            yield instruction;
        }
        const schemaNormalized = new StoreSchema(transformer);
        const newsScope = createScope(schemaNormalized, Path.fromSelector(f => f.news));
        const showScope = createScope(schemaNormalized, Path.fromSelector(f => f.show));
        const newsArgPath = newsScope.path.join(Path.fromSelector(f => f["{}"]));
        const showArgPath = showScope.path.join(Path.fromSelector(f => f["{}"]));

        const storeNormalized = new Store(schemaNormalized, { ...initNormalizedState });
        storeNormalized.updateHandler.subscribe(() => { });
        bench("normalized state", function () {
            storeNormalized.beginTransaction();
            for (let i = 0; i < normalizedCount; i++) {
                storeNormalized.instructor.add(newsArgPath, { id: i, text: "some news text" + i }, [i]);
            }
            for (let i = normalizedCount - 1; i >= 0; i--) {
                storeNormalized.instructor.remove(newsScope.path, [], i);
            }
            storeNormalized.flush();
        });
    });
};
module.exports.reistateSuite = reistateSuite;

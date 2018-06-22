const { Store, StoreSchema, Scope, Path, Instructor } = require("../lib");
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
        function* transformer(instruction, is, state) {
            if (is(newsPath)) {
                if (instruction.type === InstructionType.add) {
                    yield Instructor.createAdd(showPath, instruction.value.id);
                } else {
                    yield Instructor.createRemove(showPath, instruction.index);
                }
            }
            yield instruction;
        }
        const schemaNormalized = new StoreSchema(transformer);

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
};
module.exports.reistateSuite = reistateSuite;

const { createStore, createSchema, createScope, Path, Instructor } = require("../lib");
const { InstructionType } = require("../lib/enums/InstructionType");

const reistateSuite = (iterations, initCounterStore, deepState, initNormalizedState, normalizedCount) => {
    suite("reistate", function () {
        set('iterations', iterations);
        const initStore = (state) => {
            return createStore(createSchema({ ...state }))
                .subscribe(() => { });
        };
        const schema = createSchema({});
        bench("create", function () {
            const store = createStore(schema)
                .subscribe(() => { });
            Path.fromSelector(f => f.scope);
        });
        const counter = Path.fromSelector(f => f.scope.counter);
        const storeModify = initStore(initCounterStore);
        bench("modify", function () {
            storeModify.set(counter, 1);
        });
        const storeCounter = initStore(initCounterStore);
        bench("counter reducer", function () {
            storeCounter.beginTransaction();
            storeCounter.set(counter, v => v + 1);
            storeCounter.set(counter, v => v - 1);
            storeCounter.set(counter, v => v + 1);
            storeCounter.set(counter, v => v - 1);
            storeCounter.flush();
        });
        const deepSchema = createSchema({ ...deepState });
        const storeDeepCounter = createStore(deepSchema)
            .subscribe(() => { });
        const scopeSchema = createScope(deepSchema, f => f.scope0.scope1.scope2.scope3.scope4.counter);
        const counterPath = scopeSchema.path.join(f => f.counter);
        bench("counter reducer deep", function () {
            storeDeepCounter.beginTransaction();
            storeDeepCounter.set(counterPath, v => v + 1);
            storeDeepCounter.set(counterPath, v => v - 1);
            storeDeepCounter.set(counterPath, v => v + 1);
            storeDeepCounter.set(counterPath, v => v - 1);
            storeDeepCounter.flush();
        });

        function* transformer(instruction, is, state) {
            if (is(newsScope.path)) {
                if (instruction.type === InstructionType.add) {
                    yield Instructor.createAdd(showArgPath, instruction.value.id);
                } else if (instruction.type === InstructionType.remove) {
                    yield Instructor.createRemove(showScope.path, instruction.index);
                }
            }
            yield instruction;
        }
        const schemaNormalized = createSchema(initNormalizedState, transformer);
        const newsScope = createScope(schemaNormalized, f => f.news);
        const showScope = createScope(schemaNormalized, f => f.show);
        const newsArgPath = newsScope.path.join(f => f["{}"]);
        const showArgPath = showScope.path.join(f => f["{}"]);

        const storeNormalized = createStore(schemaNormalized)
            .subscribe(() => { });
        bench("normalized state", function () {
            storeNormalized.beginTransaction();
            for (let i = 0; i < normalizedCount; i++) {
                storeNormalized.add(newsArgPath, { id: i, text: "some news text" + i }, [i]);
            }
            for (let i = normalizedCount - 1; i >= 0; i--) {
                storeNormalized.remove(newsScope.path, i);
            }
            storeNormalized.flush();
        });
    });
};
module.exports.reistateSuite = reistateSuite;

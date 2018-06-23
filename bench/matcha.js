const { reduxSuite } = require("./redux");
const { efSuite } = require("./effector");
const { pathonSuite } = require("./pathon");
const { reistateSuite } = require("./reistate");

const initCounterStore = {
    scope: {
        counter: 0
    }
};
const initNormalizedState = {
    news: {},
    show: []
};
const deepState = {
    scope0: {
        scope1: {
            scope2: {
                scope3: {
                    scope4: {
                        counter: 0
                    }
                }
            }
        }
    }
};
const normalizedCount = 1;

const iterations = 1000;
suite("immutable noop", function () {
    set('iterations', iterations);
    bench("create", function () {
        const store = {
            scope: {
                counter: 0
            }
        };
    });
    let store = initCounterStore;
    bench("modify", function () {
        store = {
            ...store,
            scope: {
                ...store.scope,
                counter: 1
            }
        };
    });
});
reduxSuite(iterations, initCounterStore, deepState, initNormalizedState, normalizedCount);
reistateSuite(iterations, initCounterStore, deepState, initNormalizedState, normalizedCount);
efSuite(iterations, initCounterStore, deepState, initNormalizedState, normalizedCount);
// pathonSuite(iterations, initCounterStore, deepState, initNormalizedState, normalizedCount);

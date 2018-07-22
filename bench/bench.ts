import { createHeavySubscriber } from "./helpers";
import { Suite } from "benchmark";
import { reduxSuite } from "./redux";
import { efSuite } from "./effector";
import { pathonSuite } from "./pathon";
import { reistoreSuite } from "./reistore";
import { reporter } from "./benchmark/reporter";

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
const normalizedCount = 20;

const iterations = 1000;

var bench = new Suite('immutable noop', {
    delay: 0
});
// bench.on('cycle', function (event) {
//     console.log(String(event.target));
// }).on('complete', function () {
//     // console.log('Fastest is ' + this.filter('fastest').map('name'));
// });
reporter(bench);
bench.add({
    'name': 'create',
    'fn': () => {
        const store = {
            scope: {
                counter: 0
            }
        };
    }
});
const modifyBench = () => {
    let store = initCounterStore;
    return () => {
        store = {
            ...store,
            scope: {
                ...store.scope,
                counter: 1
            }
        };
    };
}
bench.add({
    'name': 'modify',
    'fn': modifyBench()
});
bench.run();
const options = {
    iterations,
    normalizedCount,
    helpers: {
        createHeavySubscriber
    },
    initState: {
        counter: initCounterStore,
        deepCounter: deepState,
        normalized: initNormalizedState
    }
};
const suites = [reduxSuite, reistoreSuite];
for (const s of suites) {
    const su = s(options);
    var bench = new Suite(su.name, {
        delay: 0,
        maxTime: 1,
        initCount: 1
    });
    reporter(bench);
    bench.on('error', event => {
        console.log(event);
    });
    for (const b of su.benchmarks) {
        const fn = b.bench()
        bench.add({ name: b.name, fn });
    }
    bench.run();
}
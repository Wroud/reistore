import { color, humanize, padBefore, cursor } from "./utils";
import { Suite, Event } from "benchmark";

export function reporter(suite: Suite) {

    // suite.on('start', function () {
    //   console.log();
    // });

    // suite.on('complete', function (stats) {
    //   console.log();
    //   console.log(color('  Suites:  ', 'gray') + stats.suites);
    //   console.log(color('  Benches: ', 'gray') + stats.benches);
    //   console.log(color('  Elapsed: ', 'gray') + humanize(stats.elapsed.toFixed(2)) + ' ms');
    //   console.log();
    // });

    suite.on('start', function (suite: Event) {
        console.log(padBefore('', 23) + (suite.currentTarget as any).name);
    });

    suite.on('complete', function (suite) {
        console.log();
    });

    // suite.on('cycle', function (bench) {
    //   process.stdout.write('\r' + color(padBefore('wait » ', 25), 'yellow')
    //                             + color(bench.title, 'gray'));
    // });

    suite.on('cycle', function (results: Event) {
        //   cursor.CR();
        var ops = humanize((results.target as any).hz.toFixed(0));
        console.log(color(padBefore(ops + ' op/s', 22), 'cyan')
            + color(' » ' + (results.target as any).name, 'gray'));
    });
};
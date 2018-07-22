export const series = function (arr, delay, iterator, done) {
    if ('function' == typeof delay) {
        done = iterator;
        iterator = delay;
        delay = 0;
    }

    done = done || function () { };

    function iterate(i) {
        var fn = arr[i];
        if (!fn) return done();
        iterator(fn, function cb(err) {
            if (err) return done(err);
            if (!delay) return iterate(++i);
            setTimeout(function () {
                iterate(++i);
            }, delay);
        });
    };

    iterate(0);
};


export const color = function (str, color) {
    var options = {
        red: '\u001b[31m'
        , green: '\u001b[32m'
        , yellow: '\u001b[33m'
        , blue: '\u001b[34m'
        , magenta: '\u001b[35m'
        , cyan: '\u001b[36m'
        , gray: '\u001b[90m'
        , reset: '\u001b[0m'
    };
    return options[color] + str + options.reset;
};

export const highlight = function (str, color) {
    var options = {
        red: '\u001b[41m'
        , green: '\u001b[42m'
        , yellow: '\u001b[43m'
        , blue: '\u001b[44m'
        , magenta: '\u001b[45m'
        , cyan: '\u001b[46m'
        , gray: '\u001b[100m'
        , reset: '\u001b[0m'
    };
    return options[color] + str + options.reset;
};

export const padAfter = function (str, width) {
    return str + Array(width - str.length).join(' ');
};

export const padBefore = function (str, width) {
    return Array(width - str.length).join(' ') + str;
};

export const humanize = function (n) {
    var n = String(n).split('.') as any;
    n[0] = n[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    return n.join('.')
};

// from mocha
export const cursor = {
    hide: function () {
        process.stdout.write('\\033[?25l');
    }

    , show: function () {
        process.stdout.write('\\033[?25h');
    }

    , deleteLine: function () {
        process.stdout.write('\\033[2K');
    }

    , beginningOfLine: function () {
        process.stdout.write('\\033[0G');
    }

    , CR: function () {
        cursor.deleteLine();
        cursor.beginningOfLine();
    }
};
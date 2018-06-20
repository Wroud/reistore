"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function* exchangeIterator(iterator, action) {
    for (const value of iterator) {
        yield* action(value);
    }
}
exports.exchangeIterator = exchangeIterator;
//# sourceMappingURL=tools.js.map
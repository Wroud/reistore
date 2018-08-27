"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Store_1 = require("./Store");
function* exchangeIterator(iterator, action) {
    for (const value of iterator) {
        yield* action(value);
    }
}
exports.exchangeIterator = exchangeIterator;
function isStore(object) {
    return object instanceof Store_1.Store;
}
exports.isStore = isStore;
//# sourceMappingURL=tools.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("./tools");
const Schema_1 = require("./Schema");
class StoreSchema extends Schema_1.Schema {
    setInitState(store) {
        if (!store.state) {
            store.state = Object.assign({}, this.initState);
        }
        for (const scope of this.scopes) {
            scope.setInitState(store);
        }
    }
    getState(state) {
        return tools_1.isStore(state) ? state.state : state;
    }
}
exports.StoreSchema = StoreSchema;
function createSchema(initState, transformator) {
    return new StoreSchema(initState, transformator);
}
exports.createSchema = createSchema;
//# sourceMappingURL=StoreSchema.js.map
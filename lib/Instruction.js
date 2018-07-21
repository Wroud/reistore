"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Instruction {
    constructor(type, path, index, args, value, injection) {
        this.type = type;
        this.path = path;
        this.index = index;
        this.args = args;
        this.value = value;
        this.injection = injection;
    }
    in(path, args, strict) {
        if (args !== undefined
            && (this.args === undefined
                || args.length > this.args.length)
            || !this.path) {
            return false;
        }
        const isPathEqual = this.path.includes(path, strict);
        if (!isPathEqual
            || args === undefined
            || this.args === undefined
            || args.length === 0) {
            return isPathEqual;
        }
        for (let i = 0; i < args.length; i++) {
            if (args[i] !== this.args[i]) {
                return false;
            }
        }
        return true;
    }
}
exports.Instruction = Instruction;
//# sourceMappingURL=Instruction.js.map
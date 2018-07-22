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
    in(path, strict, ...args) {
        if (!this.path) {
            return false;
        }
        if ((!this.args || this.args.length === 0) && args.length === 0) {
            return this.path === path || this.path.includes(path, strict);
        }
        if (!this.args || args.length > this.args.length) {
            return false;
        }
        if (this.path === path) {
            if (this.args.length !== args.length) {
                return false;
            }
            for (let i = 0; i < this.args.length; i++) {
                if (this.args[i] !== args[i]) {
                    return false;
                }
            }
            return true;
        }
        const instructionPathWithArgs = this.path.getPath(this.args);
        const pathWithArgs = path.getPath(args);
        return strict
            ? instructionPathWithArgs === pathWithArgs
            : instructionPathWithArgs.startsWith(pathWithArgs);
    }
}
exports.Instruction = Instruction;
//# sourceMappingURL=Instruction.js.map
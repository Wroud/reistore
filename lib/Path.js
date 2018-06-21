"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
class Path {
    constructor(selector, path, instructions) {
        this.selector = selector;
        this.instructions = instructions;
        this.path = path;
    }
    static fromSelector(selector) {
        const { path, instructions } = getPathInstructions(selector, {});
        return new Path(selector, path, instructions);
    }
    static fromPath(path) {
        const parts = path.replace(/(\[(\d)\])/g, ".$2").split(".");
        const instructions = [];
        for (const unit of parts) {
            const isIndex = !isNaN(unit.toString());
            instructions.push({ isIndex, key: unit.toString() });
        }
        if (instructions.length > 0) {
            instructions[instructions.length - 1].isEnd = true;
        }
        return new Path(f => f, path, instructions);
    }
    static root() {
        return new Path(f => f, "", []);
    }
    getPath() {
        return this.path;
    }
    getSelector() {
        return this.selector;
    }
    getInstructions() {
        return this.instructions;
    }
    includes(path, strict = false) {
        if (this.path.length === 0) {
            return false;
        }
        return strict
            ? this.path === path.getPath()
            : this.path.startsWith(path.getPath());
    }
    includes2(path, strict = false) {
        if (this.path.length === 0) {
            return false;
        }
        const { path: str } = getPathInstructions(path, {});
        return strict
            ? this.path === str
            : this.path.startsWith(str);
    }
    join(path) {
        const newPath = this.path.length > 0
            ? path.getPath().length > 0
                ? this.path + (path.getPath()[0] === "[" ? "" : ".") + path.getPath()
                : this.path
            : path.getPath();
        return new Path(f => path.getSelector()(this.selector(f)), newPath, [...this.instructions.map(i => (Object.assign({}, i, { isEnd: false }))), ...path.getInstructions()]);
    }
    get(object, defaultValue) {
        let link = object;
        for (const instruction of this.instructions) {
            if (instruction.isEnd) {
                const result = link[instruction.key];
                return result === undefined ? defaultValue : result;
            }
            link = link[instruction.key];
            if (link === undefined) {
                return defaultValue;
            }
        }
        return object;
    }
    set(object, value) {
        let link = object;
        for (const instruction of this.instructions) {
            if (instruction.isEnd) {
                link[instruction.key] = value;
                return true;
            }
            link = link[instruction.key];
            if (link === undefined) {
                return false;
            }
        }
        return false;
    }
    setImmutable(object, value) {
        if (object === undefined) {
            return false;
        }
        this.nextPath(0, object, value);
        return true;
    }
    nextPath(index, object, value) {
        const instruction = this.instructions[index];
        if (instruction.isEnd) {
            if (value === null) {
                delete object[instruction.key];
            }
            else {
                object[instruction.key] = value;
            }
            return;
        }
        const nextInstruction = this.instructions[++index];
        let newObject = object[instruction.key];
        if (newObject === undefined) {
            newObject = nextInstruction.isIndex ? [] : {};
        }
        else if (util_1.isArray(newObject)) {
            newObject = [...newObject];
        }
        else {
            newObject = Object.assign({}, newObject);
        }
        object[instruction.key] = newObject;
        this.nextPath(index, newObject, value);
    }
}
exports.Path = Path;
function getPathInstructions(selector, data) {
    let path = "";
    const instructions = [];
    const proxyFactory = object => new Proxy(object, {
        get(target, prop) {
            if (prop === undefined) {
                return {};
            }
            const propAsString = util_1.isNumber(prop) ? prop : prop.toString();
            const isIndex = !isNaN(propAsString);
            instructions.push({ isIndex, key: propAsString });
            path += isIndex
                ? `[${propAsString}]`
                : path === ""
                    ? `${propAsString}`
                    : `.${propAsString}`;
            let selectedVal = target[prop];
            if (selectedVal === undefined) {
                selectedVal = {};
            }
            if (typeof selectedVal === "object" && selectedVal !== null) {
                return proxyFactory(selectedVal);
            }
            else {
                return selectedVal;
            }
        }
    });
    selector(proxyFactory(data));
    if (instructions.length > 0) {
        instructions[instructions.length - 1].isEnd = true;
    }
    return { path, instructions };
}
exports.getPathInstructions = getPathInstructions;
function isPath(object) {
    return "fromSelector" in object;
}
exports.isPath = isPath;
//# sourceMappingURL=Path.js.map
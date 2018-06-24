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
            instructions.push({ isIndex, key: unit.toString(), isMutable: false });
        }
        if (instructions.length > 0) {
            instructions[instructions.length - 1].isEnd = true;
        }
        return new Path(f => f, path, instructions);
    }
    static root() {
        return new Path(f => f, "", []);
    }
    toMutable() {
        return new Path(this.selector, this.path, this.instructions.map(i => (Object.assign({}, i, { isMutable: true }))));
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
    join(spath) {
        const path = isPath(spath)
            ? spath
            : Path.fromSelector(spath);
        const newPath = this.path.length > 0
            ? path.getPath().length > 0
                ? this.path + (path.getPath()[0] === "[" ? "" : ".") + path.getPath()
                : this.path
            : path.getPath();
        return new Path(f => path.getSelector()(this.selector(f)), newPath, [...this.instructions.map(i => (Object.assign({}, i, { isEnd: false }))), ...path.getInstructions()]);
    }
    get(object, defaultValue, strict = false, args = []) {
        let link = object;
        try {
            if (!strict) {
                return this.tryReinitializeValue(object, args, this.selector(object), defaultValue);
            }
        }
        catch (_a) {
            console.group("Reistate:Path");
            console.warn("Cant get value by selector, get it slowly mode, is default value not properly initialized?");
            console.warn("Path: ", this.path);
            console.groupEnd();
        }
        for (const instruction of this.instructions) {
            let key = instruction.key;
            if (instruction.isArg) {
                let arg = args[key];
                key = typeof arg === "function"
                    ? arg(link)
                    : arg;
            }
            if (instruction.isEnd) {
                return this.tryReinitializeValue(object, args, link[key], defaultValue);
            }
            link = link[key];
            if (link === undefined) {
                return defaultValue;
            }
        }
        return object;
    }
    set(object, value, args = []) {
        let link = object;
        for (const instruction of this.instructions) {
            let key = instruction.key;
            if (instruction.isArg) {
                let arg = args[key];
                key = typeof arg === "function"
                    ? arg(link)
                    : arg;
            }
            if (instruction.isEnd) {
                link[key] = typeof value === "function"
                    ? value(link[key])
                    : value;
                return true;
            }
            link = link[key];
            if (link === undefined) {
                return false;
            }
        }
        return false;
    }
    setImmutable(object, value, args) {
        if (this.instructions.length === 0) {
            throw new Error("Reistate:Path Cant set value to zero path");
        }
        this.nextPath(0, this.instructions[0], object, value, args);
    }
    nextPath(index, { key: ikey, isArg, isEnd }, object, value, args) {
        let key = ikey;
        if (isArg) {
            if (!args) {
                key = Array.isArray(object)
                    ? object.length
                    : undefined;
            }
            else {
                const arg = args[key];
                if (arg === undefined) {
                    key = Array.isArray(object) && (args.length === 0 || key === args.length - 1)
                        ? object.length
                        : undefined;
                }
                else if (typeof arg === "function") {
                    key = arg(object);
                }
                else {
                    key = arg;
                }
            }
        }
        if (isEnd) {
            if (value === null) {
                delete object[key];
            }
            else {
                object[key] = typeof value === "function"
                    ? value(object[key])
                    : value;
            }
            return;
        }
        const nextInstruction = this.instructions[++index];
        let newObject = object[key];
        if (!nextInstruction.isMutable || newObject === undefined) {
            if (newObject === undefined) {
                newObject = nextInstruction.isIndex ? [] : {};
            }
            else {
                newObject = util_1.isArray(newObject)
                    ? [...newObject]
                    : Object.assign({}, newObject);
            }
            object[key] = newObject;
        }
        this.nextPath(index, nextInstruction, newObject, value, args);
    }
    tryReinitializeValue(object, args, value, defaultValue) {
        if (value === undefined && defaultValue !== undefined) {
            console.group("Reistate:Path");
            console.warn("Trying to get undefined value, is default value not properly initialized?");
            console.warn("Path: ", this.path);
            console.groupEnd();
            this.set(object, defaultValue, args);
            return defaultValue;
        }
        return value;
    }
}
exports.Path = Path;
function getPathInstructions(selector, data) {
    let path = "";
    let argIndex = 0;
    const instructions = [];
    const proxyFactory = object => new Proxy(object, {
        get(target, prop) {
            if (prop === undefined) {
                return {};
            }
            const propAsString = util_1.isNumber(prop) ? prop : prop.toString();
            const isIndex = !isNaN(propAsString);
            if (propAsString === "{}") {
                instructions.push({ isIndex, key: argIndex++, isMutable: false, isArg: true });
            }
            else {
                instructions.push({ isIndex, key: propAsString, isMutable: false });
            }
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
    return "fromSelector" in object || "instructions" in object;
}
exports.isPath = isPath;
//# sourceMappingURL=Path.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const IPath_1 = require("./interfaces/IPath");
class Path {
    constructor(selector, path) {
        this.selectors = selector;
        this.path = path;
    }
    static create(selector) {
        const { path, pathSelector } = getPathInstructions(selector, {});
        return new Path([pathSelector], path);
    }
    static root() {
        return new Path([{
                selector: f => f,
                instructions: [],
                type: IPath_1.SelectorType.safe,
                isMutable: true
            }], "");
    }
    toMutable() {
        return new Path(this.selectors.map(s => (Object.assign({}, s, { isMutable: s.type === IPath_1.SelectorType.safe }))), this.path);
    }
    getPath() {
        return this.path;
    }
    getSelector() {
        return (data) => {
            let link = data;
            for (const { selector } of this.selectors) {
                link = selector(link);
            }
            return link;
        };
    }
    getSelectors() {
        return this.selectors;
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
            : Path.create(spath);
        const rawPath = path.getPath();
        const newPath = this.path.length > 0
            ? rawPath.length > 0
                ? this.path + (rawPath[0] === "[" ? "" : ".") + rawPath
                : this.path
            : rawPath;
        let argIndex = 0;
        return new Path([
            ...this.selectors.map(selector => (Object.assign({}, selector, { isEnd: false, instructions: selector.instructions.map(instruction => (Object.assign({}, instruction, { key: instruction.isArg ? argIndex++ : instruction.key, isEnd: false }))) }))),
            ...path.getSelectors().map(selector => (Object.assign({}, selector, { instructions: selector.instructions.map(instruction => (Object.assign({}, instruction, { key: instruction.isArg ? argIndex++ : instruction.key }))) })))
        ], newPath);
    }
    get(object, defaultValue, args) {
        let link = object;
        for (const { selector, type, instructions } of this.selectors) {
            if (type === IPath_1.SelectorType.safe) {
                try {
                    link = selector(link);
                    if (link === undefined) {
                        console.group("Reistate:Path");
                        console.warn("Trying to get value from undefined, is default value not properly initialized?");
                        console.warn("Path: ", this.path);
                        console.groupEnd();
                        return defaultValue;
                    }
                }
                catch (_a) {
                    console.group("Reistate:Path");
                    console.warn("Cant get value by selector, is default value not properly initialized?");
                    console.warn("Path: ", this.path);
                    console.groupEnd();
                    return defaultValue;
                }
                continue;
            }
            for (const { key: iKey, isArg, isEnd } of instructions) {
                let key = iKey;
                if (!args) {
                    console.group("Reistate:Path");
                    console.warn("Trying to get value from path with arguments, but no arguments passed.");
                    console.warn("Path: ", this.path);
                    console.groupEnd();
                }
                else if (isArg) {
                    let arg = args[key];
                    key = typeof arg === "function"
                        ? arg(link)
                        : arg;
                }
                if (isEnd) {
                    return this.tryReinitializeValue(object, args, link[key], defaultValue);
                }
                link = link[key];
                if (link === undefined) {
                    console.group("Reistate:Path");
                    console.warn("Trying to get value from undefined, is default value not properly initialized?");
                    console.warn("Path: ", this.path);
                    console.groupEnd();
                    return defaultValue;
                }
            }
        }
        return link;
    }
    set(object, value, args) {
        let link = object;
        for (const { instructions, isEnd, selector, type } of this.selectors) {
            if (instructions.length === 0) {
                throw new Error("Reistate:Path Cant set value to zero path");
            }
            if (type === IPath_1.SelectorType.safe && !isEnd) {
                link = selector(link);
                continue;
            }
            for (const { key: iKey, isArg, isEnd } of instructions) {
                let key = iKey;
                if (isArg) {
                    if (!args) {
                        key = Array.isArray(link)
                            ? link.length
                            : undefined;
                    }
                    else {
                        const arg = args[key];
                        if (arg === undefined) {
                            key = Array.isArray(link) && (args.length === 0 || key === args.length - 1)
                                ? link.length
                                : undefined;
                        }
                        else if (typeof arg === "function") {
                            key = arg(link);
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
                            ? value(link[key])
                            : value;
                    }
                    return true;
                }
                link = link[key];
                if (link === undefined) {
                    return false;
                }
            }
        }
        return false;
    }
    setImmutable(object, value, args) {
        let link = { object, key: undefined };
        for (const { selector, instructions, isEnd, isMutable } of this.selectors) {
            if (isMutable && !isEnd) {
                link.object = selector(link.object);
                continue;
            }
            if (instructions.length === 0) {
                throw new Error("Reistate:Path Cant set value to zero path");
            }
            link = this.nextPath(instructions, 0, instructions[0], link.object, link.key, value, args);
        }
    }
    nextPath(instructions, index, { key: ikey, isArg, isEnd, isIndex }, object, currentKey, value, args) {
        if (currentKey !== undefined) {
            let newObject = object[currentKey];
            if (newObject === undefined) {
                if (newObject === undefined) {
                    newObject = isIndex ? [] : {};
                }
                else {
                    newObject = util_1.isArray(newObject)
                        ? [...newObject]
                        : Object.assign({}, newObject);
                }
                object[currentKey] = newObject;
            }
            object = newObject;
        }
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
        if (instructions.length === index + 1) {
            return { object, key };
        }
        const nextInstruction = instructions[++index];
        return this.nextPath(instructions, index, nextInstruction, object, key, value, args);
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
    let safe = true;
    const instructions = [];
    const proxyFactory = object => new Proxy(object, {
        get(target, prop) {
            if (prop === undefined) {
                return {};
            }
            const propAsString = util_1.isNumber(prop) ? prop : prop.toString();
            const isIndex = !isNaN(propAsString);
            if (propAsString === "{}") {
                safe = false;
                instructions.push({ isIndex, key: argIndex++, isArg: true });
            }
            else {
                instructions.push({ isIndex, key: propAsString });
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
    return {
        path,
        pathSelector: {
            selector,
            instructions,
            type: safe ? IPath_1.SelectorType.safe : IPath_1.SelectorType.unsafe,
            isEnd: true
        }
    };
}
exports.getPathInstructions = getPathInstructions;
function isPath(object) {
    return "fromSelector" in object || "selectors" in object;
}
exports.isPath = isPath;
//# sourceMappingURL=Path.js.map
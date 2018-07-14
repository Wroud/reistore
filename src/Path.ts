import { isArray, isNumber } from "util";
import { IPath, PathSelector, IPathInstruction, PathArg, PathValue } from "./interfaces/IPath";

export class Path<TModel, TValue> implements IPath<TModel, TValue> {
    static fromSelector<TModel, TValue>(selector: PathSelector<TModel, TValue>) {
        const { path, instructions } = getPathInstructions(selector, {});
        return new Path<TModel, TValue>(selector, path, instructions);
    }
    static fromPath<TModel = any, TValue = any>(path: string) {
        const parts = path.replace(/(\[(\d)\])/g, ".$2").split(".");
        const instructions: IPathInstruction[] = [];
        for (const unit of parts) {
            const isIndex = !isNaN(unit.toString() as any);
            instructions.push({ isIndex, key: unit.toString(), isMutable: false });
        }
        if (instructions.length > 0) {
            instructions[instructions.length - 1].isEnd = true;
        }
        return new Path<TModel, TValue>(f => f as any, path, instructions);
    }
    static root<TModel>() {
        return new Path<TModel, TModel>(f => f, "", []);
    }
    private selector: PathSelector<TModel, TValue>;
    private path: string;
    private instructions: IPathInstruction[];
    constructor(selector: PathSelector<TModel, TValue>, path: string, instructions: IPathInstruction[]) {
        this.selector = selector;
        this.instructions = instructions;
        this.path = path;
    }
    toMutable() {
        return new Path(this.selector, this.path, this.instructions.map(i => ({ ...i, isMutable: true })))
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
    includes(path: IPath<TModel, any>, strict: boolean = false) {
        if (this.path.length === 0) {
            return false;
        }
        return strict
            ? this.path === path.getPath()
            : this.path.startsWith(path.getPath());
    }
    includes2(path: (model: TModel) => any, strict: boolean = false) {
        if (this.path.length === 0) {
            return false;
        }
        const { path: str } = getPathInstructions(path, {});
        return strict
            ? this.path === str
            : this.path.startsWith(str);
    }
    join<T>(spath: IPath<TValue, T> | PathSelector<TValue, T>) {
        const path = isPath<TValue, T>(spath)
            ? spath
            : Path.fromSelector(spath);
        const newPath = this.path.length > 0
            ? path.getPath().length > 0
                ? this.path + (path.getPath()[0] === "[" ? "" : ".") + path.getPath()
                : this.path
            : path.getPath();
        return new Path<TModel, T>(
            f => path.getSelector()(this.selector(f)),
            newPath,
            [...this.instructions.map(i => ({ ...i, isEnd: false })), ...path.getInstructions()]
        );
    }
    get(object: TModel, defaultValue?: TValue, strict: boolean = false, args: PathArg[] = []): TValue | undefined {
        let link = object;
        try {
            if (!strict) {
                const result = this.selector(object);
                return result === undefined ? defaultValue : result;
            }
        } catch {
            console.group("Reistate:Path");
            console.warn("Cant get value by selector, is default value not properly initialized?");
            console.warn("Path: ", this.path);
            console.groupEnd();
            return defaultValue;
        }
        for (const instruction of this.instructions) {
            let key = instruction.key as string;
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
                console.group("Reistate:Path");
                console.warn("Trying to get value from undefined, is default value not properly initialized?");
                console.warn("Path: ", this.path);
                console.groupEnd();
                return defaultValue;
            }
        }
        return object as any;
    }
    set(object: TModel, value?: PathValue<TValue> | null, args: PathArg[] = []) {
        let link = object;
        for (const instruction of this.instructions) {
            let key = instruction.key as string;
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
    setImmutable(object: TModel, value: PathValue<TValue> | undefined | null, args?: PathArg[]) {
        if (this.instructions.length === 0) {
            throw new Error("Reistate:Path Cant set value to zero path");
        }
        this.nextPath(0, this.instructions[0], object, value, args);
    }
    private nextPath(
        index: number,
        { key: ikey, isArg, isEnd }: IPathInstruction,
        object: TModel,
        value: PathValue<TValue> | undefined | null,
        args?: PathArg[]
    ) {
        let key = ikey as number | string;
        if (isArg) {
            if (!args) {
                key = Array.isArray(object)
                    ? (object as any).length
                    : undefined;
            } else {
                const arg = args[key];
                if (arg === undefined) {
                    key = Array.isArray(object) && (args.length === 0 || key === args.length - 1)
                        ? (object as any).length
                        : undefined;
                } else if (typeof arg === "function") {
                    key = arg(object);
                } else {
                    key = arg;
                }
            }
        }
        if (isEnd) {
            if (value === null) {
                delete object[key];
            } else {
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
            } else {
                newObject = isArray(newObject)
                    ? [...newObject]
                    : { ...newObject };
            }
            object[key] = newObject;
        }
        this.nextPath(index, nextInstruction, newObject, value, args);
    }
    private tryReinitializeValue(object, args, value, defaultValue) {
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

export function getPathInstructions(selector: (obj) => any, data) {
    let path = "";
    let argIndex = 0;
    const instructions: IPathInstruction[] = [];
    const proxyFactory = object => new Proxy(object, {
        get(target, prop) {
            if (prop === undefined) {
                return {};
            }
            const propAsString = isNumber(prop) ? prop : prop.toString();
            const isIndex = !isNaN(propAsString as any);
            if (propAsString === "{}") {
                instructions.push({ isIndex, key: argIndex++, isMutable: false, isArg: true });
            } else {
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
            } else {
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

export function isPath<TModel, TValue>(object): object is Path<TModel, TValue> | IPath<TModel, TValue> {
    return "fromSelector" in object || "instructions" in object;
}

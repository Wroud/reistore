import { isArray, isNumber, isString } from "util";
import {
    IPath,
    PathSelector,
    IPathInstruction,
    PathArg,
    PathValue,
    IPathSelector,
    SelectorType
} from "./interfaces/IPath";

export class Path<TModel, TValue> implements IPath<TModel, TValue> {
    static create<TModel, TValue>(selector: PathSelector<TModel, TValue>) {
        const { path, pathSelector } = getPathInstructions(selector, {});
        return new Path<TModel, TValue>([pathSelector], path);
    }
    static root<TModel>() {
        return new Path<TModel, TModel>(
            [{
                path: "",
                selector: f => f,
                instructions: [],
                type: SelectorType.safe,
                isMutable: true
            }],
            ""
        );
    }
    private selectors: IPathSelector<any, any>[];
    private path: string;
    private constructor(selector: IPathSelector<any, any>[], path: string) {
        this.selectors = selector;
        this.path = path;
    }
    toMutable() {
        return new Path<TModel, TValue>(
            this.selectors.map(s => ({
                ...s,
                isMutable: s.type === SelectorType.safe
            })),
            this.path
        );
    }
    getPath(args?: PathArg[]) {
        if (!args || args.length === 0) {
            return this.path;
        }
        let i = 0;
        const getArg = () => {
            if (i >= args.length) {
                return ".{}";
            }
            const arg = args[i++];
            if (isString(arg)) {
                return "." + arg;
            }
            return `[${arg.toString()}]`;
        }
        return this.path.replace(".{}", getArg);
    }
    getSelector() {
        return (data: TModel) => {
            let link: TValue = data as any;
            for (const { selector } of this.selectors) {
                link = selector(link);
            }
            return link;
        };
    }
    getSelectors() {
        return this.selectors;
    }
    includes(path: IPath<TModel, any>, strict: boolean = false) {
        if (this.path.length === 0) {
            return false;
        }
        return strict
            ? this.path === path.getPath()
            : this.path.startsWith(path.getPath());
    }
    join<T>(spath: IPath<TValue, T> | PathSelector<TValue, T>) {
        const path: IPath<TValue, T> = isPath<TValue, T>(spath)
            ? spath
            : Path.create(spath);
        const rawPath = path.getPath();
        const newPath = this.path.length > 0
            ? rawPath.length > 0
                ? this.path + (rawPath[0] === "[" ? "" : ".") + rawPath
                : this.path
            : rawPath;
        let argIndex = 0;
        return new Path<TModel, T>(
            [
                ...this.selectors.map(selector => ({
                    ...selector,
                    isEnd: false,
                    instructions: selector.instructions.map(instruction => ({
                        ...instruction,
                        key: instruction.isArg ? argIndex++ : instruction.key,
                        isEnd: false
                    }))
                })),
                ...path.getSelectors().map(selector => ({
                    ...selector,
                    instructions: selector.instructions.map(instruction => ({
                        ...instruction,
                        key: instruction.isArg ? argIndex++ : instruction.key
                    }))
                }))
            ],
            newPath
        );
    }
    get(object: TModel, defaultValue?: TValue, args?: PathArg[]): TValue | undefined {
        let link = object;
        for (const { selector, type, instructions } of this.selectors) {
            if (type === SelectorType.safe) {
                try {
                    link = selector(link);
                    if (link === undefined) {
                        console.group("Reistate:Path");
                        console.warn("Trying to get value from undefined, is default value not properly initialized?");
                        console.warn("Path: ", this.path);
                        console.groupEnd();
                        return defaultValue;
                    }
                } catch {
                    console.group("Reistate:Path");
                    console.warn("Cant get value by selector, is default value not properly initialized?");
                    console.warn("Path: ", this.path);
                    console.groupEnd();
                    return defaultValue;
                }
                continue;
            }
            for (const { key: iKey, isArg, isEnd } of instructions) {
                let key = iKey as string;
                if (!args) {
                    console.group("Reistate:Path");
                    console.warn("Trying to get value from path with arguments, but no arguments passed.");
                    console.warn("Path: ", this.path);
                    console.groupEnd();
                } else if (isArg) {
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
        return link as any;
    }
    set(object: TModel, value?: PathValue<TValue> | null, args?: PathArg[]) {
        let link = object;
        for (const { instructions, isEnd, selector, type } of this.selectors) {
            if (instructions.length === 0) {
                throw new Error("Reistate:Path Cant set value to zero path");
            }
            if (type === SelectorType.safe && !isEnd) {
                link = selector(link);
                continue;
            }
            for (const { key: iKey, isArg, isEnd } of instructions) {
                let key = iKey as number | string;
                if (isArg) {
                    if (!args) {
                        key = Array.isArray(link)
                            ? (link as any).length
                            : undefined;
                    } else {
                        const arg = args[key];
                        if (arg === undefined) {
                            key = Array.isArray(link) && (args.length === 0 || key === args.length - 1)
                                ? (link as any).length
                                : undefined;
                        } else if (typeof arg === "function") {
                            key = arg(link);
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
    setImmutable(object: TModel, value: PathValue<TValue> | undefined | null, args?: PathArg[]) {
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
    private nextPath(
        instructions: IPathInstruction[],
        index: number,
        { key: ikey, isArg, isEnd, isIndex }: IPathInstruction,
        object: TModel,
        currentKey: string | number | undefined,
        value: PathValue<TValue> | undefined | null,
        args?: PathArg[]
    ) {
        if (currentKey !== undefined) {
            let newObject = object[currentKey];
            if (newObject === undefined) {
                newObject = isIndex ? [] : {};
            } else {
                newObject = isArray(newObject)
                    ? [...newObject]
                    : { ...newObject };
            }
            object[currentKey] = newObject;
            object = newObject;
        }

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

        if (instructions.length === index + 1) {
            return { object, key };
        }
        const nextInstruction = instructions[++index];
        return this.nextPath(instructions, index, nextInstruction, object, key, value, args);
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
    let safe = true;
    const instructions: IPathInstruction[] = [];
    const proxyFactory = object => new Proxy(object, {
        get(target, prop) {
            if (prop === undefined) {
                return {};
            }
            const propAsString = isNumber(prop) ? prop : prop.toString();
            const isIndex = !isNaN(propAsString as any);
            if (propAsString === "{}") {
                safe = false;
                instructions.push({ isIndex, key: argIndex++, isArg: true });
            } else {
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
            } else {
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
            path,
            selector,
            instructions,
            type: safe ? SelectorType.safe : SelectorType.unsafe,
            isEnd: true
        } as IPathSelector<any, any>
    };
}

export function isPath<TModel, TValue>(object): object is Path<TModel, TValue> | IPath<TModel, TValue> {
    return "fromSelector" in object || "selectors" in object;
}

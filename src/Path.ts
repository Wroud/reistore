import { isArray, isNumber } from "util";
import { IPath, PathSelector, IPathInstruction } from "./interfaces/IPath";

// export interface IPath<TModel, TValue> extends Path<TModel, TValue> {
//     new(selector: PathSelector<TModel, TValue>, path: string, instructions: IPathInstruction[]): Path<TModel, TValue>;
// }

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
            instructions.push({ isIndex, key: unit.toString() });
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
    join<T>(path: IPath<TValue, T>) {
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
    get(object: TModel, defaultValue?: TValue): TValue | undefined {
        let link = object;
        for (const instruction of this.instructions) {
            if (instruction.isEnd) {
                const result = link[instruction.key];
                return result === undefined ? defaultValue : result;
            }
            link = link[instruction.key];
            if (link === undefined) {
                return defaultValue as any;
            }
        }
        return object as any;
    }
    set(object: TModel, value?: TValue | null) {
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
    setImmutable(object: TModel, value?: TValue | null) {
        if (object === undefined) {
            return false;
        }
        this.nextPath(0, object, value);
        return true;
    }
    private nextPath(index: number, object: TModel, value?: TValue | null) {
        const instruction = this.instructions[index];
        if (instruction.isEnd) {
            if (value === null) {
                delete object[instruction.key];
            } else {
                object[instruction.key] = value;
            }
            return;
        }

        const nextInstruction = this.instructions[++index];
        let newObject = object[instruction.key];
        if (newObject === undefined) {
            newObject = nextInstruction.isIndex ? [] : {};
        } else if (isArray(newObject)) {
            newObject = [...newObject];
        } else {
            newObject = { ...newObject };
        }
        object[instruction.key] = newObject;
        this.nextPath(index, newObject, value);
    }
}

export function getPathInstructions(selector: (obj) => any, data) {
    let path = "";
    const instructions: IPathInstruction[] = [];
    const proxyFactory = object => new Proxy(object, {
        get(target, prop) {
            if (prop === undefined) {
                return {};
            }
            const propAsString = isNumber(prop) ? prop : prop.toString();
            const isIndex = !isNaN(propAsString as any);
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

export function isPath<TModel, TValue>(object): object is Path<TModel, TValue> {
    return "fromSelector" in object;
}

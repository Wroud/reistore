import { IPath, PathSelector, IPathInstruction } from "./interfaces/IPath";
export declare class Path<TModel, TValue> implements IPath<TModel, TValue> {
    static fromSelector<TModel, TValue>(selector: PathSelector<TModel, TValue>): Path<TModel, TValue>;
    static fromPath<TModel = any, TValue = any>(path: string): Path<TModel, TValue>;
    static root<TModel>(): Path<TModel, TModel>;
    private selector;
    private path;
    private instructions;
    constructor(selector: PathSelector<TModel, TValue>, path: string, instructions: IPathInstruction[]);
    getPath(): string;
    getSelector(): PathSelector<TModel, TValue>;
    getInstructions(): IPathInstruction[];
    includes(path: IPath<TModel, any>, strict?: boolean): boolean;
    includes2(path: (model: TModel) => any, strict?: boolean): boolean;
    join<T>(path: IPath<TValue, T>): Path<TModel, T>;
    get(object: TModel, defaultValue?: TValue): TValue | undefined;
    set(object: TModel, value?: TValue | null): boolean;
    setImmutable(object: TModel, value?: TValue | null): boolean;
    private nextPath;
}
export declare function getPathInstructions(selector: (obj: any) => any, data: any): {
    path: string;
    instructions: IPathInstruction[];
};
export declare function isPath<TModel, TValue>(object: any): object is Path<TModel, TValue>;

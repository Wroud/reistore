import { IPath, PathSelector, PathArg, PathValue, IPathSelector } from "./interfaces/IPath";
export declare class Path<TModel, TValue> implements IPath<TModel, TValue> {
    static create<TModel, TValue>(selector: PathSelector<TModel, TValue>): Path<TModel, TValue>;
    static root<TModel>(): Path<TModel, TModel>;
    private selectors;
    private path;
    private constructor();
    toMutable(): Path<TModel, TValue>;
    getPath(args?: PathArg[]): string;
    getSelector(): (data: TModel) => TValue;
    getSelectors(): IPathSelector<any, any>[];
    includes(path: IPath<TModel, any>, strict?: boolean): boolean;
    join<T>(spath: IPath<TValue, T> | PathSelector<TValue, T>): Path<TModel, T>;
    get(object: TModel, defaultValue?: TValue, args?: PathArg[]): TValue | undefined;
    set(object: TModel, value?: PathValue<TValue> | null, args?: PathArg[]): boolean;
    setImmutable(object: TModel, value: PathValue<TValue> | undefined | null, args?: PathArg[]): void;
    private nextPath;
    private tryReinitializeValue;
}
export declare function getPathInstructions(selector: (obj: any) => any, data: any): {
    path: string;
    pathSelector: IPathSelector<any, any>;
};
export declare function isPath<TModel, TValue>(object: any): object is Path<TModel, TValue> | IPath<TModel, TValue>;

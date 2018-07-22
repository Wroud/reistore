export declare type PathSelector<TModel, TValue> = (model: TModel) => TValue;
export declare type PathArg = string | number | ((value: any) => string | number);
export declare type PathValue<T> = T | ((value: T) => T);
export declare enum SelectorType {
    safe = 0,
    unsafe = 1
}
export interface IPathInstruction {
    key: PathArg;
    isArg?: boolean;
    isIndex: boolean;
    isEnd?: boolean;
}
export interface IPathSelector<TModel, TValue> {
    path: string;
    selector: PathSelector<TModel, TValue>;
    instructions: IPathInstruction[];
    type: SelectorType;
    isMutable: boolean;
    isEnd?: boolean;
}
export interface IPath<TModel, TValue> {
    getPath(args?: PathArg[]): string;
    getSelector(): PathSelector<TModel, TValue>;
    getSelectors(): IPathSelector<any, any>[];
    toMutable(): IPath<TModel, TValue>;
    setImmutable(object: TModel, value?: PathValue<TValue> | null, args?: PathArg[]): any;
    set(object: TModel, value?: PathValue<TValue> | null, args?: PathArg[]): any;
    get(object: TModel, defaultValue?: TValue, args?: PathArg[]): TValue | undefined;
    join<T>(spath: IPath<TValue, T> | PathSelector<TValue, T>): IPath<TModel, T>;
    includes(path: IPath<TModel, any>, strict?: boolean): boolean;
}

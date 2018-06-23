export declare type PathSelector<TModel, TValue> = (model: TModel) => TValue;
export declare type PathArg = string | number | ((value: any) => string | number);
export declare type PathValue<T> = T | ((value: T) => T);
export interface IPathInstruction {
    key: PathArg;
    isArg?: boolean;
    isIndex: boolean;
    isMutable: boolean;
    isEnd?: boolean;
}
export interface IPath<TModel, TValue> {
    getPath(): string;
    getSelector(): PathSelector<TModel, TValue>;
    getInstructions(): IPathInstruction[];
    toMutable(): IPath<TModel, TValue>;
    setImmutable(object: TModel, value: PathValue<TValue> | undefined | null, args: PathArg[]): any;
    set(object: TModel, value: PathValue<TValue>, args?: PathArg[]): any;
    get(object: TModel, defaultValue?: TValue, strict?: boolean, args?: PathArg[]): TValue | undefined;
    join<T>(spath: IPath<TValue, T> | PathSelector<TValue, T>): IPath<TModel, T>;
    includes(path: IPath<TModel, any>, strict?: boolean): boolean;
}

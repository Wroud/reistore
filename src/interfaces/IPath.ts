export type PathSelector<TModel, TValue> = (model: TModel) => TValue;

export type PathArg = string | number | ((value: any) => string | number);
export type PathValue<T> = T | ((value: T) => T)

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
    setImmutable(object: TModel, value?: PathValue<TValue> | null, args?: PathArg[]);
    set(object: TModel, value: PathValue<TValue>, args?: PathArg[]);
    get(object: TModel, defaultValue?: TValue, strict?: boolean, args?: PathArg[]): TValue | undefined;
    join<T>(spath: IPath<TValue, T> | PathSelector<TValue, T>): IPath<TModel, T>;
    includes(path: IPath<TModel, any>, strict?: boolean): boolean;
}

export type PathSelector<TModel, TValue> = (model: TModel) => TValue;
export type PathArg = string | number | ((value: any) => string | number);
export type PathValue<T> = T | ((value: T) => T);

export enum SelectorType {
    safe,
    unsafe
}

export interface IPathInstruction {
    key: PathArg;
    isArg?: boolean;
    isIndex: boolean;
    isEnd?: boolean;
}
export interface IPathSelector<TModel, TValue> {
    selector: PathSelector<TModel, TValue>;
    instructions: IPathInstruction[];
    type: SelectorType;
    isMutable: boolean;
    isEnd?: boolean;
}

export interface IPath<TModel, TValue> {
    getPath(): string;
    getSelector(): PathSelector<TModel, TValue>;
    getSelectors(): IPathSelector<any, any>[];
    toMutable(): IPath<TModel, TValue>;
    setImmutable(object: TModel, value?: PathValue<TValue> | null, args?: PathArg[]);
    set(object: TModel, value?: PathValue<TValue> | null, args?: PathArg[]);
    get(object: TModel, defaultValue?: TValue, args?: PathArg[]): TValue | undefined;
    join<T>(spath: IPath<TValue, T> | PathSelector<TValue, T>): IPath<TModel, T>;
    includes(path: IPath<TModel, any>, strict?: boolean): boolean;
}

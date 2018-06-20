export type PathSelector<TModel, TValue> = (model: TModel) => TValue;

export interface IPathInstruction {
    key: string | number;
    isIndex: boolean;
    isEnd?: boolean;
}

export interface IPath<TModel, TValue> {
    getPath(): string;
    getSelector(): PathSelector<TModel, TValue>;
    getInstructions(): IPathInstruction[];
    setImmutable(object: TModel, value: TValue);
    get(object: TModel, defaultValue?: TValue): TValue | undefined;
    join<T>(path: IPath<TValue, T>): IPath<TModel, T>;
    includes(path: IPath<TModel, any>, strict?: boolean): boolean;
}

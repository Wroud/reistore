import { IPath, PathArg, PathValue } from "./IPath";
export declare type IndexSearch<TValue> = (value: TValue, index: string | number) => boolean;
export declare type IndexGetter<TValue> = (value: TValue[]) => string | number;
export declare type ValueMap<TValue> = {
    [key: string]: TValue;
} | {
    [key: number]: TValue;
};
export interface IInstructor<TState> {
    beginTransaction(): any;
    flush(): any;
    undoTransaction(): any;
    set<TValue>(path: IPath<TState, TValue>, value: PathValue<TValue>, pathArgs?: PathArg[]): any;
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: PathValue<TValue>, pathArgs?: PathArg[]): any;
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, pathArgs?: PathArg[]): any;
}

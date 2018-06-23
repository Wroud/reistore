import { IPath, PathArg } from "./IPath";
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
    set<TValue>(path: IPath<TState, TValue>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>): any;
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>): any;
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, pathArgs: PathArg[] | undefined, index: string | number | IndexSearch<TValue>): any;
}

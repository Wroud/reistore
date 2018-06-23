import { IPath, PathArg } from "./IPath";

export type IndexSearch<TValue> = (value: TValue, index: string | number) => boolean;
export type IndexGetter<TValue> = (value: TValue[]) => string | number;
export type ValueMap<TValue> = { [key: string]: TValue } | { [key: number]: TValue };

export interface IInstructor<TState> {
    set<TValue>(path: IPath<TState, TValue>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>);
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>);
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, pathArgs: PathArg[] | undefined, index: string | number | IndexSearch<TValue>);
}

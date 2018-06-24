import { IPath, PathArg, PathValue } from "./IPath";

export type IndexSearch<TValue> = (value: TValue, index: string | number) => boolean;
export type IndexGetter<TValue> = (value: TValue[]) => string | number;
export type ValueMap<TValue> = { [key: string]: TValue } | { [key: number]: TValue };

export interface IInstructor<TState> {
    beginTransaction();
    flush();
    undoTransaction();
    set<TValue>(path: IPath<TState, TValue>, value: PathValue<TValue>, pathArgs?: PathArg[]);
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: PathValue<TValue>, pathArgs?: PathArg[]);
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, pathArgs?: PathArg[]);
}

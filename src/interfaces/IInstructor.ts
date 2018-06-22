import { IPath } from "./IPath";

export type IndexSearch<TValue> = (value: TValue, index: string | number) => boolean;
export type IndexGetter<TValue> = (value: TValue[]) => string | number;

export interface IInstructor<TState> {
    set<TValue>(path: IPath<TState, TValue>, value: TValue, index?: string | number | IndexGetter<TValue>);
    add<TValue>(path: IPath<TState, TValue[]>, value: TValue, index?: string | number | IndexGetter<TValue>);
    remove<TValue>(path: IPath<TState, TValue[]>, index: string | number | IndexSearch<TValue>);
}

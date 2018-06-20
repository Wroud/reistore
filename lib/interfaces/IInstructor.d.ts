import { IPath } from "./IPath";
export declare type IndexSearch<TValue> = (value: TValue, index: string | number) => boolean;
export declare type IndexGetter<TValue> = (value: TValue[]) => string | number;
export interface IInstructor<TState> {
    set<TValue>(path: IPath<TState, TValue>, value: TValue): any;
    add<TValue>(path: IPath<TState, TValue[]>, value: TValue, index?: string | number | IndexGetter<TValue>): any;
    remove<TValue>(path: IPath<TState, TValue[]>, index: string | number | IndexSearch<TValue>): any;
}

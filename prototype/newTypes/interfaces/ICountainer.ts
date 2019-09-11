import { isMultiple, nodeArgs, nodeSymbol } from "../symbols";
import { IGetNode, INode, ISetNode } from "./INode";

export interface ICountainer extends IMultipleCountainer<false> {
    [nodeSymbol]: INode;
    [nodeArgs]: Map<INode, object>;
}
export interface IMultipleCountainer<TMultiple extends boolean> {
    [isMultiple]: TMultiple;
}
export interface IGetCountainer<TModel, TValue> extends ICountainer {
    [nodeSymbol]: IGetNode<TModel, TValue>;
}
export interface IComputedCountainer<TModel, TValue, TArgs extends any[]>
    extends IGetCountainer<TModel, TValue> {
    (...args: TArgs): this;
}
export interface ISetCountainer<TModel, TValue> extends IGetCountainer<TModel, TValue> {
    [nodeSymbol]: ISetNode<TModel, TValue>;
}
export interface ILockCountainer<T> extends ICountainer {
    // [baseSymbol]: T;
    next<V>(next: (base: T) => V): V;
}
export type CloneMultiple<T, P> = P extends IMultipleCountainer<true>
    ? T extends IMultipleCountainer<true> ? T : T & IMultipleCountainer<true>
    : T;
export type LockCountainer<T> = T extends ILockCountainer<any>
    ? T
    : CloneMultiple<(T extends ISetCountainer<infer TModel, infer TValue>
        ? ISetCountainer<TModel, TValue>
        : T extends IGetCountainer<infer TModel, infer TValue>
        ? IGetCountainer<TModel, TValue>
        : never)
    & ILockCountainer<T>, T>;
export interface ICollectionCountainer<
    TModel,
    TCollection,
    TNestend extends IGetCountainer<any, any>,
    TKey,
    TValue
    > extends ISetCountainer<TModel, TCollection> {
    <
        TA extends TKey | TKey[],
        TAccessor extends IGetCountainer<any, any> = TNestend
        >(
        arg?: TA | IGetCountainer<any, TA> | IMultipleCountainer<false>,
        next?: (node: TNestend extends ILockCountainer<infer P> ? P : TNestend) => TAccessor
    ): TA extends TKey[] ? (LockCountainer<TAccessor> & IMultipleCountainer<true>) : LockCountainer<TAccessor>;
    <
        TAccessor extends IGetCountainer<any, any> = TNestend
        >(
        arg?: IGetCountainer<any, TKey> & IMultipleCountainer<true> | Pattern<TValue>,
        next?: (node: TNestend extends ILockCountainer<infer P> ? P : TNestend) => TAccessor
    ): LockCountainer<TAccessor> & IMultipleCountainer<true>;
    element: TNestend;
}
type ElementType<T> = T extends Iterable<infer P> ? P : T;
type Pattern<TModel> = {
    [P in keyof TModel]?: TModel[P] | IGetCountainer<any, TModel[P]> | (IGetCountainer<any, ElementType<TModel[P]>> & IMultipleCountainer<true>);
};

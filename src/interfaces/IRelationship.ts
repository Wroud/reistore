import { INode, IAccessorContainer } from "./INode";

export interface IRelationship<TStore, TSchema> {
    remove<TValue, TNode extends INode<TStore, any, TValue, any, any>>
        (
        node: (schema: TSchema) => TValue extends Map<infer TKey, any> ? TKey : number,
        key: (value: TValue) => TValue extends Map<infer TKey, any> ? TKey : number);
}
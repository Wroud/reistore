export type NodeValue<T> = T | ((value: T | undefined) => T | null) | null;
export type NodeArg =
    string
    | number
    | symbol
    | (string | number | symbol)[];
export type NodeArgsMap<TRoot> = Map<INode<TRoot, any, any, any, any>, any>;
export type GetNodeValue<T, TMultiple extends boolean> = TMultiple extends true ? (T | undefined)[] : (T | undefined);
export interface INodeResult<T, TMultiple extends boolean = false> {
    isMultiple: boolean;
    value: GetNodeValue<T, TMultiple>;
}
export interface INodeLink<T> {
    isMultiple: boolean;
    value: T;
}
export const PathNode = Symbol("@@node");
export enum NodeType {
    field,
    node,
    array,
    map
}
export interface INode<
    TRoot,
    TModel,
    TValue,
    TParent extends INode<TRoot, any, TModel, any, any>,
    TMultiple extends boolean = false
    >
    extends IAccessor<TRoot, INode<TRoot, TModel, TValue, TParent, TMultiple>> {
    name?: string | number | symbol;
    defaultValue?: () => TValue;
    type: NodeType;
    parent?: TParent;
    root: INode<TRoot, any, any, any, any>;
    chain: INode<TRoot, any, any, any, any>[];

    getFromMultiple(
        objects: TModel[],
        args?: NodeArgsMap<TRoot>
    ): (TValue | undefined)[];
    getFromLink(
        link: INodeLink<TModel>,
        args?: NodeArgsMap<TRoot>
    ): TValue | undefined | (TValue | undefined)[];
    getFromNode<TR = TRoot>(
        object: TR,
        from: INode<TRoot, TR, any, any, any>,
        args?: NodeArgsMap<TRoot>
    ): GetNodeValue<TValue, TMultiple>;
    get(
        object: TRoot,
        args?: NodeArgsMap<TRoot>
    ): GetNodeValue<TValue, TMultiple>;
    setToNode<TR = TRoot>(
        object: TR,
        value: NodeValue<TValue>,
        to: INode<TRoot, TR, any, any, any>,
        args?: NodeArgsMap<TRoot>,
    ): IUndo<TRoot, this>;
    set(
        object: TRoot,
        value: NodeValue<TValue>,
        args?: NodeArgsMap<TRoot>
    ): IUndo<TRoot, this>;
}
export type MarkMultiple<T> = {
    [P in keyof T]: T[P] extends INode<infer R, infer M, infer V, infer N, any>
    ? INode<R, M, V, N, true>
    : (
        T[P] extends object
        ? MarkMultiple<T[P]>
        : T[P]
    )
};
export interface ICountainer<T> {
    [PathNode]: T;
}
export type NodeContainer<TRoot, TParent, TModel, TNode extends INode<TRoot, any, TParent, any, any>> =
    ICountainer<INode<TRoot, TParent, TModel, TNode>>;
export interface IArgContainer<
    TRoot,
    TParent,
    TModel,
    TNode extends INode<TRoot, any, TParent, any, any>,
    TKey,
    TValue extends ICountainer<INode<TRoot, any, any, any, any>>
    >
    extends NodeContainer<TRoot, TParent, TModel, TNode> {
    <TA extends TKey | TKey[], TNode extends INode<TRoot, any, any, any, any> = TValue extends ICountainer<infer N> ? N : undefined>(
        arg?: TA,
        next?: (
            node: TA extends Array<any> ? MarkMultiple<TValue> : TValue
        ) => ICountainer<TNode> | INodeAccessor<TRoot, TNode>
    ): INodeAccessor<TRoot, TNode>;
}
export type FilteredKeys<T, U> = { [P in keyof T]: T[P] extends U ? P : never }[keyof T];
export type Part<T extends symbol | string | number, Value> = { [P in T]: Value };
export type AddKey<
    T,
    K extends string | number | symbol,
    V> = T & Part<K, V>;
export type Container<
    TRoot,
    TParent,
    TModel,
    TNode extends INode<TRoot, any, TParent, any, any>,
    TValue
    > = NodeContainer<TRoot, TModel, TValue, INode<TRoot, TParent, TModel, TNode>>;
export type ArgContainer<
    TRoot,
    TParent,
    TModel,
    TNode extends INode<TRoot, any, TParent, any, any>,
    TKey,
    TValue,
    TElement,
    TSchema
    > = IArgContainer<
    TRoot,
    TModel,
    TValue,
    INode<TRoot, TParent, TModel, TNode, any>,
    TKey,
    TSchema & Container<TRoot, TModel, TValue, INode<TRoot, TParent, TModel, TNode>, TElement>
    >;
export type ExtractNodeSetValue<TNode> = TNode extends INode<any, any, infer V, any, any> ? V : never;
export type ExtractNodeValue<TNode> = TNode extends INode<any, any, infer V, any, infer M> ? GetNodeValue<V, M> : never;
export interface IAccessor<TRoot, TNode extends INode<TRoot, any, any, any, any>> {
    args: NodeArgsMap<TRoot> | undefined;
    node: TNode;
    get(state: TRoot): ExtractNodeValue<TNode>;
    set(state: TRoot, value: NodeValue<ExtractNodeSetValue<TNode>>): IUndo<TRoot, TNode>;
    in(
        node: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>> | ICountainer<INode<TRoot, any, any, any, any>>,
        strict: boolean,
        args?: NodeArgsMap<TRoot>
    ): boolean;
}
export interface INodeAccessor<TRoot, TNode extends INode<TRoot, any, any, any, any>>
    extends IAccessor<TRoot, TNode> {
    in(
        node: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>> | ICountainer<INode<TRoot, any, any, any, any>>,
        strict: boolean
    ): boolean;
}
export interface IUndo<TRoot, TNode extends INode<TRoot, any, any, any, any>>
    extends INodeAccessor<TRoot, TNode> {
    value: ExtractNodeValue<TNode>;
}
export interface ISchemaBuilder<
    TRoot extends object | any[] | Map<any, any>,
    TParent extends object | Array<TModel> | Map<any, TModel>,
    TModel extends object | Array<any> | Map<any, any>,
    TSchema,
    TNode extends INode<TRoot, any, TParent, any, any> = INode<TRoot, TRoot, TParent, never, any>> {
    schema: TSchema;

    field<
        TValue extends TModel[TKey],
        TKey extends FilteredKeys<TModel, string | number | boolean>
        >(key: TKey, defaultValue?: () => TValue): ISchemaBuilder<
        TRoot,
        TParent,
        Exclude<TModel, TKey>,
        AddKey<TSchema, TKey, Container<TRoot, TParent, TModel, TNode, TValue>>,
        TNode>;

    node<
        TValue extends Extract<TModel[TKey], object>,
        TKey extends FilteredKeys<TModel, object>,
        TScope = {}>(
            key: TKey,
            builder?: (
                builder: ISchemaBuilder<TRoot, TModel, TValue, {}, INode<TRoot, TParent, TModel, TNode>>
            ) => ISchemaBuilder<TRoot, TModel, TValue, TScope, INode<TRoot, TParent, TModel, TNode>>,
            defaultValue?: () => TValue
        ): ISchemaBuilder<
        TRoot,
        TParent,
        Exclude<TModel, TKey>,
        AddKey<TSchema, TKey, TScope & Container<TRoot, TParent, TModel, TNode, TValue>>,
        TNode>;

    array<
        TValue extends TModel[TKey] extends Array<infer P> ? P : never,
        TKey extends FilteredKeys<TModel, Array<any>>,
        TScope = {}>(
            key: TKey,
            builder?: (
                builder: ISchemaBuilder<TRoot, Array<TValue>, TValue, {}, INode<TRoot, TModel, Array<TValue>, INode<TRoot, TParent, TModel, TNode>>>
            ) => ISchemaBuilder<TRoot, Array<TValue>, TValue, TScope, INode<TRoot, TModel, Array<TValue>, INode<TRoot, TParent, TModel, TNode>>>,
            defaultValue?: () => TModel[TKey]
        ): ISchemaBuilder<
        TRoot,
        TParent,
        Exclude<TModel, TKey>,
        AddKey<TSchema, TKey, ArgContainer<TRoot, TParent, TModel, TNode, number, TValue[], TValue, TScope>>,
        TNode>;

    map<
        TMapKey extends TModel[TKey] extends Map<infer P, any> ? P : never,
        TValue extends TModel[TKey] extends Map<any, infer P> ? P : never,
        TKey extends Exclude<FilteredKeys<TModel, Map<any, any>>, keyof TSchema>,
        TScope = {}>(
            key: TKey,
            builder?: (
                builder: ISchemaBuilder<TRoot, Map<TMapKey, TValue>, TValue, {}, INode<TRoot, TModel, Map<TMapKey, TValue>, INode<TRoot, TParent, TModel, TNode>>>
            ) => ISchemaBuilder<TRoot, Map<TMapKey, TValue>, TValue, TScope, INode<TRoot, TModel, Map<TMapKey, TValue>, INode<TRoot, TParent, TModel, TNode>>>,
            defaultValue?: () => TModel[TKey]
        ): ISchemaBuilder<
        TRoot,
        TParent,
        Exclude<TModel, TKey>,
        AddKey<TSchema, TKey, ArgContainer<TRoot, TParent, TModel, TNode, TMapKey, Map<TMapKey, TValue>, TValue, TScope>>,
        TNode
        >;
}
// interface ITP {
//     summary: number;
//     count: number;
//     isChecked: boolean;
//     elements: { a: string }[];
//     elementsMap: Map<number, { c: boolean }>;
//     scope: {
//         name: string;
//     }
// }
// const schemaBuilder: ISchemaBuilder<ITP, ITP, ITP> = {} as any;
// const { schema } = schemaBuilder
//     .field("summary")
//     .field("count")
//     .field("isChecked")
//     .array("elements", b =>
//         b.field("a")
//     )
//     .map("elementsMap", b =>
//         b.field("c")
//     )
//     .node("scope", b =>
//         b.field("name")
//     );
// store.get(schema.summary); // number
// store.get(schema.elements); // Array<{ a: string }>
// store.get(schema.elements()); // { a: string }
// store.get(schema.elements(15).a); // string
// store.get(schema.elementsMap); // Map<number, { c: boolean }>
// store.get(schema.elementsMap()); // { c: boolean }
// store.get(schema.elementsMap([1, 15]).c); // Array<boolean>

// store.set(schema.summary, 5);
// store.set(schema.elements, v => [...v]); // immutable update
// store.set(schema.elements(15), { a: "some" }); // mutate state.elements[15] = { a: "some" }
// store.set(schema.elementsMap(15).c, false); // mutate state.elementsMap.get(15).c = false
// store.set(schema.elementsMap([1, 15]).c, true); /* mutate state.elementsMap.get(1).c = true
//                                                           state.elementsMap.get(15).c = true*/

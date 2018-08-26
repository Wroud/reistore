import { INode, IUndo, NodeValue, NodeArgsMap, INodeResult, NodeType, INodeLink, GetNodeValue, AddKey, Container, ISchemaBuilder, FilteredKeys, ArgContainer, ExtractNodeValue, ExtractNodeSetValue, INodeAccessor, ICountainer } from "./interfaces/INode";
export declare class NodeResult<T, TMultiple extends boolean = false> implements INodeResult<T, TMultiple> {
    value: GetNodeValue<T, TMultiple>;
    isMultiple: boolean;
    constructor(value: GetNodeValue<T, TMultiple>, isMultiple: boolean);
}
export declare class NodeLink<T> implements INodeLink<T> {
    value: T;
    isMultiple: boolean;
    constructor(value: T, isMultiple: boolean);
}
export declare class NodeAccessor<TRoot, TNode extends INode<TRoot, any, any, any, any>> implements INodeAccessor<TRoot, TNode> {
    private _node;
    private _args?;
    constructor(node: TNode, args?: NodeArgsMap<TRoot>);
    get(state: TRoot): ExtractNodeValue<TNode>;
    set(state: TRoot, value: NodeValue<ExtractNodeSetValue<TNode>>): IUndo<TRoot, TNode>;
    in(node: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>> | ICountainer<INode<TRoot, any, any, any, any>>, strict: boolean): boolean;
    readonly node: TNode;
    readonly args: Map<INode<TRoot, any, any, any, any>, any> | undefined;
}
export declare class Undo<TRoot, TNode extends INode<TRoot, any, any, any, any>> extends NodeAccessor<TRoot, TNode> implements IUndo<TRoot, TNode> {
    value: ExtractNodeValue<TNode>;
    constructor(node: TNode, value: ExtractNodeValue<TNode>, args?: NodeArgsMap<TRoot>);
}
export declare class Node<TRoot, TModel, TValue, TParent extends INode<TRoot, any, TModel, any, any>, TMultiple extends boolean = false> implements INode<TRoot, TModel, TValue, TParent, TMultiple> {
    name?: string | number | symbol;
    defaultValue?: () => TValue;
    type: NodeType;
    parent?: TParent;
    root: INode<TRoot, any, any, any, any>;
    chain: INode<TRoot, any, any, any, any>[];
    constructor(parent?: TParent, name?: string | number | symbol, defaultValue?: () => TValue, type?: NodeType);
    getFromMultiple(objects: TModel[], args?: NodeArgsMap<TRoot>): (TValue | undefined)[];
    getFromLink(link: INodeLink<TModel>, args: NodeArgsMap<TRoot> | undefined): any;
    getFromNode<TR = TRoot>(object: TR, from: INode<TRoot, TR, any, any>, args?: NodeArgsMap<TRoot>): any;
    get(object: TRoot, args?: NodeArgsMap<TRoot>): GetNodeValue<TValue, TMultiple>;
    setToNode<TR = TRoot>(object: TR, value: NodeValue<TValue>, to: INode<TRoot, TR, any, any>, args?: NodeArgsMap<TRoot>): IUndo<TRoot, this>;
    set(object: TRoot, value: NodeValue<TValue>, args?: NodeArgsMap<TRoot>): IUndo<TRoot, this>;
    in(change: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>> | ICountainer<INode<TRoot, any, any, any, any>>, strict: boolean, args?: NodeArgsMap<TRoot>): boolean;
    readonly node: any;
    readonly args: undefined;
    private setTo;
    private getFrom;
    private getNames;
    private baseGetArray;
    private mutateObject;
    private getProperty;
}
export declare class SchemaBuilder<TRoot extends object | any[] | Map<any, any>, TParent extends object | Array<TModel> | Map<any, TModel>, TModel extends object | Array<any> | Map<any, any>, TSchema, TNode extends INode<TRoot, any, TParent, any, any> = INode<TRoot, TRoot, TParent, never, any>> {
    schema: TSchema;
    constructor(schema?: TSchema);
    field<TValue extends TModel[TKey], TKey extends FilteredKeys<TModel, string | number | boolean>>(key: TKey, defaultValue?: () => TValue): ISchemaBuilder<TRoot, TParent, Exclude<TModel, TKey>, AddKey<TSchema, TKey, Container<TRoot, TParent, TModel, TNode, TValue>>, TNode>;
    node<TValue extends Extract<TModel[TKey], object>, TKey extends FilteredKeys<TModel, object>, TScope = {}>(key: TKey, builder?: (builder: ISchemaBuilder<TRoot, TModel, TValue, {}, INode<TRoot, TParent, TModel, TNode>>) => ISchemaBuilder<TRoot, TModel, TValue, TScope, INode<TRoot, TParent, TModel, TNode>>, defaultValue?: () => TValue): ISchemaBuilder<TRoot, TParent, Exclude<TModel, TKey>, AddKey<TSchema, TKey, TScope & Container<TRoot, TParent, TModel, TNode, TValue>>, TNode>;
    array<TValue extends TModel[TKey] extends Array<infer P> ? P : never, TKey extends FilteredKeys<TModel, Array<any>>, TScope = {}>(key: TKey, builder?: (builder: ISchemaBuilder<TRoot, Array<TValue>, TValue, {}, INode<TRoot, TModel, Array<TValue>, INode<TRoot, TParent, TModel, TNode>>>) => ISchemaBuilder<TRoot, Array<TValue>, TValue, TScope, INode<TRoot, TModel, Array<TValue>, INode<TRoot, TParent, TModel, TNode>>>, defaultValue?: () => TModel[TKey]): ISchemaBuilder<TRoot, TParent, Exclude<TModel, TKey>, AddKey<TSchema, TKey, ArgContainer<TRoot, TParent, TModel, TNode, number, TValue[], TValue, TScope>>, TNode>;
    map<TMapKey extends TModel[TKey] extends Map<infer P, any> ? P : never, TValue extends TModel[TKey] extends Map<any, infer P> ? P : never, TKey extends Exclude<FilteredKeys<TModel, Map<any, any>>, keyof TSchema>, TScope = {}>(key: TKey, builder?: (builder: ISchemaBuilder<TRoot, Map<TMapKey, TValue>, TValue, {}, INode<TRoot, TModel, Map<TMapKey, TValue>, INode<TRoot, TParent, TModel, TNode>>>) => ISchemaBuilder<TRoot, Map<TMapKey, TValue>, TValue, TScope, INode<TRoot, TModel, Map<TMapKey, TValue>, INode<TRoot, TParent, TModel, TNode>>>, defaultValue?: () => TModel[TKey]): ISchemaBuilder<TRoot, TParent, Exclude<TModel, TKey>, AddKey<TSchema, TKey, ArgContainer<TRoot, TParent, TModel, TNode, TMapKey, Map<TMapKey, TValue>, TValue, TScope>>, TNode>;
    private createChange;
    private logError;
}
export declare function isCountainer<T>(object: any): object is ICountainer<T>;
export declare function buildSchema<TBase extends object | any[] | Map<any, any>>(): SchemaBuilder<TBase, never, TBase, {}, never>;
export declare function isMap<TKey, TValue>(object: any): object is Map<TKey, TValue>;
export declare function isNode<TNode extends INode<any, any, any, any, any>>(object: any): object is TNode;
export declare function isNodeAccessor<TRoot, TNode extends INode<TRoot, any, any, any, any>>(object: any): object is NodeAccessor<TRoot, TNode> | INodeAccessor<TRoot, TNode>;

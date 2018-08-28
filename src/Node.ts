import {
    INode,
    IUndo,
    NodeValue,
    NodeArgsMap,
    NodeArg,
    INodeResult,
    PathNode,
    NodeType,
    INodeLink,
    GetNodeValue,
    AddKey,
    Container,
    ISchemaBuilder,
    FilteredKeys,
    ArgContainer,
    ExtractNodeValue,
    ExtractNodeSetValue,
    INodeAccessor,
    ICountainer
} from "./interfaces/INode";
export class NodeResult<T, TMultiple extends boolean = false>
    implements INodeResult<T, TMultiple>{
    value: GetNodeValue<T, TMultiple>;
    isMultiple: boolean;
    constructor(value: GetNodeValue<T, TMultiple>, isMultiple: boolean) {
        this.value = value;
        this.isMultiple = isMultiple;
    }
}
export class NodeLink<T> implements INodeLink<T> {
    value: T;
    isMultiple: boolean;
    constructor(value: T, isMultiple: boolean) {
        this.value = value;
        this.isMultiple = isMultiple;
    }
}
export class NodeAccessor<TRoot, TNode extends INode<TRoot, any, any, any, any>>
    implements INodeAccessor<TRoot, TNode>  {
    private _node: TNode;
    private _args?: NodeArgsMap<TRoot>;
    constructor(node: TNode, args?: NodeArgsMap<TRoot>) {
        this._node = node;
        this._args = args;
    }
    get(state: TRoot): ExtractNodeValue<TNode> {
        return this._node.get(state, this._args);
    }
    set(state: TRoot, value: NodeValue<ExtractNodeSetValue<TNode>>) {
        return this._node.set(state, value, this._args);
    }
    in(
        node: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>> | ICountainer<INode<TRoot, any, any, any, any>>,
        strict: boolean
    ): boolean {
        return this._node.in(node, strict, this._args);
    }
    get node() {
        return this._node;
    }
    get args() {
        return this._args;
    }
}
export class Undo<
    TRoot,
    TNode extends INode<TRoot, any, any, any, any>
    >
    extends NodeAccessor<TRoot, TNode>
    implements IUndo<TRoot, TNode> {
    value: ExtractNodeValue<TNode>;
    constructor(
        node: TNode,
        value: ExtractNodeValue<TNode>,
        args?: NodeArgsMap<TRoot>
    ) {
        super(node, args);
        this.value = value;
    }
}
export class Node<
    TRoot,
    TModel,
    TValue,
    TParent extends INode<TRoot, any, TModel, any, any>,
    TMultiple extends boolean = false
    >
    implements INode<TRoot, TModel, TValue, TParent, TMultiple>
{
    name?: string | number | symbol;
    defaultValue?: () => TValue;
    type: NodeType;
    root: INode<TRoot, any, any, any, any>;
    chain: INode<TRoot, any, any, any, any>[];
    parent?: TParent;
    constructor(
        parent?: TParent,
        name?: string | number | symbol,
        defaultValue?: () => TValue,
        type: NodeType = NodeType.node
    ) {
        this.name = name;
        this.type = type;
        this.parent = parent;
        this.defaultValue = defaultValue;
        if (parent) {
            this.root = parent.root;
            this.chain = [...parent.chain, this];
        } else {
            this.root = this as any;
            this.chain = [this];
        }
    }
    getFromMultiple(
        objects: TModel[],
        args?: NodeArgsMap<TRoot>
    ) {
        let result: (TValue | undefined)[];
        const names = this.getNames(args);
        if (Array.isArray(names)) {
            result = new Array(names.length * objects.length);
            let ir = 0;
            for (let io = 0; io < objects.length; io++) {
                for (let ina = 0; ina < names.length; ina++) {
                    result[ir++] = this.getProperty(objects[io], names[ina]);
                }
            }
        } else {
            result = new Array(objects.length);
            for (let io = 0; io < objects.length; io++) {
                result[io] = this.getProperty(objects[io], names);
            }
        }
        return result;
    }
    getFromLink(
        link: INodeLink<TModel>,
        args: NodeArgsMap<TRoot> | undefined
    ) {
        const names = this.getNames(args);
        if (Array.isArray(names)) {
            link.isMultiple = true;
            return this.baseGetArray(link.value, names);
        } else {
            return this.getProperty(link.value, names);
        }
    }
    getFromNode<TR = TRoot>(
        object: TR,
        from: INode<TRoot, TR, any, any>,
        args?: NodeArgsMap<TRoot>
    ) {
        return this.getFrom(object, from.chain.length - 1, args);
    }
    get(
        object: TRoot,
        args?: NodeArgsMap<TRoot>
    ): GetNodeValue<TValue, TMultiple> {
        return this.getFrom(object, 0, args);
    }
    setToNode<TR = TRoot>(
        object: TR,
        value: NodeValue<TValue>,
        to: INode<TRoot, TR, any, any>,
        args?: NodeArgsMap<TRoot>
    ): IUndo<TRoot, this> {
        return this.setTo(object, value, to.chain.length - 1, args);
    }
    set(
        object: TRoot,
        value: NodeValue<TValue>,
        args?: NodeArgsMap<TRoot>
    ): IUndo<TRoot, this> {
        return this.setTo(object, value, 0, args);
    }
    in(
        change: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>> | ICountainer<INode<TRoot, any, any, any, any>>,
        strict: boolean,
        args?: NodeArgsMap<TRoot>
    ): boolean {
        let changeNode: INode<TRoot, any, any, any, any>;
        let changeArgs: NodeArgsMap<TRoot> | undefined;
        if (isCountainer<INode<TRoot, any, any, any, any>>(change)) {
            changeNode = change[PathNode];
        } else {
            changeNode = change.node;
            changeArgs = change.args;
            if (changeArgs !== undefined && changeArgs.size === 0) {
                changeArgs = undefined;
            }
        }
        if (args !== undefined && args.size === 0) {
            args = undefined;
        }

        if (this === changeNode as any) {
            if (changeArgs === undefined || args === undefined) {
                return true;
            }
            for (let arg of changeArgs) {
                let compare = args.get(arg["0"]);
                if (Array.isArray(arg["1"])) {
                    if (Array.isArray(compare)) {
                        if (arg["1"].some(e => compare.indexOf(e) < 0)) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else {
                    if (Array.isArray(compare)) {
                        if (compare.indexOf(arg["1"]) < 0) {
                            return false;
                        }
                    } else if (arg["1"] !== compare) {
                        return false;
                    }
                }
            }
            return true;
        }
        if (
            strict
            || this.chain.length < changeNode.chain.length
            || this.chain[changeNode.chain.length - 1] !== changeNode
        ) {
            return false;
        }
        if (changeArgs === undefined || args === undefined) {
            return true;
        }
        for (let arg of changeArgs) {
            let compare = args.get(arg["0"]);
            if (Array.isArray(arg["1"])) {
                if (Array.isArray(compare)) {
                    if (!arg["1"].some(e => compare.indexOf(e) >= 0)) {
                        return false;
                    }
                } else if (arg["1"].indexOf(compare) < 0) {
                    return false;
                }
            } else {
                if (Array.isArray(compare)) {
                    if (compare.indexOf(arg["1"]) < 0) {
                        return false;
                    }
                } else if (arg["1"] !== compare) {
                    return false;
                }
            }
        }
        return true;
    }
    get node() {
        return this as any;
    }
    get args() {
        return undefined;
    }
    private setTo<TR = TRoot>(
        object: TR,
        value: NodeValue<TValue>,
        to: number,
        args?: NodeArgsMap<TRoot>
    ): IUndo<TRoot, this> {
        let link = new NodeLink(object as any, false);
        if (this.chain.length > 1) {
            const length = this.chain.length - 1;
            for (let i = to; i < length; i++) {
                if (link.isMultiple) {
                    link.value = this.chain[i].getFromMultiple(link.value, args);
                } else {
                    link.value = this.chain[i].getFromLink(link, args);
                }
            }
        }
        let prevValues: TValue | (TValue | undefined)[] | undefined;
        const names = this.getNames(args);
        if (link.isMultiple) {
            if (Array.isArray(names)) {
                prevValues = new Array(names.length * link.value.length);
                let ir = 0;
                for (let ina = 0; ina < names.length; ina++) {
                    for (let io = 0; io < link.value.length; io++) {
                        prevValues[ir++] = this.mutateObject(link.value[io], names[ina], value);
                    }
                }
            } else {
                prevValues = new Array(link.value.length);
                for (let io = 0; io < link.value.length; io++) {
                    prevValues[io] = this.mutateObject(link.value[io], names, value);
                }
            }
        } else {
            if (Array.isArray(names)) {
                prevValues = new Array(names.length);
                for (let ina = 0; ina < names.length; ina++) {
                    prevValues[ina] = this.mutateObject(link.value, names[ina], value);
                }
            } else {
                prevValues = this.mutateObject(link.value, names, value);
            }
        }
        return new Undo(
            this,
            prevValues as ExtractNodeValue<this>,
            args
        );
    }
    private getFrom<TR = TRoot>(
        object: TR,
        from: number,
        args?: NodeArgsMap<TRoot>
    ) {
        if (this.chain.length > 1) {
            let link = new NodeLink<TModel | TModel[]>(object as any, false);
            for (let i = from; i < this.chain.length; i++) {
                if (link.isMultiple) {
                    link.value = this.chain[i].getFromMultiple(link.value as TModel[], args);
                } else {
                    link.value = this.chain[i].getFromLink(link, args);
                }
            }
            return link.value;
        }
        const names = this.getNames(args);
        if (Array.isArray(names)) {
            return this.baseGetArray(object as any as TModel, names);
        }
        return this.getProperty(object as any as TModel, names);
    }
    private getNames(
        args?: NodeArgsMap<TRoot>
    ) {
        if (this.name !== undefined) {
            return this.name;
        }
        const arg = args !== undefined ? args.get(this) : undefined;
        return arg;
    }
    private baseGetArray(object: TModel, names: any[]) {
        const result: (TValue | undefined)[] = new Array(names.length);
        for (let i = 0; i < names.length; i++) {
            result[i] = this.getProperty(object, names[i]);
        }
        return result;
    }
    private mutateObject(
        object: TModel,
        name,
        value: NodeValue<TValue>
    ) {
        let prev: TValue | undefined;
        switch (this.parent ? this.parent.type : NodeType.node) {
            case NodeType.map:
                if (isMap<any, TValue>(object)) {
                    prev = object.get(name);
                    const newValue = typeof value === "function"
                        ? value(prev)
                        : value;
                    if (newValue === null) {
                        object.delete(name);
                    } else {
                        object.set(name, newValue);
                    }
                } else {
                    this.logErrorType(name);
                }
                break;
            case NodeType.array:
                if (Array.isArray(object)) {
                    prev = object[name];
                    const newValue = typeof value === "function"
                        ? value(prev)
                        : value;
                    if (newValue === null) {
                        object.splice(name, 1);
                    } else {
                        object[name] = newValue;
                    }
                } else {
                    this.logErrorType(name);
                }
                break;
            default:
                prev = object[name];
                const newValue = typeof value === "function"
                    ? value(prev)
                    : value;
                if (newValue === null) {
                    delete object[name];
                } else {
                    object[name] = newValue;
                }
                break;
        }
        return prev;
    }
    private getProperty(
        object: TModel,
        key
    ): TValue | undefined {
        switch (this.parent ? this.parent.type : NodeType.node) {
            case NodeType.map:
                if (isMap<any, TValue>(object)) {
                    return object.get(key);
                } else {
                    this.logErrorType(key);
                }
                break;
            default:
                if (this.defaultValue !== undefined && object[key] === undefined) {
                    object[key] = this.defaultValue();
                }
                return object[key];
        }
        return undefined;
    }
    private logErrorType(key) {
        console.groupCollapsed("Trying to get or set value from non Map / array object.");
        console.error("Key: ", key);
        console.error("Node: ", this);
        console.groupEnd();
    }
}

export class SchemaBuilder<
    TRoot extends object | any[] | Map<any, any>,
    TParent extends object | Array<TModel> | Map<any, TModel>,
    TModel extends object | Array<any> | Map<any, any>,
    TSchema,
    TNode extends INode<TRoot, any, TParent, any, any> = INode<TRoot, TRoot, TParent, never, any>>
    /*implements ISchemaBuilder<TRoot, TParent, TModel, TSchema, TNode>*/ {
    schema: TSchema;
    constructor(schema: TSchema = {} as any) {
        this.schema = schema;
    }
    field<
        TValue extends TModel[TKey],
        TKey extends FilteredKeys<TModel, string | number | boolean>
        >(key: TKey, defaultValue?: () => TValue): ISchemaBuilder<
        TRoot,
        TParent,
        Exclude<TModel, TKey>,
        AddKey<TSchema, TKey, Container<TRoot, TParent, TModel, TNode, TValue>>,
        TNode> {
        if (this.schema[key as any] !== undefined) {
            this.logError(key);
            return this as any;
        }
        this.schema[key as any] = {
            [PathNode]: new Node(this.schema[PathNode], key, defaultValue, NodeType.field)
        };
        return this as any;
    }
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
        TNode> {
        if (this.schema[key as any] !== undefined) {
            this.logError(key);
            return this as any;
        }
        const schema = {
            [PathNode]: new Node(this.schema[PathNode], key, defaultValue, NodeType.node)
        };
        this.schema[key as any] = schema;
        if (builder) {
            builder(new SchemaBuilder(schema) as any);
        }
        return this as any;
    }
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
        TNode> {
        if (this.schema[key as any] !== undefined) {
            this.logError(key);
            return this as any;
        }
        const path = new Node(this.schema[PathNode], key, defaultValue, NodeType.array);
        const schema = {
            [PathNode]: new Node(path, undefined, undefined, NodeType.node)
        };
        this.schema[key as any] = (id, next) => this.createChange(schema, id, next);
        this.schema[key as any][PathNode] = path;
        if (builder) {
            builder(new SchemaBuilder(schema) as any);
        }
        return this as any;
    }
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
        > {
        if (this.schema[key as any] !== undefined) {
            this.logError(key);
            return this as any;
        }
        const path = new Node(this.schema[PathNode], key, defaultValue, NodeType.map);
        const schema = {
            [PathNode]: new Node(path, undefined, undefined, NodeType.node)
        };
        this.schema[key as any] = (id, next) => this.createChange(schema, id, next);
        this.schema[key as any][PathNode] = path;
        if (builder) {
            builder(new SchemaBuilder(schema) as any);
        }
        return this as any;
    }
    private createChange(schema, id?: NodeArg, next?: (node) => ICountainer<INode<TRoot, any, any, any, any>> | INodeAccessor<TRoot, any>) {
        let change: INodeAccessor<TRoot, any>;
        if (next !== undefined) {
            const n = next(schema);
            if (isNodeAccessor<TRoot, any>(n)) {
                change = n;
            } else {
                if (n !== undefined) {
                    change = new NodeAccessor(n[PathNode], new Map());
                } else {
                    change = new NodeAccessor(schema[PathNode], new Map());
                }
            }
        } else {
            change = new NodeAccessor(schema[PathNode], new Map());
        }
        if (id !== undefined) {
            (change.args as Map<any, any>).set(schema[PathNode], id);
        }
        return change;
    }
    private logError(key) {
        console.groupCollapsed("Trying to add node with same key.");
        console.error("Key: ", key);
        console.error("Schema: ", this.schema);
        console.error("Builder: ", this);
        console.groupEnd();
    }
}

export function isCountainer<T>(object): object is ICountainer<T> {
    return object[PathNode] !== undefined;
}

export function buildSchema<TBase extends object | any[] | Map<any, any>>() {
    return new SchemaBuilder<TBase, never, TBase, {}, never>();
}

export function isMap<TKey, TValue>(object): object is Map<TKey, TValue> {
    return object instanceof Map;
}

export function isNode<
    TNode extends INode<any, any, any, any, any>
    >(object): object is TNode {
    return object instanceof Node;
}
export function isNodeAccessor<TRoot, TNode extends INode<TRoot, any, any, any, any>>(object): object is NodeAccessor<TRoot, TNode> | INodeAccessor<TRoot, TNode> {
    return object instanceof NodeAccessor;
}


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const INode_1 = require("./interfaces/INode");
class NodeResult {
    constructor(value, isMultiple) {
        this.value = value;
        this.isMultiple = isMultiple;
    }
}
exports.NodeResult = NodeResult;
class NodeLink {
    constructor(value, isMultiple) {
        this.value = value;
        this.isMultiple = isMultiple;
    }
}
exports.NodeLink = NodeLink;
class NodeAccessor {
    constructor(node, args) {
        this._node = node;
        this._args = args;
    }
    get(state) {
        return this._node.get(state, this._args);
    }
    set(state, value) {
        return this._node.set(state, value, this._args);
    }
    in(node, strict) {
        return this._node.in(node, strict, this._args);
    }
    get node() {
        return this._node;
    }
    get args() {
        return this._args;
    }
}
exports.NodeAccessor = NodeAccessor;
class Undo extends NodeAccessor {
    constructor(node, value, args) {
        super(node, args);
        this.value = value;
    }
}
exports.Undo = Undo;
class Node {
    constructor(parent, name, defaultValue, type = INode_1.NodeType.node) {
        this.name = name;
        this.type = type;
        this.parent = parent;
        this.defaultValue = defaultValue;
        if (parent) {
            this.root = parent.root;
            this.chain = [...parent.chain, this];
        }
        else {
            this.root = this;
            this.chain = [this];
        }
    }
    // join<TV extends keyof TValue, T extends TValue[TV]>(
    //     name?: TV,
    //     type: NodeType = NodeType.node
    // ): TValue extends object | Array<T> | Map<any, T>
    //     ? INode<TRoot, TValue, T, this, TMultiple>
    //     : INode<TRoot, any, T, any, TMultiple> {
    //     return new Node(this as any, name, type) as any;
    // }
    getFromMultiple(objects, args) {
        let result;
        const names = this.getNames(args);
        if (Array.isArray(names)) {
            result = new Array(names.length * objects.length);
            let ir = 0;
            for (let io = 0; io < objects.length; io++) {
                for (let ina = 0; ina < names.length; ina++) {
                    result[ir++] = this.getProperty(objects[io], names[ina]);
                }
            }
        }
        else {
            result = new Array(objects.length);
            for (let io = 0; io < objects.length; io++) {
                result[io] = this.getProperty(objects[io], names);
            }
        }
        return result;
    }
    getFromLink(link, args) {
        const names = this.getNames(args);
        if (Array.isArray(names)) {
            link.isMultiple = true;
            return this.baseGetArray(link.value, names);
        }
        else {
            return this.getProperty(link.value, names);
        }
    }
    getFromNode(object, from, args) {
        return this.getFrom(object, from.chain.length - 1, args);
    }
    get(object, args) {
        return this.getFrom(object, 0, args);
    }
    setToNode(object, value, to, args) {
        return this.setTo(object, value, to.chain.length - 1, args);
    }
    set(object, value, args) {
        return this.setTo(object, value, 0, args);
    }
    in(change, strict, args) {
        let changeNode;
        let changeArgs;
        if (isCountainer(change)) {
            changeNode = change[INode_1.PathNode];
        }
        else {
            changeNode = change.node;
            changeArgs = change.args;
            if (changeArgs !== undefined && changeArgs.size === 0) {
                changeArgs = undefined;
            }
        }
        if (args !== undefined && args.size === 0) {
            args = undefined;
        }
        if (this === changeNode) {
            if (changeArgs === undefined || args === undefined) {
                return true;
            }
            for (let arg of args) {
                if (arg["1"] !== changeArgs.get(arg["0"])) {
                    return false;
                }
            }
            return true;
        }
        if (strict
            || this.chain.length < changeNode.chain.length
            || this.chain[changeNode.chain.length - 1] !== changeNode) {
            return false;
        }
        if (changeArgs === undefined || args === undefined) {
            return true;
        }
        for (let arg of args) {
            if (arg["1"] !== changeArgs.get(arg["0"])) {
                return false;
            }
        }
        return true;
    }
    get node() {
        return this;
    }
    get args() {
        return undefined;
    }
    setTo(object, value, to, args) {
        let link = new NodeLink(object, false);
        if (this.chain.length > 1) {
            const length = this.chain.length - 1;
            for (let i = to; i < length; i++) {
                if (link.isMultiple) {
                    link.value = this.chain[i].getFromMultiple(link.value, args);
                }
                else {
                    link.value = this.chain[i].getFromLink(link, args);
                }
            }
        }
        let prevValues;
        const names = this.getNames(args);
        if (link.isMultiple) {
            if (Array.isArray(names)) {
                prevValues = new Array(names.length * link.value.length);
                let ir = 0;
                for (let ina = 0; ina < names.length; ina++) {
                    for (let io = 0; io < link.value.length; io++) {
                        prevValues[ir++] = this.mutateObject(link.value[io], names[ina], value);
                        // this.mutateObject(link.value[io], names[ina], value)
                    }
                }
            }
            else {
                prevValues = new Array(link.value.length);
                for (let io = 0; io < link.value.length; io++) {
                    prevValues[io] = this.mutateObject(link.value[io], names, value);
                    // this.mutateObject(link.value[io], names, value);
                }
            }
        }
        else {
            if (Array.isArray(names)) {
                prevValues = new Array(names.length);
                for (let ina = 0; ina < names.length; ina++) {
                    prevValues[ina] = this.mutateObject(link.value, names[ina], value);
                    // this.mutateObject(link.value, names[ina], value)
                }
            }
            else {
                prevValues = this.mutateObject(link.value, names, value);
                // this.mutateObject(link.value, names, value);
            }
        }
        return new Undo(this, prevValues, args);
    }
    getFrom(object, from, args) {
        if (this.chain.length > 1) {
            let link = new NodeLink(object, false);
            for (let i = from; i < this.chain.length; i++) {
                if (link.isMultiple) {
                    link.value = this.chain[i].getFromMultiple(link.value, args);
                }
                else {
                    link.value = this.chain[i].getFromLink(link, args);
                }
            }
            return link.value;
        }
        const names = this.getNames(args);
        if (Array.isArray(names)) {
            return this.baseGetArray(object, names);
        }
        return this.getProperty(object, names);
    }
    getNames(args) {
        if (this.name !== undefined) {
            return this.name;
        }
        const arg = args !== undefined ? args.get(this) : undefined;
        return arg;
    }
    baseGetArray(object, names) {
        const result = new Array(names.length);
        for (let i = 0; i < names.length; i++) {
            result[i] = this.getProperty(object, names[i]);
        }
        return result;
    }
    mutateObject(object, name, value) {
        let prev;
        switch (this.parent ? this.parent.type : INode_1.NodeType.node) {
            case INode_1.NodeType.map:
                if (isMap(object)) {
                    prev = object.get(name);
                    const newValue = typeof value === "function"
                        ? value(prev)
                        : value;
                    if (newValue === null) {
                        object.delete(name);
                    }
                    else {
                        object.set(name, newValue);
                    }
                }
                break;
            case INode_1.NodeType.array:
                if (Array.isArray(object)) {
                    prev = object[name];
                    const newValue = typeof value === "function"
                        ? value(prev)
                        : value;
                    if (newValue === null) {
                        object.splice(name, 1);
                    }
                    else {
                        object[name] = newValue;
                    }
                }
                break;
            default:
                prev = object[name];
                const newValue = typeof value === "function"
                    ? value(prev)
                    : value;
                if (newValue === null) {
                    delete object[name];
                }
                else {
                    object[name] = newValue;
                }
                break;
        }
        return prev;
    }
    getProperty(object, key) {
        switch (this.parent ? this.parent.type : INode_1.NodeType.node) {
            case INode_1.NodeType.map:
                if (isMap(object)) {
                    return object.get(key);
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
}
exports.Node = Node;
class SchemaBuilder {
    constructor(schema = {}) {
        this.schema = schema;
    }
    field(key, defaultValue) {
        if (this.schema[key] !== undefined) {
            this.logError(key);
            return this;
        }
        this.schema[key] = {
            [INode_1.PathNode]: new Node(this.schema[INode_1.PathNode], key, defaultValue, INode_1.NodeType.field)
        };
        return this;
    }
    node(key, builder, defaultValue) {
        if (this.schema[key] !== undefined) {
            this.logError(key);
            return this;
        }
        const schema = {
            [INode_1.PathNode]: new Node(this.schema[INode_1.PathNode], key, defaultValue, INode_1.NodeType.node)
        };
        this.schema[key] = schema;
        if (builder) {
            builder(new SchemaBuilder(schema));
        }
        return this;
    }
    array(key, builder, defaultValue) {
        if (this.schema[key] !== undefined) {
            this.logError(key);
            return this;
        }
        const path = new Node(this.schema[INode_1.PathNode], key, defaultValue, INode_1.NodeType.array);
        const schema = {
            [INode_1.PathNode]: new Node(path, undefined, undefined, INode_1.NodeType.node)
        };
        this.schema[key] = (id, next) => this.createChange(schema, id, next);
        this.schema[key][INode_1.PathNode] = path;
        if (builder) {
            builder(new SchemaBuilder(schema));
        }
        return this;
    }
    map(key, builder, defaultValue) {
        if (this.schema[key] !== undefined) {
            this.logError(key);
            return this;
        }
        const path = new Node(this.schema[INode_1.PathNode], key, defaultValue, INode_1.NodeType.map);
        const schema = {
            [INode_1.PathNode]: new Node(path, undefined, undefined, INode_1.NodeType.node)
        };
        this.schema[key] = (id, next) => this.createChange(schema, id, next);
        this.schema[key][INode_1.PathNode] = path;
        if (builder) {
            builder(new SchemaBuilder(schema));
        }
        return this;
    }
    createChange(schema, id, next) {
        let change;
        if (next !== undefined) {
            const n = next(schema);
            if (isNodeAccessor(n)) {
                change = n;
            }
            else {
                if (n !== undefined) {
                    change = new NodeAccessor(n[INode_1.PathNode], new Map());
                }
                else {
                    change = new NodeAccessor(schema[INode_1.PathNode], new Map());
                }
            }
        }
        else {
            change = new NodeAccessor(schema[INode_1.PathNode], new Map());
        }
        if (id !== undefined) {
            change.args.set(schema[INode_1.PathNode], id);
        }
        return change;
    }
    logError(key) {
        console.groupCollapsed("Trying to add node with same key.");
        console.error("Key: ", key);
        console.error("Schema: ", this.schema);
        console.error("Builder: ", this);
        console.groupEnd();
    }
}
exports.SchemaBuilder = SchemaBuilder;
function isCountainer(object) {
    return object[INode_1.PathNode] !== undefined;
}
exports.isCountainer = isCountainer;
function buildSchema() {
    return new SchemaBuilder();
}
exports.buildSchema = buildSchema;
function isMap(object) {
    return object instanceof Map;
}
exports.isMap = isMap;
function isNode(object) {
    return object instanceof Node;
}
exports.isNode = isNode;
function isNodeAccessor(object) {
    return object instanceof NodeAccessor;
}
exports.isNodeAccessor = isNodeAccessor;
//# sourceMappingURL=Node.js.map
import { IGetNode, INode, NodeType } from "./interfaces/INode";
import { INodeResult } from "./interfaces/INodeResult";
import { IStore } from "./interfaces/IStore";
import { Node } from "./Node";

export class GetNode<TModel, TValue>
    extends Node
    implements IGetNode<TModel, TValue> {
    defaultValue?: () => TValue;
    parent?: IGetNode<any, TModel>;
    constructor(
        type: NodeType = NodeType.node,
        name?: string,
        parent?: IGetNode<any, TModel>,
        defaultValue?: () => TValue
    ) {
        super(type, name, parent);
        this.defaultValue = defaultValue;
    }
    get(
        store: IStore,
        value: INodeResult<TModel>,
        args?: Map<INode, any>
    ) {
        if (this.parent !== undefined) {
            this.parent.get(store, value, args);
        } else {
            value.value = store.getModel(this);
        }
        const object = value.value;
        if (value.isMultiple) {
            value.value = this.getMultipleFrom(object as TModel[], args) as any;
        } else {
            const names = this.getNames(args);
            if (Array.isArray(names)) {
                value.value = new Array(names.length);
                for (const name of names) {
                    value.value.push(this.getProperty(object as TModel, name) as any);
                }
                value.isMultiple = true;
            } else {
                value.value = this.getProperty(object as TModel, names) as any;
            }
        }
    }
    protected logErrorType(key) {
        console.groupCollapsed("Trying to get or set value from non Map / array object.");
        console.error("Key: ", key);
        console.error("Node: ", this);
        console.groupEnd();
    }
    protected getNames(
        args?: Map<INode, any>
    ) {
        if (this.name !== undefined) {
            return this.name;
        }
        const arg = args !== undefined ? args.get(this) : undefined;
        return arg;
    }
    private getMultipleFrom(
        object: TModel[],
        args?: Map<INode, any>
    ) {
        const names = this.getNames(args);
        let result: Array<TValue | undefined>;
        if (Array.isArray(names)) {
            result = new Array(object.length * names.length);
            for (const n of names) {
                for (const o of object) {
                    result.push(this.getProperty(o, n));
                }
            }
        } else {
            result = object.map(o => this.getProperty(o, names));
        }
        return result;
    }
    private getProperty(
        object: TModel | undefined,
        key
    ): TValue | undefined {
        if (object === undefined) {
            return undefined;
        }
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
}
export function isMap<TKey, TValue>(object): object is Map<TKey, TValue> {
    return object instanceof Map;
}

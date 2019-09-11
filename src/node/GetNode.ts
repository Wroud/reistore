import { IGetNode, INode, NodeArgsMap, NodeType } from "../interfaces/node";
import { Node } from "./Node";
import { isMap } from "./tools";

export class GetNode<
    TParent extends INode<any, TRoot>,
    TRoot,
    TModel,
    TValue
    >
    extends Node<TParent, TRoot>
    implements IGetNode<TParent, TRoot, TRoot, TValue> {
    defaultValue?: () => TValue;
    constructor(
        type: NodeType = NodeType.node,
        name?: string | number | symbol,
        parent?: TParent,
        defaultValue?: () => TValue
    ) {
        super(type, name, parent);
        this.defaultValue = defaultValue;
    }
    get(
        object: TRoot,
        args?: NodeArgsMap<TRoot>
    ): TValue | undefined {
        return this.getFrom(object, args);
    }
    getMultiple(
        object: TRoot,
        args?: NodeArgsMap<TRoot>
    ): Array<TValue | undefined> {
        return this.getMultipleFrom(object, args);
    }
    protected logErrorType(key) {
        console.groupCollapsed("Trying to get or set value from non Map / array object.");
        console.error("Key: ", key);
        console.error("Node: ", this);
        console.groupEnd();
    }
    protected getNames(
        args?: NodeArgsMap<TRoot>
    ) {
        if (this.name !== undefined) {
            return this.name;
        }
        const arg = args !== undefined ? args.get(this) : undefined;
        return arg;
    }
    private getFrom(
        object: TRoot,
        args?: NodeArgsMap<TRoot>
    ) {
        let link = object as any as TModel | undefined;
        if (this.parent !== undefined) {
            link = (this.parent as any as IGetNode<any, TRoot, TRoot, TModel>).get(object, args);
        }
        const names = this.getNames(args);
        return this.getProperty(link, names);
    }
    private getMultipleFrom(
        object: TRoot,
        args?: NodeArgsMap<TRoot>
    ) {
        let link: Array<TModel | undefined>;
        link = this.parent !== undefined
            ? (this.parent as any as IGetNode<any, TRoot, TRoot, TModel>).getMultiple(object, args)
            : [object] as any as TModel[];

        const names = this.getNames(args);
        let result: Array<TValue | undefined>;
        if (Array.isArray(names)) {
            result = new Array(link.length * names.length);
            for (const n of names) {
                for (const o of link) {
                    result.push(this.getProperty(o, n));
                }
            }
        } else {
            result = link.map(o => this.getProperty(o, names));
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

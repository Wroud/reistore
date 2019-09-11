import { IGetNode, INode, ISetNode, NodeArgsMap, NodeType, NodeValue } from "../interfaces/node";
import { GetNode } from "./GetNode";
import { NodeUndo } from "./NodeUndo";
import { isMap } from "./tools";

export class SetNode<
    TParent extends INode<any, TRoot>,
    TRoot,
    TModel,
    TValue
    >
    extends GetNode<TParent, TRoot, TModel, TValue>
    implements ISetNode<TParent, TRoot, TRoot, TValue> {
    set(
        state: TRoot,
        value: NodeValue<TValue>,
        args?: NodeArgsMap<TRoot>
    ) {
        const parent = (this.parent as any as IGetNode<any, TRoot, TRoot, TModel>).get(state, args);
        const name = this.getNames(args);
        return new NodeUndo(this, this.mutateObject(parent, name, value), args);
    }
    setMultiple(
        state: TRoot,
        value: NodeValue<TValue>,
        args?: NodeArgsMap<TRoot>
    ) {
        const link = (this.parent as any as IGetNode<any, TRoot, TRoot, TModel>)
            .getMultiple(state, args);

        const names = this.getNames(args);
        let result: Array<TValue | undefined>;
        if (Array.isArray(names)) {
            result = new Array(link.length * names.length);
            for (const n of names) {
                for (const o of link) {
                    result.push(this.mutateObject(o, n, value));
                }
            }
        } else {
            result = link.map(o => this.mutateObject(o, names, value));
        }
        return new NodeUndo(this, result, args);
    }
    private mutateObject(
        object: TModel | undefined,
        name,
        value: NodeValue<TValue>
    ) {
        if (object === undefined) {
            return undefined;
        }
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
}

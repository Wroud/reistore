import { INode, INodeAccessor, isMultiple, NodeArgs, PathNode } from "../interfaces/node";

export class NodeAccessor<
    TNode extends INode<any, TRoot>,
    TRoot,
    TMultiple extends boolean = false
    >
    implements INodeAccessor<TNode, TRoot, TMultiple> {
    [NodeArgs]?: Map<INode<any, TRoot>, any> | undefined;
    [isMultiple]?: TMultiple;
    [PathNode]: TNode;
    in(
        node: INodeAccessor<INode<any, TRoot>, TRoot, any>,
        strict: boolean
    ): boolean {
        let targs = this[NodeArgs];
        const tnode = this[PathNode];
        const changeNode = node[PathNode];
        let changeArgs = node[NodeArgs];
        const isSameNode = tnode.in(changeNode, strict);
        if (!isSameNode) {
            return false;
        }
        if (changeArgs !== undefined && changeArgs.size === 0) {
            changeArgs = undefined;
        }
        if (targs !== undefined && targs.size === 0) {
            targs = undefined;
        }
        if (changeArgs === undefined || targs === undefined) {
            return true;
        }

        for (const arg of changeArgs) {
            const compare = targs.get(arg["0"]);
            if (Array.isArray(arg["1"])) {
                if (strict) {
                    if (Array.isArray(compare)) {
                        if (arg["1"].some(e => compare.indexOf(e) < 0)) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else {
                    if (Array.isArray(compare)) {
                        if (!arg["1"].some(e => compare.indexOf(e) >= 0)) {
                            return false;
                        }
                    } else if (arg["1"].indexOf(compare) < 0) {
                        return false;
                    }
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
}

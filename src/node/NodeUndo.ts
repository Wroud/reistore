import { INode, INodeUndo, ISetNode } from "../interfaces/node";

export class NodeUndo<TNode extends ISetNode<any, TRoot, any, any>, TRoot, TValue>
    implements INodeUndo<TNode, TRoot, TValue> {
    node: TNode;
    value: TValue;
    args?: Map<INode<any, TRoot>, any>;
    constructor(node: TNode, value: TValue, args?: Map<INode<any, TRoot>, any>) {
        this.node = node;
        this.value = value;
        this.args = args;
    }
    in(node: INode<any, TRoot>, strict: boolean): boolean {
        return this.node.in(node, strict);
    }
}

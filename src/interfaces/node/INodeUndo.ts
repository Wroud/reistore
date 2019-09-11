import { INode, ISetNode, NodeArgsMap } from "./INode";

export interface INodeUndo<TNode extends ISetNode<any, any, any>, TValue> {
    node: TNode;
    args?: NodeArgsMap;
    value: TValue;
    in(
        node: INode<any>,
        strict: boolean
    ): boolean;
}

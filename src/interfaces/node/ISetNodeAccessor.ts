import { IGetNodeAccessor } from "./IGetNodeAccessor";
import { ISetNode, NodeValue } from "./INode";
import { MultipleValue } from "./INodeAccessor";
import { INodeUndo } from "./INodeUndo";

export interface ISetNodeAccessor<
    TNode extends ISetNode<any, TSource, TValue>,
    TSource,
    TValue,
    TMultiple extends boolean
    >
    extends IGetNodeAccessor<TNode, TSource, TValue, TMultiple> {

    set(value: NodeValue<TValue>): INodeUndo<TNode, MultipleValue<TValue, TMultiple>>;
}

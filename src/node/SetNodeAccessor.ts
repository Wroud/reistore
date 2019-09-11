import {
    INodeUndo,
    ISetNode,
    ISetNodeAccessor,
    isMultiple,
    MultipleValue,
    NodeArgs,
    NodeValue,
    PathNode
} from "../interfaces/node";
import { GetNodeAccessor } from "./GetNodeAccessor";

export class SetNodeAccessor<
    TNode extends ISetNode<any, TRoot, TSource, TValue>,
    TRoot,
    TSource,
    TValue,
    TMultiple extends boolean = false
    >
    extends GetNodeAccessor<TNode, TRoot, TSource, TValue, TMultiple>
    implements ISetNodeAccessor<TNode, TRoot, TSource, TValue, TMultiple> {
    set(
        state: TSource,
        value: NodeValue<TValue>
    ): INodeUndo<TNode, TRoot, MultipleValue<TValue, TMultiple>> {
        return this[isMultiple]
            ? this[PathNode].setMultiple(state, value, this[NodeArgs])
            : this[PathNode].set(state, value, this[NodeArgs]) as any;
    }
}

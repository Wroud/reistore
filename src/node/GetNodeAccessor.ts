import {
    IGetNode,
    IGetNodeAccessor,
    isMultiple,
    MultipleValue,
    NodeArgs,
    PathNode
} from "interfaces/node";
import { NodeAccessor } from "./NodeAccessor";

export class GetNodeAccessor<
    TNode extends IGetNode<any, TRoot, TSource, TValue>,
    TRoot,
    TSource,
    TValue,
    TMultiple extends boolean = false
    >
    extends NodeAccessor<TNode, TRoot, TMultiple>
    implements IGetNodeAccessor<TNode, TRoot, TSource, TValue, TMultiple> {
    get(object: TSource): MultipleValue<TValue | undefined, TMultiple> {
        return this[isMultiple]
            ? this[PathNode].getMultiple(object, this[NodeArgs])
            : this[PathNode].get(object, this[NodeArgs]) as any;
    }
}

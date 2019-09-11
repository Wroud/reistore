import { IGetNode } from "./INode";
import { INodeAccessor, MultipleValue } from "./INodeAccessor";

export interface IGetNodeAccessor<
    TNode extends IGetNode<any, TSource, TValue>,
    TSource,
    TValue,
    TMultiple extends boolean
    >
    extends INodeAccessor<TNode, TMultiple> {

    get(): MultipleValue<TValue | undefined, TMultiple>;
}

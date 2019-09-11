import { ICountainer } from "./ICountainer";
import { INode, NodeArgsMap } from "./INode";

export const NodeArgs = Symbol("@@args");
export const isMultiple = Symbol("@@args");

export type MultipleValue<TValue, TMultiple extends boolean> = TMultiple extends true ? TValue[] : TValue;
export interface INodeAccessor<
    TNode extends INode<any>,
    TMultiple extends boolean
    >
    extends ICountainer<TNode> {
    [NodeArgs]?: NodeArgsMap;
    [isMultiple]?: TMultiple;
    in(
        node: INodeAccessor<INode<any>, any>,
        strict: boolean
    ): boolean;
}

import { INode, NodeArgsMap, NodeValue } from "./INode";
import { MultipleValue } from "./INodeAccessor";

export interface IValueNode<
    TParent extends INode<any>,
    TRoot,
    TValue,
    TMultiple extends boolean = false
    >
    extends INode<TParent> {

    get(
        object: TRoot,
        args?: NodeArgsMap
    ): MultipleValue<TValue | undefined, TMultiple>;
    set(
        state: TRoot,
        value: NodeValue<TValue>
    );
}

import { InstructionType } from "../enums/InstructionType";
import { INode, NodeValue, INodeAccessor } from "./INode";
export interface IInstruction<TState, TValue> {
    type: InstructionType;
    node: INodeAccessor<TState, INode<TState, any, TValue, any, any>>;
    value?: NodeValue<TValue>;
}

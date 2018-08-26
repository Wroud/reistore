import { IInstruction, INodeAccessor, NodeValue, INode } from "./interfaces";
import { InstructionType } from "./enums/InstructionType";
export declare class Instruction<TState, TValue> implements IInstruction<TState, TValue> {
    type: InstructionType;
    node: INodeAccessor<TState, INode<TState, any, TValue, any, any>>;
    value?: NodeValue<TValue>;
    constructor(type: InstructionType, node: INodeAccessor<TState, INode<TState, any, TValue, any, any>>, value?: NodeValue<TValue>);
}

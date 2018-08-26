import {
    IStore,
    INode,
    INodeAccessor,
    NodeValue,
    IInstructor,
    ICountainer,
    PathNode
} from "./interfaces";
import { Instruction } from "./Instruction";
import { InstructionType } from "./enums/InstructionType";
import { isCountainer } from "./Node";

export class Instructor<TState extends object | any[] | Map<any, any>> implements IInstructor<TState> {
    private store: IStore<TState>;
    constructor(store: IStore<TState>) {
        this.store = store;
    }
    get state() {
        return this.store.state;
    }
    set<TValue>(
        node: INodeAccessor<TState, INode<TState, any, TValue, any, any>> | ICountainer<INode<TState, any, TValue, any, any>>,
        value: NodeValue<TValue>
    ) {
        this.store.update(new Instruction(InstructionType.set, isCountainer(node) ? node[PathNode] : node, value));
    }
    add<TValue>(
        node: INodeAccessor<TState, INode<TState, any, TValue, any, any>> | ICountainer<INode<TState, any, TValue, any, any>>,
        value: NodeValue<TValue>
    ) {
        this.store.update(new Instruction(InstructionType.add, isCountainer(node) ? node[PathNode] : node, value));
    }
    remove(
        node: INodeAccessor<TState, INode<TState, any, any, any, any>> | ICountainer<INode<TState, any, any, any, any>>
    ) {
        this.store.update(new Instruction(InstructionType.remove, isCountainer(node) ? node[PathNode] : node, null));
    }
}

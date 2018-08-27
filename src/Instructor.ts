import {
    IStore,
    INode,
    NodeValue,
    IInstructor,
    PathNode,
    IAccessorContainer
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
        node: IAccessorContainer<TState, INode<TState, any, TValue, any, any>>,
        value: NodeValue<TValue>
    ) {
        this.store.update(new Instruction(InstructionType.set, isCountainer(node) ? node[PathNode] : node, value));
    }
    add<TValue>(
        node: IAccessorContainer<TState, INode<TState, any, TValue, any, any>>,
        value: NodeValue<TValue>
    ) {
        this.store.update(new Instruction(InstructionType.add, isCountainer(node) ? node[PathNode] : node, value));
    }
    remove(
        node: IAccessorContainer<TState, INode<TState, any, any, any, any>>
    ) {
        this.store.update(new Instruction(InstructionType.remove, isCountainer(node) ? node[PathNode] : node, null));
    }
}

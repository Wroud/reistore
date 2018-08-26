import { ITransformer, INodeAccessor, NodeValue, INode, ApplyChange, IInstruction, IStore, PathNode, ICountainer } from "./interfaces";
import { InstructionType } from "./enums/InstructionType";
import { Instruction } from "./Instruction";
import { isCountainer } from "./Node";

export class Transformer<TState extends object | any[] | Map<any, any>, TScope>
    implements ITransformer<TState, TScope>{
    private node?: INode<TState, any, TScope, any, any>;
    private store: IStore<TState>;
    private applyChange: ApplyChange<TState>;
    constructor(
        store: IStore<TState>,
        applyChange: ApplyChange<TState>,
        node?: INode<TState, any, TScope, any, any>
    ) {
        this.node = node;
        this.store = store;
        this.applyChange = applyChange;
    }
    get scope() {
        if (this.node) {
            return this.store.get(this.node) as TScope;
        }
        return undefined;
    }
    get state() {
        return this.store.state;
    }
    apply(instruction: IInstruction<TState, any>) {
        this.applyChange(this.store, instruction);
    }
    set<TValue>(
        node: INodeAccessor<TState, INode<TState, any, TValue, any, any>> | ICountainer<INode<TState, any, TValue, any, any>>,
        value: NodeValue<TValue>
    ) {
        this.applyChange(this.store, new Instruction(InstructionType.set, isCountainer(node) ? node[PathNode] : node, value));
    }
    add<TValue>(
        node: INodeAccessor<TState, INode<TState, any, TValue, any, any>> | ICountainer<INode<TState, any, TValue, any, any>>,
        value: NodeValue<TValue>
    ) {
        this.applyChange(this.store, new Instruction(InstructionType.add, isCountainer(node) ? node[PathNode] : node, value));
    }
    remove(
        node: INodeAccessor<TState, INode<TState, any, any, any, any>> | ICountainer<INode<TState, any, any, any, any>>
    ) {
        this.applyChange(this.store, new Instruction(InstructionType.remove, isCountainer(node) ? node[PathNode] : node, null));
    }
}
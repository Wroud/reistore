import { IInstructor } from "./IInstructor";
import { IInstruction } from "./IInstruction";

export interface ITransformer<TState> extends IInstructor<TState> {
    applyInstruction();
    toIterator(): IterableIterator<IInstruction<TState, any>>;
}

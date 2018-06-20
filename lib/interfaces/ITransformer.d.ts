import { IInstructor } from "./IInstructor";
import { IInstruction } from "./IInstruction";
export interface ITransformer<TState> extends IInstructor<TState> {
    applyInstruction(): any;
    toIterator(): IterableIterator<IInstruction<TState, any>>;
}

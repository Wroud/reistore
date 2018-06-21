import { IUpdateHandler } from "./IUpdateHandler";
import { IInstructor } from "./IInstructor";
import { IInstruction } from "./IInstruction";
export interface IStore<TState> {
    state: TState;
    instructor: IInstructor<TState>;
    updateHandler: IUpdateHandler;
    update(instructins: IterableIterator<IInstruction<TState, any>>): any;
}

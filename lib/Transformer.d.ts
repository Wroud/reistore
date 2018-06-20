import { IPath, ITransformer, IInstruction } from "./interfaces";
export declare class Transformer<TState> implements ITransformer<TState> {
    private instruction;
    private instructions;
    constructor(instruction: IInstruction<TState, any>);
    set<TValue>(path: IPath<TState, TValue>, value: TValue): void;
    add<TValue>(path: IPath<TState, TValue[]>, value: TValue, index?: string | number | ((value: TValue[]) => string | number)): void;
    remove<TValue>(path: IPath<TState, TValue[]>, index: string | number | ((value: TValue, index: string | number) => boolean)): void;
    applyInstruction(): void;
    toIterator(): IterableIterator<IInstruction<TState, any>>;
}

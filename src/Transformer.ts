import { InstructionType } from "./enums/InstructionType";
import { IPath, ITransformer, IInstruction } from "./interfaces";

export class Transformer<TState> implements ITransformer<TState> {
    private instruction: IInstruction<TState, any>;
    private instructions: Array<IInstruction<TState, any>>;
    constructor(instruction: IInstruction<TState, any>) {
        this.instruction = instruction;
        this.instructions = [];
    }
    set<TValue>(path: IPath<TState, TValue>, value: TValue) {
        this.instructions.push({ path, value, type: InstructionType.set });
    }
    add<TValue>(path: IPath<TState, TValue[]>, value: TValue, index?: string | number | ((value: TValue[]) => string | number)) {
        this.instructions.push({ path, index, value, type: InstructionType.add });
    }
    remove<TValue>(path: IPath<TState, TValue[]>, index: string | number | ((value: TValue, index: string | number) => boolean)) {
        this.instructions.push({ path, index, type: InstructionType.remove });
    }
    applyInstruction() {
        this.instructions.push(this.instruction);
    }
    toIterator() {
        return this.instructions[Symbol.iterator]();
    }
}

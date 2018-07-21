import { ITransformer, IPath, InstructionValue, PathArg, ValueMap, IndexSearch } from "./interfaces";
import { Instructor } from "./Instructor";

export class Transformer<TState, TScope> implements ITransformer<TState, TScope>{
    scope: () => TScope;
    state: TState;
    constructor(scope: () => TScope, state: TState) {
        this.scope = scope;
        this.state = state;
    }

    set<TState, TValue>(
        path: IPath<TState, TValue>,
        value: InstructionValue<TValue>,
        ...pathArgs: PathArg[]
    ) {
        return Instructor.createSet(path, value, pathArgs);
    }
    add<TState, TValue>(
        path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>,
        value: InstructionValue<TValue>,
        ...pathArgs: PathArg[]
    ) {
        return Instructor.createAdd(path, value, pathArgs);
    }
    remove<TState, TValue>(
        path: IPath<TState, ValueMap<TValue> | TValue[]>,
        index: string | number | IndexSearch<TValue>,
        ...pathArgs: PathArg[]
    ) {
        return Instructor.createRemove(path, index, pathArgs);
    }
}
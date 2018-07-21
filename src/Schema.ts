import { IInstruction, Transformator, ISchema, IStore } from "./interfaces";
import { exchangeIterator } from "./tools";
import { Transformer } from "./Transformer";

export abstract class Schema<TState, T> implements ISchema<TState, T> {
    transformator!: Transformator<TState, T>;
    protected scopes: ISchema<TState, any>[];
    protected initState: T;
    constructor(initState?: T, transformator?: Transformator<TState, T>) {
        this.initState = initState || {} as any;
        this.transformator = transformator as any;
        this.scopes = [];
    }
    abstract setInitState(store: IStore<TState>);
    abstract getState(state: TState | IStore<TState>);
    transform(state: TState, instructions: IterableIterator<IInstruction<TState, any>>) {
        if (this.transformator !== undefined) {
            const transformer = new Transformer(() => this.getState(state), state);
            instructions = exchangeIterator(
                instructions,
                instruction => this.transformator(instruction, transformer)
            );
        }
        for (const scope of this.scopes) {
            instructions = scope.transform(state, instructions);
        }
        return instructions;
    }
    bindSchema(schema: ISchema<TState, any>) {
        this.scopes.push(schema);
    }
    unBindSchema(schema: ISchema<TState, any>) {
        const id = this.scopes.indexOf(schema);
        if (id > -1) {
            this.scopes.splice(id, 1);
        }
    }
}

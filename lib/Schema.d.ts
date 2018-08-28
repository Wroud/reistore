import { IInstruction, Transformator, ISchema, IStore } from "./interfaces";
export declare class Schema<TState extends object | any[] | Map<any, any>> implements ISchema<TState> {
    protected transformator: Transformator<TState, any>;
    protected scopes: ISchema<TState>[];
    constructor(transformator?: Transformator<TState, any>);
    readonly schema: ISchema<TState>;
    transform(store: IStore<TState>, change: IInstruction<TState, any>): void;
    bindSchema(schema: ISchema<TState>): void;
    unBindSchema(schema: ISchema<TState>): void;
    applyChange(store: IStore<TState>, change: IInstruction<TState, any>): void;
}
export declare function createSchema<TState extends object | any[] | Map<any, any>>(transformator?: Transformator<TState, {}>): ISchema<TState>;

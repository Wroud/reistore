import { IInstruction, IInstructor, IPath, IStore, Transformator, IUpdateHandler, IScope } from "./interfaces";
export declare class Store<TState, T> implements IStore<TState, T> {
    instructor: IInstructor<TState>;
    transformator: Transformator<TState, T>;
    updateHandler: IUpdateHandler;
    private stateStore;
    private scopes;
    constructor(initState?: T, transformator?: Transformator<TState, T>);
    readonly state: any;
    transform(instructions: IterableIterator<IInstruction<TState, any>>): IterableIterator<IInstruction<TState, any>>;
    update(instructions: IterableIterator<IInstruction<TState, any>>): void;
    addScope(scope: IScope<TState, T, any>): void;
    removeScope(scope: IScope<TState, T, any>): void;
    protected isInstruction: (instruction: IInstruction<TState, any>) => (path: IPath<TState, any>, strict?: boolean | undefined) => boolean;
}

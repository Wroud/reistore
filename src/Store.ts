import { InstructionType } from "./enums/InstructionType";
import { Instructor } from "./Instructor";
import { IInstruction, IInstructor, IUpdateHandler, IPath, Handler } from "./interfaces";
import { UpdateHandler } from "./UpdateHandler";
import { IStore } from "./interfaces/IStore";
import { StoreSchema } from "./StoreSchema";
import { IndexSearch, ValueMap } from "./interfaces/IInstructor";
import { PathArg, PathValue } from "./interfaces/IPath";
import { ISchema, Transformator } from "./interfaces/ISchema";

type IStoreInstructor<TState> = IStore<TState> & IInstructor<TState>;

export class Store<TState> implements IStoreInstructor<TState> {
    instructor: IInstructor<TState>;
    updateHandler: IUpdateHandler<TState>;
    schema: ISchema<TState, TState>;
    private stateStore!: TState;
    private isUpdating: boolean;
    constructor(schema?: ISchema<TState, TState>, initState?: TState, transformator?: Transformator<TState, TState>) {
        if (!schema) {
            schema = new StoreSchema(initState, transformator);
        }
        if (initState) {
            this.stateStore = { ...initState as any };
        }
        this.isUpdating = false;
        this.schema = schema;
        this.instructor = new Instructor(this);
        this.updateHandler = new UpdateHandler();
        this.schema.setInitState(this);
    }
    get state() {
        return this.stateStore;
    }
    set state(value: TState) {
        this.stateStore = value;
    }
    beginTransaction() {
        this.instructor.beginTransaction();
    }
    flush() {
        this.instructor.flush();
    }
    undoTransaction() {
        this.instructor.undoTransaction();
    }
    set<TValue>(
        path: IPath<TState, TValue>,
        value: PathValue<TValue>,
        pathArgs?: PathArg[]
    ) {
        this.instructor.set(path, value, pathArgs);
    }
    add<TValue>(
        path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>,
        value: PathValue<TValue>,
        pathArgs?: PathArg[]
    ) {
        this.instructor.add(path, value, pathArgs);
    }
    remove<TValue>(
        path: IPath<TState, ValueMap<TValue> | TValue[]>,
        index: string | number | IndexSearch<TValue>,
        pathArgs?: PathArg[]
    ) {
        this.instructor.remove(path, index, pathArgs);
    }
    update(instructions: IterableIterator<IInstruction<TState, any>>) {
        if (this.isUpdating) {
            console.group("Reistate:Store");
            console.error("Trying to run update before last update finished, asynchronous problem?");
            console.error("store: ", this);
            console.groupEnd();
            return;
        }
        this.isUpdating = true;
        this.stateStore = { ...this.stateStore as any };
        instructions = this.schema.transform(this.stateStore, instructions);
        for (const { type, path, value, index, args } of instructions) {
            switch (type) {
                case InstructionType.set:
                case InstructionType.add:
                    path.setImmutable(this.stateStore, value, args);
                    break;
                case InstructionType.remove:
                    if (index === undefined) {
                        console.error("You need specify index for removing element");
                        break;
                    }
                    path.setImmutable(this.stateStore, curValue => {
                        if (!Array.isArray(curValue)) {
                            const id = typeof index === "function"
                                ? (index as any)(curValue)
                                : index;
                            const { [id]: _, ...newValue } = curValue;
                            return newValue;
                        } else if (typeof index === "function") {
                            return curValue.filter(index);
                        } else {
                            return curValue.filter((v, i) => i !== index);
                        }
                    }, args);
                    break;
            }
        }
        this.updateHandler.update(this.stateStore);
        this.isUpdating = false;
    }
    subscribe(handler: Handler<TState>) {
        this.updateHandler.subscribe(handler);
        return this;
    }
    unSubscribe(handler: Handler<TState>) {
        this.updateHandler.unSubscribe(handler);
        return this;
    }
}

export function createStore<TState>(schema?: ISchema<TState, TState>, initState?: TState, transformator?: Transformator<TState, TState>) {
    return new Store(schema, initState, transformator);
}

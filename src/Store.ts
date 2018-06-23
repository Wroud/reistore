import { InstructionType } from "./enums/InstructionType";
import { Instructor } from "./Instructor";
import { IInstruction, IInstructor, IStoreSchema, IUpdateHandler, IPath } from "./interfaces";
import { UpdateHandler } from "./UpdateHandler";
import { IStore } from "./interfaces/IStore";
import { StoreSchema } from "./StoreSchema";
import { IndexGetter, IndexSearch, ValueMap } from "./interfaces/IInstructor";
import { PathArg } from "./interfaces/IPath";

type IStoreInstructor<TState> = IStore<TState> & IInstructor<TState>;

export class Store<TState> implements IStoreInstructor<TState> {
    instructor: IInstructor<TState>;
    updateHandler: IUpdateHandler;
    schema: IStoreSchema<TState, TState>;
    private stateStore: TState;
    constructor(schema?: IStoreSchema<TState, TState>, initState?: TState) {
        if (!schema) {
            schema = new StoreSchema();
        }
        this.schema = schema;
        if (initState === undefined) {
            this.stateStore = {} as any;
        } else {
            this.stateStore = initState;
        }
        this.instructor = new Instructor(this);
        this.updateHandler = new UpdateHandler();
    }
    get state() {
        return this.stateStore;
    }
    set<TValue>(path: IPath<TState, TValue>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>) {
        this.instructor.set(path, value, pathArgs, index);
    }
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>) {
        this.instructor.add(path, value, pathArgs, index);
    }
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, pathArgs: PathArg[], index: string | number | IndexSearch<TValue>) {
        this.instructor.remove(path, pathArgs, index);
    }
    update(instructions: IterableIterator<IInstruction<TState, any>>) {
        this.stateStore = { ...this.stateStore as any };
        instructions = this.schema.transform(this.stateStore, instructions);
        for (const { type, path, value, index, args } of instructions) {
            switch (type) {
                case InstructionType.set:
                    path.setImmutable(this.stateStore, value, args);
                    break;
                case InstructionType.add:
                    path.setImmutable(this.stateStore, value, index !== undefined ? [args, index as any] : args);
                    break;
                case InstructionType.remove:
                    if (index === undefined) {
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
        this.updateHandler.update();
    }
}

export function createStore<TState>(schema?: IStoreSchema<TState, TState>, initState?: TState) {
    return new Store(schema, initState);
}

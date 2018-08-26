import { IInstruction, Transformator, ISchema, IStore } from "./interfaces";
import { Transformer } from "./Transformer";
import { InstructionType } from "./enums/InstructionType";

export class Schema<TState extends object | any[] | Map<any, any>> implements ISchema<TState> {
    protected transformator!: Transformator<TState, any>;
    protected scopes: ISchema<TState>[];
    constructor(transformator?: Transformator<TState, any>) {
        this.transformator = transformator as any;
        this.scopes = [];
        this.applyChange = this.applyChange.bind(this);
        this.transform = this.transform.bind(this);
    }
    get schema() {
        return this as ISchema<TState>;
    }
    transform(store: IStore<TState>, change: IInstruction<TState, any>) {
        if (this.transformator !== undefined) {
            const transformer = new Transformer(store, this.applyChange);
            this.transformator(change, transformer)
        } else {
            this.applyChange(store, change);
        }
    }
    bindSchema(schema: ISchema<TState>) {
        this.scopes.push(schema);
    }
    unBindSchema(schema: ISchema<TState>) {
        const id = this.scopes.indexOf(schema);
        if (id > -1) {
            this.scopes.splice(id, 1);
        }
    }
    applyChange(store: IStore<TState>, change: IInstruction<TState, any>) {
        if (this.scopes.length === 0) {
            const { type, node: node, value } = change;
            switch (type) {
                case InstructionType.set:
                case InstructionType.add:
                case InstructionType.remove:
                    if (node) {
                        store.addChange(node.set(store.state, value));
                    }
                    break;
            }
            return;
        }
        for (const scope of this.scopes) {
            scope.transform(store, change);
        }
    }
}

export function createSchema<TState extends object | any[] | Map<any, any>>(transformator?: Transformator<TState, {}>) {
    return new Schema<TState>(transformator);
}

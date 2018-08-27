import { IInstruction, Transformator, ISchema, IStore } from "./interfaces";
import { Transformer } from "./Transformer";

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
        if (this.transformator === undefined) {
            this.applyChange(store, change);
            return;
        }
        const transformer = new Transformer(store, this.applyChange);
        this.transformator(change, transformer);
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
            const { node, value } = change;
            store.addChange(node.set(store.state, value));
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

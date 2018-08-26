import { expect } from "chai";
import "mocha";

import { createStore, createSchema, createScope, Instructor, IInstruction, ITransformer, PathNode } from "../src/";
import { buildSchema } from "../src/Node";

describe("Transform", () => {
    interface IArray {
        number: number
    }
    interface IModel {
        value: string;
        scope: {
            value: number;
            array: IArray[],
            indexedArray: Map<number, IArray>
        }
    }
    const { schema: nodeSchema } = buildSchema<IModel>()
        .field("value", () => "123" as string)
        .node("scope", b =>
            b.field("value", () => 15 as number)
                .array("array", b =>
                    b.field("number"),
                    () => [] as IArray[]
                )
                .map("indexedArray", b =>
                    b.field("number"),
                    () => new Map()
                ),
            () => ({} as IModel["scope"])
        );

    it("two transformers with scope", () => {

        const schema = createSchema<IModel>((change, transformer) => {
            if (change.node.in(nodeSchema.scope, false) && change.value !== undefined) {
                transformer.set(nodeSchema.value, change.value.toString());
            }
            transformer.apply(change);
        });

        const scope = createScope(schema, nodeSchema.scope, (change, transformer) => {
            if (change.node.in(nodeSchema.value, false) && change.value !== undefined) {
                transformer.set(nodeSchema.scope.value, parseInt(change.value));
            }
            transformer.apply(change);
        });
        const store = createStore<IModel>({} as IModel, schema);
        const expectedState = {
            value: "0",
            scope: {
                value: 0
            }
        }
        const expectedState1 = {
            value: "1",
            scope: {
                value: 1
            }
        }
        store.set(nodeSchema.scope.value, 0);
        expect(store.state.scope.value).to.be.equal(0);
        expect(store.state.value).to.be.equal("0");
        expect(store.state).to.be.deep.equal(expectedState);

        store.set(nodeSchema.value, "1");
        expect(store.state.scope.value).to.be.equal(1);
        expect(store.state.value).to.be.equal("1");
        expect(store.state).to.be.deep.equal(expectedState1);
    });

});

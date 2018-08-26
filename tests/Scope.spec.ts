import { expect } from "chai";
import "mocha";

import { createStore, createScope, createSchema, PathNode } from "../src/";
import { buildSchema } from "../src/Node";

describe("Scope", () => {
    interface IArray {
        number: number,
        aar: string[]
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
        .field("value")
        .node("scope", b =>
            b.field("value")
                .array("array", b =>
                    b.field("number")
                        .array("aar"),
                    () => []
                )
                .map("indexedArray", b =>
                    b.field("number"),
                    () => new Map()
                ),
            () => ({} as any as IModel["scope"])
        );

    it("set", () => {
        const schema = createSchema<IModel>();
        const scope = createScope(schema, nodeSchema.scope);
        const store = createStore<IModel>({} as IModel, schema);

        const expectedState = {
            scope: {
                array: [
                    {
                        number: 6
                    }
                ]
            }
        }
        store.add(nodeSchema.scope.array(0), {
            number: 5
        });
        store.set(nodeSchema.scope.array(0, s => s.number), 6);
        expect(store.get(nodeSchema.scope.array(0, s => s.number))).to.be.equal(6);
        expect(store.get(nodeSchema.scope)).to.be.deep.equal(expectedState.scope);
        expect(store.state).to.be.deep.equal(expectedState);
    });

    it("add", () => {
        const schema = createSchema<IModel>();
        const scope = createScope(schema, nodeSchema.scope);
        const store = createStore<IModel>({} as IModel, schema);
        const expectedState = {
            scope: {
                array: [
                    {
                        number: 6
                    }, ,
                    {
                        number: 6
                    }
                ]
            }
        }
        store.add(nodeSchema.scope.array(0), {
            number: 6
        });
        store.add(nodeSchema.scope.array(2), {
            number: 6
        });
        expect(store.get(nodeSchema.scope.array(0, e => e.number))).to.be.equal(6);
        expect(store.get(nodeSchema.scope.array(2, e => e.number))).to.be.equal(6);
        expect(store.get(nodeSchema.scope)).to.be.deep.equal(expectedState.scope);
        expect(store.state).to.be.deep.equal(expectedState);
    });

    it("remove", () => {
        const init = {
            scope: {
                array: [
                    {
                        number: 6
                    }
                ]
            }
        };
        const expectState = {
            scope: {
                array: [{
                    number: 6
                }]
            }
        };
        const schema = createSchema<IModel>();
        const scope = createScope(schema, nodeSchema.scope);
        const store = createStore<IModel>({} as IModel, schema);
        store.add(nodeSchema.scope.array([0, 1, 2]), {
            number: 6
        });
        store.remove(nodeSchema.scope.array(0));
        expect(store.get(nodeSchema.scope.array).length).to.be.equal(2);
        store.remove(nodeSchema.scope.array(0));
        expect(store.get(nodeSchema.scope.array).length).to.be.equal(1);
        expect(store.get(nodeSchema.scope)).to.be.deep.equal(expectState.scope);
        expect(store.state).to.be.deep.equal(expectState);
    });

    it("set number index to object", () => {
        const schema = createSchema<IModel>();
        const scope = createScope(schema, nodeSchema.scope);
        const store = createStore<IModel>({} as IModel, schema);
        store.set(nodeSchema.scope.indexedArray(0), {
            number: 6
        });
        store.set(nodeSchema.scope.indexedArray(2), {
            number: 6
        });
        expect(store.get(nodeSchema.scope.indexedArray(0, e => e.number))).to.be.equal(6);
        expect(store.get(nodeSchema.scope.indexedArray(2, e => e.number))).to.be.equal(6);
        expect(store.state.scope.indexedArray.get(0).number).to.be.deep.equal(6);
        expect(store.state.scope.indexedArray.get(2).number).to.be.deep.equal(6);
    });

});

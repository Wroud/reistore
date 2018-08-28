import { expect } from "chai";
import "mocha";

import { createStore, buildSchema } from "../src/";

describe("Store", () => {
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
            b.field("value")
                .array("array", b =>
                    b.field("number"),
                    () => []
                )
                .map("indexedArray", b =>
                    b.field("number"),
                    () => new Map()
                ),
            () => ({
                value: 15,
                array: [
                    { number: 5 }
                ],
                indexedArray: (new Map()).set(0, { number: 6 })
            } as IModel["scope"])
        );

    it("init state", () => {
        const store = createStore<IModel>({} as IModel);
        expect(store.get(nodeSchema.value)).to.be.equal("123");
        expect(store.get(nodeSchema.scope.value)).to.be.equal(15);
        expect(store.get(nodeSchema.scope.array(0, f => f.number))).to.be.equal(5);
        expect(store.get(nodeSchema.scope.indexedArray(0, f => f.number))).to.be.equal(6);
    });

    it("subscription", () => {
        const store = createStore<IModel>();
        let storeUpdates = 0;
        let scopeValueUpdates = 0;
        let valueUpdates = 0;
        let scopeUpdates = 0;
        const storeHandler = () => storeUpdates++;
        store.subscribe(storeHandler);
        const sub = store.subscribe(
            () => valueUpdates++,
            nodeSchema.value,
            true
        );
        const subScope = store.subscribe(
            () => scopeUpdates++,
            nodeSchema.scope
        );
        var subChild = store.subscribe(
            () => scopeValueUpdates++,
            nodeSchema.scope.value
        );
        store.set(nodeSchema.scope.value, 6);
        expect(storeUpdates).to.be.equal(1);
        expect(scopeValueUpdates).to.be.equal(1);
        expect(scopeUpdates).to.be.equal(1);
        expect(valueUpdates).to.be.equal(0);

        store.set(nodeSchema.value, "6");
        expect(storeUpdates).to.be.equal(2);
        expect(scopeValueUpdates).to.be.equal(1);
        expect(scopeUpdates).to.be.equal(1);
        expect(valueUpdates).to.be.equal(1);

        sub.unSubscribe();
        store.set(nodeSchema.value, "6");
        expect(storeUpdates).to.be.equal(3);
        expect(scopeValueUpdates).to.be.equal(1);
        expect(scopeUpdates).to.be.equal(1);
        expect(valueUpdates).to.be.equal(1);

        subChild.unSubscribe();
        store.set(nodeSchema.scope.value, 2);
        expect(storeUpdates).to.be.equal(4);
        expect(scopeValueUpdates).to.be.equal(1);
        expect(scopeUpdates).to.be.equal(2);
        expect(valueUpdates).to.be.equal(1);

        subScope.unSubscribe();
        store.set(nodeSchema.scope.value, 2);
        expect(storeUpdates).to.be.equal(5);
        expect(scopeValueUpdates).to.be.equal(1);
        expect(scopeUpdates).to.be.equal(2);
        expect(valueUpdates).to.be.equal(1);

        store.unSubscribe(storeHandler);
        store.set(nodeSchema.scope.value, 2);
        expect(storeUpdates).to.be.equal(5);
        expect(scopeValueUpdates).to.be.equal(1);
        expect(valueUpdates).to.be.equal(1);
    });

    it("set", () => {
        const store = createStore<IModel>();
        store.set(nodeSchema.scope.array(0), { number: 6 });
        expect(store.state.scope.array[0].number).to.be.equal(6);
        store.set(nodeSchema.scope.indexedArray(0), { number: 6 });
        expect(store.state.scope.array[0].number).to.be.equal(6);
        store.set(nodeSchema.scope.indexedArray(0, s => s.number), 6);
        expect(store.get(nodeSchema.scope.indexedArray(0, s => s.number))).to.be.equal(6);
        expect(store.get(nodeSchema.scope.indexedArray(0))).to.be.deep.equal({ number: 6 });
    });

    it("add", () => {
        const store = createStore<IModel>();
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
        expect(store.state.scope.array[0].number).to.be.equal(6);
        expect(store.state.scope.array[2].number).to.be.equal(6);
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
        const store = createStore<IModel>(init as IModel);
        store.instructor.add(nodeSchema.scope.array(2), {
            number: 6
        });
        store.remove(nodeSchema.scope.array(0));
        expect(store.state.scope.array.length).to.be.equal(2);
        store.remove(nodeSchema.scope.array(0));
        expect(store.state.scope.array.length).to.be.equal(1);
    });

    it("set number index to object", () => {
        const store = createStore<IModel>({} as any);
        store.instructor.set(nodeSchema.scope.indexedArray(0), {
            number: 6
        });
        store.instructor.set(nodeSchema.scope.indexedArray(2), {
            number: 6
        });
        expect(store.get(nodeSchema.scope.indexedArray(0)).number).to.be.equal(6);
        expect(store.get(nodeSchema.scope.indexedArray(2, n => n.number))).to.be.equal(6);
    });

    // it("array tests", () => {
    //     const store = createStore<IModel>(undefined, { scope: { array: [] } } as any);
    //     const expectedState = {
    //         scope: {
    //             array: [1, 2, 3]
    //         }
    //     }
    //     store.instructor.add(Path.create(f => f.scope.array["{}"]), 1 as any);
    //     store.instructor.add(Path.create(f => f.scope.array["{}"]), 2 as any);
    //     store.instructor.add(Path.create(f => f.scope.array["{}"]), 3 as any);
    //     expect(store.state.scope.array[0]).to.be.equal(1);
    //     expect(store.state.scope.array[1]).to.be.equal(2);
    //     expect(store.state.scope.array[2]).to.be.equal(3);
    //     expect(store.state).to.be.deep.equal(expectedState);
    // });

    it("batch tests", () => {
        const store = createStore<IModel>({} as IModel);
        const expectedState = [15, 2, true];
        store.batch(store => {
            store.add(nodeSchema.scope.array(0), 1 as any);
            store.add(nodeSchema.scope.array(1), 2 as any);
            store.add(nodeSchema.scope.array(2), 3 as any);
            store.set(nodeSchema.scope.array(0), 15 as any);
            store.set(nodeSchema.scope.array(2), v => (v === 3 as any) as any);
        });
        expect(store.state.scope.array[0]).to.be.equal(15);
        expect(store.state.scope.array[1]).to.be.equal(2);
        expect(store.state.scope.array[2]).to.be.equal(true);
        expect(store.state.scope.array).to.be.deep.equal(expectedState);
    });

});

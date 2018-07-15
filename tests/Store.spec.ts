import { expect } from "chai";
import "mocha";

import { Path, createStore, createSchema, createScope } from "../src/";

describe("Store", () => {
    interface IArray {
        number: number
    }
    interface IIArray {
        [key: number]: IArray
    }
    interface IModel {
        value: string;
        scope: {
            value: number;
            array: IArray[],
            indexedArray: IIArray
        }
    }

    it("init state", () => {
        const schema = createSchema<IModel>({ value: "123" } as IModel);
        const scope = createScope<IModel, IModel, IModel["scope"]>(
            schema,
            f => f.scope,
            {
                value: 15,
                array: [
                    { number: 5 }
                ]
            } as IModel["scope"]
        );
        const array = scope.createScope(
            f => f.indexedArray,
            {
                0: { number: 6 }
            }
        );
        const store = createStore<IModel>(schema);
        const expectedState = {
            value: "123",
            scope: {
                value: 15,
                array: [
                    { number: 5 }
                ],
                indexedArray: {
                    0: { number: 6 }
                }
            }
        }
        expect(store.state).to.be.deep.equal(expectedState);
    });

    it("set", () => {
        const store = createStore<IModel>();
        const expectedState = {
            scope: {
                array: [
                    {
                        number: 6
                    }
                ]
            }
        }
        store.set(Path.create(f => f.scope.array[0].number), 6);
        expect(store.state.scope.array[0].number).to.be.equal(6);
        expect(store.state).to.be.deep.equal(expectedState);
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
        store.add(Path.create(f => f.scope.array[0]), {
            number: 6
        });
        store.add(Path.create(f => f.scope.array[2]), {
            number: 6
        });
        expect(store.state.scope.array[0].number).to.be.equal(6);
        expect(store.state.scope.array[2].number).to.be.equal(6);
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
        const expectState = { scope: { array: [] } };
        const store = createStore<IModel>(undefined, init as IModel);
        store.instructor.add(Path.create(f => f.scope.array[2]), {
            number: 6
        });
        store.remove(Path.create(f => f.scope.array), 0);
        expect(store.state.scope.array.length).to.be.equal(1);
        store.remove(Path.create(f => f.scope.array), 0);
        expect(store.state.scope.array.length).to.be.equal(0);
        expect(store.state).to.be.deep.equal(expectState);
    });

    it("set number index to object", () => {
        const store = createStore<IModel>(undefined, { scope: { indexedArray: {} } } as any);
        const expectedState = {
            scope: {
                indexedArray: {
                    0: {
                        number: 6
                    },
                    2: {
                        number: 6
                    }
                }
            }
        }
        store.instructor.set(Path.create(f => f.scope.indexedArray[0]), {
            number: 6
        });
        store.instructor.set(Path.create(f => f.scope.indexedArray[2]), {
            number: 6
        });
        expect(store.state.scope.indexedArray[0].number).to.be.equal(6);
        expect(store.state.scope.indexedArray[2].number).to.be.equal(6);
        expect(store.state).to.be.deep.equal(expectedState);
    });

    it("array tests", () => {
        const store = createStore<IModel>(undefined, { scope: { array: [] } } as any);
        const expectedState = {
            scope: {
                array: [1, 2, 3]
            }
        }
        store.instructor.add(Path.create(f => f.scope.array["{}"]), 1 as any);
        store.instructor.add(Path.create(f => f.scope.array["{}"]), 2 as any);
        store.instructor.add(Path.create(f => f.scope.array["{}"]), 3 as any);
        expect(store.state.scope.array[0]).to.be.equal(1);
        expect(store.state.scope.array[1]).to.be.equal(2);
        expect(store.state.scope.array[2]).to.be.equal(3);
        expect(store.state).to.be.deep.equal(expectedState);
    });

    it("inject tests", () => {
        const store = createStore<IModel>(undefined, { scope: { array: [] } } as any);
        const expectedState = {
            scope: {
                array: [15, 2, true]
            }
        }
        const arrayPath = Path.create((f: IModel) => f.scope.array["{}"]);
        store.add(arrayPath, 1 as any);
        store.add(arrayPath, 2 as any);
        store.add(arrayPath, 3 as any);
        store.inject((state, inject) => {
            inject.set(arrayPath, 15 as any, 0);
            inject.set(arrayPath, v => (v === 3 as any) as any, 2);
        });
        expect(store.state.scope.array[0]).to.be.equal(15);
        expect(store.state.scope.array[1]).to.be.equal(2);
        expect(store.state.scope.array[2]).to.be.equal(true);
        expect(store.state).to.be.deep.equal(expectedState);
    });

});

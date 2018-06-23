import { expect } from "chai";
import "mocha";

import { Path } from "../src/Path";
import { Store } from "../src/Store";
import { StoreSchema } from "../src/StoreSchema";

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

    it("set", () => {
        const schema = new StoreSchema<IModel, IModel>();
        const store = new Store<IModel>(schema);
        const expectedState = {
            scope: {
                array: [
                    {
                        number: 6
                    }
                ]
            }
        }
        store.instructor.set(Path.fromSelector(f => f.scope.array[0].number), 6);
        expect(store.state.scope.array[0].number).to.be.equal(6);
        expect(store.state).to.be.deep.equal(expectedState);
    });

    it("add", () => {
        const schema = new StoreSchema<IModel, IModel>();
        const store = new Store<IModel>(schema);
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
        store.instructor.add(Path.fromSelector(f => f.scope.array[0]), {
            number: 6
        });
        store.instructor.add(Path.fromSelector(f => f.scope.array[2]), {
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
        const schema = new StoreSchema<IModel, IModel>();
        const store = new Store<IModel>(schema, init as any);
        store.instructor.add(Path.fromSelector(f => f.scope.array[2]), {
            number: 6
        });
        store.instructor.remove(Path.fromSelector(f => f.scope.array), [], 0);
        expect(store.state.scope.array.length).to.be.equal(1);
        store.instructor.remove(Path.fromSelector(f => f.scope.array), [], 0);
        expect(store.state.scope.array.length).to.be.equal(0);
        expect(store.state).to.be.deep.equal(expectState);
    });

    it("set number index to object", () => {
        const schema = new StoreSchema<IModel, IModel>();
        const store = new Store<IModel>(schema, { scope: { indexedArray: {} } } as any);
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
        store.instructor.set(Path.fromSelector(f => f.scope.indexedArray[0]), {
            number: 6
        });
        store.instructor.set(Path.fromSelector(f => f.scope.indexedArray[2]), {
            number: 6
        });
        expect(store.state.scope.indexedArray[0].number).to.be.equal(6);
        expect(store.state.scope.indexedArray[2].number).to.be.equal(6);
        expect(store.state).to.be.deep.equal(expectedState);
    });

    it("array tests", () => {
        const store = new Store<IModel>(undefined, { scope: { array: [] } } as any);
        const expectedState = {
            scope: {
                array: [1, 2, 3]
            }
        }
        store.instructor.add(Path.fromSelector(f => f.scope.array["{}"]), 1 as any);
        store.instructor.add(Path.fromSelector(f => f.scope.array["{}"]), 2 as any);
        store.instructor.add(Path.fromSelector(f => f.scope.array["{}"]), 3 as any);
        expect(store.state.scope.array[0]).to.be.equal(1);
        expect(store.state.scope.array[1]).to.be.equal(2);
        expect(store.state.scope.array[2]).to.be.equal(3);
        expect(store.state).to.be.deep.equal(expectedState);
    });

});

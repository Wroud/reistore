import { expect } from "chai";
import "mocha";

import { PathNode, buildSchema } from "../src";

describe("Node", () => {
    interface ITest {
        a: {
            b: {
                c: number;
            };
        };
    }

    const { schema } = buildSchema<ITest>()
        .node("a", b =>
            b.node("b", b =>
                b.field("c")
            )
        );
    const path0 = schema.a[PathNode];
    const path1 = schema.a.b[PathNode];

    it("includes closest", () => {
        expect(path0.in(path1, false)).to.be.equal(false);
    });
    it("includes further", () => {
        expect(path1.in(path0, false)).to.be.equal(true);
    });
    it("includes strict negative", () => {
        expect(path1.in(path0, true)).to.be.equal(false);
    });
    it("includes strict positive", () => {
        expect(path1.in(path1, true)).to.be.equal(true);
    });
    it("getValue returns undefined if object doesn't implements path", () => {
        expect(path0.get({} as any)).to.be.equal(undefined);
    });
    it("getValue returns value", () => {
        expect(path0.get({ a: 1 } as any)).to.be.equal(1);
    });
    it("getValue after join returns value", () => {
        expect(path1.get({ a: { b: 1 } } as any)).to.be.equal(1);
    });
    it("setValue positive", () => {
        const obj = { a: {} };
        const setObj = {};
        path0.set(obj as any, setObj as any);
        expect(path0.get(obj as any)).to.be.equal(setObj);
    });
    it("setValue negative", () => {
        const obj = { a: { b: {} } };
        const setObj = {};
        path1.set(obj as any, setObj as any)
        expect(path1.get(obj as any)).to.be.equal(setObj);
    });
});

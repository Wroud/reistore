"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathNode = Symbol("@@node");
var NodeType;
(function (NodeType) {
    NodeType[NodeType["field"] = 0] = "field";
    NodeType[NodeType["node"] = 1] = "node";
    NodeType[NodeType["array"] = 2] = "array";
    NodeType[NodeType["map"] = 3] = "map";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
// interface ITP {
//     summary: number;
//     count: number;
//     isChecked: boolean;
//     elements: { a: string }[];
//     elementsMap: Map<number, { c: boolean }>;
//     scope: {
//         name: string;
//     }
// }
// const schemaBuilder: ISchemaBuilder<ITP, ITP, ITP> = {} as any;
// const { schema } = schemaBuilder
//     .field("summary")
//     .field("count")
//     .field("isChecked")
//     .array("elements", b =>
//         b.field("a")
//     )
//     .map("elementsMap", b =>
//         b.field("c")
//     )
//     .node("scope", b =>
//         b.field("name")
//     );
// store.get(schema.summary); // number
// store.get(schema.elements); // Array<{ a: string }>
// store.get(schema.elements()); // { a: string }
// store.get(schema.elements(15).a); // string
// store.get(schema.elementsMap); // Map<number, { c: boolean }>
// store.get(schema.elementsMap()); // { c: boolean }
// store.get(schema.elementsMap([1, 15]).c); // Array<boolean>
// store.set(schema.summary, 5);
// store.set(schema.elements, v => [...v]); // immutable update
// store.set(schema.elements(15), { a: "some" }); // mutate state.elements[15] = { a: "some" }
// store.set(schema.elementsMap(15).c, false); // mutate state.elementsMap.get(15).c = false
// store.set(schema.elementsMap([1, 15]).c, true); /* mutate state.elementsMap.get(1).c = true
//                                                           state.elementsMap.get(15).c = true*/
//# sourceMappingURL=INode.js.map
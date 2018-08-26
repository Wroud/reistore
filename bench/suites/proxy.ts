// import { modifyReducer, counterReducer, normalizedReducer, deepCounterReducer } from "stmbenchmarks";
// import { Path, PathNode } from "../../src";
// import { buildSchema, SchemaBuilder, Undo } from "../../src/Node";
// // interface INode {
// //     name?: string;
// //     isArray?: boolean;
// //     parent?: INode;
// //     root?: INode;
// //     chain: INode[];
// //     get(object): any;
// //     set(object, value): IUndo;
// //     setImmutable(object, value);
// //     join(name?: string, isArray?: boolean): INode;
// //     in(node: INode, strict?: boolean): boolean;
// // }
// // interface IUndo {
// //     path: INode;
// //     value: any;
// // }

// // class Node implements INode {
// //     name?: string;
// //     isArray?: boolean;
// //     parent?: INode;
// //     root?: INode;
// //     chain: INode[];
// //     constructor(parent?: INode, name?: string, isArray?: boolean) {
// //         this.name = name;
// //         this.isArray = isArray;
// //         this.parent = parent;
// //         if (parent) {
// //             this.root = parent.root;
// //             this.chain = [...parent.chain, this];
// //         } else {
// //             this.root = this;
// //             this.chain = [this];
// //         }
// //     }
// //     join(name?: string, isArray?: boolean): INode {
// //         return new Node(this, name, isArray);
// //     }
// //     set(object, value): IUndo {
// //         let prevValue;
// //         if (this.parent) {
// //             prevValue = this.parent.get(object)[this.name];
// //             this.parent.get(object)[this.name] = value;
// //         } else {
// //             prevValue = object[this.name];
// //             object[this.name] = value;
// //         }
// //         return {
// //             path: this,
// //             value: prevValue
// //         };
// //     }
// //     setImmutable(object, value) {
// //         if (this.parent) {
// //             let link = object;
// //             for (let i = 0; i < this.chain.length - 1; i++) {
// //                 const node = this.chain[i];
// //                 link = link[node.name] = node.isArray
// //                     ? [...link[node.name]]
// //                     : { ...link[node.name] };
// //             }
// //             link[this.name] = value;
// //         } else {
// //             object[this.name] = value;
// //         }
// //     }
// //     get(object) {
// //         if (!this.parent) {
// //             return object[this.name];
// //         }
// //         return this.parent.get(object)[this.name];
// //     }
// //     in(node: INode, strict?: boolean): boolean {
// //         if (this === node) {
// //             return true;
// //         }
// //         if (strict) {
// //             return false;
// //         }
// //         for (let i = 0; i < node.chain.length; i++) {
// //             if (node.chain[i] !== this.chain[i]) {
// //                 return false;
// //             }
// //         }
// //         return true;
// //     }
// // }
// interface IModel {
//     a: {
//         b: {
//             c: number
//         },
//         array: number[]
//     },
//     d: number
// }
// const { schema } = buildSchema<IModel>()
//     .node("a", s => s
//         .node("b", s => s
//             .field("c")
//         )
//         .array("array")
//     )
//     .field("d");

// const pathd = Path.create((f: IModel) => f.d);
// const patha = Path.create((f: IModel) => f.a);
// const pathb = patha.join(f => f.b);
// const pathc = pathb.join(f => f.c);
// const pathar = patha.join(f => f.array);
// const pathare = pathar.join<number>(f => f["{}"]);
// const getObj = (): IModel => ({
//     a: {
//         b: {
//             c: 15
//         },
//         array: [1, 2, 3]
//     },
//     d: 15
// });
// // let obj = getObj();

// // const c = schema.a.b.c[PathNode];
// // c.set(obj, 1);
// // console.log("a.b.c: ", c.get(obj), obj.a.b.c);

// // const a = schema.a[PathNode];
// // a.set(obj, 1);
// // console.log("a: ", a.get(obj), obj.a);

// // obj = getObj();
// // const ar = schema.a.array[PathNode];
// // ar.set(obj, [2, 3, 4]);
// // console.log("a.array: ", ar.get(obj), obj.a.array);

// // obj = getObj();
// // const are = schema.a.array.map()[PathNode];
// // const args = new Map();
// // args.set(schema.a.array.map()[PathNode], [0, 1, 2]);
// // are.set(obj, 22, args);
// // console.log("a.array: ", obj.a.array);

// function getIn(object, args) {
//     let link = object;
//     for (const arg of args) {
//         link = link[arg];
//     }
//     return link;
// }
// class LNode {
//     name;
//     parent;
//     nodes;
//     constructor(name, parent) {
//         this.name = name;
//         this.parent = parent;
//         if (this.parent) {
//             this.nodes = [...this.parent.nodes, this];
//         } else {
//             this.nodes = [this];
//         }
//     }
//     get(object) {
//         if (this.parent !== undefined) {
//             return this.parent.get(object)[this.name];
//         } else {
//             return object[this.name];
//         }
//     }
// }

// export const proxySuite = ({ variables: { normalizedCount }, initState, helpers: { subscribeChecker } }) => {

//     return {
//         name: "proxy",
//         benchmarks: [
//             // {
//             //     name: "dyn array",
//             //     bench() {
//             //         const ars = [];
//             //         for (let i = 0; i < 10; i++) {
//             //             ars.push(i);
//             //         }
//             //         return () => {
//             //             const ar = [];
//             //             for (let i = 0; i < 10; i++) {
//             //                 ar.push(ars[i]);
//             //             }
//             //         };
//             //     }
//             // },
//             // {
//             //     name: "new Array()",
//             //     bench() {
//             //         const ars = [];
//             //         for (let i = 0; i < 10; i++) {
//             //             ars.push(i);
//             //         }
//             //         return () => {
//             //             const ar = new Array(10);
//             //             for (let i = 0; i < ar.length; i++) {
//             //                 ar[i] = ars[i];
//             //             }
//             //         }
//             //     }
//             // },
//             // {
//             //     name: "getIn",
//             //     bench() {
//             //         const obj = getObj();
//             //         const args = ["a", "b", "c"];
//             //         return () => {
//             //             const v = getIn(obj, args);
//             //         };
//             //     }
//             // },
//             // {
//             //     name: "linked-list",
//             //     bench() {
//             //         const obj = getObj();
//             //         const node = new LNode("c", new LNode("b", new LNode("a", undefined)));
//             //         return () => {
//             //             const v = node.get(obj);
//             //         };
//             //     }
//             // },
//             {
//                 name: "path get",
//                 bench() {
//                     const obj = getObj();
//                     return () => {
//                         patha.get(obj, undefined, undefined);
//                     };
//                 }
//             },
//             {
//                 name: "path get deep",
//                 bench() {
//                     const obj = getObj();
//                     return () => {
//                         pathc.get(obj, undefined, undefined);
//                     };
//                 }
//             },
//             {
//                 name: "path get array",
//                 bench() {
//                     const obj = getObj();
//                     const e0 = [0];
//                     const e1 = [1];
//                     const e2 = [2];
//                     const e3 = [3];
//                     const e4 = [4];
//                     const e5 = [5];
//                     return () => {
//                         const arr = [
//                             pathare.get(obj, undefined, e0),
//                             pathare.get(obj, undefined, e1),
//                             pathare.get(obj, undefined, e2),
//                             pathare.get(obj, undefined, e3),
//                             pathare.get(obj, undefined, e4),
//                             pathare.get(obj, undefined, e5)
//                         ]
//                     };
//                 }
//             },
//             {
//                 name: "path in",
//                 bench() {
//                     const obj = getObj();
//                     return () => {
//                         // pathc.includes(pathd, false);
//                         pathc.includes(patha, false);
//                         // pathc.includes(pathb, false);
//                         // pathc.includes(pathc, false);
//                     };
//                 }
//             },
//             {
//                 name: "path in complex",
//                 bench() {
//                     const obj = getObj();
//                     return () => {
//                         pathc.includes(pathd, false);
//                         pathc.includes(patha, false);
//                         pathc.includes(pathb, false);
//                         pathc.includes(pathc, false);
//                     };
//                 }
//             },
//             {
//                 name: "path set",
//                 bench() {
//                     const obj = getObj();
//                     return () => {
//                         patha.set(obj, obj.a, undefined);
//                     };
//                 }
//             },
//             {
//                 name: "path set deep",
//                 bench() {
//                     const obj = getObj();
//                     return () => {
//                         pathc.set(obj, 1, undefined);
//                     };
//                 }
//             },
//             {
//                 name: "path set array",
//                 bench() {
//                     const obj = getObj();
//                     return () => {
//                         for (let i = 0; i < 20; i++) {
//                             pathare.set(obj, 1, [i]);
//                         }
//                     };
//                 }
//             },
//             {
//                 name: "node get",
//                 bench() {
//                     const obj = getObj();
//                     const a = schema.a[PathNode];
//                     return () => {
//                         const temp = a.get(obj, undefined);
//                     };
//                 }
//             },
//             {
//                 name: "node get deep",
//                 bench() {
//                     const obj = getObj();
//                     const c = schema.a.b.c[PathNode];
//                     return () => {
//                         const temp = c.get(obj, undefined);
//                     };
//                 }
//             },
//             {
//                 name: "node get array",
//                 bench() {
//                     const obj = getObj();
//                     const are = schema.a.array([0, 1, 2, 3, 4, 5]);
//                     return () => {
//                         const temp = are.get(obj);
//                     };
//                 }
//             },
//             {
//                 name: "node in",
//                 bench() {
//                     const a = new Undo(schema.a[PathNode], undefined, undefined);
//                     const b = new Undo(schema.a.b[PathNode], undefined, undefined);
//                     const c = new Undo(schema.a.b.c[PathNode], undefined, undefined);
//                     const d = new Undo(schema.d[PathNode], undefined, undefined);
//                     const cc = schema.a.b.c[PathNode];
//                     return () => {
//                         cc.in(a, false, undefined);
//                         // cc.in(b, false, undefined);
//                         // cc.in(c, false, undefined);
//                         // cc.in(d, false, undefined);
//                     };
//                 }
//             },
//             {
//                 name: "node in complex",
//                 bench() {
//                     const a = new Undo(schema.a[PathNode], undefined, undefined);
//                     const b = new Undo(schema.a.b[PathNode], undefined, undefined);
//                     const c = new Undo(schema.a.b.c[PathNode], undefined, undefined);
//                     const d = new Undo(schema.d[PathNode], undefined, undefined);
//                     const cc = schema.a.b.c[PathNode];
//                     return () => {
//                         cc.in(a, false, undefined);
//                         cc.in(b, false, undefined);
//                         cc.in(c, false, undefined);
//                         cc.in(d, false, undefined);
//                     };
//                 }
//             },
//             {
//                 name: "node set",
//                 bench() {
//                     const obj = getObj();
//                     const a = schema.a[PathNode];
//                     return () => {
//                         a.set(obj, obj.a, undefined);
//                     };
//                 }
//             },
//             {
//                 name: "node set deep",
//                 bench() {
//                     const obj = getObj();
//                     const c = schema.a.b.c[PathNode];
//                     return () => {
//                         c.set(obj, 3, undefined);
//                     };
//                 }
//             },
//             {
//                 name: "node set array",
//                 bench() {
//                     const obj = getObj();
//                     const are = schema.a.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
//                     return () => {
//                         are.set(obj, 22);
//                     };
//                 }
//             },


//             // {
//             //     name: "proxy get",
//             //     bench() {
//             //         const obj = new Proxy({ a: 5 }, {
//             //             get(target, prop) {
//             //                 return target[prop];
//             //             }
//             //         });
//             //         return () => {
//             //             const t = obj.a;
//             //         };
//             //     }
//             // },
//             // {
//             //     name: "object get",
//             //     bench() {
//             //         const obj = { a: 5 };
//             //         return () => {
//             //             const t = obj.a;
//             //         };
//             //     }
//             // },
//             // {
//             //     name: "defineProperty get",
//             //     bench() {
//             //         const sobj = { a: 5 };
//             //         const obj = {} as typeof sobj;
//             //         Object.defineProperty(obj, "a", {
//             //             configurable: false,
//             //             set: v => sobj.a = v,
//             //             get: () => sobj.a
//             //         });
//             //         return () => {
//             //             const t = obj.a;
//             //         };
//             //     }
//             // }
//         ]
//     };
// };

"use strict";
// type PrimitiveMethod<T extends symbol | string, A> = { [P in T]: A extends undefined ? () => void : (arg: A) => void };
// class Primitive<B, S> {
//     on<TSymbol extends symbol | string, TCommit, TArgument = undefined>(
//         key: TSymbol,
//         action: (context: B) => (args: TArgument) => Promise<TCommit> | void,
//         commit?: (store: S, commit: TCommit) => void
//     ): this & PrimitiveMethod<TSymbol, TArgument> {
//         return {} as any;
//     }
// }
// function createPrimitive() {
//     return new Primitive();
// }
// export const userPrimitive = createPrimitive()
//     .on(
//         "hide",
//         (user) => async (args: string) => {
//             // logic place
//             // arg0 - context where logic runned
//             if (user.isHidden) {
//                 return;
//             }
//             await api.hideUser();
//             await anotherPrimitive(/* their context*/).someAnotherAction();
//             return user.id as number; // userId
//         },
//         (state, userId) => {
//             // commit phase, 
//             // arg0 - state manage, 
//             // arg1 - result of logic
//             state.set(f => userId, true);
//             // or
//             efAction0(userId);
//             efAction2(userId);
//             efAction3(userId);
//         })
//     .on(
//         "edit",
//         (user) => (arg) => {
//             if (user.isHidden) {
//                 return;
//             }
//             redirect(`/user/${user.id}`);
//         });
// userPrimitive.hide("asd");
// userPrimitive.edit();
//# sourceMappingURL=primitiveApi.js.map
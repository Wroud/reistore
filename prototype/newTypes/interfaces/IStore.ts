import { IGetNode } from "./INode";

export interface IStore {
    getModel<TValue>(node: IGetNode<any, TValue>): TValue;
}

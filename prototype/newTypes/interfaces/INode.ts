import { IMetaDescriptor } from "./IMetaDescriptor";
import { INodeResult } from "./INodeResult";
import { IStore } from "./IStore";

export enum NodeType {
    field,
    computed,
    node,
    array,
    map,
    reference
}

export interface INode {
    name?: string;
    type: NodeType;
    root: INode;
    parent?: INode;
    chain: INode[];
    meta<T>(
        key: IMetaDescriptor<T>,
        value?: T
    ): T;
}
export interface IGetNode<TModel, TValue> extends INode {
    root: INode;
    parent?: IGetNode<any, TModel>;
    get(
        store: IStore,
        value: INodeResult<TModel>,
        args?: Map<INode, any>
    );
}
export interface ISetNode<TModel, TValue> extends IGetNode<TModel, TValue> {
    set(
        model: TModel,
        value: TValue | undefined,
        args?: Map<INode, any>
    );
    setMultiple(
        model: TModel,
        value: TValue[],
        args?: Map<INode, any>
    );
}

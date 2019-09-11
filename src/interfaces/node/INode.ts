import { INodeUndo } from "./INodeUndo";
import { NodeType } from "./NodeType";

export interface INode<TParent extends INode<any>> {
    type: NodeType;
    name?: string | number | symbol;
    root: INode<any>;
    parent?: TParent;
    chain: Array<INode<any>>;

    in(
        node: INode<any>,
        strict: boolean
    ): boolean;

    create(
        type?: NodeType,
        name?: string | number | symbol
    ): INode<this>;
}

export type NodeArgsMap = Map<INode<any>, any>;

export interface IGetNode<
    TParent extends INode<any>,
    TSource,
    TValue
    >
    extends INode<TParent> {
    defaultValue?: () => TValue;

    get(
        object: TSource,
        args?: NodeArgsMap
    ): TValue | undefined;

    getMultiple(
        object: TSource,
        args?: NodeArgsMap
    ): Array<TValue | undefined>;
}

export type NodeValue<TValue> = TValue | ((value: TValue | undefined) => TValue | null) | null;
export interface ISetNode<
    TParent extends INode<any>,
    TSource,
    TValue
    >
    extends IGetNode<TParent, TSource, TValue> {

    set(
        state: TSource,
        value: NodeValue<TValue>,
        args?: NodeArgsMap
    ): INodeUndo<this, TValue>;
    setMultiple(
        state: TSource,
        value: NodeValue<TValue>,
        args?: NodeArgsMap
    ): INodeUndo<this, TValue[]>;
}

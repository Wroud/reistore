import { INode, NodeType } from "../interfaces/node";

export class Node<TParent extends INode<any, TRoot>, TRoot> implements INode<TParent, TRoot> {
    name?: string | number | symbol;
    type: NodeType;
    root: INode<any, TRoot>;
    parent?: TParent;
    chain: Array<INode<any, TRoot>>;

    constructor(
        type: NodeType = NodeType.node,
        name?: string | number | symbol,
        parent?: TParent
    ) {
        this.name = name;
        this.type = type;
        this.parent = parent;
        if (parent) {
            this.root = parent.root;
            this.chain = [...parent.chain, this];
        } else {
            this.root = this;
            this.chain = [this];
        }
    }

    create(
        type: NodeType = NodeType.node,
        name?: string | number | symbol
    ): INode<this, TRoot> {
        return new Node(type, name, this);
    }

    in(
        node: INode<any, TRoot>,
        strict: boolean
    ): boolean {

        if (this === node) {
            return true;
        }
        if (
            strict
            || this.chain.length < node.chain.length
            || this.chain[node.chain.length - 1] !== node
        ) {
            return false;
        }
        return true;
    }
}

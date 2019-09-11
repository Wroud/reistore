import { IMetaDescriptor } from "./interfaces/IMetaDescriptor";
import { INode, NodeType } from "./interfaces/INode";

export class Node implements INode {
    name?: string;
    type: NodeType;
    parent?: INode;
    chain: INode[];

    constructor(
        type: NodeType = NodeType.node,
        name?: string,
        parent?: INode
    ) {
        this.name = name;
        this.type = type;
        this.parent = parent;
        this.chain = parent
            ? [...parent.chain, this]
            : [this];
    }

    get root() {
        return this.chain[0];
    }

    create(
        type: NodeType = NodeType.node,
        name?: string
    ): INode {
        return new Node(type, name, this);
    }

    meta<T>(key: IMetaDescriptor<T>, value?: T | undefined): T {
        throw new Error("Method not implemented.");
    }

    in(
        node: INode,
        strict: boolean
    ): boolean {

        if (this === node) {
            return true;
        }
        if (
            strict
            || this.root !== node.root
            || this.chain.length < node.chain.length
            || this.chain[node.chain.length - 1] !== node
        ) {
            return false;
        }
        return true;
    }
}

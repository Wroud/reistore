import { IGetNode, INode, INodeUndo, ISetNode, NodeType, NodeValue } from "../interfaces/node";
import { ISubscriber } from "../interfaces/subscription/ISubscriber";
import { Node } from "./Node";

export class RelationshipNode<
    TRelation extends IGetNode<any, TRoot, TRoot, Map<TKey, TValue>>,
    TParent extends INode<any, TRoot>,
    TRoot extends object | any[] | Map<any, any>,
    TKey,
    TValue
    >
    extends Node<TParent, TRoot>
    implements ISetNode<TParent, TRoot, ISubscriber<TRoot>, TValue> {
    defaultValue?: () => TValue;
    relationship: TRelation;
    id: string | number | symbol;
    relationId?: string | number | symbol;

    constructor(
        type: NodeType = NodeType.node,
        relationship: TRelation,
        id: string | number | symbol,
        relationId?: string | number | symbol,
        name?: string | number | symbol,
        parent?: TParent,
        defaultValue?: () => TValue
    ) {
        super(type, name, parent);
        this.defaultValue = defaultValue;
        this.relationship = relationship;
        this.id = id;
        this.relationId = relationId;
    }
    get(
        sub: ISubscriber<TRoot>,
        args?: Map<INode<any, TRoot>, any>
    ): TValue | undefined {
        const parent = (this.parent as any as IGetNode<any, TRoot, TRoot, any>)
            .get(sub.store.state, args);
        const map = this.relationship.get(sub.store.state);
        if (parent === undefined || map === undefined) {
            return undefined;
        }
        return map.get(parent[this.id]);
    }
    getMultiple(
        sub: ISubscriber<TRoot>,
        args?: Map<INode<any, TRoot>, any>
    ): Array<TValue | undefined> {
        const map = this.relationship.get(sub.store.state);
        if (map === undefined) {
            return [];
        }
        const parent = (this.parent as any as IGetNode<any, TRoot, TRoot, any>)
            .getMultiple(sub.store.state, args);
        return parent.map(p => map.get(p[this.id]));
    }
    set(
        state: ISubscriber<TRoot>,
        value: NodeValue<TValue>,
        args?: Map<INode<any, TRoot>, any> | undefined
    ): INodeUndo<this, TRoot, TValue> {
        throw new Error("Method not implemented.");
    }
    setMultiple(
        state: ISubscriber<TRoot>,
        value: NodeValue<TValue>,
        args?: Map<INode<any, TRoot>, any> | undefined
    ): INodeUndo<this, TRoot, TValue[]> {
        throw new Error("Method not implemented.");
    }
}

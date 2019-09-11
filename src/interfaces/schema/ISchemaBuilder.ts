import { Computed, IComputedNode, ICountainer, IGetNode, IGetNodeAccessor, INode, INodeAccessor, ISetNode, ISetNodeAccessor } from "../node";
import { ISubscriber } from "../subscription/ISubscriber";

enum AccessType {
    get,
    set
}

interface INodeDefinion<TValue, TAType extends AccessType> {
    accessType: TAType;
    defaultValue: () => TValue;
}
interface IReferenceDefinion<TValue, TAType extends AccessType>
    extends INodeDefinion<TValue, TAType> {
}
interface ISchemaDefinion<TValue, TAType extends AccessType, TDef>
    extends INodeDefinion<TValue, TAType> {
    definion: IDefinion<TValue, TDef>;
}
interface ICollectionDefinion<TValue, TAType extends AccessType, TDef, TKey, TCollection>
    extends INodeDefinion<TCollection, TAType> {
    elementDef: IDefinion<TValue, TDef>;
}
interface IComputedNodeDefinion<
    TValue,
    TAType extends AccessType,
    TArgs extends any[]
    >
    extends INodeDefinion<TValue, TAType> {
    func: Computed<ISubscriber<any>, INodeAccessor<any, any, false>, TArgs, TValue>;
}
// type MapModelToReadableDefinion<TModel> = {
//     [P in keyof TModel]: INodeDefinion<TModel[P], AccessType.get>;
// };

type SelectRefs<TModel> = {
    [P in keyof TModel]?: TModel[P] extends IReferenceDefinion<infer TValue, AccessType.set>
    ? any
    : never;
};
type SelectComputes<TModel> = {
    [P in keyof TModel]?: TModel[P] extends IComputedNodeDefinion<infer TValue, AccessType.get, infer TArgs>
    ? Computed<ISubscriber<any>, TransformToSchema<TModel, any, never>, TArgs, TValue>
    : never;
};
type MapModelToDefinion<TModel> = {
    [P in keyof TModel]: INodeDefinion<TModel[P], AccessType.set | AccessType.get>;
};
export interface IDefinionBuilder {
    field<TValue>(defaultValue?: () => TValue): INodeDefinion<TValue, AccessType.set>;
    array<TModel, TDef extends MapModelToDefinion<TModel>>(
        def: IDefinion<TModel, TDef>,
        defaultValue?: () => TModel[]
    ): ICollectionDefinion<TModel, AccessType.set, TDef, number, TModel[]>;
    array<TValue>(
        defaultValue?: () => TValue[]
    ): IDefinionCollectionCreator<number, TValue, TValue[]>;
    map<TKey, TModel, TDef extends MapModelToDefinion<TModel>>(
        def: IDefinion<TModel, TDef>,
        defaultValue?: () => Map<TKey, TModel>
    ): ICollectionDefinion<TModel, AccessType.set, TDef, TKey, Map<TKey, TModel>>;
    map<TKey, TValue>(
        defaultValue?: () => Map<TKey, TValue>
    ): IDefinionCollectionCreator<TKey, TValue, Map<TKey, TValue>>;
    definion<TModel, TDef extends MapModelToDefinion<TModel>>(
        def: IDefinion<TModel, TDef>
    ): ISchemaDefinion<TModel, AccessType.set, TDef>;
    definion<T>(): IDefinionCreator<T>;
    computed<TValue, TArgs extends any[]>(
        defaultValue?: () => TValue
    ): IComputedNodeDefinion<TValue, AccessType.get, TArgs>;
    reference<TModel>(
        def?: IDefinion<TModel, any>
    ): IReferenceDefinion<TModel, AccessType.set>;
}
interface IToRelationBuilder<TDefinion> {
    inMap<TDef>(def: IDefinion<any, TDef>): this;
}
interface IRelationBuilder<TDefinion> {
    hasOne(id?: (s: TransformToSchema<TDefinion, any, never>) => ICountainer<any>): IToRelationBuilder<TDefinion>;
}

interface IDefinion<TModel, TDefinion> {
    definion: TDefinion;
    computed(impl: SelectComputes<TDefinion>): this;
    relations<T extends SelectRefs<TDefinion>>(builder: (builder: IRelationBuilder<TDefinion>) => T): this;
}
interface IDefinionCreator<TModel> {
    create<TDef extends MapModelToDefinion<TModel>>(
        def: (s: IDefinionBuilder) => IDefinion<TModel, TDef>
    ): ISchemaDefinion<TModel, AccessType.set, TDef>;
}
interface IDefinionCollectionCreator<
    TKey,
    TValue,
    TCollection
    > {
    element(): ICollectionDefinion<TValue, AccessType.set, {}, TKey, TCollection>;
    element<TDef extends MapModelToDefinion<TValue>>(
        def: (s: IDefinionBuilder) => IDefinion<TValue, TDef>
    ): ICollectionDefinion<TValue, AccessType.set, TDef, TKey, TCollection>;
}

type MakeMultiple<T> = T extends ISetNodeAccessor<infer TNode, infer TRoot, infer TSource, infer TValue, any>
    ? ISetNodeAccessor<TNode, TRoot, TSource, TValue, true>
    : T extends IGetNodeAccessor<infer TNode, infer TRoot, infer TSource, infer TValue, any>
    ? IGetNodeAccessor<TNode, TRoot, TSource, TValue, true>
    : T;

export interface IElementCountainer<
    TNode extends INode<any, TRoot>,
    TRoot,
    TKey,
    TValue,
    TDef
    >
    extends ICountainer<TNode> {
    <
        TA extends TKey | TKey[],
        TAccessor extends IGetNodeAccessor<any, any, any, any, any>
        >(
        arg?: TA,
        next?: (
            node: TransformToSchema<TDef, TRoot, ISetNode<TNode, TRoot, TRoot, TValue>>
        ) => TAccessor
    ): TA extends TKey[] ? MakeMultiple<TAccessor> : TAccessor;
    element: TransformToSchema<TDef, TRoot, ISetNode<TNode, TRoot, TRoot, TValue>> & ISetNodeAccessor<ISetNode<TNode, TRoot, TRoot, TValue>, TRoot, TRoot, TValue, false>;
}
export type IComputedContainer<
    TNode extends INode<any, TRoot>,
    TRoot,
    TModel,
    TValue,
    TArgs extends any[]
    > =
    GetNodeType<IComputedNode<TNode, TRoot, TModel, TValue, TArgs>, TRoot, ISubscriber<TRoot>, TValue> &
    ((...args: TArgs) => GetNodeType<IComputedNode<TNode, TRoot, TModel, TValue, TArgs>, TRoot, ISubscriber<TRoot>, TValue>);

type GetNodeAccess<TAType extends AccessType, TNode extends INode<any, TRoot>, TRoot, TSource, TValue> =
    TAType extends AccessType.set
    ? ISetNode<TNode, TRoot, TRoot, TValue>
    : IGetNode<TNode, TRoot, TRoot, TValue>;

type GetNodeType<TNode extends IGetNode<any, TRoot, TSource, TValue>, TRoot, TSource, TValue> =
    TNode extends ISetNode<any, TRoot, TSource, TValue>
    ? ISetNodeAccessor<TNode, TRoot, TSource, TValue, false>
    : IGetNodeAccessor<TNode, TRoot, TSource, TValue, false>;

type TransformToSchema<T, TRoot, TNode extends INode<any, TRoot>> = {
    [P in keyof T]: T[P] extends IComputedNodeDefinion<infer TValue, infer TAType, infer TArgs>
    ? IComputedContainer<TNode, TRoot, TransformToSchema<T, TRoot, TNode>, TValue, TArgs>
    : T[P] extends ICollectionDefinion<infer TValue, infer TAType, infer TDef, infer TKey, infer TCollection>
    ? IElementCountainer<ISetNode<TNode, TRoot, TRoot, TCollection>, TRoot, TKey, TValue, TDef>
    : T[P] extends ISchemaDefinion<infer TModel, infer TAType, infer TDef>
    ? TransformToSchema<TDef, TRoot, ISetNode<TNode, TRoot, TRoot, TModel>> & GetNodeType<GetNodeAccess<TAType, ISetNode<TNode, TRoot, TRoot, TModel>, TRoot, TRoot, TModel>, TRoot, TRoot, TModel>
    : T[P] extends INodeDefinion<infer TValue, infer TAType>
    ? GetNodeType<GetNodeAccess<TAType, TNode, TRoot, TRoot, TValue>, TRoot, TRoot, TValue>
    : never;
};
interface IAvatar {
    id: string;
}
interface IUser {
    id: string;
    refererId: string;
    avatarId: string;
    name: string;
    referer: IUser;
    avatar: IAvatar;
}
interface IModel {
    field: string;
    computedField: string;
    simpleArray: number[];
    node: IUser;
    array: IUser[];
    map: Map<string, IUser>;
}

const avatarDef = createDefinion<IAvatar>()(s => ({
    id: s.field()
}));

const userDef = createDefinion<IUser>()(s => ({
    id: s.field(),
    refererId: s.field(),
    avatarId: s.field(),
    name: s.field(),
    referer: s.reference(),
    avatar: s.reference(avatarDef)
}))
    .relations(b => ({
        referer: b.hasOne(user => user.refererId),
        avatar: b.hasOne().inMap(storeDef)
    }));

const storeDef = createDefinion<IModel>()(s => ({
    field: s.field(() => "default value here"),
    simpleArray: s.array<number>().element(),
    array: s.array(userDef),
    map: s.map(userDef),
    node: s.definion(userDef),
    // inValue: s.hasOneWithMany(s => s.map, s => s.field)

    computedField: s.computed<string, [string]>()
}))
    .computed({
        computedField: (sub, current, externalArgument: string) => {
            // можно даже
            const last = sub.get(current.computedField("argument")); // получить предыдущее значение

            const field = sub.get(current.field);
            return field + externalArgument + "some";
        }
    });

const s = createSchema(storeDef);
const t3 = s.field; // s.field string
const t7 = s.computedField("argument"); // string
const t4 = s.simpleArray(0); // number
const t5 = s.array; // s.array IN[]
const t6 = s.map; // s.map Map<string, IN>
const t = s.array(1, s => s.id); // s.array[1].id
const ts = s.array([1, 2], s => s.id); // s.array[1].id
const t2 = s.map("1", s => s.id); // s.map.get("1")

function createDefinion<T>(): (<P extends MapModelToDefinion<T>>(
    schema: (s: IDefinionBuilder) => P,
    defaultValue?: () => T
) => IDefinion<T, P>) {
    return {} as any;
}
function createSchema<TModel, TDef extends MapModelToDefinion<TModel>>(definion: IDefinion<TModel, TDef>): TransformToSchema<TDef, IModel, never> {
    return {} as any;
}

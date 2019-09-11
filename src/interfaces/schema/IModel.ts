const getValue = Symbol("get");
const setValue = Symbol("set");
const nodeSymbol = Symbol("node");
const baseSymbol = Symbol("base");
const nodeContext = Symbol("context");
const isMultiple = Symbol("isMultiple");
const nodeArgs = Symbol("arguments");

interface IMetaDescriptor<T> {
    key: symbol;
    default: T;
}

function createMetaDescriptor<T>(key: symbol, def?: T): IMetaDescriptor<T> {
    return {} as any;
}
const meta = createMetaDescriptor<string>(Symbol("t"), undefined);

interface INode {
    meta<T>(
        key: IMetaDescriptor<T>,
        value?: T
    ): T;
}
interface IGetNode<TModel, TValue> extends INode {
    get(model: TModel): TValue | undefined;
    getMultiple(model: TModel): TValue[];
}
interface ISetNode<TModel, TValue> extends IGetNode<TModel, TValue> {
    set(model: TModel, value: TValue | undefined);
    setMultiple(model: TModel, value: TValue[]);
}

interface ICountainer extends IMultipleCountainer<false> {
    [nodeSymbol]: INode;
    [nodeArgs]: Map<INode, object>;
}
interface IMultipleCountainer<TMultiple extends boolean> {
    [isMultiple]: TMultiple;
}
interface IGetCountainer<TModel, TValue> extends ICountainer {
    [nodeSymbol]: IGetNode<TModel, TValue>;
}
interface IComputedCountainer<TModel, TValue, TArgs extends any[]>
    extends IGetCountainer<TModel, TValue> {
    (...args: TArgs): this;
}
interface ISetCountainer<TModel, TValue> extends IGetCountainer<TModel, TValue> {
    [nodeSymbol]: ISetNode<TModel, TValue>;
}
interface ILockCountainer<T> extends ICountainer {
    // [baseSymbol]: T;
    next<V>(next: (base: T) => V): V;
}
type CloneMultiple<T, P> = P extends IMultipleCountainer<true>
    ? T extends IMultipleCountainer<true> ? T : T & IMultipleCountainer<true>
    : T;
type LockCountainer<T> = T extends ILockCountainer<any>
    ? T
    : CloneMultiple<(T extends ISetCountainer<infer TModel, infer TValue>
        ? ISetCountainer<TModel, TValue>
        : T extends IGetCountainer<infer TModel, infer TValue>
        ? IGetCountainer<TModel, TValue>
        : never)
    & ILockCountainer<T>, T>;
interface ICollectionCountainer<
    TModel,
    TCollection,
    TNestend extends IGetCountainer<any, any>,
    TKey,
    TValue
    > extends ISetCountainer<TModel, TCollection> {
    <
        TA extends TKey | TKey[],
        TAccessor extends IGetCountainer<any, any> = TNestend
        >(
        arg?: TA | IGetCountainer<any, TA> | IMultipleCountainer<false>,
        next?: (node: TNestend extends ILockCountainer<infer P> ? P : TNestend) => TAccessor
    ): TA extends TKey[] ? (LockCountainer<TAccessor> & IMultipleCountainer<true>) : LockCountainer<TAccessor>;
    <
        TAccessor extends IGetCountainer<any, any> = TNestend
        >(
        arg?: IGetCountainer<any, TKey> & IMultipleCountainer<true> | Pattern<TValue>,
        next?: (node: TNestend extends ILockCountainer<infer P> ? P : TNestend) => TAccessor
    ): LockCountainer<TAccessor> & IMultipleCountainer<true>;
    element: TNestend;
}
type ElementType<T> = T extends Iterable<infer P> ? P : T;
type Pattern<TModel> = {
    [P in keyof TModel]?: TModel[P] | IGetCountainer<any, TModel[P]> | (IGetCountainer<any, ElementType<TModel[P]>> & IMultipleCountainer<true>);
};
type MapModel<TModel> = {
    [P in keyof TModel]: TModel[P] extends Iterable<infer V>
    ? (IGetCountainer<any, V> & IMultipleCountainer<true>) | IGetCountainer<any, TModel[P]>
    : IGetCountainer<any, TModel[P]>;
};

type ModelInterface<T> = T extends Model<infer P> ? P : never;
interface IBuilder<TModel> {
    field<TValue>(defaultValue?: () => TValue): ISetCountainer<TModel, TValue>;
    array<TValue>(
        defaultValue?: () => TValue[]
    ): ICollectionCountainer<TModel, TValue[], never, number, TValue>;
    array<TDef extends IGetCountainer<any, any>>(
        def: new () => TDef,
        defaultValue?: () => Array<ModelInterface<TDef>>
    ): ICollectionCountainer<TModel, Array<ModelInterface<TDef>>, TDef, number, ModelInterface<TDef>>;
    map<TKey, TDef extends IGetCountainer<any, any> = never>(
        def: new () => TDef,
        defaultValue?: () => Map<TKey, ModelInterface<TDef>>
    ): ICollectionCountainer<TModel, Map<TKey, ModelInterface<TDef>>, TDef, TKey, ModelInterface<TDef>>;
    computed<TValue, TArgs extends any[]>(
        calc: (sub, current, ...args: TArgs) => TValue,
        defaultValue?: () => TValue
    ): IComputedCountainer<TModel, TValue, TArgs>;
    ref<TValue, TDef>(
        def: new () => TDef,
        ref?: (ref: TDef) => TValue
    ): TValue;
}

interface IPost {
    id: string;
    title: string;

    userId: string;
    user: IUser;
}

interface ISubscription {
    userId: string;
    subscribedToId: string;

    user: IUser;
    subscribedTo: IUser;
}

interface IUser {
    id: string;
    name: string;

    subscribers: Iterable<IUser>;
    posts: Iterable<IPost>;
}

interface IStore {
    users: Map<string, IUser>;
    posts: Map<string, IPost>;
    subscriptions: ISubscription[];
}

interface IPostsFeed {
    page: number;

    postIds: string[];
    posts: Iterable<IPost>;
}

const Def = <T>() => ({} as any as IBuilder<T>);

class Model<T> implements ISetCountainer<T, T> {
    [nodeSymbol]: ISetNode<T, T>;
    [nodeArgs]: Map<INode, object>;
    [isMultiple]: false;
}

class Post extends Model<IPost> implements MapModel<IPost> {
    id = Def<IPost>().field<string>();
    title = Def<IPost>().field<string>();
    userId = Def<IPost>().field<string>();
    user = Def<IPost>().ref(Database, s => s.users(this.userId));
}

class User extends Model<IUser> implements MapModel<IUser> {
    id = Def<IUser>().field<string>();
    name = Def<IUser>().field<string>();

    subscribers = Def<IUser>().ref(Database, s => s.subscriptions({
        subscribedToId: this.id // filtering based on pattern matching
    }, s => s.user));
    posts = Def<IUser>().ref(Database, s => s.posts({
        userId: this.id
    }));
}

class Subscription extends Model<ISubscription> implements MapModel<ISubscription> {
    userId = Def<ISubscription>().field<string>();
    subscribedToId = Def<ISubscription>().field<string>();

    user = Def<ISubscription>().ref(Database, s => s.users(this.userId));
    subscribedTo = Def<ISubscription>().ref(Database, s => s.users(this.subscribedToId));
}

class PostsFeed extends Model<IPostsFeed> implements MapModel<IPostsFeed> {
    page = Def<IPostsFeed>().field<number>();
    postIds = Def<IPostsFeed>().array<string>();
    posts = Def<IPostsFeed>().ref(Database, s => s.posts(this.postIds));
}

class Database extends Model<IStore> implements MapModel<IStore> {
    users = Def<IStore>().map<string, User>(User);
    posts = Def<IStore>().map<string, Post>(Post);
    subscriptions = Def<IStore>().array(Subscription);
}

const createSchema = <T>(s: new () => T) => ({} as T);

const database = createSchema(Database);
const store = createStore();
const withContext = <T extends ICountainer, TMultiple extends boolean>(
    c: IMultipleCountainer<TMultiple>,
    p: T
): TMultiple extends true ? T & IMultipleCountainer<true> : T => ({
    [nodeSymbol]: p[nodeSymbol],
    [isMultiple]: c[isMultiple] || p[isMultiple],
    [nodeArgs]: new Map([...c[nodeArgs], ...p[nodeArgs]])
} as any);
const includeRef = <T extends ICountainer>(
    node: T,
    ...refs: Array<((n: T extends ILockCountainer<infer P> ? P : T) => ICountainer)>
) => node;

const { users, posts, subscriptions } = store.get(database);

const user = database.users("a");

const fullUser = includeRef(
    database.users(["a"]),
    u => u.posts,
    u => u.subscribers
);
const userPosts = withContext(user, database.users.element.posts);
// same as database.users("a", u => u.posts)

const subss = withContext(user, database.users.element.subscribers);

const subs = database.users("a", u => u.subscribers);
// same as database.users("a", u => u.subscribers)
// transpiles to
const ss = database.subscriptions({
    subscribedToId: database.users("a", u => u.id)
}, s => s.user);
// advanced
const ppp = database.users(
    "a",
    u => includeRef(u.subscribers, u => u.posts)
);
// load user `a` subscribers and theirs posts

const u = database.users({
    posts: database.users("a", u => u.posts)
});

store.get(user);
store.set(user, {});
store.replace(user, {});
store.meta(user);

const def = Def<IProfile>();

interface IProfile {
    firstName: string;
    lastName: string;
    fullName: string;
    message: string;
}

class Profile extends Model<IProfile> {
    firstName = def.field<string>();
    lastName = def.field<string>();
    fullName = def.computed(
        sub => sub.get(this.firstName) + sub.get(this.firstName)
    );
    message = def.computed(
        sub => "hello " + sub.get(this.fullName)
    );
}

const profile = createSchema(Profile);

function reaction(sub) {
    const value = sub.get(profile.firstName).length > 5
        ? sub.get(profile.firstName)
        : sub.get(profile.message);

    console.log(value);
}

const state = createСтейтМенеджерКоторыйЯЗаслужил({
    firstName: "Bob",
    lastName: "Memov",
    short: () => {
        console.log("S");
        return this.onlyFirstName
            ? this.firstName
            : `${this.firstName} ${this.lastName}`;
    },
    onlyFirstName: false,
    apiData: async () => {
        console.log("A");
        const data = await api.getUserData(this.firstName, this.lastName);
        return data;
    }
});

state.firstName.subscribe(() => {
    console.log("F");
});
state.short.subscribe(() => {
    console.log("U");
});
state.apiData.subscribe(() => {
    console.log("D");
});

function program() {
    state.firstName = "Max";
    state.lastName = "None";
    assert(state.short === "Max None");
    state.onlyFirstName = true;
    assert(state.short === "Max");

    assert(state.apiData === undefined);
    assert(state.meta.apiData === "fetching");
}

// SSAFUD
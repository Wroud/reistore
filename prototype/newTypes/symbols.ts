export const nodeSymbol = Symbol("node");
export const isMultiple = Symbol("isMultiple");
export const nodeArgs = Symbol("arguments");
export const nodeContext = Symbol("context");

function createEvent<T>(desc: string) { }
class Module {
    update() { }
}

interface ILogin {
    name: string;
    password: string;
}

class AuthModule extends Module {
    static events = {
        login: createEvent<ILogin>("login user"),
        logout: createEvent("logout user")
    };
    isAuthorized!: boolean;
    private refresher!: NodeJS.Timer;
    onRequest(emitter) {
        this.isAuthorized = false;
        this.refresher = setInterval(this.checkAuthorizeState, 60 * 1000);
    }
    onLogin(data: ILogin) {
        fetch("login", { body: JSON.stringify(data) })
            .then(responce => responce.json())
            .then(v => {
                this.isAuthorized = v;
                this.update();
            });
    }
    onLogout() {
        fetch("logout")
            .then(responce => responce.json())
            .then(v => {
                this.isAuthorized = false;
                this.update();
            })
            .catch();
    }
    dispose() {
        clearInterval(this.refresher);
    }
    private checkAuthorizeState = () => {
        fetch("user")
            .then(responce => responce.json())
            .then(v => {
                this.isAuthorized = v;
                this.update();
            })
            .catch();
    }
}

import {Router} from "./router.js";

class App {
    constructor() {
        this.router = new Router();
        window.addEventListener('DOMContentLoaded', this.handleRouteCharChanging.bind(this));
        window.addEventListener('popstate', this.handleRouteCharChanging.bind(this));
    }

    handleRouteCharChanging() {
        this.router.openRoute();
    }
}

(new App());
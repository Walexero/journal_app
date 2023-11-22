import { Overlay } from "../views/loginView/overlay.js";
import componentOptionsView from "../views/componentView/componentOptionsView.js";

export class Loader {

    constructor(timeout, actionType, syncMsg = false) {
        this.timeout = timeout
        this.syncMsg = syncMsg
    }

    component() {
        this._component = componentOptionsView.createHTMLElement(this._generateMarkup())


        this.overlay = new Overlay(this, true, {
            top: 40,
            left: 49
        }, true)
        this.overlay.render()
    }

    getComponent() {
        console.log("the loader comp", this._component)
        return this._component;
    }

    _generateMarkup() {
        if (this.syncMsg)
            return `
                <div>
                    <div class="custom-loader"></div>
                    <div class="loader-sync-msg">Syncing Data Please Wait ...</div>
                </div>
            `
        if (!this.syncMsg)
            return `
                <div>
                    <div class="custom-loader"></div>
                </div>
            `
    }

    remove() {
        this.overlay.remove()
        this._component.remove()
        delete this
    }
}
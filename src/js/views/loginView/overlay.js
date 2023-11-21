
import { delegateConditional } from "../../helpers.js";
import componentOptionsView from "../componentView/componentOptionsView.js";

export class Overlay {
    _eventListeners = ["click", "keyup"]

    constructor(contentComponent, disableEvents = false, position = undefined, extraClassName = false) {
        this.contentComponent = contentComponent
        this.positionEl = document.querySelector("body");
        this.position = position
        this.extraClassName = extraClassName
        this._component = this.component()
        this.disableEvents = disableEvents
    }

    component() {
        this._component = componentOptionsView.createHTMLElement(this._generateMarkup())
        this.overlay_bkg = this._component.querySelector(".login-overlay")
        const overlayContent = this._component.querySelector(`${this.extraClassName ? ".form-container-above" : ".form-container"}`)

        //change content position based on defined params
        if (this.position) this._modifyPosition(this.position, overlayContent)

        overlayContent.insertAdjacentElement("beforeend", this.contentComponent.getComponent())
        return this._component
    }

    render() {
        const cls = this;
        this.positionEl.insertAdjacentElement("beforeend", this._component)

        if (!this.disableEvents) {
            this.overlay_bkg.addEventListener(cls._eventListeners[0], cls._handleEvents.bind(cls))
            window.addEventListener(cls._eventListeners[1], cls._handleEvents.bind(cls))
        }
    }

    _modifyPosition(modifyObj, node) {
        node.style.top = `${modifyObj.top}%`
        node.style.left = `${modifyObj.left}%`
    }

    _handleEvents(ev) {
        if (delegateConditional(ev, "login-overlay", "body")) this.remove()
    }

    _generateMarkup() {
        return `
            <div class="login-overlay">
                <div class="${this.extraClassName ? "overlay-content-above" : "form-container"}">
                    
                </div>
            </div>
        `
    }

    remove() {
        const cls = this;

        if (!this.disableEvents) {
            this._eventListeners.forEach(ev => {
                this.overlay_bkg.removeEventListener(ev, cls._handleEvents)
                window.removeEventListener(ev, cls._handleEvents)
            })
            //remove content component
            this.contentComponent.remove(true)
        }
        this._component.remove()


        delete this;
    }

}
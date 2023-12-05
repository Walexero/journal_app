import { delegateConditional } from "../../helpers.js";
import { importComponentOptionsView } from "../componentView/componentOptionsView.js";
export class Overlay {
    _eventListeners = ["click", "keyup"]
    _componentHandler = importComponentOptionsView.cls

    constructor(contentComponent, disableEvents = false, position = undefined, extraClassName = false) {
        this.contentComponent = contentComponent
        this.positionEl = document.querySelector("body");
        this.position = position
        this.extraClassName = extraClassName
        this._component = this.component()
        this.disableEvents = disableEvents
    }

    component() {
        this._component = this._componentHandler.createHTMLElement(this._generateMarkup())
        // this.overlay = this._component.querySelector(".login-overlay")

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
            this._component.addEventListener(cls._eventListeners[0], cls._handleEvents.bind(cls))
            window.addEventListener(cls._eventListeners[1], cls._handleEvents.bind(cls))
        }
    }

    _modifyPosition(modifyObj, node) {
        node.style.top = `${modifyObj.top}%`
        node.style.left = `${modifyObj.left}%`
    }

    _handleEvents(ev) {
        if (delegateConditional(ev, "login-overlay-bkg", "body")) this.remove()
        if (delegateConditional(ev, "close-form", "body")) this.remove()
    }

    _generateMarkup() {
        return `
            <div class="login-overlay">
                <div class="login-overlay-bkg"></div>
                <div class="${this.extraClassName ? "form-container-above" : "form-container"}">
                    
                </div>
            </div>
        `
    }

    remove() {
        const cls = this;

        if (!this.disableEvents) {
            this._eventListeners.forEach(ev => {
                this._component.removeEventListener(ev, cls._handleEvents)
                window.removeEventListener(ev, cls._handleEvents)
            })
            //remove content component
            this.contentComponent.remove(true)
        }
        this._component.remove()


        delete this;
    }

}
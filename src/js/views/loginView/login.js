import { Form } from "./form.js"
import { Overlay } from "./overlay.js"
import { delegateMatch } from "../../helpers.js"

class Login {

    _listenerNodes = []

    _eventListeners = ["click", "keyup"]

    _children = []


    pass() { }

    updateListenerNodeState(node, handler, temp = false) {
        const nodeExists = this._listenerNodes.find(listenerNode => listenerNode.node === node)
        if (nodeExists) return;

        const nodeObj = {}
        nodeObj.node = node
        nodeObj.ev = this._eventListeners
        nodeObj.handler = handler
        nodeObj.temp = temp
        this._listenerNodes.push(nodeObj)
    }

    addEventListeners(controlHandler) {
        //handler that gets called on login
        this.controlHandler = controlHandler.bind(this, this.remove.bind(this));

        const cls = this;
        const loginBtns = document.querySelectorAll(".cta-btn")

        //each node should return self
        loginBtns.forEach(btn => {
            this._eventListeners.forEach(ev => btn.addEventListener(ev, this._handleEvents.bind(cls)))
            this.updateListenerNodeState(btn, this._handleEvents)

        })
    }

    _handleEvents(ev) {
        ev.stopPropagation();
        //login ev
        if (delegateMatch(ev, "cta-btn")) this.handleAuth(ev.target.textContent.trim().toLowerCase())
        //reset ev
        if (delegateMatch(ev, "btn-reset")) this.handleAuth("reset")
    }

    handleAuth(authType) {
        this._removeChildren()
        this._generateAuthComponent(authType)
        this.form.component()

        //add event to temp node
        if (authType === "login") this._insertTempNodeToComponent(this.form.getComponent().querySelector(".btn-reset"), "click")

        this._overlay = new Overlay(this.form)
        this._children.push(this._overlay)
        this._overlay.render()
    }

    _handleResetCallBack() {
        this._removeChildren()
        this.remove(true)
        // this._reRenderComponentContent("login")
    }

    _generateAuthComponent(authType) {
        this._removeChildren()

        if (this.form) this.form.remove(true)

        this.form = Form.form(authType)

        //add control handler to form
        this.form.addControlHandler(this._getFormCallBack(authType))


        this._children.push(this.form)
    }

    _reRenderComponentContent(authType) {
        this._generateAuthComponent(authType)
    }

    _getFormCallBack(authType) {
        if (authType === "reset") return this._handleResetCallBack.bind(this)
        return this.controlHandler
    }

    getComponent() {
        return this._component
    }

    component(formComponent, cls) {
        return this._component
    }

    _insertTempNodeToComponent(tempNode, eventType = false) {
        const cls = this;
        if (eventType) tempNode.addEventListener(eventType, cls._handleEvents.bind(cls))
        if (!eventType) this._eventListeners.forEach(ev => tempNode.addEventListener(ev, cls._handleEvents.bind(cls)))

        this.updateListenerNodeState(tempNode, cls._handleEvents, true)
    }

    _removeTempNodes() {
        const cls = this;
        const tempNodes = []
        this._listenerNodes.forEach((node, i) => node.temp === true ? tempNodes.push([node, i]) : this.pass())
        tempNodes.forEach((node, i) => {
            node[0].ev.forEach(nodeEv => node[0].node.removeEventListener(nodeEv, cls._handleEvents))
            node[0].node.remove(true)
            tempNodes.splice(i, 1)
            this._listenerNodes.splice(node[1], 1)
        })
    }

    _removeResetActive() {
        this._component.classList.remove("reset-active")
    }

    _removeChildren() {
        for (let i = this._children.length - 1; i > -1; i--) {
            this._children[i].remove(true)
            this._children.splice(i, 1)
        }
    }

    remove(children = false) {
        if (children) this._removeChildren()

        if (!children) {
            this._listenerNodes.forEach(listenerNode => {
                listenerNode.ev.forEach(e =>
                    listenerNode.node.removeEventListener(e, listenerNode.handler)
                )
            })
            this._removeChildren()
            this._removeTempNodes()

            delete this;
        }
    }
}

export default new Login();
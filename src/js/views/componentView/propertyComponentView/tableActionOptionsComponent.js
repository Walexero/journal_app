import PropertyOptionsComponent from "./propertyOptionsComponent";
import { TABLE_ACTION_OPTIONS } from "../../../config";
import { importComponentOptionsView } from "../componentOptionsView";
import tableActionsProcessorView from "../../tableActionsProcessorView";

export class TableActionOptionsComponent extends PropertyOptionsComponent {
    _componentHandler = importComponentOptionsView.object;
    _state;
    _events = ["click"];

    constructor(state) {
        super()
        this._state = state;
    }

    render() {
        const cls = this;
        this._state.markup = this._generateMarkup(TABLE_ACTION_OPTIONS.properties, "table-head-actions", false)
        const { overlay, overlayInterceptor, component } = this._componentHandler._componentOverlay(this._state)

        this._state = { ...this._state, overlay, overlayInterceptor, component }

        //overlay component handles its event
        overlayInterceptor.addEventListener(
            "click",
            function (e) {
                cls._componentHandler._componentRemover(cls._state);
            },
            { once: true }
        );

        //component handles its event
        this._events.forEach((ev) => {
            component.addEventListener(ev, this._handleEvents.bind(cls));

        });
    }

    _handleEvents(e) {
        //route events to the parent component
        tableActionsProcessorView.matchEvent(e, this.remove.bind(this))
    }

    remove() {
        const cls = this;
        this._state?.overlayInterceptor?.click()
        this._events.forEach(ev => this._state?.component?.removeEventListener(ev, cls._handleEvents, true
        ))
    }


}
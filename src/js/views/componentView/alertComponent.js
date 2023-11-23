// import componentOptionsView from "./componentOptionsView.js";
import { importComponentOptionsView } from "./componentOptionsView.js";
import { timeoutWithoutPromise } from "../../helpers.js";

export default class alertComponent {
  _componentHandler = importComponentOptionsView.object;
  _state;
  _events = [];

  constructor(state) {
    this._state = state;
  }

  _generateMarkup(alertMsg) {
    return `
        <div class="alert-box">
            <div class="alert-msg">
              ${alertMsg}
            </div>
        </div>
    `;
  }

  render() {
    const cls = this;

    this._state.markup = this._generateMarkup(this._state.alertMsg);

    this._state.component = componentOptionsView._componentRender(this._state);

    timeoutWithoutPromise(5, cls.remove.bind(cls));
  }

  remove() {
    const cls = this;
    this._events.forEach((ev) =>
      this._state.component.removeEventListener(ev, cls._handleEvents, true)
    );
    this._state.component.remove();
    // delete this;
  }
}

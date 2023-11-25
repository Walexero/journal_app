// import componentOptionsView from "./componentOptionsView.js";
import { importComponentOptionsView } from "./componentOptionsView.js";
import { componentGlobalState } from "./componentGlobalState.js";
export default class TableInputComponent {
  _componentHandler = importComponentOptionsView.object;
  _state;
  _events = ["keydown"];

  constructor(state) {
    this._state = state;
  }

  _generateMarkup() {
    return `
      <div class="row-actions-text-input" contenteditable="true"></div>
    `;
  }

  render() {
    const cls = this;
    this._state.markup = this._generateMarkup();
    const {
      overlay,
      overlayInterceptor,
      component: componentInput,
    } = this._componentHandler._componentOverlay(this._state);

    this._state = {
      ...this._state,
      overlay,
      overlayInterceptor,
      componentInput,
    };

    this._handleUpdateModelIfFilterActive();

    //overlay component handles its event
    overlayInterceptor.addEventListener(
      "click",
      function (e) {
        cls._componentHandler._componentRemover(cls._state);
      },
      { once: true }
    );

    //render existing text in text container into input
    if (this._state.table.textContent.length > 0)
      this._state.componentInput.textContent =
        this._state.component.textContent;

    //component handles its event
    this._events.forEach((ev) => {
      componentInput.addEventListener(ev, this._handleEvents.bind(cls));
    });
  }

  _handleEvents(e) {
    //listen for enter from the textinput
    if (e.key === "Enter") {
      //adds the filter to be used when updating the item
      this._handleUpdateModelIfFilterActive();

      this._componentHandler._componentRemover(this._state);
    }
  }

  _handleUpdateModelIfFilterActive() {
    debugger;
    const updateModel = this._state.updateModel.bind(
      null,
      componentGlobalState.filterMethod,
      componentGlobalState.sortMethod,
      "title" //add the payload type
    );

    this._state.updateModel = updateModel;
  }
}

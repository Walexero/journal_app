import componentOptionsView from "../componentOptionsView.js";
import svgMarkup from "../../../helpers.js"

export default class TableFilterDeleteComponent {
  _componentHandler = componentOptionsView;
  _state;
  _events = ["click"];

  constructor(state) {
    this._state = state;
  }

  _generateMarkup() {
    return `
        <div class="filter-input-option-option">
            <div class="filter-option-option">
              <div
                class="filter-option-action filter-option-delete hover"
              >
                <div class="filter-option-icon">
                  ${svgMarkup("filter-icon icon-md nav-icon-active", "trashcan-icon")}
                </div>
                <div class="filter-option-text">Delete Filter</div>
              </div>
            </div>
        </div>
    `;
  }

  render() {
    const cls = this;
    this._state.markup = this._generateMarkup();

    const { overlay, overlayInterceptor, component } =
      this._componentHandler._componentOverlay(this._state);

    this._state = { ...this._state, overlay, overlayInterceptor, component };

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
    if (this._deleteFilterRuleMatchStrategy(e))
      this._handleDeleteFilterRuleEvent(e);
  }

  _deleteFilterRuleMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("filter-option-delete") ||
      e.target.closest(".filter-option-delete");

    return matchStrategy;
  }

  _handleDeleteFilterRuleEvent(e) {
    this._state.component.remove();
    this._state.overlay.remove();
    this._state.removeAncestors.forEach((removeAncestor) => removeAncestor());
  }
}

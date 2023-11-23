// import componentOptionsView from "../componentOptionsView.js";
import { importComponentOptionsView } from "../componentOptionsView.js";
import { componentGlobalState } from "../componentGlobalState.js";
import optionActionComponent from "./optionActionComponent.js";
import { TABLE_SORT_TYPE } from "../../../config.js";
import { svgMarkup } from "../../../helpers.js";

export default class TableSortRuleOptionActionComponent extends optionActionComponent {
  _componentHandler = importComponentOptionsView.object;
  _state;
  _events = ["click"];

  constructor(state) {
    super();
    this._state = state;
  }

  pass() { }

  _generateActionSelectOption(options) {
    let markup = "";
    options.forEach((option) => {
      markup += `
        <div class="filter-option-action filter-option-${option.text.toLowerCase()} hover">
          <div class="filter-option-icon">
            ${svgMarkup("filter-icon icon-md icon-active", `${option.icon}`)}
          </div>
          <div class="filter-option-text">${option.text}</div>
        </div>
    `;
    });
    return markup;
  }

  render() {
    const cls = this;

    const componentMarkup = this._generateActionSelectOption(TABLE_SORT_TYPE);

    this._state.markup = this._generateMarkup(componentMarkup);

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
    if (this._sortRuleMatchStrategy(e)) this._handleSortRuleEvent(e);
  }

  _sortRuleMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("filter-option-action ") ||
      e.target.closest(".filter-option-action ");

    return matchStrategy;
  }

  _handleSortRuleEvent(e) {
    let filteredTableItems;
    const sortType = e.target?.textContent.trim();

    const sortEvent = new CustomEvent("sort", {
      detail: {
        sortType: sortType,
        optionObj: this,
      },
    });
    this._state.parentState.component.dispatchEvent(sortEvent);
    this._setSortTypeSelectValue(sortType);
  }

  _setSortTypeSelectValue(value) {
    const sortTypeContainer = document.querySelector(
      ".sort-type-options-box .action-filter-text"
    );
    sortTypeContainer.textContent = value;
  }

  _resetGlobalStateFilterTagActive() {
    componentGlobalState.filterTagOptionActive = false;
  }

  remove() {
    this._state.overlay.remove();
    this._state.component.remove();
  }
}

import { importComponentOptionsView } from "../componentOptionsView.js";
import { componentGlobalState } from "../componentGlobalState.js";
import { TableFuncMixin } from "./tableFuncMixin.js";

export default class TableFilterPrepositionComponent {
  _componentHandler = importComponentOptionsView.object;
  _state;
  _events = ["click"];

  constructor(state) {
    this._state = state;
  }

  _generatePrepositionBoxMarkup(preposition) {
    return `
        <div class="action-filter-content">
            <div class="action-filter-text">${preposition.condition}</div>
        </div>
    `;
  }

  _generateMarkup(prepositions) {
    const prepositionsMarkup = prepositions
      .map((preposition) => this._generatePrepositionBoxMarkup(preposition))
      .join("");

    return `
        <div class="filter-pre-action--options component-options">
          <div class="filter-options">
            <div class="filter-pre-filter--option">
              <div class="filter-content-box">
                <div class="filter-content">
                  <div class="add-action-filters">
                    ${prepositionsMarkup}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    `;
  }

  render() {
    const cls = this;

    this._state.markup = this._generateMarkup(this._state.conditional);

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
    if (this._prepositionSelectMatchStrategy(e))
      this._handlePrepositionSelectEvent(e);
  }

  _prepositionSelectMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("action-filter-content") ||
      e.target.closest(".action-filter-content");
    return matchStrategy;
  }

  _handlePrepositionSelectEvent(e) {
    const prepositionRemovesFilterInput = ["Is empty", "Is not empty"];

    const prepositionContainer = document.querySelector(
      ".filter-input-filter-text"
    );

    const filterRuleInput = document.querySelector(".filter-input-container");
    const selectedPreposition = e.target.closest(".action-filter-content");
    const selectPrepositionValue = selectedPreposition.textContent
      .replace("\n", "")
      .trim();

    //update the parent state
    this._state.parentState.preposition = selectPrepositionValue;

    const removeFilterInput = prepositionRemovesFilterInput.find(
      (prep) => prep.toLowerCase() === selectPrepositionValue.toLowerCase()
    );

    console.log("the filter tag list comp glob", componentGlobalState.filterTagList)

    const filterInputToExecute =
      this._state.property.text.toLowerCase() === "tags"
        ? componentGlobalState.filterTagList
        : this._state.inputValue;

    prepositionContainer.textContent = selectPrepositionValue;
    //remove filter input if preposition doesn't require it
    if (!removeFilterInput && !filterRuleInput) {
      this._state.generateInput();
    }

    if (!removeFilterInput && filterRuleInput) {
      this._state.executeFilter(filterInputToExecute);
    }

    if (removeFilterInput && filterRuleInput) {
      //clear the filteredTagList from the global component state
      componentGlobalState.filterTagList.length = 0;

      filterRuleInput.remove();
      this._state.parent._handleEvents(e, null, true);
    }

    if (removeFilterInput && !filterRuleInput) {
      //clear the filteredTagList from the global component state
      componentGlobalState.filterTagList.length = 0;
      // this._state.executeFilter(null);
      this._state.parent._handleEvents(e, null, true);
    }

    this._state.component.remove();
    this._state.overlay.remove();
  }
}

import { importComponentOptionsView } from "../componentOptionsView.js";
import tagOptionComponent from "../tagsOptionComponent.js";
import { componentGlobalState } from "../componentGlobalState.js";
import optionActionComponent from "./optionActionComponent.js";
import { svgMarkup } from "../../../helpers.js";

export default class TableFilterRuleOptionActionComponent extends optionActionComponent {
  _componentHandler = importComponentOptionsView.object;
  _state;
  _events = ["click"];

  constructor(state) {
    super();
    this._state = state;
  }

  _generateTagsSelectOption() {
    return `
      <div class="filter-option-action filter-option-tags hover">
        <div class="filter-option-icon">
          ${svgMarkup("filter-icon icon-md nav-icon-active", "list-icon")}
        </div>
        <div class="filter-option-text">Select Tags</div>
      </div>
    `;
  }

  _generateFilterDeleteMarkup() {
    return `
      <div
      class="filter-option-action filter-option-delete hover">
        <div class="filter-option-icon">
          ${svgMarkup("filter-icon icon-md nav-icon-active", "trashcan-icon")}
        </div>
        <div class="filter-option-text">Delete Filter</div>
      </div>
    `;
  }

  _generateMarkup() {
    const tagsSelectMarkup =
      this._state.property?.text.toLowerCase() === "tags"
        ? this._generateTagsSelectOption()
        : "";

    return `
        <div class="filter-input-option-option">
            <div class="filter-option-option">
              <div
                class="filter-option-action filter-option-delete hover"
              >
                <div class="filter-option-icon">
                  ${svgMarkup(
      "filter-icon icon-md nav-icon-active",
      "trashcan-icon"
    )}
                </div>
                <div class="filter-option-text">Delete Filter</div>
              </div>
              ${tagsSelectMarkup}
            </div>
        </div>
    `;
  }

  render() {
    const cls = this;
    const componentMarkup =
      this._generateFilterDeleteMarkup() +
      (this._state.property?.text.toLowerCase() === "tags"
        ? this._generateTagsSelectOption()
        : "");
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
    if (this._deleteFilterRuleMatchStrategy(e))
      this._handleDeleteFilterRuleEvent(e);

    if (this._tagSelectMatchStrategy(e)) this._handleTagSelectEvent(e);
  }

  _deleteFilterRuleMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("filter-option-delete") ||
      e.target.closest(".filter-option-delete");

    return matchStrategy;
  }

  _tagSelectMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("filter-option-tags") ||
      e.target.closest(".filter-option-tags");

    return matchStrategy;
  }

  _handleDeleteFilterRuleEvent(e) {
    const cls = this
    this._state.component.remove();
    this._events.forEach((ev) =>
      this._state.component.removeEventListener(ev, cls._handleEvents, true)
    );
    this._state.overlay.remove();
    this._state.removeAncestors.forEach((removeAncestor) => removeAncestor());
    componentGlobalState.filterTagList = [];
  }

  _handleTagSelectEvent(e) {
    const tagViewportHolder = e.target.closest(".filter-input-option-option");

    let { top, left, width, height } =
      tagViewportHolder.getBoundingClientRect();

    const queryPositioner = window.matchMedia("(max-width: 500px)")
    if (queryPositioner.matches) left = `${parseInt(left) - 50}`

    const componentObj = {
      table: tagViewportHolder,
      top,
      left,
      width,
      height,
      selector: ".options-markup",
      updateModel: null,
      subComponentCallback: null,
      updateTag: null,
      updateObj: null,
      tags: componentGlobalState.tags,
      tagsColors: componentGlobalState.tagsColor,
      disableInput: true,
      callBack: this._resetGlobalStateFilterTagActive.bind(this),
      disableOptionsNudge: true,
    };

    const component = new tagOptionComponent(componentObj);

    //notify the global component state of active TagOption
    componentGlobalState.filterTagOptionActive = true;

    //remove the options from the filterRule
    this._state.component.remove();
    this._state.overlay.remove()
    component.render();
  }

  _resetGlobalStateFilterTagActive() {
    componentGlobalState.filterTagOptionActive = false;
  }
}

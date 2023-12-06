import { importComponentOptionsView } from "../componentOptionsView.js";
import { importTableComponentView } from "../../tableComponentView.js";
import {
  PREPOSITIONS,
  FILTER_RULE_CONTAINER_TOP_DIFF,
} from "../../../config.js";
import tableFilterPrepositionComponent from "./tableFilterPrepositionComponent.js";
import tableFilterRuleOptionActionComponent from "./tableFilterRuleOptionActionComponent.js";
import { componentGlobalState } from "../componentGlobalState.js";
import { importSignals } from "../../../signals.js";
import { svgMarkup, capitalize } from "../../../helpers.js";
import { TableFuncMixin } from "./tableFuncMixin.js";
export default class TableFilterRuleComponent {
  _componentHandler = importComponentOptionsView.object;
  _state;
  _events = ["click", "keyup"];
  _signals = importSignals.object
  _mixinActive = false

  constructor(state) {
    this._state = state;
  }

  _generateNameInput(inpVal = "") {
    return `
      <input
      type="text"
      class="filter-value component-form"
      placeholder="Type a Value..."
      value="${inpVal ? inpVal : ""}"
      />
    `;
  }

  _generateTagsInput(inpVal = "") {
    let tagsMarkup = "";

    if (Array.isArray(inpVal) && inpVal.length > 0)
      tagsMarkup = inpVal
        .map((val) => componentGlobalState.tagItemMarkupFactory(val, true))
        .join("");

    return `
      <div
        contenteditable="false"
        class="filter-value-tags"
        aria-placeholder="Add Tags To Filter By"
      >
      ${tagsMarkup}
      </div>
    `;
  }

  _generateFilterInput(inpVal = "", property) {
    const inputMarkup =
      property.toLowerCase() === "tags"
        ? this._generateTagsInput(inpVal)
        : this._generateNameInput(inpVal);
    return `
      <div class="filter-input-container">
        ${inputMarkup}
      </div>
    `;
  }

  _generateMarkup(conditional, inpVal, property) {
    const removeFilterInput = ["Is empty", "Is not empty"];
    const filterInputMarkup =
      this._state?.removeFilterInput ||
        removeFilterInput.find(
          (filter) => filter.toLowerCase() === conditional?.toLowerCase()
        )
        ? ""
        : this._generateFilterInput(inpVal, property);

    return `
      <div class="filter-rule-input-box">
        <div class="filter-input-content">
          <div class="filter-input-content-box">
            <div class="filter-input-text">${property}</div>
            <div class="filter-input-filter hover">
              <div class="filter-input-filter-text">
                ${conditional.condition ?? capitalize(conditional)}
              </div>
              <div class="added-rule-icon">
                ${svgMarkup(
      "filter-addeed-icon icon-sm nav-icon-active",
      "arrow-down"
    )}
              </div>
            </div>
            <div class="div-filler"></div>
            <div class="filter-input-option hover">
              ${svgMarkup(
      "filter-added-icon icon-md nav-icon-active",
      "ellipsis"
    )}
            </div>
          </div>
          ${filterInputMarkup}
          
        </div>
      </div>
    `;
  }

  render() {
    // debugger;
    if (!this._mixinActive) this._addMixin()
    const cls = this;
    this._state.conditional = PREPOSITIONS.filter(
      (preposition) =>
        preposition[this._state.property.text.toLowerCase()] === true
    );

    const inputValue =
      this._state.property.text.toLowerCase() !== "tags"
        ? this._state.parentState.inputValue
        : componentGlobalState.filterTagList;

    // const fnActive = this._checkTableFuncActive("filter")

    // if (!fnActive) {
    this._state.markup = this._generateMarkup(
      this._state.parentState.conditional ??
      this._state.conditional[0].condition,
      inputValue,
      this._state.property.text
    );

    //set parent state conditional value if it doesn't exist
    this._setConditional()

    //disables the click interceptor|Allows click to be detected in background
    // this._state.disableOverlayInterceptor = true;

    const { overlay, overlayInterceptor, component } =
      this._componentHandler._componentOverlay(
        this._state,
        // this._state.disableOverlayInterceptor
      );

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

    //register for events from tag Options
    this._signals.subscribe({ component: this, source: ["tagadd"] });
  }

  _insertFilterRuleInput() {
    const filterRuleInputParentContainer = document.querySelector(
      ".filter-input-content-box"
    );

    filterRuleInputParentContainer.insertAdjacentHTML(
      "afterend",
      this._generateFilterInput(null, this._state.property.text)
    );
  }

  _handleEvents(e, signals = false, childEvent = false) {
    if (!signals) {
      if (this._prepositionSelectMatchStrategy(e))
        this._handlePrepositionSelectEvent(e);

      if (this._filterRuleInputMatchStrategy(e))
        this._handleFilterRuleInputEvent(e);

      if (this._filterRuleOptionMatchStrategy(e))
        this._handleFilterRuleOptionEvent(e);

      if (this._filterRuleRemoveTagMatchStrategy(e))
        this._handleFilterRuleRemoveTagEvent(e);
    }

    if (childEvent) {
      this._handleFilterRuleWithoutInputEvent(e);
    }

    if (signals) {
      this._handleFilterRuleTagAdd(e);
    }
  }

  _itemAddFilterChecker(e) {
    if (e.type === "click") {
      if (
        e.target.classList.contains("row-adder-filter") ||
        e.target.closest(".row-adder-filter")
      )
        return true;
    }
  }

  _prepositionSelectMatchStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("filter-input-filter") ||
        e.target.closest(".filter-input-filter");
      return matchStrategy;
    }
  }

  _filterRuleInputMatchStrategy(e) {
    if (e.type === "keyup") {
      const matchStrategy =
        e.target.classList.contains("filter-value") ||
        e.target.closest(".filter-input-container");
      return matchStrategy;
    }
  }

  _filterRuleOptionMatchStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("filter-input-option") ||
        e.target.closest(".filter-input-option");
      return matchStrategy;
    }
  }

  _filterRuleRemoveTagMatchStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("row-tag-icon") ||
        e.target.closest(".row-tag-icon");
      return matchStrategy;
    }
  }

  _handlePrepositionSelectEvent(e) {
    const prepositionContainer = document.querySelector(
      ".filter-input-content"
    );

    const { top, left, width, height } =
      prepositionContainer.getBoundingClientRect();

    const componentObj = {
      top:
        this._state.property.text.toLowerCase() !== "tags"
          ? `${parseInt(top) - FILTER_RULE_CONTAINER_TOP_DIFF}`
          : `${parseInt(top) - 120}`,
      left,
      width,
      height,
      conditional: this._state.conditional,
      property: this._state.property,
      selector: ".filter-pre-action--options",
      parentState: this._state,
      generateInput: this._insertFilterRuleInput.bind(this),
      executeFilter: this._executeFilterRule.bind(this),
      inputValue: this._state.parentState.inputValue,
      parent: this,
    };

    const component = new tableFilterPrepositionComponent(componentObj);
    component.render();
  }

  _handleFilterRuleOptionEvent(e) {
    const filterRuleOptionNudge = e.target.closest(".filter-input-option");

    const { top, left, width, height } =
      filterRuleOptionNudge.getBoundingClientRect();

    const componentObj = {
      top,
      left: `${parseInt(left) + 20}`,
      width,
      height,
      selector: ".filter-input-option-option",
      property: this._state.property,
      removeAncestors: [
        this._state.parent.remove.bind(this._state.parent),
        this.remove.bind(this),
      ],
    };

    const component = new tableFilterRuleOptionActionComponent(componentObj);
    component.render();
  }

  _handleFilterRuleInputEvent(e) {
    const filterRuleBoxRuleAdded = document.querySelector(".filter-added-rule");
    const filterRuleInput = e.target.closest(".filter-value");

    //add the input value as the current filter
    filterRuleBoxRuleAdded.textContent = filterRuleInput.value;

    if (!filterRuleInput.value.length > 0) return;

    const filterInputValue = filterRuleInput.value.trim().toLowerCase();

    //adds input Value to parent state
    this._state.parentState.inputValue = filterInputValue;

    this._executeFilterRule(filterInputValue);
  }

  _handleFilterRuleWithoutInputEvent(e) {
    //add the conditional as the filter added value
    const filterRuleBoxRuleAdded = document.querySelector(".filter-added-rule");

    filterRuleBoxRuleAdded.textContent = this._state.preposition;
    this._executeFilterRule(null);
  }

  _handleFilterRuleTagAdd(e) {
    const filterRuleBoxRuleAdded = document.querySelector(".filter-added-rule");

    const tagToAdd =
      e.target.closest(".row-tag-tag") ||
      e.target.querySelector(".row-tag-tag");

    const tagItemsContainer = document.querySelector(".filter-value-tags");

    const addedTagItems = Array.from(tagItemsContainer.children)
      .map((tagItem) => tagItem.textContent.trim())
      .filter((tagItem) => tagItem.length > 0);

    const { createTagMarkup: createdItemTag, tagObj } =
      componentGlobalState.tagItemFactory(tagToAdd);

    //check if tag in addedTags
    const duplicateCheck =
      addedTagItems.length > 0 &&
      addedTagItems.find(
        (tag) => tag.toLowerCase() === tagObj.text.toLowerCase()
      );

    //prevents duplicate addition of tag to tag items
    if (!duplicateCheck) {
      tagItemsContainer.insertAdjacentHTML("beforeend", createdItemTag);

      if (!componentGlobalState.filterTagList)
        componentGlobalState.filterTagList = [];

      console.log("the component glob filertaglist", componentGlobalState.filterTagList)

      componentGlobalState.filterTagList.push(tagObj);

      filterRuleBoxRuleAdded.textContent = componentGlobalState.filterTagList
        .map((tags) => tags.text)
        .join(", ");

      this._executeFilterRule(componentGlobalState.filterTagList);
    }
  }

  _handleFilterRuleRemoveTagEvent(e) {
    const tagToRemove = e.target.closest(".tag-tag");
    const filterRuleBoxRuleAdded = document.querySelector(".filter-added-rule");
    //remove the tag from the componentGlobalState
    const tagToRemoveIndex = componentGlobalState.filterTagList.findIndex(
      (tag) =>
        tag.text.toLowerCase() === tagToRemove.textContent.trim().toLowerCase()
    );

    componentGlobalState.filterTagList.splice(tagToRemoveIndex, 1);

    filterRuleBoxRuleAdded.textContent = componentGlobalState.filterTagList
      .map((tags) => tags.text)
      .join(", ");

    tagToRemove.remove();

    //run the filter again
    this._executeFilterRule(componentGlobalState.filterTagList);
  }

  _executeFilterRule(input) {
    const currentTable = document.querySelector(".table-row-active");

    const conditionalValue = document
      .querySelector(".filter-input-filter")
      .textContent.replace("\n", "")
      .trim();

    const table = this._state.eventHandlers.tableControllers.controlGetTable(
      +currentTable.dataset.id
    );


    const filterType = this._getPropertyType()

    this._state.filterMethod = this._queryConditional(
      conditionalValue.toLowerCase(),
      filterType,
      input
    );

    //add the filterMethod to the parentState as well and the component Global State
    this._state.parentState.filterMethod = componentGlobalState.filterMethod =
      this._state.filterMethod;

    this._state.parentState.conditional = componentGlobalState.conditional =
      conditionalValue;

    //persist the filter properties
    this._state.eventHandlers.tableControllers.controlPersistTableFunc({ tableId: +currentTable.dataset.id, type: filterType, conditional: conditionalValue.toLowerCase(), value: input, tags: componentGlobalState.filterTagList, property: this._state.property.text.toLowerCase() }, "filter")

    //filter and render the table
    this._renderFiltered(table)
  }

  _queryConditional(conditional, property, input) {
    if (property === "itemTitle")
      return this._queryConditionalName(conditional, property, input);

    if (property === "itemTags")
      return this._queryConditionalTags(conditional, property, input);
  }

  _queryConditionalName(conditional, property, input) {
    let filterMethod;
    if (conditional === "contains") {
      filterMethod = (property, input, tableItems) =>
        tableItems.filter((items) => items[property].includes(input));
    }

    if (conditional === "does not contain") {
      filterMethod = (property, input, tableItems) =>
        tableItems.filter((items) => !items[property].includes(input));
    }

    if (conditional === "is empty") {
      filterMethod = (property, input, tableItems) =>
        tableItems.filter((items) => items[property].length === 0);
    }

    if (conditional === "is not empty") {
      filterMethod = (property, input, tableItems) =>
        tableItems.filter(
          (items) =>
            items[property] !== null &&
            items[property] !== "" &&
            items[property].length > 0
        );
    }

    if (conditional === "is") {
      filterMethod = (property, input, tableItems) =>
        tableItems.filter((items) => items[property] === input);
    }

    if (conditional === "is not") {
      filterMethod = (property, input, tableItems) =>
        tableItems.filter((items) => items[property] !== input);
    }

    if (conditional === "starts with") {
      filterMethod = (property, input, tableItems) =>
        tableItems.filter((items) => items[property].startsWith(input));
    }

    if (conditional === "ends with") {
      filterMethod = (property, input, tableItems) =>
        tableItems.filter((items) => items[property].endsWith(input));
    }

    //bind the property and input search and return the bound method
    return filterMethod.bind(null, property, input);
  }

  _queryConditionalTags(conditional, property, input) {
    let filterMethod;
    if (conditional === "contains") {
      filterMethod = (property, input, tableItems) =>
        tableItems.filter((items) =>
          items[property].find((tag) =>
            input.find((filteredTag) => Number(filteredTag.id) === tag)
          )
        );
    }

    if (conditional === "does not contain") {
      filterMethod = (property, input, tableItems) =>
        tableItems.filter(
          (items) =>
            !items[property].find((tag) =>
              input.find((filteredTag) => Number(filteredTag.id) === tag)
            )
        );
    }

    if (conditional === "is empty") {
      filterMethod = (property, input, tableItems) =>
        tableItems.filter((items) => items[property].length === 0);
    }

    if (conditional === "is not empty") {
      filterMethod = (property, input, tableItems) =>
        tableItems.filter((items) => items[property].length > 0);
    }

    //bind the property and input search and return the bound method
    return filterMethod.bind(null, property, input);
  }

  _getPropertyType() {
    const property = document.querySelector(".filter-input-text");
    if (property) {
      const propertyValue = property.textContent.trim().toLowerCase();
      if (propertyValue === "name") return "itemTitle";
      if (propertyValue === "created") return "id";
      if (propertyValue === "tags") return "itemTags";
    }
  }

  _setConditional() {
    if (!this._state.parentState.conditional)
      this._state.parentState.conditional =
        this._state.conditional[0].condition;
  }

  // _renderFilteredTableItems(filteredItems, filterPlaceHolder = false) {
  // importTableComponentView.object.renderTableItem(filteredItems, null, filterPlaceHolder);
  // }



  _addMixin() {
    const { constructor, ...prototypePatch } = Object.getOwnPropertyDescriptors(TableFuncMixin.prototype)

    //add copied props to instance proto
    Object.defineProperties(Object.getPrototypeOf(this).__proto__, prototypePatch)

    this._mixinActive = true
  }

  remove(reset = true, parentRemove = false) {
    const cls = this;
    if (parentRemove) {
      //removes only the component and no rerender
      this._state.component.remove();
      this._events.forEach((ev) =>
        this._state.component.removeEventListener(ev, cls._handleEvents, true)
      );
      if (!this._state.disableOverlayInterceptor) this._state.overlay.remove();
      return;
    }
    //reset tableItems to default
    const currentTable = document.querySelector(".table-row-active");

    const table = this._state.eventHandlers.tableControllers.controlGetTable(
      +currentTable.dataset.id
    );
    // if (table.tableItems.length === 0)
    //reset the table back to default
    if (reset) this._renderFilteredTableItems(table.tableItems);

    //unsubscribe from signals
    this._signals.unsubscribe(this);

    //remove its components
    this._state.component.remove();
    this._events.forEach((ev) =>
      this._state.component.removeEventListener(ev, cls._handleEvents, true)
    );
    if (!this._state.disableOverlayInterceptor) this._state.overlay.remove();
  }
}

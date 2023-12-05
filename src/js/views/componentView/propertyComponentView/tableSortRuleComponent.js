import { importComponentOptionsView } from "../componentOptionsView.js";
import { importTableComponentView } from "../../tableComponentView.js";
import { TABLE_SORT_TYPE } from "../../../config.js";
import { svgMarkup } from "../../../helpers.js";
import { componentGlobalState } from "../componentGlobalState.js";
import tableSortRuleOptionActionComponent from "./tableSortRuleOptionActionComponent.js";
import { TableFuncMixin } from "./tableFuncMixin.js";


export default class TableSortRuleComponent {
  _componentHandler = importComponentOptionsView.object;
  _state;
  _events = ["click"];
  _mixinActive = false

  constructor(state) {
    this._state = state;
  }

  _generateMarkup(sortType, property) {
    return `
        <div class="sort-rules">
            <div class="sort-rules-container">
              <div class="sort-action-form">
                <div class="add-sort-rules-box">
                  <div class="sort-property-options">
                    <div class="sort-select sort-property-options-box">
                      <div class="sort-sort-icon">
                        ${svgMarkup(
      "sort-icon icon-active icon-md",
      `${property.icon}`
    )}
                      </div>
                      <div class="action-filter-text">${property.text}</div>
                      <div class="sort-dropdown-icon">
                        ${svgMarkup(
      "sort-icon icon-active icon-sm",
      "arrow-down"
    )}
                      </div>
                    </div>
                  </div>
                  <div class="sort-type">
                    <div class="sort-type-options">
                      <div class="sort-type-options-box sort-select">
                        <div class="action-filter-text">${sortType}</div>
                        <div class="sort-dropdown-icon">
                          ${svgMarkup(
      "sort-icon icon-active icon-sm",
      "arrow-down"
    )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="sort-delete-container">
                <div class="sort-action-box">
                  <div class="sort-delete-icon">
                    <div class="sort-sort-icon">
                      ${svgMarkup("icon-active icon-md", "trashcan-icon")}
                    </div>
                  </div>
                  <div class="sort-delete-text">Delete Sort</div>
                </div>
              </div>
            </div>
        </div>
    `;
  }

  render() {
    if (!this._mixinActive) this._addMixin()
    const cls = this;

    this._state.markup = this._generateMarkup(
      this._state.parentState.sortType ?? TABLE_SORT_TYPE[0].text,
      this._state.property
    );

    //disables the click interceptor|Allows click to be detected in background
    this._state.disableOverlayInterceptor = true;

    const { overlay, overlayInterceptor, component } =
      this._componentHandler._componentOverlay(
        this._state,
        this._state.disableOverlayInterceptor
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

    //run initial sort here
    const sortType =
      this._state.parentState.sortType ?? TABLE_SORT_TYPE[0].text;
    this._executeSortRule(sortType);

    //listen for sort event
    component.addEventListener("sort", cls._handleSortEvent.bind(cls));
  }

  _handleEvents(e, signals = false) {
    if (!signals) {
      if (this._sortPropertySelectStrategy(e))
        this._handleSortPropertySelectEvent(e);

      if (this._sortTypeSelectStrategy(e)) this._handleSortTypeSelectEvent(e);

      if (this._sortDeleteMatchStrategy(e)) this._handleSortDeleteEvent(e);
    }
  }

  _sortPropertySelectStrategy(e) {
    const matchStrategy =
      e.target.classList.contains(" sort-property-options-box") ||
      e.target.closest(".sort-property-options-box");
    return matchStrategy;
  }

  _sortTypeSelectStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("sort-type-options") ||
      e.target.closest(".sort-type-options");
    return matchStrategy;
  }

  _sortDeleteMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("sort-delete-container") ||
      e.target.closest(".sort-delete-container");
    return matchStrategy;
  }

  _handleSortPropertySelectEvent(e) {
    debugger;
    const setPropertySelector = this._setPropertySelectValue.bind(this);
    const propertySelectPosition = document
      .querySelector(".sort-property-options-box")
      .getBoundingClientRect();
    const eventDetails = {
      detail: {
        callBack: setPropertySelector,
        positioner: propertySelectPosition,
      }
    }
    const reuseEvent = new CustomEvent("reuse", eventDetails);
    this._state?.parentState?.component?.dispatchEvent(reuseEvent) ?? this._state.parent._handleEvents(null, null, eventDetails);
  }

  _handleSortTypeSelectEvent(e) {
    const sortTypeSelect = e.target.closest(".sort-type-options");
    const { top, left, width, height } = sortTypeSelect.getBoundingClientRect();
    const componentObj = {
      top: `${parseInt(top) + 30}`,
      left,
      width,
      height,
      selector: ".filter-input-option-option",
      eventHandlers: this._state.eventHandlers,
      property: this._state.property,
      parentState: this._state,
    };

    const component = new tableSortRuleOptionActionComponent(componentObj);
    component.render();
  }

  _handleSortDeleteEvent(e) {
    this.remove();
    this._state.parent.remove();
  }

  _querySort(property, sortType) {
    let sortMethod;
    if (property.toLowerCase() === "tags") {
      sortMethod = (sortType, tableItems) =>
        tableItems.sort((a, d) => {
          if (sortType.toLowerCase() === "ascending") {
            if (a.itemTags[0] && d.itemTags[0]) {
              if (a.itemTags[0].text < d.itemTags[0].text) return -1;
              else return 1;
            } else return -1;
          }

          if (sortType.toLowerCase() === "descending") {
            if (a.itemTags[0] && d.itemTags[0]) {
              if (a.itemTags[0].text > d.itemTags[0].text) return -1;
              else return 1;
            } else return 1;
          }
        });
    }

    if (property.toLowerCase() === "name") {
      sortMethod = (sortType, tableItems) =>
        tableItems.sort((a, d) => {
          return sortType.toLowerCase() === "ascending"
            ? a.itemTitle < d.itemTitle
              ? -1
              : 1
            : a.itemTitle > d.itemTitle
              ? -1
              : 1;
        });
    }

    return sortMethod.bind(this, sortType);
  }

  _handleSortEvent(e) {
    const { sortType, optionObj } = e.detail;
    this._state.parentState.sortType = sortType;
    this._executeSortRule(sortType.toLowerCase(), optionObj);
  }

  _executeSortRule(sortType, optionObj = undefined) {
    debugger;
    let filteredTableItems;
    const currentTable = document.querySelector(".table-row-active");

    const table = this._state.eventHandlers.tableControllers.controlGetTable(
      +currentTable.dataset.id
    );

    this._state.sortMethod = null;
    this._state.sortMethod = this._querySort(
      this._state.parentState.property.text,
      sortType.toLowerCase()
    );

    componentGlobalState.sortMethod = this._state.parentState.sortMethod =
      this._state.sortMethod;

    //persist the sort properties
    this._state.eventHandlers.tableControllers.controlPersistTableFunc({ tableId: +currentTable.dataset.id, type: this._state.parentState.property.text, value: sortType.toLowerCase(), property: this._state.parentState.property }, "sort")

    if (table.tableItems.length > 0) {
      //check if filter methods exist
      if (componentGlobalState.filterMethod) {
        filteredTableItems = componentGlobalState.filterMethod(
          table.tableItems
        );
      }

      const sortedTableItems =
        filteredTableItems?.length > 0
          ? componentGlobalState.sortMethod(filteredTableItems)
          : componentGlobalState.sortMethod(table.tableItems);
      this._renderSortedTableItems(sortedTableItems);
    }

    optionObj ? optionObj.remove() : null;
  }

  _setPropertySelectValue(value, parentState) {
    const propertySelectContainer = document.querySelector(
      ".sort-property-options-box"
    );
    const sortTypeContainer = document.querySelector(
      ".sort-type-options-box .action-filter-text"
    );
    const containerText = propertySelectContainer.querySelector(
      ".action-filter-text"
    );

    const containerIcon = propertySelectContainer.querySelector(".sort-icon");
    containerText.textContent = value.text;
    containerIcon.src = value.icon;

    //switch the parentState to the newly created instance
    this._state.parentState = parentState;

    this._executeSortRule(sortTypeContainer.textContent.trim());
  }

  _addMixin() {
    const { constructor, ...prototypePatch } = Object.getOwnPropertyDescriptors(TableFuncMixin.prototype)

    //add copied props to instance proto
    Object.defineProperties(Object.getPrototypeOf(this).__proto__, prototypePatch)

    this._mixinActive = true
  }

  // _renderSortedTableItems(sortedItems, filterPlaceHolder = false) {
  // importTableComponentView.object.renderTableItem(sortedItems, null);
  // }

  remove(reset = true) {
    const cls = this;
    this._state?.overlay?.remove();
    this._events.forEach((ev) =>
      this._state.component.removeEventListener(ev, cls._handleEvents, true)
    );
    this._state.component.remove();
  }
}

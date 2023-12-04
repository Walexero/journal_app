import propertyOptionsComponent from "./propertyOptionsComponent.js";
import { importComponentOptionsView } from "../componentOptionsView.js";
import { TABLE_PROPERTIES } from "../../../config.js";
import tableFilterRuleComponent from "./tableFilterRuleComponent.js";
import { importSignals } from "../../../signals.js";//allows signals to be sent to required component
import { componentGlobalState } from "../componentGlobalState.js";
import containerSidePeekComponentView from "../../containerSidePeekComponentView.js";
import { TableFuncMixin } from "./tableFuncMixin.js";

export default class TableFilterOptionComponent extends propertyOptionsComponent {
  _componentHandler = importComponentOptionsView.object;
  _state;
  _events = ["click", "keyup"];
  _signals = importSignals.object

  constructor(state) {
    super();
    this._state = state;
  }

  render() {
    if (!this._mixinActive) this._addMixin()
    const cls = this;
    const propertiesToRender = TABLE_PROPERTIES.properties.filter(
      (property) => property.text.toLowerCase() !== "created"
    );

    const fnActive = this._checkTableFuncActive("filter")
    if (!fnActive) {

      this._state.markup = this._generateMarkup(propertiesToRender, "filter");

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
    if (fnActive) {
      //generate filter rule markup
      this._handlePropertyOptionsOption(null, {
        property: "filter",
        state: this._state,
        callBack: null,
        props: TABLE_PROPERTIES,
      })

      const filterRuleBoxRuleAdded = document.querySelector(".filter-added-rule");
      filterRuleBoxRuleAdded.textContent = this._getFunc("filter").value

      this._state.conditional = this._getFunc("filter").type

      this._state.filterMethod = componentGlobalState.filterMethod = tableFilterRuleComponent.prototype._queryConditional(this._getFunc("filter").conditional, this._state.conditional, this._getFunc("filter").value)

      const table = this._state.eventHandlers.tableControllers.controlGetTable(this._getFunc("filter").tableId)

      //filter and render the table
      this._renderFiltered(table)
    }
    //register the component as an observer
    this._signals.subscribe({ component: this, source: ["tablebody", "content"] });
  }

  _handleEvents(e, signal = false) {
    if (!signal) {
      if (this._propertyOptionFormStrategy(e, "filter"))
        this._handlePropertyOptionsForm(TABLE_PROPERTIES.properties, "filter");

      if (this._propertyOptionsOptionStrategy(e))
        this._handlePropertyOptionsOption(e, {
          property: "filter",
          state: this._state,
          callBack: this._renderRule.bind(this),
          props: TABLE_PROPERTIES,
        });
    }

    if (signal) {
      if (this._filterAddItemChecker(e)) this._handleFilterAddItem(e);

      if (this._filterAddRuleBoxStrategy(e))
        this._handleFilterAddRuleBoxEvent(e);

      if (this._removeFilterAddRuleBoxStrategy(e))
        this._handleRemoveRuleBoxEvent(e);

      if (this._filterHoverAddStrategy(e))
        this._handleFilterHoverAddStrategy(e);
    }
  }

  _filterOptionFormStrategy(e) {
    const filterOptionsFormStrategy =
      e.type === "keyup" && e.target.classList.contains("filter-search");

    return filterOptionsFormStrategy;
  }

  _filterOptionsOptionStrategy(e) {
    const filterOptionsOptionStrategy =
      e.type === "click" &&
      (e.target.classList.contains("action-property-text") ||
        e.target.closest(".action-property-content"));
    return filterOptionsOptionStrategy;
  }

  _filterAddRuleBoxStrategy(e) {
    const filterAddRuleBoxStrategy =
      (e.type === "click" &&
        e.target.classList.contains("filter-added-rule-box")) ||
      e.target.closest(".filter-added-rule-box");

    return filterAddRuleBoxStrategy;
  }

  _removeFilterAddRuleBoxStrategy(e) {
    const filterRuleBox = document.querySelector(".filter-input-content");

    if (filterRuleBox) {
      const matchStrategy =
        (e.type === "click" &&
          !e.target.classList.contains("filter-input-content")) ||
        !e.target.closest(".filter-input-content");

      return matchStrategy;
    }
  }

  _filterHoverAddStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("row-add-icon") ||
        e.target.closest(".row-add-icon");

      if (matchStrategy) {
        const ruleBoxExists = document.querySelector(".added-rule"); //(".filter-added-rule-box");
        if (ruleBoxExists?.textContent.trim().length > 0) return true;
      }
    }
  }

  _filterAddItemChecker(e) {
    if (e.type === "click") {
      const filterAddItemStrategy =
        e.target.classList.contains("row-adder-content") ||
        e.target.closest(".row-adder-content") ||
        e.target.classList.contains("row-adder-filter") ||
        e.target.closest(".row-adder-filter");

      // filter-added-rule-name
      if (filterAddItemStrategy) {
        const currentProperty = this._state.property.text.toLowerCase();
        const ruleBoxExists = document.querySelector(".filter-added-rule");
        const ruleBoxAddedRule = document.querySelector(".filter-added-rule");

        if (ruleBoxAddedRule?.textContent.trim().length > 0) {
          if (
            currentProperty !== "tags" &&
            ruleBoxExists &&
            ruleBoxExists?.textContent.trim().length > 0
          )
            return true;
          if (currentProperty === "tags" && ruleBoxExists) return true;
        }
      }
    }
  }

  _handleRemoveFilterAddRuleBoxEvent(e) {
    if (!this._state.ruleBoxActive) {
      this._state.children.forEach((child) => child.remove(false, true));
      this._state.children = [];
    }

    //   if (this._state.ruleBoxActive) this._state.ruleBoxActive = false; //sets the component active state back to not just rendered
  }

  _handleFilterOptionsForm(properties) {
    const filterOptionsContainer = document.querySelector(
      ".filter-content-search"
    );

    const filterOptionForm = document.querySelector(".filter-search");

    const renderProperties = properties.filter((property) =>
      property.text
        .toLowerCase()
        .includes(filterOptionForm.value.trim().toLowerCase())
    );
    filterOptionsContainer.innerHTML = "";
    filterOptionsContainer.insertAdjacentHTML(
      "beforeend",
      this._generateOptions(renderProperties)
    );
  }

  _handleFilterAddRuleBoxEvent(e) {
    //should be called by the options option to add the rulebox

    const clickedProperty = this._getClickedProperty({ e, closest: ".filter-added-rule-box", selector: ".filter-added-rule-name" })

    const selectedProperty = TABLE_PROPERTIES.properties.find(
      (property) =>
        property.text.toLowerCase() ===
        clickedProperty
    );

    this._renderFilterRuleComponent(selectedProperty);

    //implement a notifier to the rulebox remover the component was just added
    this._state.ruleBoxActive = true;
  }

  _handleFilterAddItem(e) {
    this._executeItemAdder(e, null);
  }

  _handleFilterHoverAddStrategy(e) {
    const targetContainer = e.target
      .closest("[role=rowgroup]")
      .querySelector(".row-actions-handler-container");

    this._executeItemAdder(e, +targetContainer.dataset.id);
  }

  _executeItemAdder(e, relativeItem = undefined) {
    const sliderConditional =
      this._state?.conditional?.toLowerCase() === "is not empty";

    const ruleBoxFilterText = document.querySelector(".filter-added-rule");
    const filterContainerInput = document.querySelector(".filter-value");

    const tableSearchInput = document.querySelector(".search-input");

    const itemTitle = filterContainerInput
      ? filterContainerInput.value.trim()
      : ruleBoxFilterText.textContent.replace(":", "").trim().toLowerCase();

    const updateAction = this._getConditionalAction(
      this._state.conditional?.toLowerCase() ??
      componentGlobalState.conditional.toLowerCase()
    );

    const updateObj = {
      action:
        this._state.property.text.toLowerCase() === "tags"
          ? "createEmpty"
          : updateAction,
      itemTitle:
        this._state.property.text.toLowerCase() === "tags" ? "" : itemTitle,
      itemTags:
        updateAction === "createEmpty"
          ? []
          : componentGlobalState.filterTagList?.length > 0
            ? [componentGlobalState.filterTagList[0]]
            : [],
      //conditional is gotten from the filter rule component
    };

    if (this._state.children.length > 0) {
      this._state.children.forEach((child) => child.remove(false, true));
      this._state.children = [];
      //   console.log("before remove",this._state.children)
    }

    if (!sliderConditional)
      this._state.eventHandlers.tableItemControllers.controlAddTableItem(
        updateObj,
        relativeItem,
        this._state.filterMethod,
        componentGlobalState.sortMethod
      );

    if (sliderConditional) {
      if (this._state.property.text.toLowerCase() === "tags") {
        if (updateObj.itemTags.length === 0)
          updateObj.itemTags.push(componentGlobalState.tags[0]);
        this._state.eventHandlers.tableItemControllers.controlAddTableItem(
          updateObj,
          relativeItem,
          this._state.filterMethod,
          componentGlobalState.sortMethod
        );
      } else {
        //filter not added to allow render on table
        this._state.eventHandlers.tableItemControllers.controlAddTableItem(
          updateObj,
          relativeItem,
          null,
          componentGlobalState.sortMethod,
          this._renderContainerSidePeekComponent.bind(this)
        );
      }
    }

    //clear the tableSearchInput if it exists
    tableSearchInput.value = "";
  }

  _renderRule(selectedProperty) {
    this._renderFilterRuleComponent(selectedProperty);
    this._state.component.remove();
    this._state.overlay.remove();
  }

  _renderFilterRuleComponent(selectedProperty) {
    const filterAddRuleBox = document.querySelector(".filter-added-rule-box");

    const { top, left, width, height } =
      filterAddRuleBox.getBoundingClientRect();

    //generate filter rule component
    const componentObj = {
      top: `${parseInt(top) - 20}`,
      left,
      width,
      height,
      selector: ".filter-rule-input-box",
      eventHandlers: this._state.eventHandlers,
      property: selectedProperty,
      updateModel: "",
      parentState: this._state,
      parent: this,
    };

    const component = new tableFilterRuleComponent(componentObj);
    debugger;
    this._state.inputValue = this._state.inputValue ?? "";
    this._state.children.push(component);
    component.render();
  }

  _renderContainerSidePeekComponent(itemId) {
    //remove the container if it currently exists
    const sliderAlreadyExists = document.querySelector(
      ".container-slide-template"
    );
    if (sliderAlreadyExists) {
      sliderAlreadyExists.remove();
      document.querySelector(".container").classList.remove("side-peek");
    }

    const componentObj =
      componentGlobalState.containerSidePeekComponentObj(itemId);
    const component = new containerSidePeekComponentView(componentObj);
    component.render();
  }

  _getConditionalAction(conditional) {
    const createEmptyItemConditional = [
      "Is not",
      "Does not contain",
      "Is empty",
      "Is not empty",
    ];

    const action =
      // this._state.property.toLowerCase() === "tags" ||
      createEmptyItemConditional.find(
        (condition) => condition.toLowerCase() === conditional
      )
        ? "createEmpty"
        : "createFromInput";

    return action;
  }

  remove() {
    const cls = this;
    const filterContainer = document.querySelector(".filter-action-container");
    //TODO: can click on the overlay to remove
    // this._state.component.remove();
    // this._state.overlay.remove();
    this._state.overlay.click();
    this._events.forEach((ev) =>
      this._state.component.removeEventListener(ev, cls._handleEvents, true)
    );
    filterContainer.remove();

    //unsubscribe from signal events
    this._signals.unsubscribe(this);
    componentGlobalState.filterMethod = null;
  }
}

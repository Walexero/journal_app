import propertyOptionsComponent from "./propertyOptionsComponent.js";
import { importComponentOptionsView } from "../componentOptionsView.js";
import { TABLE_PROPERTIES } from "../../../config.js";
import { importSignals } from "../../../signals.js";//allows signals to be sent to required component
import { componentGlobalState } from "../componentGlobalState.js";
import tableSortRuleComponent from "./tableSortRuleComponent.js";

export default class TableSortOptionComponent extends propertyOptionsComponent {
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
    const fnActive = this._checkTableFuncActive("sort")

    if (!fnActive) {
      this._state.markup = this._generateMarkup(propertiesToRender, "sort");

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

      //listen for reuse events
      component.addEventListener("reuse", cls._reuseComponentListener.bind(cls));
    }

    if (fnActive) {
      //generate sort rule markup
      this._handlePropertyOptionsOption(null, {
        property: "sort",
        state: this._state,
        callBack: null,
        props: TABLE_PROPERTIES,
      })

      this._state.property = this._getFunc("sort").property

      this._state.sortMethod = componentGlobalState.sortMethod = tableSortRuleComponent.prototype._querySort(this._state.property.text, this._getFunc("sort").type)

      const table = this._state.eventHandlers.tableControllers.controlGetTable(this._getFunc("sort").tableId)

      //sort and render the table
      this._renderSorted(table)

      //remove persistedSort
      // this._removeComponentTableFunc("sort")

    }

    //register for events from the body
    if (!componentGlobalState.sortMethod || fnActive) {
      //prevent subscribing multiple times if already subscribeed  or if fnActive subscribe for events
      this._signals.subscribe({ component: this, source: ["tablebody", "content"] });
    }
  }

  _handleEvents(e, signal = false, childEvent = false) {
    if (!signal && !childEvent) {
      if (this._propertyOptionFormStrategy(e, "sort"))
        this._handlePropertyOptionsForm(TABLE_PROPERTIES.properties, "sort");

      if (this._propertyOptionsOptionStrategy(e))
        this._handlePropertyOptionsOption(
          e,
          this._options(this._state.reuseCallBack)
        );
    }

    if (signal) {
      if (this._removeSortRuleBoxStrategy(e)) this._handleRemoveRuleBoxEvent(e);

      if (this._sortAddRuleBoxStrategy(e)) this._handleSortAddRuleBoxEvent(e);

      if (this._sortItemAddMatchStrategy(e)) this._handleSortAddItem(e);

      if (this._sortHoverAddStrategy(e)) this._handleSortHoverAddEvent(e);
    }

    if (childEvent) this._reuseComponentListener(childEvent)
  }

  _sortAddRuleBoxStrategy(e) {
    const matchStrategy =
      (e.type === "click" &&
        e.target.classList.contains("sort-added-rule-box")) ||
      e.target.closest(".sort-added-rule-box");

    return matchStrategy;
  }
  _removeSortRuleBoxStrategy(e) {
    const sortRuleBox = document.querySelector(".sort-rules");

    if (sortRuleBox) {
      const matchStrategy =
        (e.type === "click" &&
          !e.target.classList.contains("filter-input-content")) ||
        !e.target.closest(".filter-input-content");
      return matchStrategy;
    }
  }

  _sortItemAddMatchStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("row-adder-content") ||
        e.target.closest(".row-adder-content") ||
        e.target.classList.contains("row-adder-filter") ||
        e.target.closest(".row-adder-filter");

      //prevent event from matching if filter exists
      if (matchStrategy && !componentGlobalState.filterMethod) return true;
    }
  }

  _sortHoverAddStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("row-add-icon") ||
        e.target.closest(".row-add-icon");

      if (matchStrategy && !componentGlobalState.filterMethod) return true;
    }
  }

  _handleSortAddRuleBoxEvent(e) {
    this._renderSortRuleComponent(this._state.property);
  }

  _handleSortHoverAddEvent(e) {
    const targetContainer = e.target
      .closest("[role=rowgroup]")
      .querySelector(".row-actions-handler-container");

    this._state.eventHandlers.tableItemControllers.controlAddTableItem(
      {},
      +targetContainer.dataset.id,
      null,
      this._state.sortMethod
    );
  }

  _handleSortAddItem(e) {
    const tableSearchInput = document.querySelector(".search-input");
    if (tableSearchInput) tableSearchInput.value = "";
    this._state.eventHandlers.tableItemControllers.controlAddTableItem(
      {},
      null,
      null,
      this._state.sortMethod
    );
  }

  _renderRule(selectedProperty) {
    const propertyContainer = document
      .querySelector(".property-actions")
      .classList.toggle("show-border");

    this._renderSortRuleComponent(selectedProperty);
    this._state.component.remove();
    this._state.overlay.remove();
  }

  _renderSortRuleComponent(selectedProperty) {
    const sortAddRuleBox = document.querySelector(".sort-added-rule-box");

    const { top, left, width, height } = sortAddRuleBox.getBoundingClientRect();

    //generate filter rule component
    const componentObj = {
      top: `${parseInt(top) - 20}`,
      left,
      width,
      height,
      selector: ".sort-rules",
      eventHandlers: this._state.eventHandlers,
      property: selectedProperty,
      updateModel: "",
      parentState: this._state,
      parent: this,
    };

    const component = new tableSortRuleComponent(componentObj);
    this._state.children.push(component);
    component.render();

    // this._state.ruleBoxActive = true;
  }

  _options(callBack = undefined) {
    return {
      property: "sort",
      state: this._state,
      callBack: callBack ?? this._renderRule.bind(this),
      props: TABLE_PROPERTIES,
    };
  }

  _reuseComponentListener(e) {
    const { top, left, width, height } = e.detail.positioner;

    (this._state.top = top),
      (this._state.left = `${parseInt(left) + 150}`),
      (this._state.width = width),
      (this._state.height = height);

    this._removeComponentTableFunc("sort")
    this.render();
    this._state.reuseCallBack = (value, parentState) => {
      e.detail.callBack(value, parentState);
      this._state.component.remove();
      this._state.overlay.remove();
    };
  }

  remove() {
    const cls = this;
    const sortActionContainer = document.querySelector(
      ".sort-action-container "
    );
    this._state?.overlay?.remove();
    // this._state?.overlay?.remove();

    //unsubscribe from signal events
    this._signals.unsubscribe(this)
    this._events.forEach((ev) =>
      this._state?.component?.removeEventListener(ev, cls._handleEvents, true)
    );
    this._state?.component?.remove();
    sortActionContainer?.remove();
    componentGlobalState.sortMethod = null;

    const fnActive = this._checkTableFuncActive("sort")
    if (fnActive) this._removeComponentTableFunc("sort")
    this._state = {}
    delete this;
  }
}

import {
  TABLE_HEAD_LIMIT,
  TABLE_ROW_FILTER_PLACEHOLDER,
  TABLE_ROW_PLACEHOLDER,
} from "../config.js";
import {
  tableRowActivator,
  swapItemIndexInPlace,
  svgMarkup,
} from "../helpers.js";
import { importSignals } from "../signals.js";
import { componentGlobalState } from "./componentView/componentGlobalState.js";
import tableHeadProcessorView from "./tableHeadProcessorView.js";

import tableActionsProcessorView from "./tableActionsProcessorView.js";
import tableBodyProcessorView from "./tableBodyProcessorView.js";

class TableComponentView {
  _parentElement = document.querySelector(".content-container");
  _tableElement = document.querySelector(".main-table");
  _tableHeadElement = document.querySelector(".main-table-head");
  _tableBodyElement = document.querySelector(`[role="tablerow"]`);
  _signals = importSignals.object ? importSignals.object : (importSignals.object = importSignals.import())
  _tableBodyItemElement;
  _tableViewOptionsActive = false;
  _currentTable;
  _currentTableItem;
  _currentTableHandler;
  _tableHeadEventProcessor = tableHeadProcessorView;
  _tableActionsEventProcessor = tableActionsProcessorView;
  _tableBodyEventProcessor = tableBodyProcessorView;
  _bodyEventListenerActive = false;
  _token; //api token

  init(tableHandler, currentTableHandler, tables, currentTable) {

    //add handleer to set currentTable in the model
    this._currentTableHandler = currentTableHandler;
    tableHandler();
    console.log(this._signals, "tablecomponentvie")

    this._currentTable = currentTable;

    //generate table head markup
    const markup = this._generateMarkup(tables, currentTable.id);

    //load initial UI data

    this._tableHeadElement.innerHTML = "";
    this._tableHeadElement.insertAdjacentHTML("afterbegin", markup);

    // this._tableBodyElement.innerHTML = "";
    this._tableBodyElement.insertAdjacentHTML(
      "beforeend",
      this._generateBodyMarkup()
    );

    this._tableBodyEventProcessor._currentTable = currentTable;
    this._tableBodyEventProcessor.render(this._currentTable);

    //set the table body item element to the component private variable

    this._tableBodyItemElement = document.querySelector(`[role="tablebody"]`);

    //add the renderTableItem as a componentGlobalState method
    componentGlobalState.renderTableItem = this.renderTableItem.bind(this);

    //add body event listener for the table body items if they exist on page load
    if (
      this._currentTable &&
      this._currentTable?.tableItems?.length > 0 &&
      !this._bodyEventListenerActive
    ) {
      this.addBodyDelegationEventListener();
      this.setBodyEventListenerState(true);
    }
  }

  addComponentHandlers(handlers) {
    this._tableActionsEventProcessor.addHandlers(handlers);
    this._tableHeadEventProcessor.addHandlers(
      handlers,
      this.setCurrentTableAndPersistInModel.bind(this)
    );
    this._tableBodyEventProcessor.addHandlers(
      handlers,
      this.setCurrentTableAndPersistInModel.bind(this)
    );
  }

  setCurrentTableAndPersistInModel(currentTable, tableToDisplayId = undefined) {
    if (currentTable) this._currentTable = currentTable;

    //perist currentTable in the model
    this._currentTableHandler(currentTable, tableToDisplayId);
  }

  setBodyEventListenerState(value) {
    this._bodyEventListenerActive = value;
  }

  addTableTagMetaData(...data) {
    this._tableBodyEventProcessor.addTagsMetaData(data);
    [componentGlobalState.tags, componentGlobalState.tagsColor] = data;
  }

  addDelegationEventListener(e) {
    const cls = this;
    e.stopPropagation();

    //process events related to the main-heading section
    cls._tableHeadEventProcessor.matchEvent(e);

    //process events related to the main-actions section
    cls._tableActionsEventProcessor.matchEvent(e);

    //process events related to the table body section
    cls._tableBodyEventProcessor.matchEvent(e);

    //register the event as a signal as well
    if (this._signals.eventsToListenFor().find((events) => e.type === events))
      this._signals.observe(e, "content");
  }

  addBodyDelegationEventListener() {
    componentGlobalState.hoverEl =
      this._tableBodyEventProcessor._generateHoverMarkupAndCreateElement();

    this.listen();
  }

  render(tables, currentTable) {
    const cls = this;
    //set currentTable
    if (currentTable) this._currentTable = currentTable;

    // //generate table head markup
    const markup = this._generateMarkup(tables, currentTable?.id);

    // //load initial UI data

    this._tableHeadElement.innerHTML = "";
    this._tableHeadElement.insertAdjacentHTML("afterbegin", markup);
  }

  _clearTableFunc() {
    document.querySelector(".filter-action-container")?.remove()
    document.querySelector(".sort-action-container")?.remove()
  }

  _activateTableFunc(activeTableFunc) {
    const filter = activeTableFunc.filter > 0
    const sort = activeTableFunc.sort > 0

    if (filter) document.querySelector(".table-filter").click()
    if (sort) document.querySelector(".table-sort").click()
  }

  renderTableItem(tableItems, filter, filterPlaceHolder = false, clearTableFunc = undefined, activeTableFunc = undefined) {
    const itemsExists = tableItems.length > 0;
    this._tableBodyItemElement.innerHTML = "";

    if (itemsExists)
      this._tableBodyItemElement.insertAdjacentHTML(
        "beforeend",
        this._tableBodyEventProcessor._generateItemMarkup(tableItems)
      );

    if (!itemsExists)
      this._tableBodyItemElement.insertAdjacentHTML(
        "beforeend",
        this._generateBodyMarkup(true, filterPlaceHolder)
      );

    if (clearTableFunc) this._clearTableFunc()

    //apply filters to currently set tables if it exists
    if (activeTableFunc) this._activateTableFunc(activeTableFunc)
  }

  updateTableItem(currentTable, tableItems, itemId, callBack = undefined) {
    this._tableBodyItemElement.innerHTML = "";
    this._tableBodyItemElement.insertAdjacentHTML(
      "beforeend",
      this._tableBodyEventProcessor._generateItemMarkup(tableItems)
    );

    //triggers slider and prevents input render
    if (callBack) {
      callBack(itemId);
      return;
    }

    //add the Input for the name property for the currently created item
    const addedItemRow = document.querySelector(
      `.row-actions-handler-container[data-id="${itemId}"] .row-actions-segment`
    );

    this._tableBodyEventProcessor.renderTableInput(addedItemRow, currentTable);

    //add body event listener for the table body items if they exist on page load
    if (!this._bodyEventListenerActive) {
      this.addBodyDelegationEventListener();
      this.setBodyEventListenerState(true);
    }
  }

  listen() {
    this._signals.activateListener("tablebody", this._tableBodyItemElement);
  }

  _generateMarkup(journals, currentTableId) {
    const headMarkup = this._generateHeadMarkup(journals, currentTableId);
    const markup = headMarkup + this._generateActionsMarkup();
    return markup;
  }

  _generateHeadMarkup(journals, currentTableId) {
    let journalsMarkup = "";
    const switchTableAdd = journals.length >= 5;
    journals = swapItemIndexInPlace(journals, currentTableId);

    journals.forEach((journal, i) => {
      const [journalName, journalId] = journal;
      const activeTable = tableRowActivator(currentTableId, journalId, i);

      if (i < 4)
        journalsMarkup += `
        <div class="table-row table-journal ${activeTable}" data-name="${journalName}" data-id="${journalId}">
          
          <div class="table-row-icon">
            ${svgMarkup("table-icon", "list-icon")}
          </div>
          <div class="table-row-text">${journalName}</div>
        </div>
      `;
    });

    if (!switchTableAdd) {
      return `
        <div class="main-table-heading">
          ${journalsMarkup}
  
          <div class="table-column-adder table-row">
            ${svgMarkup("table-icon", "plus")}
          </div>
        </div>
      `;
    }
    if (switchTableAdd) {
      return `
        <div class="main-table-heading">
          ${journalsMarkup}
  
          <div class="table-column-options table-row">
          <div class="table-row-text">${journals.length - TABLE_HEAD_LIMIT
        } more...</div>
          </div>
        </div>
      `;
    }
  }

  _generateBodyPlaceholder(placeholder = false) {
    return `
      <div role="rowgroup" class="rowfill">
        <div role="row">
            <div class="${placeholder ? "row-adder-filter" : "row-adder-content"
      }">
              <div class="row-adder-text color-dull">${placeholder
        ? TABLE_ROW_FILTER_PLACEHOLDER
        : TABLE_ROW_PLACEHOLDER
      }</div>
            </div>
        </div>
      </div>

    `;
  }

  _generateBodyMarkup(body = false, placeholder = false) {
    let markup = "";
    const tableBodyExists = document.querySelector(`[role="tablebody"]`);

    if (tableBodyExists) markup = this._generateBodyPlaceholder(placeholder);

    if (!tableBodyExists)
      markup = `
      <div role="tablebody">
        ${this._generateBodyPlaceholder(placeholder)}
      </div>
    `;

    const adderMarkup = `
      <div role="tableadd">
          <div role="rowgroup" class="rowfill">
            <div role="row" class="row-adder">
              <div class="row-adder-content">
                <div class="row-adder-icon">
                  ${svgMarkup("row-icon", "plus")}
                </div>
                <div class="row-adder-text color-dull">New</div>
              </div>
            </div>
          </div>
      </div>
    `;

    if (!body) return (markup += adderMarkup);
    if (body) return markup;
  }

  _generateActionsMarkup() {
    return `
      <div class="main-table-actions">
        <div class="table-row table-filter">
          <div class="table-row-text">Filter</div>
        </div>
        <div class="table-row table-sort">
          <div class="table-row-text">Sort</div>
        </div>
        <div class="table-row table-row-search">
          <div class="table-row-icon">
            ${svgMarkup("table-icon", "search-icon")}
          </div>
        </div>
        <div class="table-row-search--form">
          <input type="text" class="search-input hide-search-input" placeholder="Type to search..." />
        </div>
        <div class="table-row-button">
          <div class="table-button">
            <div class="table-button-content">
              <div class="table-button-text table-row-text">New</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// export const importTableComponentView = (() => new TableComponentView());
export const importTableComponentView = {
  import: (() => new TableComponentView()),
  object: null
};
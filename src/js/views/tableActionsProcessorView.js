import tableViewOptionComponent from "./componentView/tableViewOptionComponent.js";
import tableHeadProcessorView from "./tableHeadProcessorView.js";
import tableFilterOptionComponent from "./componentView/propertyComponentView/tableFilterOptionComponent.js";
import tableSortOptionComponent from "./componentView/propertyComponentView/tableSortOptionComponent.js";
import tableComponentView from "./tableComponentView.js";
import containerSidePeekComponentView from "./containerSidePeekComponentView.js";
import { componentGlobalState } from "./componentView/componentGlobalState.js";
import { importSideBarComponentView } from "./sidebarComponentView.js";
// import sidebarComponentView from "./sidebarComponentView.js";

class TableActionsProcessorView {
  _tableHeadProcessor = tableHeadProcessorView;
  _eventHandlers;
  _sidebarComponentView = importSideBarComponentView.object

  addHandlers(handlers) {
    this._eventHandlers = handlers;
  }

  matchEvent(e) {
    const cls = this;

    //table adder
    if (cls._tableAddMatchStrategy(e)) {
      const adderContainer = e.target.closest(".table-column-adder");
      cls._handleAddTableJournal();
    }

    //render journals in option view
    const journalOptionsContainer = this._tableViewStrategy(e);
    if (journalOptionsContainer)
      this._handleTableViewOptions(e, journalOptionsContainer);

    //filter functionality in table head
    const filterContainer = this._tableFilterStrategy(e);
    if (filterContainer) this._handleFilterOption(e, filterContainer);

    //sort functionality in table head
    const sortContainer = this._tableSortStrategy(e);
    if (sortContainer) this._handleSortOption(e, sortContainer);

    if (this._tableSearchMatchStrategy(e)) this._handleTableSearchEvent(e);

    if (this._tableNewBtnMatchStrategy(e)) this._handleTableNewBtnEvent(e);
  }

  _tableAddMatchStrategy(e) {
    const addMatchStrategy =
      e.target.classList.contains("table-column-adder") ||
      e.target.closest(".table-column-adder");

    return addMatchStrategy;
  }

  _tableViewStrategy(e) {
    if (
      e.target.classList.contains("table-column-options") ||
      e.target.closest(".table-column-options")
    ) {
      const TableViewStrategy = e.target?.closest(".table-column-options");
      return TableViewStrategy;
    }
  }

  _tableFilterStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("table-filter") ||
      e.target.closest(".table-filter");

    if (matchStrategy) return e.target.closest(".table-filter");
    return matchStrategy;
  }

  _tableSortStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("table-sort") ||
      e.target.closest(".table-sort");

    if (matchStrategy) return e.target.closest(".table-sort");
    return matchStrategy;
  }

  _tableSearchMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("table-row-search") ||
      e.target.closest(".table-row-search");
    return matchStrategy;
  }

  _tableNewBtnMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("table-button-content") ||
      e.target.closest(".table-button-content");
    return matchStrategy;
  }

  _handleTableViewOptions(e, container) {
    const cls = this;

    const tables = this._eventHandlers.tableControllers.controlGetTableHeads();

    const { top, left, width, height } = container.getBoundingClientRect();

    const componentObj = {
      top,
      left,
      width,
      height,
      tables,
      selector: ".table-view-list--options",
    };

    const component = new tableViewOptionComponent(componentObj);
    component.render();
  }

  _handleAddTableJournal() {
    this._eventHandlers.tableControllers.controlAddNewTable();

    //update sidebar tables if open
    if (componentGlobalState.sideBarListActive) {
      const sidebarJournalContainer = document.querySelector(
        ".nav-options-journal"
      );
      this._sidebarComponentView._renderSideBarList(null, sidebarJournalContainer);
    }
  }

  _handleFilterOption(e, container) {
    const cls = this;

    const filterExists = document.querySelector(".filter-added-rule-box");

    if (filterExists) return;

    //logic to prevent re-render of container
    // this._optionsView._optionsActive = true;

    const { top, left, width, height } = container.getBoundingClientRect();

    const componentObj = {
      top,
      left,
      width,
      height,
      selector: ".filter-add-action--options",
      eventHandlers: cls._eventHandlers,
      updateModel: "",
      children: [],
    };

    const component = new tableFilterOptionComponent(componentObj);
    component.render();
  }

  _handleSortOption(e, container) {
    const cls = this;

    const sortExists = document.querySelector(".sort-added-rule-box");

    if (sortExists) return;

    //logic to prevent re-render of container
    // this._optionsView._optionsActive = true;

    const { top, left, width, height } = container.getBoundingClientRect();

    const componentObj = {
      top,
      left,
      width,
      height,
      selector: ".sort-add-action--options",
      eventHandlers: cls._eventHandlers,
      updateModel: "",
      children: [],
    };

    const component = new tableSortOptionComponent(componentObj);
    component.render();
  }

  _handleTableSearchEvent(e) {
    let filteredSearchValue;
    const cls = this;
    const currentTable = document.querySelector(".table-row-active");
    const searchInput = document.querySelector(".search-input");

    searchInput ? searchInput.classList.toggle("hide-search-input") : null;

    //add event listeners
    searchInput.addEventListener("keyup", function (e) {
      const inputVal = searchInput.value.trim();

      const table = cls._eventHandlers.tableControllers.controlGetTable(
        +currentTable.dataset.id
      );

      filteredSearchValue = table.tableItems.filter((tableItem) =>
        tableItem.itemTitle.toLowerCase().includes(inputVal.toLowerCase())
      );

      if (componentGlobalState.filterMethod)
        filteredSearchValue =
          componentGlobalState.filterMethod(filteredSearchValue);

      tableComponentView.renderTableItem(
        filteredSearchValue,
        componentGlobalState.filterMethod
      );
    });
  }

  _handleTableNewBtnEvent(e) {
    const sidePeekCallBack = (itemId) => {
      const componentObj =
        componentGlobalState.containerSidePeekComponentObj(itemId);
      const component = new containerSidePeekComponentView(componentObj);
      component.render();
    };
    const updateObj = {};
    this._eventHandlers.tableItemControllers.controlAddTableItem(
      updateObj,
      null,
      null,
      componentGlobalState.sortMethod,
      sidePeekCallBack
    );
  }
}

export default new TableActionsProcessorView();

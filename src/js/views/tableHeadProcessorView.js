import tableOptionComponent from "./componentView/tableOptionComponent.js";
import { componentGlobalState } from "./componentView/componentGlobalState.js";
import { importSideBarComponentView } from "./sidebarComponentView.js";
import { TABLE_VIEW_OPTION_REPLACE_TABLE_OPTION } from "../config.js";
import tableActionsProcessorView from "./tableActionsProcessorView.js";

class TableHeadProcessorView {
  _optionsView; // = tableOptionsView;
  _renameOption;
  _duplicateOption;
  _deleteOption;
  _active = false;
  _eventHandlers;
  _currentTableSetter;
  _sidebarComponentView = importSideBarComponentView.object

  addHandlers(handlers, currentTableSetter) {
    this._eventHandlers = handlers.optionControllers;
    this._currentTableSetter = currentTableSetter;
  }

  matchEvent(e) {
    //journals table matching strategy
    if (this._tableMatchChecker(e)) this._handleTableOptions(e);
  }

  _tableMatchChecker(e) {
    const match =
      e.target.classList.contains("table-journal") ||
      e.target.closest(".table-journal");

    return match;
  }

  _tableMatchStrategy(e) {
    const matchChecker = this._tableMatchChecker(e);
    const matchStrategy =
      (matchChecker && !this._optionsView._optionsActive) ||
      (matchChecker && this._optionsView._optionsActive);

    return matchStrategy;
  }

  _handleTableOptions(e) {
    const tableViewOptionRender = window.matchMedia(TABLE_VIEW_OPTION_REPLACE_TABLE_OPTION)
    if (tableViewOptionRender.matches) this._renderTableViewOptions(e)
    if (!tableViewOptionRender.matches) this._renderTableOptions(e)
  }

  _renderTableOptions(e) {
    const { currentTable, currentTableIsActiveTable } = this._activateTable(e);

    //use overlay imp instead
    if (currentTableIsActiveTable) {
      this._renderAndListenForTableOptionsEvents(currentTable);
    }

  }

  _renderTableViewOptions(e) {
    const container = document.querySelector(".table-row-active")
    tableActionsProcessorView._handleTableViewOptions(e, container)
  }

  /**
   * Reuseable for Wherever the component is rendered
   * * @param {Object} currentTable  The specific table to process events on if supplied
   */
  _renderAndListenForTableOptionsEvents(
    currentTable,
    callerCallBack = undefined
  ) {
    const cls = this;
    if (!this._active) {
      this._active = true;

      //get position of the currentTable
      const { top, left, width, height } = currentTable.getBoundingClientRect();

      const componentObj = {
        top,
        left,
        width,
        height,
        callBack: callerCallBack
          ? [cls._resetActiveState.bind(cls), callerCallBack]
          : cls._resetActiveState.bind(cls),
        selector: ".table-row-active--options",
        table: currentTable,
        updateUI: cls._updateUITableTitle.bind(cls),
        rename: cls._eventHandlers.controlRenameOption,
        delete: cls._eventHandlers.controlDeleteOption,
        duplicate: cls._eventHandlers.controlDuplicateOption,
      };

      const component = new tableOptionComponent(componentObj).render();
    }
  }

  _activateTable(
    e = undefined,
    currentTableSelector = false,
    tableToDisplayId = undefined
  ) {
    debugger;
    const allTables = document.querySelectorAll(".table-journal");

    const currentTable = currentTableSelector
      ? document.querySelector(currentTableSelector)
      : e.target.closest(".table-journal");

    const currentTableIsActiveTable =
      currentTable?.classList?.contains("table-row-active");

    //activate table if table is not active
    if (!currentTableIsActiveTable)
      this._activator(currentTable, allTables, tableToDisplayId);

    return { currentTable, currentTableIsActiveTable };
  }

  _activator(currentTable, allTables, tableToDisplayId = undefined) {
    allTables.forEach((table) => table.classList.remove("table-row-active"));

    if (currentTable) {
      currentTable.classList.add("table-row-active");
      this._currentTableSetter(+currentTable.dataset.id);

      //update sidebar tables if open
      if (componentGlobalState.sideBarListActive) {
        const sidebarJournalContainer = document.querySelector(
          ".nav-options-journal"
        );
        this._sidebarComponentView._renderSideBarList(null, sidebarJournalContainer);
      }
    }

    if (!currentTable) {
      this._currentTableSetter(null, tableToDisplayId);
    }

    // notify tableComponentView of Current Table
    this._active = false;
  }

  _updateUITableTitle(currentTable, titleValue) {
    // const [_, journalId, journalIndex] = tableAttribs;
    const tableTitles = Array.from(
      document.querySelectorAll(`[data-id="${currentTable.dataset.id}"]`)
    );

    tableTitles.forEach((title) => {
      if (+title.dataset.id === +currentTable.dataset.id) {
        //update table render
        if (title.classList.contains("table-journal"))
          title.querySelector(".table-row-text").textContent = titleValue;

        //update options render
        if (title.classList.contains("table-view-options"))
          title
            .closest(".table-view-box")
            .querySelector(".table-row-text").textContent = titleValue;
      }
    });
  }

  _resetActiveState() {
    this._active = false;
  }
}

export default new TableHeadProcessorView();

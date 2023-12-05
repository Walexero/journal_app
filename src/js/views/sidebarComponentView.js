import { USER } from "../config";
// import signals from "../signals";
import { importSignals } from "../signals";
import { componentGlobalState } from "./componentView/componentGlobalState";
import { svgMarkup } from "../helpers";
import tableHeadProcessorView from "./tableHeadProcessorView";

class SideBarComponentView {
  _parentElement = document.querySelector(".nav-sidebar");
  _eventHandlers = null;
  _events = ["click"];
  _signals = importSignals.object

  init(sideBarHandler) {
    sideBarHandler();
    this.addSideBarDelegationEventListener();
    this._signals.subscribe({ component: this, source: ["journalInfo"] });
  }

  addComponentHandlers(handlers) {
    this._eventHandlers = handlers;
  }

  addSideBarDelegationEventListener() {
    const cls = this;
    this._events.forEach((ev) =>
      this._parentElement.addEventListener(ev, cls._handleEvents.bind(cls))
    );
  }

  _handleEvents(e, signals = false) {
    if (this._sideBarCollapseMatchStrategy(e))
      this._handleSideBarCollapseEvent(e);

    if (!signals) {
      if (this._sideBarListTablesMatchStrategy(e))
        this._handleSideBarListTablesEvent(e);

      if (this._sideBarRenderTableMatchStrategy(e))
        this._handleSideBarRenderTableEvent(e);
    }
  }

  _sideBarCollapseMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("angles-icon") ||
      e.target.closest(".angles-icon");
    return matchStrategy;
  }

  _sideBarOpenMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("angles-icon") ||
      e.target.closest(".angles-icon");
    return matchStrategy;
  }

  _sideBarListTablesMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("arrow-render") ||
      e.target.closest(".arrow-render");
    return matchStrategy;
  }

  _sideBarRenderTableMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("tables-list-box") ||
      e.target.closest(".tables-list-box");
    return matchStrategy;
  }

  _handleSideBarCollapseEvent(e) {
    const container = document.querySelector(".container");
    container.classList.toggle("nav-hide");
    //add icon to uncollapse sidebar
    if (container.classList.contains("nav-hide")) {
      const sideBarVisibleMarkup = this._generateSideBarVisibilityIcon();
      const contentHeader = document.querySelector(".container-header");
      contentHeader.insertAdjacentHTML("afterbegin", sideBarVisibleMarkup);
    }

    if (!container.classList.contains("nav-hide")) {
      //removes the sidebar opener from the journalInfo component
      const sideBarOpen = document.querySelector(".sidebar-open");
      sideBarOpen.remove();
    }
  }

  _handleSideBarListTablesEvent(e) {
    const sidebarJournalContainer = e.target.closest(".nav-options-journal");

    sidebarJournalContainer.classList.toggle("tables-open");

    this._renderSideBarList(e, sidebarJournalContainer);
  }

  _handleSideBarRenderTableEvent(e) {
    const tableId = e.target.closest(".tables-list-box").dataset.id;
    tableHeadProcessorView._activateTable(
      null,
      `.main-table-heading [data-id="${tableId}"]`,
      tableId
    );

    const sidebarJournalContainer =
      e.target.closest(".nav-options-journal") ||
      document.querySelector(".nav-options-journal");
    this._renderSideBarList(null, sidebarJournalContainer);
  }

  _renderSideBarList(e = undefined, sidebarJournalContainer) {
    const sideBarJournalTableContainer =
      e?.target
        ?.closest(".nav-options-journal")
        ?.querySelector(".tables-list") ??
      document.querySelector(".nav-options-journal .tables-list");

    const sideBarJournalIcon = e?.target.closest(".nav-options-icon");

    if (sidebarJournalContainer.classList.contains("tables-open")) {
      //let componentGlobal Keep state of its active status
      componentGlobalState.sideBarListActive = true;

      const currentTable =
        this._eventHandlers.tableControllers.controlGetTable();
      const sideBarTablesMarkup = this._eventHandlers.tableControllers
        .controlGetTableHeads()
        .map((table) =>
          this._generateSideBarTablesMarkup(table, currentTable.id)
        )
        .join("");

      if (sideBarJournalIcon) {
        sideBarJournalIcon.innerHTML = "";
        sideBarJournalIcon.insertAdjacentHTML(
          "afterbegin",
          svgMarkup("arrow-render arrow-down-icon icon icon-mid", "arrow-down")
        );
      }

      sideBarJournalTableContainer.innerHTML = "";
      sideBarJournalTableContainer.insertAdjacentHTML(
        "afterbegin",
        sideBarTablesMarkup
      );
    }

    if (!sidebarJournalContainer.classList.contains("tables-open")) {
      sideBarJournalTableContainer.innerHTML = "";

      //disable the notifier from the global state for components
      componentGlobalState.sideBarListActive = false;

      if (sideBarJournalIcon) {
        sideBarJournalIcon.innerHTML = "";
        sideBarJournalIcon.insertAdjacentHTML(
          "afterbegin",
          svgMarkup(
            "arrow-render arrow-right-icon icon icon-mid",
            "arrow-right"
          )
        );
      }
    }
  }

  _generateSideBarTablesMarkup(table, currentTableId) {
    return `
      <div class="tables-list-box hover ${table[1] === currentTableId ? "hover-bg-stay" : ""
      }" data-id="${table[1]}">
        <div class="tables-list-disc"></div>
        <li class="tables-list-table">${table[0]}</li>
      </div>
    `;
  }

  _generateSideBarHeadingMarkup(user) {
    const userFirstName = user.split(" ")[0];
    return `
        <div class="nav-options-heading">
            <div class="options-heading-icon">${userFirstName[0]}</div>
            <div class="options-heading-title">${userFirstName[0].toUpperCase() + userFirstName.slice(1)
      }'s Notion</div>

          ${svgMarkup("angles-icon sidebar-close icon", "angles-left")}
        </div>
    `;
  }

  _generateSideBarJournalMarkup(journalName) {
    return `
        <div class="nav-option nav-options-journal">
            <div class="nav-options-icon">
              ${svgMarkup(
      "arrow-render arrow-right-icon icon icon-mid",
      "arrow-right"
    )}
            </div>
    
            <div class="nav-icon-text">
              <div class="nav-options-journal-icon">
                ${svgMarkup("journal-icon icon", "journal-icon")}
              </div>

              <div class="nav-options-text">${journalName.length > 0 ? journalName : "Untitled"
      }</div>

              <div class="journal-tables-list">
              <ul class="tables-list">
              </ul>
              </div>
            </div>
        </div>
    `;
  }

  _generateMarkup(user, journal) {
    return `
        <div class="nav-sidebar-options">
            ${this._generateSideBarHeadingMarkup(user)}
            ${this._generateSideBarJournalMarkup(journal)}
        </div>
    `;
  }

  _generateSideBarVisibilityIcon() {
    return `
        <div class="sidebar-open nav-options-sidebar-open-icon">
          ${svgMarkup("angles-icon icon icon-lg", "angles-right")}
        </div>
    `;
  }

  render(journalName) {
    const markup = this._generateMarkup(USER, journalName);

    this._parentElement.innerHTML = "";
    this._parentElement.insertAdjacentHTML("beforeend", markup);
  }
}

export const importSideBarComponentView = {
  import: (() => new SideBarComponentView()), object: null
}

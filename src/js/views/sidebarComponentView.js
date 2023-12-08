import { USER, SIDEBAR_JOURNAL_TITLE_LENGTH, LAYOUT_BREAKPOINT } from "../config";
import { importSignals } from "../signals";
import { componentGlobalState } from "./componentView/componentGlobalState";
import { svgMarkup, valueEclipser, matchStrategy, formatJournalHeadingName } from "../helpers";
import tableHeadProcessorView from "./tableHeadProcessorView";
import { Form } from "../views/loginView/form.js"
import { Overlay } from "./loginView/overlay.js";

class SideBarComponentView {
  _parentElement = document.querySelector(".nav-sidebar");
  _eventHandlers = null;
  _events = ["click"];
  _signals = importSignals.object
  _children = []
  _token

  init(sideBarHandler, token) {
    debugger
    this._token = token;
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
    if (matchStrategy(e, "angles-icon"))
      this._handleSideBarCollapseEvent(e);

    if (!signals) {
      if (matchStrategy(e, "table-list-arrow-render"))
        this._handleSideBarListTablesEvent(e);

      if (matchStrategy(e, "update-list-arrow-render")) this._handleSideBarUpdateEvent(e)

      if (matchStrategy(e, "tables-list-box"))
        this._handleSideBarRenderTableEvent(e);

      if (matchStrategy(e, "update-user-info")) this._handleUpdateUserInfoEvent(e)

      if (matchStrategy(e, "update-user-pwd")) this._handleUpdateUserPasswordEvent(e)
    }
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

      const layoutBreakpointTrigger = window.matchMedia(LAYOUT_BREAKPOINT)
      if (layoutBreakpointTrigger.matches) {
        const containerSideBeekCloseIcon = document.querySelector(".slide-nav-close")
        containerSideBeekCloseIcon?.click()
      }

    }
  }

  _handleSideBarListTablesEvent(e) {
    const sidebarJournalContainer = e.target.closest(".nav-options-journal");

    sidebarJournalContainer.classList.toggle("tables-open");

    this._renderSideBarList(e, sidebarJournalContainer);
  }

  _handleSideBarUpdateEvent(e) {
    const sidebarUpdateOptionContainer = e.target.closest(".nav-options-user");
    sidebarUpdateOptionContainer.classList.toggle("updates-open");
    const updateInfoContainer = sidebarUpdateOptionContainer.querySelector(".update-info-list")
    const sideBarUpdateIcon = e.target.closest(".nav-options-icon")

    const renderUpdatesOptions = sidebarUpdateOptionContainer.classList.contains("updates-open")
    if (renderUpdatesOptions) {
      const updateOptionsMarkup = this._generateSideBarUpdateOptionsMarkup()
      sideBarUpdateIcon.innerHTML = "";
      sideBarUpdateIcon.insertAdjacentHTML(
        "afterbegin",
        svgMarkup("update-list-arrow-render arrow-render arrow-down-icon icon icon-mid", "arrow-down")
      )

      updateInfoContainer.innerHTML = "";
      updateInfoContainer.insertAdjacentHTML("afterbegin", updateOptionsMarkup)

    }
    if (!renderUpdatesOptions) {
      updateInfoContainer.innerHTML = "";
      sideBarUpdateIcon.innerHTML = "";
      sideBarUpdateIcon.insertAdjacentHTML("afterbegin", svgMarkup(
        "update-list-arrow-render arrow-render arrow-right-icon icon icon-mid",
        "arrow-right"
      ))
    }
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
          svgMarkup("table-list-arrow-render arrow-render arrow-down-icon icon icon-mid", "arrow-down")
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
            "table-list-arrow-render arrow-render arrow-right-icon icon icon-mid",
            "arrow-right"
          )
        );
      }
    }
  }

  _handleUpdateUserInfoEvent(e) {
    const updateUserInfoForm = Form.form("updateInfo")
    updateUserInfoForm.addToken(this._token)
    updateUserInfoForm.component()
    const overlay = new Overlay(updateUserInfoForm)
    this._children.push(updateUserInfoForm, overlay)
    overlay.render()
  }

  _handleUpdateUserPasswordEvent(e) {
    const updateUserPasswordForm = Form.form("updatePwd")
    updateUserPasswordForm.addToken(this._token)
    updateUserPasswordForm.component()
    const overlay = new Overlay(updateUserPasswordForm)
    this._children.push(updateUserPasswordForm, overlay)
    overlay.render()
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

  _generateSideBarUpdateOptionsMarkup() {
    return `
      <div class="update-list-box update-user-info hover">
        <div class="update-list-disc"></div>
        <li class="update-option">Update User Info</li>
      </div>
      <div class="update-list-box update-user-pwd hover">
        <div class="update-list-disc"></div>
        <li class="update-option">Update Password</li>
      </div>

    `;
  }

  _generateSideBarHeadingMarkup(username) {
    return `
        <div class="nav-options-heading">
            <div class="options-heading-icon">${username[0]}</div>
            <div class="options-heading-title">${formatJournalHeadingName(username)}</div>

          ${svgMarkup("angles-icon sidebar-close icon", "angles-left")}
        </div>
    `;
  }

  _generateSideBarJournalMarkup(journalName) {
    return `
        <div class="nav-option nav-options-journal">
          <div class="nav-group">
            <div class="nav-options-icon">
              ${svgMarkup(
      "table-list-arrow-render arrow-render arrow-right-icon icon icon-mid",
      "arrow-right"
    )}
            </div>
    
            <div class="nav-icon-text">
              <div class="nav-options-journal-icon">
                ${svgMarkup("journal-icon icon", "journal-icon")}
              </div>

              <div class="nav-options-text">${journalName.length > 0 ? valueEclipser(journalName, SIDEBAR_JOURNAL_TITLE_LENGTH) : "Untitled"
      }</div>
      </div>
      </div>
      <div class="journal-tables-list">
      <ul class="tables-list">
      </ul>
      </div>
        </div>
    `;
  }

  _generateSideBarUserSettingsOption() {
    return `
      <div class="nav-option nav-options-user">
        <div class="nav-group">
          <div class="nav-options-icon">
            ${svgMarkup("update-list-arrow-render arrow-render arrow-right-icon icon icon-mid", "arrow-right")}
          </div>

          <div class="nav-icon-text">
            <div class="nav-options-journal-icon">
              ${svgMarkup("journal-icon icon", "journal-icon")}
            </div>
            <div class="nav-options-text">Update Info</div>
          </div>
        </div>
        <div class="journal-update-info-list">
          <ul class="update-info-list">

          </ul>
        </div>
      </div>
    `;
  }

  _generateMarkup(user, journal) {
    return `
        <div class="nav-sidebar-options">
            ${this._generateSideBarHeadingMarkup(user)}
            ${this._generateSideBarJournalMarkup(journal)}
            ${this._generateSideBarUserSettingsOption()}
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

  render(dataObj) {
    const { username, journalName } = dataObj
    console.log("the username", username)
    const markup = this._generateMarkup(username, journalName);

    this._parentElement.innerHTML = "";
    this._parentElement.insertAdjacentHTML("beforeend", markup);
  }
}

export const importSideBarComponentView = {
  import: (() => new SideBarComponentView()), object: null
}

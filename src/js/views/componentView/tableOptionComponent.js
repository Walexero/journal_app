// import componentOptionsView from "./componentOptionsView.js";
import { importComponentOptionsView } from "./componentOptionsView.js";
import { componentGlobalState } from "./componentGlobalState.js";
// import sidebarComponentView from "../sidebarComponentView.js";
import { importSideBarComponentView } from "../sidebarComponentView.js";
import { svgMarkup, matchStrategy } from "../../helpers.js";

export default class TableOptionComponent {
  _componentHandler = importComponentOptionsView.object;
  _state;
  _events = ["click"];
  _sidebarComponentView = importSideBarComponentView.object

  constructor(state) {
    this._state = state;
  }

  _generateMarkup() {
    return `
          <div class="table-row-active--options component-options">
            <div class="table-options">
              <div class="table-options-edits--option">
                <div class="edit-content-container">
                  <div class="edit-content-box">
                    <div class="edit-content-form hidden">
                      <form action="" id="table-rename-form">
                        <input
                          type="text"
                          placeholder=""
                          class="table-rename component-form"
                          name="table-rename"
                        />
                      </form>
                    </div>
                    <div class="edit-content">
                      <div class="edit-content-icon">
                        ${svgMarkup("edit-icon", "pen-to-square")}
                      </div>
                      <div class="edit-text">Rename</div>
                    </div>
                    
                  </div>
                </div>
              </div>
              <div class="table-options-actions--option">
                <div class="actions-content-container">
                  <div class="actions-content-box">
                    <div class="action-content action-duplicate">
                      <div class="action-content-icon">
                        ${svgMarkup("action-icon", "clone")}
                      </div>
                      <div class="action-text">Duplicate</div>
                    </div>
                    <div class="action-content action-delete">
                      <div class="action-icon">
                        ${svgMarkup("action-icon", "trashcan-icon")}
                      </div>
                      <div class="action-text">Delete</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
  }

  render() {
    const cls = this;
    this._state.markup = this._generateMarkup();
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
    debugger;
    if (this._renameMatchStrategy(e)) this._handleRenameEvent(e);
    if (this._deleteMatchStrategy(e)) this._handleDeleteEvent(e);
    if (this._duplicateMatchStrategy(e)) this._handleDuplicateEvent(e);
  }

  _renameMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("edit-content") ||
      e.target.closest(".edit-content");
    return matchStrategy;
  }

  _deleteMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("action-delete") ||
      e.target.closest(".action-delete");
    return matchStrategy;
  }

  _duplicateMatchStrategy(e) {
    {
      const matchStrategy =
        e.target.classList.contains("action-duplicate") ||
        e.target.closest(".action-duplicate");
      return matchStrategy;
    }
  }

  _handleRenameEvent(e) {
    const cls = this;
    const state = this._state;

    const renameInputContainer = document.querySelector(".edit-content-form");
    const renameInputForm = document.querySelector("#table-rename-form");
    const renameInput = document.querySelector(".table-rename");

    //show the input container
    renameInputContainer.classList.toggle("hidden");

    //get the input value
    renameInput.value = state.table.dataset.name;

    renameInputForm.addEventListener("submit", function (e) {
      e.preventDefault();
      //format form data
      let formData = new FormData(e.target);
      [formData] = [...formData];

      //set table UI value if exists
      state.updateUI(state.table, renameInput.value);
      //updateUi being updateUItableTitle

      //change the dataset name on the current table
      state.table.dataset.name = renameInput.value;

      //clear and hide form
      cls._hideInputcontainer(renameInputContainer);

      //update model
      state.rename(formData[1], +state.table.dataset.id);

      //update sidebar tables if open
      if (componentGlobalState.sideBarListActive) {
        const sidebarJournalContainer = document.querySelector(
          ".nav-options-journal"
        );
        this._sidebarComponentView._renderSideBarList(null, sidebarJournalContainer);
      }
    });
  }

  _handleDeleteEvent(e) {
    const state = this._state;
    this.remove();
    state.delete(+state.table.dataset.id);

    //update sidebar tables if open
    if (componentGlobalState.sideBarListActive) {
      const sidebarJournalContainer = document.querySelector(
        ".nav-options-journal"
      );
      this._sidebarComponentView._renderSideBarList(null, sidebarJournalContainer);
    }
  }

  _handleDuplicateEvent(e) {
    debugger
    const state = this._state;
    this.remove();
    state.duplicate(+state.table.dataset.id);

    //update sidebar tables if open
    if (componentGlobalState.sideBarListActive) {
      const sidebarJournalContainer = document.querySelector(
        ".nav-options-journal"
      );
      this._sidebarComponentView._renderSideBarList(null, sidebarJournalContainer);
    }
  }

  _hideInputcontainer(inputContainer) {
    inputContainer.classList.toggle("hidden");
  }

  remove() {
    const cls = this;
    this._state.overlayInterceptor.click();
    this._events.forEach((ev) =>
      this._state.component.removeEventListener(ev, cls._handleEvents, true)
    );
    this._state.component.remove();
  }
}

import optionsView from "./optionsView.js";
import { TABLE_NOT_FOUND_RESPONSE, TABLE_PROPERTIES } from "../config.js";

class TableOptionsView extends optionsView {
  _currentTable;
  _currentOption;
  _optionsActive = false;
  _renameHandler;
  _duplicateHandler;
  _deleteHandler;

  addHeadOptionHandlers(...handlers) {
    handlers = [...handlers[0]];
    [this._renameHandler, this._duplicateHandler, this._deleteHandler] =
      handlers;
  }

  _handleOptionsDelegationEvents(
    e,
    table,
    tableAttribs,
    overlay,
    callerOverlay,
    callBack
  ) {
    this._currentTable = table;
    this._handleEditOptions(e, tableAttribs);
    this._handleActionOptions(e, table, overlay, callerOverlay, callBack);
  }

  _handleEditOptions(e, tableAttribs) {
    let optionsValue;

    const noOptionsValue =
      !e.target.classList.contains("edit-content") ||
      !e.target.classList.contains("edit-text");

    if (noOptionsValue) {
      optionsValue = e.target
        ?.closest(".edit-content")
        ?.querySelector(".edit-text")
        .textContent.trim();
      // console.log("traversed", w);
    }
    if (!noOptionsValue) optionsValue = e.target.textContent.trim();

    console.log(optionsValue);
    if (optionsValue && optionsValue === "Rename")
      this._handleRenameOption(tableAttribs);
  }

  _handleActionOptions(e, table, overlay, callerOverlay, callBack) {
    let optionsValue;

    const noOptionsValue =
      !e.target.classList.contains("action-content") ||
      !e.target.classList.contains("action-text");

    if (noOptionsValue) {
      optionsValue = e.target
        ?.closest(".action-content")
        ?.querySelector(".action-text")
        .textContent.trim();
    }
    if (!noOptionsValue) optionsValue = e.target.textContent.trim();

    console.log(optionsValue);
    if (optionsValue && optionsValue === "Duplicate")
      this._handleDuplicateOption(e, table, overlay, callerOverlay, callBack);

    if (optionsValue && optionsValue === "Delete")
      this._handleDeleteOption(e, table, overlay, callerOverlay, callBack);
  }

  _handleRenameOption(tableAttribs) {
    const cls = this;
    debugger;
    const renameInputContainer = document.querySelector(".edit-content-form");
    const renameInputForm = document.querySelector("#table-rename-form");
    const renameInput = document.querySelector(".table-rename");

    //show the input container
    renameInputContainer.classList.toggle("hidden");

    //get the input value
    renameInput.value = this._currentTable.dataset.name;

    renameInputForm.addEventListener("submit", function (e) {
      e.preventDefault();
      //format form data
      let formData = new FormData(e.target);
      [formData] = [...formData];

      console.log(formData);

      //set table UI value if exists
      cls._updateUITableTitle(cls._currentTable, renameInput.value);

      //change the dataset name on the current table
      cls._currentTable.dataset.name = renameInput.value;

      //clear and hide form
      cls._hideInputcontainer(renameInputContainer);

      //update model
      const [_, journalId] = tableAttribs;
      cls._renameHandler(formData[1], journalId);
    });
  }

  _handleDuplicateOption(e, table, overlay, callerOverlay, callBack) {
    console.log("the cur table gotten", table);
    // const currentTable = document.querySelector(".table-row-active");
    const journalId = +table.dataset.id;
    overlay.remove();
    if (callerOverlay) callerOverlay.remove();
    callBack();
    this._duplicateHandler(journalId);
  }

  _handleDeleteOption(e, table, overlay, callerOverlay, callBack) {
    // const currentTable = document.querySelector(".table-row-active");
    const journalId = +table.dataset.id;
    overlay.remove();
    if (callerOverlay) callerOverlay.remove();
    callBack();
    this._deleteHandler(journalId);
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

  _clearAndHideInput(input, inputContainer) {
    input.value = "";
    inputContainer.classList.toggle("hidden");
  }

  _hideInputcontainer(inputContainer) {
    inputContainer.classList.toggle("hidden");
  }

  // renderAndGetTableViewOptions(container, tables) {
  //   container.insertAdjacentHTML(
  //     "beforeend",
  //     this._generateTableViewOptionsMarkup(tables)
  //   );

  //   const tableViewContainer = document.querySelector(
  //     ".table-view-list--options"
  //   );
  //   return tableViewContainer;
  // }

  // renderAndGetTableFilterOptions(container) {
  //   container.insertAdjacentHTML(
  //     "beforeend",
  //     this._generateFilterOptionsMarkup(TABLE_PROPERTIES.properties)
  //   );

  //   const filterOptionsContainer = document.querySelector(
  //     ".filter-add-action--options"
  //   );
  //   return filterOptionsContainer;
  // }

  _generateOptionsMarkup() {
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
                    <img
                      class="edit-icon"
                      src="./src/icons/pen-to-square.svg"
                      alt=""
                    />
                  </div>
                  <div class="edit-text">Rename</div>
                </div>
                
              </div>
            </div>
          </div>
          <div class="table-options-actions--option">
            <div class="actions-content-container">
              <div class="actions-content-box">
                <div class="action-content">
                  <div class="action-content-icon">
                    <img class="action-icon" src="./src/icons/clone.svg" alt="" />
                  </div>
                  <div class="action-text">Duplicate</div>
                </div>
                <div class="action-content">
                  <div class="action-icon">
                    <img
                      class="action-icon"
                      src="./src/icons/trashcan-icon.svg"
                      alt=""
                    />
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

  _generateTableViewOptions(tables) {
    let viewsMarkup = "";

    const tablesAvailable = tables.length > 0;

    if (tablesAvailable)
      tables.forEach((journal) => {
        const [journalName, journalId] = journal;
        viewsMarkup += `
        <div class="table-list-content hover" >
          <div class="table-view-box">

            <div class="table-view-content">
              <div class="table-row-icon">
                <img class="icon-active" src="./src/icons/list-icon.svg" alt="" />
              </div>
              <div class="table-row-text color-active">${journalName}</div>
            </div>

            <div class="table-view-options" data-name="${journalName}" data-id="${journalId}">
              <div class="table-row-icon hover-dull">
                <img src="./src/icons/ellipsis.svg"
                class="table-icon icon-md"
                alt=""
                />
              </div>
            </div>
          </div>
        </div>
      `;
      });

    if (!tablesAvailable)
      viewsMarkup += `
        <div class="table-view-box">
          <div class="table-view-content">
            <div class="table-row-text">${TABLE_NOT_FOUND_RESPONSE}</div>
          </div>
        </div>
      `;
    return viewsMarkup;
  }

  _generateTableViewOptionsMarkup(journals) {
    const viewsMarkup = this._generateTableViewOptions(journals);

    return `
      <div class="table-view-list--options component-options">
        <div class="table-options">
          <div class="table-list--option">
            <div class="table-list-content-box">
              <div class="table-search-input">
                <input
                  type="text"
                  name="table-search"
                  class="table-search component-form"
                  placeholder="Search for a View..."
                />
              </div>
              <div class="table-content">
                <div class="add-table-content">
                  ${viewsMarkup}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    `;
  }

  _generateFilterOptions(properties) {
    let propertiesMarkup = "";

    properties.forEach((property) => {
      propertiesMarkup += `
        <div class="action-filter-content">
          <div class="action-filter-icon">
            <img
              src="${property.icon}"
              class="filter-icon"
              alt=""
            />
          </div>
          <div class="action-filter-text">${property.text}</div>
        </div>
                  
      `;
    });
    return propertiesMarkup;
  }

  _generateFilterOptionsMarkup(properties) {
    return `
      <div class="filter-add-action--options component-options">
        <div class="filter-options">
          <div class="filter-options-filter--option">
            <div class="filter-content-box">
              <form action="" id="filter-content-forms">
                <input
                  type="text"
                  name="filter-search"
                  class="filter-search component-form"
                  placeholder="Filter by..."
                />
              </form>
              <div class="filter-content">
                <div class="add-action-filters">
                  ${this._generateFilterOptions(properties)}
                </div>
              </div>
            </div>
            <div class="action-options-add-container">
              <div class="action-options-add-box">
                <div class="action-options-add-content">
                  <div class="action-filter-icon">
                    <img
                      src="./src/icons/plus.svg"
                      class="filter-icon filter-icon-add"
                      alt=""
        
                    <img
                      src="./src/icons/filter.svg"
                      class="filter-icon filter-icon-filter"
                      alt=""
                    />
                  </div>
                  <div class="action-filter-text color-dull">
                    Add advanced filter
                  </div>
                </div>
                <div
                  class="action-filter-rules-added color-dull"
                >
                  1 rule
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _generateFilterMarkup() {
    return `
      <div class="filter-container">
        <div class="filter-action-container">
          <div class="filter-added-rule-box">
            <div class="added-rule">rule applied</div>
            <div class="added-rule-icon">
              <img
                class="rule-icon icon-sm"
                src="./src/icons/arrow-down.svg"
                alt=""
              />
            </div>
          </div>
          <div class="filter-add-action">+ Add filter</div>
        </div>
      </div>
    `;
  }
}

export default new TableOptionsView();

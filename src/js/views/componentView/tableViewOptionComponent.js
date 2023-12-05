import { importComponentOptionsView } from "./componentOptionsView.js";
import { TABLE_NOT_FOUND_RESPONSE } from "../../config.js";
import tableHeadProcessorView from "../tableHeadProcessorView.js";
import { svgMarkup } from "../../helpers.js";

export default class TableViewOptionComponent {
  _componentHandler = importComponentOptionsView.object;
  _state;
  _events = ["click", "keyup"];

  constructor(state) {
    this._state = state;
  }

  _generateTableViewOptionsMarkup(tables) {
    let viewsMarkup = "";

    const tablesAvailable = tables.length > 0;

    if (tablesAvailable)
      tables.forEach((table) => {
        const [tableName, tableId] = table;
        viewsMarkup += `
            <div class="table-list-content hover" >
              <div class="table-view-box">
    
                <div class="table-view-content">
                  <div class="table-row-icon">
                    ${svgMarkup("icon-active", "list-icon")}
                  </div>
                  <div class="table-row-text color-active">${tableName}</div>
                </div>
    
                <div class="table-view-options" data-name="${tableName}" data-id="${tableId}">
                  <div class="table-row-icon hover-dull">
                    ${svgMarkup("table-icon icon-lg", "ellipsis")}
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

  _generateMarkup(tables) {
    const viewsMarkup = this._generateTableViewOptionsMarkup(tables);

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

  render() {
    const cls = this;
    this._state.markup = this._generateMarkup(this._state.tables);

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
    if (this._tableViewOptionsFormStrategy(e))
      this._handleTableViewOptionForm(tables);

    if (this._tableViewOptionsOptionStrategy(e))
      this._handleTableOptionsOption(e);
  }

  _tableViewOptionsFormStrategy(e) {
    const viewOptionsFormStrategy =
      e.type === "keyup" &&
      (e.target.classList.contains(".table-search") ||
        e.target.closest(".table-search-input"));
    return viewOptionsFormStrategy;
  }

  _tableViewOptionsOptionStrategy(e) {
    const viewOptionsOptionStrategy =
      e.type === "click" &&
      (e.target.classList.contains("table-icon") ||
        e.target.closest(".table-view-options"));
    return viewOptionsOptionStrategy;
  }

  _handleTableViewOptionForm(e) {
    const tables = this._state.tables;
    const tableViewOptionContainer =
      document.querySelector(".add-table-content");
    const tableViewForm = document.querySelector(".table-search");
    const renderTables = tables.filter((table) =>
      table[0].toLowerCase().includes(tableViewForm.value)
    );
    //if no filter matches, add a no match found message

    tableViewOptionContainer.innerHTML = "";
    tableViewOptionContainer.insertAdjacentHTML(
      "beforeend",
      this._generateTableViewOptionsMarkup(renderTables)
    );
  }

  _handleTableOptionsOption(e) {
    const renderViewOptions = e.target.closest(".table-view-options");
    // const renderViewOptionsTable = renderViewOptions.closest(
    //   ".table-list-content"
    // );

    //offload event handling to head process
    tableHeadProcessorView._renderAndListenForTableOptionsEvents(
      renderViewOptions,
      this.remove.bind(this)
    );
  }

  remove() {
    const cls = this;
    this._state.overlayInterceptor.click();
    this._events.forEach((ev) =>
      this._state.component.removeEventListener(ev, cls._handleEvents, true)
    );
    this._state?.component?.remove();
  }
}

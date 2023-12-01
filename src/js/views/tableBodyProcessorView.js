import { dateTimeFormat, svgMarkup } from "../helpers.js";
import tagOptionComponent from "./componentView/tagsOptionComponent.js";
import tableInputComponent from "./componentView/tableInputComponent.js";
import { componentGlobalState } from "./componentView/componentGlobalState.js";
import containerSidePeekComponentView from "./containerSidePeekComponentView.js";
import alertComponent from "./componentView/alertComponent.js";
import { COPY_ALERT } from "../config.js";
// import componentOptionsView from "./componentView/componentOptionsView.js";
import {
  importComponentOptionsView
} from "./componentView/componentOptionsView.js";
class TableBodyProcessorView {
  _parentElement = document.querySelector(`[role="tablebody"]`);
  _componentHandler = importComponentOptionsView.cls
  _eventHandlers;
  _textInputActive = false;
  _currentTable;
  _currentTableSetter;
  _hoverActive = false;
  _tags;
  _tagsColor;
  _checkedInputs = [];
  _currentHoverId = null;
  _token;

  addHandlers(handlers, currentTableSetter) {
    this._eventHandlers = handlers; //.tableItemControllers;
    this._currentTableSetter = currentTableSetter;
  }

  addTagsMetaData(...tagsMetaData) {
    tagsMetaData = [...tagsMetaData[0]];
    [this._tags, this._tagsColor] = tagsMetaData;
  }

  resetTextInputActiveState() {
    this._textInputActive = false;
  }

  callUpdateItemHandler(updateObj, filter = undefined, sort = undefined, payloadType = undefined) {
    this._eventHandlers.tableItemControllers.controlUpdateTableItem(
      updateObj,
      filter,
      sort,
      payloadType
    );
  }

  render(currentTable) {
    //guard clause against logic trigger
    if (!currentTable || !currentTable?.tableItems?.length > 0) return;
    const markup = this._generateItemMarkup(currentTable.tableItems);
    const tableBody = document.querySelector(`[role="tablebody"]`);
    tableBody.innerHTML = "";
    tableBody.insertAdjacentHTML("afterbegin", markup);
  }

  renderTableInput(inputContainer, currentTable = undefined) {
    const cls = this;

    //if currentTable not passeed in, get the current table from the DOM
    this._currentTable = currentTable
      ? currentTable
      : document.querySelector(".table-row-active").dataset;

    //prevent Another textInput from being triggered
    this._textInputActive = true;

    const { top, left, width, height } = inputContainer.getBoundingClientRect();

    const textContainer = inputContainer
      .closest(".row-actions-segment")
      .querySelector(".row-actions-text");

    const itemId = inputContainer.closest(".row-actions-handler-container")
      .dataset.id;

    //instantiating an updateObj allows the updateModel to get assess to the updateObj(same reference)
    const updateObj = {
      tableId: +this._currentTable.id,
      itemId: +itemId,
    };

    const componentObj = {
      top,
      left,
      width,
      height,
      selector: ".row-actions-text-input",
      table: inputContainer,
      component: textContainer,
      callBack: this.resetTextInputActiveState.bind(this),
      updateObj: updateObj,
      updateModel: this.callUpdateItemHandler.bind(this, updateObj),
    };

    const component = new tableInputComponent(componentObj);
    component.render();
  }

  _addOrRemoveChecked = (input, specifier) => {
    if (specifier === 1) {
      input.classList.add("highlight-rows");
      const inputCheckbox = input.querySelector(".checkboxInput");
      inputCheckbox.classList.add("visible");
      inputCheckbox.checked = true;
    }

    if (specifier === 0) {
      input.classList.remove("highlight-rows");
      const inputCheckbox = input.querySelector(".checkboxInput");
      inputCheckbox.classList.remove("visible");
      inputCheckbox.checked = false;
    }
  };

  matchEvent(e) {
    //if table item add checker before body event active
    if (this._itemAddChecker(e)) this._handleItemAdd(e);

    //checkbox container related events
    const checkTarget = e.target.closest("[role=tablehead]");
    if (checkTarget) {
      //protect checker with guardclause
      if (this._itemCheckboxChecker(e)) this._handleItemSelect(e);
    }

    this._handleCheckboxDelegationEvents(e);
  }

  _itemAddChecker(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("row-adder-content") ||
        e.target.closest(".row-adder-content");

      if (matchStrategy) {
        const filterExists = document.querySelector(".filter-added-rule"); //(".filter-added-rule-box");
        const filterContent = filterExists?.textContent?.trim().length > 0;
        const sortExists = document.querySelector(".sort-added-rule-box");
        if ((filterExists && filterContent) || sortExists) return false;

        //prevent add if search is active
        const tableSearchText = document.querySelector(".search-input");
        if (tableSearchText && tableSearchText.value.trim().length > 0)
          return false;

        if (!filterContent || !filterExists || !sortExists) return true;
      }
    }
  }

  _itemCheckboxChecker(e) {
    if (e.type === "click") if (e.target.closest(".checkboxInput")) return true;
  }

  _handleItemAdd(e) {
    //call controller to add new Item
    this._eventHandlers.tableItemControllers.controlAddTableItem();
  }

  _generateAndinsertCheckboxOption(container, itemCount) {
    const checkboxOptionMarkup = this._generateCheckboxOptionMarkup(itemCount);

    container.insertAdjacentHTML("beforeend", checkboxOptionMarkup);
  }

  _handleItemSelect(e) {
    let checkboxOptions;

    const toggleFunctionality = (input) => {
      input.classList.toggle("highlight-rows");
      const inputCheckbox = input.querySelector(".checkboxInput");
      inputCheckbox.classList.toggle("visible");
    };

    //determine if body is clicked or had
    const selectAllItems = e.target.closest("[role=tablehead]");
    const selectItems = e.target.closest("[role=tablebody]");

    //use to show the checkbox option
    const tableHeadContainer = document.querySelector(".main-table-head");

    if (selectAllItems) {
      const allItemsSelected = Array.from(
        document.querySelectorAll("[role=tablecontent]")
      );
      const allSelectIsChecked = selectAllItems.querySelector(".checkboxInput");

      if (allSelectIsChecked.checked === true) {
        this._checkedInputs.length = 0;
        this._checkedInputs.push(...allItemsSelected);
        this._checkedInputs.forEach((input) => {
          this._addOrRemoveChecked(input, 1);
        });
      }

      if (!allSelectIsChecked.checked === true) {
        this._checkedInputs.forEach((input) => {
          this._addOrRemoveChecked(input, 0);
          input.querySelector(".checkboxInput").checked = false;
        });
        this._checkedInputs.length = 0;
      }
    }

    if (selectItems && !selectAllItems) {
      const selectedItem = e.target.closest("[role=tablecontent]");

      const selectedItemIsChecked =
        selectedItem.querySelector(".checkboxInput");
      const allItemsSelector = (document
        .querySelector("[role=tablehead]")
        .querySelector(".checkboxInput").checked = false);

      if (selectedItemIsChecked.checked === true) {
        toggleFunctionality(selectedItem);
        this._checkedInputs.push(selectedItem);
      } else {
        if (this._checkedInputs.length > 0) {
          const itemIndex = this._checkedInputs.findIndex(
            (item) => item === selectedItem
          );
          toggleFunctionality(selectedItem);
          this._checkedInputs.splice(itemIndex, 1);
          const allItemsSelector = (document.querySelector(
            "[role=tablehead]"
          ).querySelector.checked = false);
        }
      }
    }

    //render checkboxOption and update Length

    const checkIfCheckboxOptionExists =
      document.querySelector(".checkbox-options");
    const checkedLength = this._checkedInputs.length;

    if (!checkIfCheckboxOptionExists && checkedLength)
      this._generateAndinsertCheckboxOption(
        tableHeadContainer,
        this._checkedInputs.length
      );

    if (checkIfCheckboxOptionExists) {
      if (!checkedLength) {
        checkIfCheckboxOptionExists.remove();
        this._checkedInputs.length = 0;
      }

      if (checkedLength)
        checkIfCheckboxOptionExists
          .querySelector(".checkbox-total")
          .querySelector(
            ".checkbox-text"
          ).textContent = `${this._checkedInputs.length} selected`;
    }
  }

  _handleDelegatedEvents(e) {
    //if table item add checker after body event active
    if (this._itemAddChecker(e)) this._handleItemAdd(e);

    //hover handler
    if (this._itemHoverMatchStrategy(e)) this._handleItemHoverEvents(e);

    //textInput switch handler
    const clickedNameColumn = this._itemNameClickStrategy(e);
    clickedNameColumn &&
      this._handleNamePropertyClickEvent(e, clickedNameColumn);

    //tag options handler
    const clickedTagColumn = this._itemTagMatchStrategy(e);
    clickedTagColumn && this._handleTagPropertyClickEvent(e, clickedTagColumn);

    if (this._itemCheckboxChecker(e)) this._handleItemSelect(e);

    //hover action handler
    if (this._hoverActionAddChecker(e)) this._handleHoverActionAddEvent(e);

    //addTable item checker for the tablesearch
    if (this._tableSearchAddMatchStrategy(e))
      this._handleTableSearchAddEvent(e);

    //side peek opener
    if (this._containerSidePeekMatchStrategy(e))
      this._handleContainerSidePeekEvent(e);
  }

  _handleCheckboxDelegationEvents(e) {
    if (e.type !== "click") return;

    //checkbox text selected click
    if (this._checkboxTextSelectedMatchStrategy(e))
      this._handleCheckboxTextSelectedEvent(e);
    //checkbox delete click
    if (this._checkboxDeleteMatchStrategy(e))
      this._handleCheckboxDeleteEvent(e);

    //checkbox options option click
    if (this._checkboxDuplicateMatchStrategy(e))
      this._handleCheckboxDuplicateEvent(e);
    //checkbox tags click
    if (this._checkboxTagsMatchStrategy(e)) this._handleCheckboxTagsEvent(e);
  }

  _handleContainerSidePeekEvent(e) {
    //remove the container if it currently exists
    const sliderAlreadyExists = document.querySelector(
      ".container-slide-template"
    );
    if (sliderAlreadyExists) {
      sliderAlreadyExists.remove();
      document.querySelector(".container").classList.remove("side-peek");
    }

    // const currentTable = document.querySelector(".table-row-active");
    const cls = this;
    const itemId = e.target.closest(".row-actions-handler-container").dataset
      .id;

    const { item, position } =
      this._eventHandlers.tableItemControllers.controlGetTableItem(
        +cls._currentTable.id,
        +itemId,
        null,
        true
      );

    const componentObj = componentGlobalState.containerSidePeekComponentObj(
      itemId,
      item,
      position
    );
    const component = new containerSidePeekComponentView(componentObj);
    component.render();
  }

  _tableSearchAddMatchStrategy(e) {
    if (e.type === "click") {
      const tableSearchInput = document.querySelector(".search-input");
      const matchStrategy =
        e.target.classList.contains("row-adder-content") ||
        e.target.closest(".row-adder-content");

      if (matchStrategy && tableSearchInput) {
        if (
          tableSearchInput.value.length > 0 &&
          parseInt(getComputedStyle(tableSearchInput)["width"]) > 0 &&
          !componentGlobalState.filterMethod &&
          !componentGlobalState.sortMethod
        ) {
          return true;
        } else false;
      }
    }
  }

  _containerSidePeekMatchStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("row-actions-render-text") ||
        e.target.closest(".row-actions-render-text");
      return matchStrategy;
    }
  }

  _hoverActionAddChecker(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("row-add-icon") ||
        e.target.closest(".row-add-icon");

      if (matchStrategy) {
        const filterExists = document.querySelector(".added-rule"); //(".filter-added-rule-box");
        const filterContent = filterExists?.textContent?.trim().length > 0;
        const sortExists = document.querySelector(".sort-added-rule-box");

        if ((filterExists && filterContent) || sortExists) return false;
        if (!filterContent || !filterExists || !sortExists) return true;
      }
    }
  }

  _checkboxTextSelectedMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("checkbox-total") ||
      e.target.closest(".checkbox-total");
    return matchStrategy;
  }

  _checkboxDeleteMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("checkbox-delete") ||
      e.target.closest(".checkbox-delete");
    return matchStrategy;
  }

  _checkboxDuplicateMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("checkbox-clone") ||
      e.target.closest(".checkbox-clone");
    return matchStrategy;
  }

  _checkboxTagsMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("checkbox-tags") ||
      e.target.closest(".checkbox-tags");
    return matchStrategy;
  }

  _handleHoverActionAddEvent(e) {
    const targetContainer = e.target.closest(
      ".row-actions-handler"
    ).previousElementSibling;

    this._eventHandlers.tableItemControllers.controlAddTableItem(
      null,
      +targetContainer.dataset.id
    );
  }

  _handleTableSearchAddEvent(e) {
    const searchInput = document.querySelector(".search-input");
    this._eventHandlers.tableItemControllers.controlAddTableItem(null);
    searchInput.value = "";
  }

  _handleCheckboxTextSelectedEvent(e) {
    const checkboxOptions = document.querySelector(".checkbox-options");
    const allInputSelector = document.querySelector(
      "[role=tablehead] .checkboxInput"
    );

    this._checkedInputs.forEach((input) => {
      this._addOrRemoveChecked(input, 0);
    });
    checkboxOptions.remove();
    this._checkedInputs.length = 0;
    allInputSelector.checked = false;
  }

  _handleCheckboxDeleteEvent(e) {
    const selectedTableItems = this._checkedInputs.map(
      (item) => item.querySelector(".row-actions-handler-container").dataset.id
    );
    this._checkedInputs.length = 0;
    const currentTable = document.querySelector(".table-row-active");

    const updateObj = {
      tableId: +currentTable.dataset.id,
      items: selectedTableItems,
    };

    //check if filterMethod exists
    // const filter = componentGlobalState.filterMethod ?? null;
    this._eventHandlers.tableItemControllers.controlDeleteTableItem(
      updateObj,
      componentGlobalState.filterMethod,
      "deleteTableItems"
    );

    //remove checkbox options container
    document.querySelector(".checkbox-options").remove();
  }

  _handleCheckboxDuplicateEvent(e) {
    const currentTable = document.querySelector(".table-row-active");
    const checkboxOptionsContainer = e.target.closest(".checkbox-options");
    checkboxOptionsContainer.remove();

    const selectedTableItems = this._checkedInputs.map(
      (item) => item.querySelector(".row-actions-handler-container").dataset.id
    );
    this._checkedInputs.length = 0;

    const updateObj = {
      tableId: +currentTable.dataset.id,
      items: selectedTableItems,
    };

    this._eventHandlers.tableItemControllers.controlDuplicateTableItem(
      updateObj
    );
  }

  _handleCheckboxTagsEvent(e) {
    const cls = this;
    const checkboxOptionsContainer = e.target.closest(".checkbox-options");

    const tagViewportHolder = e.target.closest(".checkbox-tags");
    const { top, left, width, height } =
      tagViewportHolder.getBoundingClientRect();

    const currentTable = document.querySelector(".table-row-active");

    //clear the checkedInput
    this._checkedInputs.length = 0;
    debugger;
    const selectedTableItems = Array.from(
      document.querySelectorAll(".highlight-rows")
    ).map(
      (item) => item.querySelector(".row-actions-handler-container").dataset.id
    );

    const updateObj = {
      itemIds: selectedTableItems,
      tableId: +currentTable.dataset.id,
    };

    const getTableItemWithMaxTags =
      this._eventHandlers.tableItemControllers.controlGetTableItemWithMaxTags(
        updateObj.tableId,
        updateObj.itemIds
      );

    const componentObj = {
      table: tagViewportHolder,
      top,
      left,
      width,
      height,
      selector: ".options-markup",
      updateModel: cls.callUpdateItemHandler.bind(cls, updateObj),
      subComponentCallback: cls.callUpdateItemHandler.bind(cls),
      updateTag: true,
      eventHandlers: this._eventHandlers,
      updateObj: updateObj,
      tagItems: getTableItemWithMaxTags.itemTags,
      tags: this._tags,
      tagsColors: this._tagsColor,
      payloadType: "selectTags"
    };

    const component = new tagOptionComponent(componentObj);
    component.render();

    //remove checkbox container
    checkboxOptionsContainer.remove();
  }

  _handleNamePropertyClickEvent(e, clickedContainer) {
    if (!this._textInputActive) {
      //run if no current textInput is active
      const inputContainer = clickedContainer.querySelector(
        ".row-actions-segment"
      );

      //reuse input render functionality
      this.renderTableInput(inputContainer);
    }
  }

  _handleTagPropertyClickEvent(e, clickedContainer) {
    const cls = this;

    if (this._textInputActive) return;

    const itemId = clickedContainer.closest(".row-actions-handler-container")
      .dataset.id;

    const tagContainer = clickedContainer.querySelector(".table-item-tags");

    const getTableItemData =
      this._eventHandlers.tableItemControllers.controlGetTableItem(
        +cls._currentTable.id,
        +itemId
      );

    const { top, left, width, height } = tagContainer.getBoundingClientRect();

    //component code
    const updateObj = {
      tableId: +cls._currentTable.id,
      itemId: +itemId,
    };

    const componentObj = {
      top,
      left,
      width,
      height,
      selector: ".options-markup",
      table: tagContainer,
      updateModel: cls.callUpdateItemHandler.bind(cls, updateObj),
      subComponentCallback: cls.callUpdateItemHandler.bind(cls),
      updateTag: true,
      eventHandlers: this._eventHandlers,
      updateObj: updateObj,
      tagItems: getTableItemData.itemTags,
      itemId: itemId,
      tags: this._tags,
      tagsColors: this._tagsColor,
    };

    const component = new tagOptionComponent(componentObj);
    component.render();
  }

  _handleItemHoverEvents(e) {
    const cls = this;

    const hoverEl = componentGlobalState.hoverEl;
    //guard clause against textinput and hover activation at the same time
    if (this._textInputActive) return;

    const tableItemContainer = e.target.closest(`[role="tablecontent"]`);
    const tableContentContainer =
      tableItemContainer.querySelector(`[role="rowgroup"]`);

    const sliderTriggerEl = tableContentContainer.querySelector(
      ".row-actions-render"
    );

    sliderTriggerEl.classList.remove("hidden");

    tableContentContainer.insertAdjacentElement("beforeend", hoverEl);

    //add Copy functionality for the created property
    const copyTriggerEl = tableContentContainer.querySelector(
      ".table-item-created .row-actions-render"
    );
    copyTriggerEl.classList.remove("hidden");

    const parentEv = e;

    copyTriggerEl.addEventListener(
      "click",
      function (e) {
        e.stopPropagation();

        cls._handleHoverCopyEvent(parentEv, e, copyTriggerEl);
      },
      { once: true }
    );

    //remove the hovered elements
    tableItemContainer.addEventListener("mouseleave", function () {
      hoverEl.remove();
      sliderTriggerEl.classList.add("hidden");
      copyTriggerEl.classList.add("hidden");
    });
  }

  _handleHoverCopyEvent(parentEv, e, copyTriggerEl) {
    const hoverItemId =
      parentEv?.target?.closest(".row-actions-handler-container")?.dataset
        ?.id ?? null;

    if (!hoverItemId || +hoverItemId === this._currentHoverId) return;

    if (+hoverItemId != this._currentHoverId) {
      this._currentHoverId = +hoverItemId;
    }

    const copyContent = copyTriggerEl.previousElementSibling;
    navigator.clipboard.writeText(copyContent.textContent.trim());

    const componentObj = {
      container: "main",
      insertPosition: "beforeend",
      componentContainer: "null",
      selector: ".alert-box",
      alertMsg: COPY_ALERT,
    };

    const component = new alertComponent(componentObj);
    component.render();
  }

  _itemHoverMatchStrategy(e) {
    if (e.type === "mouseover") {
      const matchStrategy =
        e.target.role === "tablecontent" ||
        e.target.closest(`[role="tablecontent"]`);

      return matchStrategy;
    }
  }

  _itemNameClickStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("table-item-name") ||
        e.target.classList.contains("row-actions-segment") ||
        e.target.classList.contains("name-actions-text");

      return (
        matchStrategy && e.target.closest(".row-actions-handler-container")
      );
    }
  }

  _itemTagMatchStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("table-item-tags") ||
        e.target.closest(".table-item-tags");

      return (
        matchStrategy && e.target.closest(".row-actions-handler-container")
      );
    }
  }

  _generateItemMarkup(tableItems) {
    let itemMarkup = "";

    tableItems.forEach((item) => {
      itemMarkup += `
        <div role="tablecontent">

          <div class="tableInput-container">
            <label class="tableInput">
              <input type="checkbox" name="" class="checkboxInput" autocomplete="off">
              
            </label>
          </div>
          <div role="rowgroup">
            <div role="row" class="row-actions-handler-container" data-id="${item.id
        }">
              <span role="cell" class="table-item table-item-name">
                <div class="row-actions-segment">
                    <div class="name-actions-text row-actions-text highlight-column">${item.itemTitle
        }</div>
                    <div class="row-actions-render hidden">
                      <div class="row-actions-render-icon">
                        ${svgMarkup("row-icon", "arrow-open")}
                      </div>
                      <div class="row-actions-render-text">OPEN</div>
                      <div class="row-actions-tooltip">
                        <div class="tooltip-text">
                          Open in side peek
                        </div>
                      </div>
                    </div>
                </div>
              </span>
              <span role="cell" class="table-item table-item-created">
                <div class="row-actions-segment">
                  <div class="created-actions-text row-actions-text">
                    ${dateTimeFormat(item.id)}
                  </div>
                  <div class="row-actions-render hidden">
                    <div class="row-actions-render-icon">
                      ${svgMarkup("row-icon", "copy")}
                    </div>
                    <div class="row-actions-tooltip">
                      <div class="tooltip-text">
                        Copy to Clipboard
                      </div>
                    </div>
                  </div>
                </div>
              </span>
              <span role="cell" class="table-item table-item-tags">
              <div class="tags-actions-text row-actions-text">
                ${this._generateTagsItemMarkup(item.itemTags)}
              </div>
              </span>
            </div>
          </div>
        </div>
        
      `;
    });

    return itemMarkup;
  }

  _generateTagsItemMarkup(tags) {
    let itemTagsMarkup = "";
    const tagsExist = tags.length > 0;

    //get item tags markup
    if (tagsExist)
      tags.forEach((tag, i) => {
        const tagProperty = this._tags.find(modelTag => modelTag.id === tag) //tag is an id
        if (!tagProperty || tagProperty === -1) {
          tags.splice(i, 1)
        }
        if (tagProperty || tagProperty > 0)
          itemTagsMarkup += `
          <div class="tag-tag ${tagProperty.color}">
            ${tagProperty.text}
          </div>
      `;
      });
    return itemTagsMarkup;
  }

  _generateCheckboxOptionMarkup(selectedLength) {
    return `
      <div class="checkbox-options">
        <div class="checkbox-options-box">
          <div class="checkbox-item checkbox-total hover">
            <div class="checkbox-text">

              ${selectedLength} selected
            </div>
          </div>
          <div class="checkbox-item checkbox-tags hover">
            ${svgMarkup("icon-md icon-active", "list-icon")}

            <div class="checkbox-text">
              Tags
            </div>
          </div>
          <div class="checkbox-item checkbox-delete hover">
            ${svgMarkup("icon-md icon-active", "trashcan-icon")}
          </div>
          <div class="checkbox-item checkbox-clone hover">
            ${svgMarkup("icon-md icon-active", "clone")}
          </div>
        </div>
      </div>
    `;
  }

  _generateHoverMarkupAndCreateElement() {
    const hoverMarkup = `
        <div class="row-actions-handler">
          <div class="row-actions-icon row-add-icon hover">
            ${svgMarkup("row-icon", "plus")}
          </div>
          <div class="row-actions-icon row-drag-icon hover">
            ${svgMarkup("row-icon", "drag-icon")}
          </div>
        </div>
    `;
    const hoverEl =
      this._componentHandler.createHTMLElement(hoverMarkup);
    return hoverEl;
  }
}

export default new TableBodyProcessorView();

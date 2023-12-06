// import componentOptionsView from "./componentView/componentOptionsView.js";
import { importComponentOptionsView } from "./componentView/componentOptionsView.js";
import tagOptionComponent from "./componentView/tagsOptionComponent.js";
import { dateTimeFormat, svgMarkup } from "../helpers.js";
import alertComponent from "./componentView/alertComponent.js";
import { COPY_ALERT } from "../config.js";
import icons from "url:../../icons.svg";
import { componentGlobalState } from "./componentView/componentGlobalState.js";
export default class ContainerSidePeekComponentView {
  _componentHandler = importComponentOptionsView.object
  _state;
  _events = ["click", "keyup", "keydown"];
  _updateAndAddTriggeredBeforeUpdateDelay = false;
  _deleteEventActivated = false

  constructor(state) {
    this._state = state;
  }

  _generateInput(inputType, type, checkbox = false) {
    const checkboxMarkup = `
      <div class="slide-action-item">
        <input
          type="checkbox"
          class="slide-action-items-checkbox"
          ${type?.checked ? "checked" : ""}
        />
      </div>
    `;

    const inputMarkup = `<div class="slide-${inputType}-input slide-input" placeholder="List" contenteditable="true">${type?.text ?? ""
      }</div>`;

    const strikeThroughMarkup = `<s>${inputMarkup}</s>`;
    return `
      <li data-id="${type?.id ?? ""}">
        ${checkbox ? checkboxMarkup : ""}
        ${type?.checked ? strikeThroughMarkup : inputMarkup}
      </li>
    `;
  }

  _generateInputContent(tableItem, inputType, checkbox = false) {
    let inputTypeMarkup = "";

    const queryInputType = inputType.includes("-")
      ? this._formatInputTypeCamelCase(inputType)
      : inputType;

    const inputTypeExists = tableItem?.[queryInputType]?.length > 0;

    if (inputTypeExists)
      inputTypeMarkup += tableItem[queryInputType]
        .map((type) => this._generateInput(inputType, type, checkbox))
        .join("");

    if (!inputTypeExists)
      inputTypeMarkup += this._generateInput(inputType, null, checkbox);

    return inputTypeMarkup;
  }

  _generateSlideContentProperties(tableItem) {
    return `
      <div class="container-slide-content">
        <div class="slide-intentions">
          <h1 class="slide-headings">Intentions</h1>
          <div class="slide-intentions-options slide-options">
            <ol class="slide-intentions-list slide-list">
            ${this._generateInputContent(tableItem, "intentions")}
            </ol>
          </div>
        </div>
        <div class="slide-happenings">
          <h1 class="slide-headings">Happenings</h1>
          <div class="slide-happenings-options slide-options">
            <ul class="slide-happenings-list slide-list">
            ${this._generateInputContent(tableItem, "happenings")}
            </ul>
          </div>
        </div>
    
        <div class="slide-grateful-for">
          <h1 class="slide-headings">Grateful for</h1>
          <div class="slide-grateful-for-options slide-options">
            <ol class="slide-grateful-for-list slide-list">
              ${this._generateInputContent(tableItem, "grateful-for")}
            </ol>
          </div>
        </div>
        <div class="slide-action-items">
          <h1 class="slide-headings">Action items</h1>
          <div class="slide-action-items-options slide-options">
            <ol class="slide-action-items-list slide-list">
            ${this._generateInputContent(tableItem, "action-items", true)}
            </ol>
          </div>
        </div>
      </div>
    `;
  }

  _generateSlideContent(tableItem, tableItemTags) {
    return `
      <div class="slide-title-box">
        <h1 class="slide-title">
          <input
            type="text"
            placeholder="Untitled"
            class="slide-title-input"
            value="${tableItem.itemTitle ?? ""}"
          />
        </h1>
      </div>
      <div class="slide-properties-box">
        <div class="slide-properties">
          <div class="slide-property-box">
            <div class="slide-property slide-tag">
              <div class="slide-property-content slide-tag-content hover">
                <div class="slide-tag-icon">
                  ${svgMarkup("slide-icon", "list-icon")}
                </div>
                <div class="slide-tag-text--box">
                  <div class="slide-property-text slide-tag-text">Tags</div>
                </div>
              </div>
              <div class="slide-tag-text--box">
                <div class="slide-property-text slide-tag-text hover ${tableItemTags !== "Empty" ? "active" : ""
      }">${tableItemTags}</div>
              </div>
            </div>
          </div>
          <div class="slide-property-box">
            <div class="slide-property slide-created">
              <div class="slide-property-content slide-created-content hover">
                <div class="slide-property-icon">
                  ${svgMarkup("slide-icon", "clock")}
                </div>
                <div class="slide-created-text--box">
                  <div class="slide-property-text slide-created-text">Created</div>
                </div>
              </div>
              <div class="slide-created-text--box">
                <div class="slide-property-text slide-created-text ${tableItem.id ? "active" : ""
      }">${dateTimeFormat(tableItem.id ?? "Empty")}
                </div>
                <div class="row-actions-render">
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
                </div>
            </div>
          </div>
        </div>
      </div>

     ${this._generateSlideContentProperties(tableItem)}
    `;
  }

  _generateSlideTagsMarkup(tableItem) {
    const tagExists = tableItem.itemTags.length > 0
    if (tagExists) {
      const markup = tableItem.itemTags.map((tag) => {
        const tagProperties = componentGlobalState.tags.find(modelTag => modelTag.id === tag)
        return tagOptionComponent.prototype._generateTagAddMarkup(tagProperties)
      }).join("")
      return markup
    }

    if (!tagExists) return "Empty"
  }

  _generateMarkup(tableItem = undefined) {
    tableItem = tableItem ? tableItem : "";
    const tableItemTags = this._generateSlideTagsMarkup(tableItem);

    return `
      <div class="container-slide-template">
        <div class="container-slide">
          <div class="slide-nav">
            <div class="slide-nav-actions">
              <div class="nav-nav-icon slide-nav-close hover">
                ${svgMarkup("icon-md nav-icon nav-icon-active", "angles-right")}
              </div>
              
              <div class="nav-nav-icon slide-nav-next hover">
                ${svgMarkup(
      `icon-md ${this._state.position === -1 ||
        this._state.position === 0 ||
        this._state.position === "only"
        ? "nav-icon-inactive"
        : "nav-icon-active"
      }`,
      "arrow-down"
    )}
                
              </div>
              <div class="nav-nav-icon slide-nav-prev hover">
                ${svgMarkup(
      `icon-md ${this._state.position === -2 ||
        this._state.position === 1 ||
        this._state.position === "only"
        ? "nav-icon-inactive"
        : "nav-icon-active"
      }`,
      "arrow-up"
    )}
                
              </div>
            </div>
          </div>
      
          <div class="slide-content">
            ${this._generateSlideContent(tableItem, tableItemTags)}
          </div>

        </div>
      </div>
    `;
  }

  render() {
    const cls = this;
    this._state.markup = this._generateMarkup(this._state.itemData);

    //implement url change
    // window.history.pushState(null,"",`${this._state.tableId}/${this._state.itemId}`)

    const component = this._componentHandler._componentRender(this._state);

    this._state = {
      ...this._state,
      component,
    };

    //component handles its event
    this._events.forEach((ev) => {
      component.addEventListener(ev, this._handleEvents.bind(cls));
    });
  }

  setDeleteActivatedState(value) {
    this._deleteEventActivated = value;
  }

  setItemDataState(value) {
    this._state.itemData = value;
  }

  getDeleteActivatedState() {
    return this._deleteEventActivated;
  }

  _handleEvents(e) {
    if (this._updateTitleMatchStrategy(e)) this._handleUpdateTitleEvent(e);
    if (this._copyToClipboardMatchStrategy(e))
      this._handleCopyToClipboardEvent(e);
    if (this._tagAddMatchStrategy(e)) this._handleTagAddEvent(e);
    if (this._inputAddMatchStrategy(e)) this._handleInputUpdateAndAddEvent(e);
    if (this._inputUpdateMatchStrategy(e)) this._handleInputUpdateEventDelay(e)//this._handleInputUpdateEvent(e);

    if (this._inputDeleteMatchStrategy(e)) this._handleInputDeleteEvent(e);

    if (this._inputCheckboxMatchStrategy(e)) this._handleInputCheckboxEvent(e);

    //nav events
    if (this._closeSliderMatchStrategy(e)) this._handleCloseSliderEvent(e);

    if (this._nextSliderMatchStrategy(e)) this._handleNextSliderEvent(e);

    if (this._prevSliderMatchStrategy(e)) this._handlePrevSliderEvent(e);
  }

  _updateTitleMatchStrategy(e) {
    if (e.type === "keyup") {
      const matchStrategy =
        e.target.classList.contains("slide-title-input") ||
        e.target.closest(".slide-title-input");
      return matchStrategy;
    }
  }

  _copyToClipboardMatchStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("row-actions-render") ||
        e.target.closest(".row-actions-render");
      return matchStrategy;
    }
  }

  _tagAddMatchStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("slide-tag-text") ||
        e.target.closest(".slide-tag-text");

      return matchStrategy;
    }
  }

  _inputAddMatchStrategy(e) {
    if (e.type === "keyup" && e.key === "Enter") {
      const matchStrategy =
        e.target.classList.contains("slide-input") ||
        e.target.closest(".slide-input");
      return matchStrategy;
    }
  }

  _inputUpdateMatchStrategy(e) {
    if (e.type === "keyup" && e.key !== "Enter") {
      const matchStrategy =
        e.target.classList.contains("slide-input") ||
        e.target.closest(".slide-input");
      return matchStrategy;
    }
  }
  _inputDeleteMatchStrategy(e) {
    if (e.type === "keydown" && e.key === "Backspace") {
      const matchStrategy =
        e.target.classList.contains("slide-input") &&
        e.target.closest(".slide-input");

      if (
        matchStrategy &&
        !matchStrategy.textContent.trim().toLowerCase().length > 0
      )
        return matchStrategy;
    }
  }

  _inputCheckboxMatchStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("slide-action-items-checkbox") ||
        e.target.closest(".slide-action-items-checkbox");
      return matchStrategy;
    }
  }

  _closeSliderMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("slide-nav-close") ||
      e.target.closest(".slide-nav-close");

    return matchStrategy;
  }

  _nextSliderMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("slide-nav-next") ||
      e.target.closest(".slide-nav-next");

    if (
      matchStrategy &&
      !e.target
        .closest(".slide-nav-next")
        .children[0].classList.contains("nav-icon-inactive")
    )
      return matchStrategy;
  }

  _prevSliderMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("slide-nav-prev") ||
      e.target.closest(".slide-nav-prev");

    if (
      matchStrategy &&
      !e.target
        .closest(".slide-nav-prev")
        .children[0].classList.contains("nav-icon-inactive")
    )
      return matchStrategy;
  }

  _handleUpdateTitleEvent(e) {
    const cls = this;

    const inputVal = e.target.closest(".slide-title-input");

    const payload = {
      itemId: this._state.itemId,
      tableId: this._state.tableId,
      title: inputVal.value,
    };

    this._state.eventHandlers.tableItemControllers.controlUpdateTableItem(
      payload,
      null,
      null,
      false
    );
  }

  _handleCopyToClipboardEvent(e) {
    const copyContent = e.target.closest(
      ".row-actions-render"
    ).previousElementSibling;
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

  _handleTagAddEvent(e) {
    const cls = this;
    const tagViewportHolder = e.target.closest(".slide-tag-text");

    const { top, left, width, height } =
      tagViewportHolder.getBoundingClientRect();

    const updateObj = {
      tableId: cls._state.tableId,
      itemId: cls._state.itemId,
      refreshCallBack: this.refreshContent.bind(cls), //add the callback for the controlUpdateTableItemFallback to call after updating model
      getUpdatedData: true
    };

    const componentObj = {
      top: `${parseInt(top) + 50}`,
      left,
      width,
      height,
      selector: ".options-markup",
      table: tagViewportHolder,
      updateModel: this._state.modelControllers.callUpdateItemHandler.bind(
        null,
        updateObj
      ),
      subComponentCallback: this._state.modelControllers.callUpdateItemHandler,
      getUpdatedData:
        this._state.eventHandlers.tableItemControllers.controlGetTableItem.bind(
          null,
          cls._state.tableId,
          cls._state.itemId
        ),
      eventHandlers: this._state.eventHandlers,
      // refreshCaller: this.refreshContent.bind(cls),
      updateTag: true,
      updateObj: updateObj,
      tagItems: cls._state.itemData.itemTags,
      itemId: cls._state.itemId,
      tags: cls._state.tags,
      tagsColors: cls._state.tagsColors,
    };

    const component = new tagOptionComponent(componentObj)
    component.render();
  }

  _handleInputUpdateAndAddEvent(e) {
    console.log("triggered update add event")
    const inputType = this._getInputType(e);

    const [inputContainer, checkedValue, updateVal, updateId] =
      this._getInputAndChecked(e, inputType);

    const nextElInput = e.target
      .closest("li")
      .nextElementSibling?.querySelector(`.slide-${inputType}-input`);

    const selectionAnchorOffset = document.getSelection().anchorOffset

    const inputSelection = document.getSelection().getRangeAt(0)
      .startContainer?.data;

    const inputSelectionExists = inputSelection?.length > 0;

    this._setUpdateValueTextContent(updateVal, inputSelectionExists, inputSelection, selectionAnchorOffset)

    const inputModelKey = this._formatInputTypeCamelCase(inputType);

    const inputContainsCheckbox = inputType === "action-items" ? true : false;

    const checkedProperty = this._constructCheckedProperty(
      inputContainsCheckbox,
      checkedValue
    );
    console.log("the input selection exists", inputSelectionExists)
    //FIXME: add an update for new value to create an empty list with id
    const update = this._constructUpdateProperty(updateVal, inputModelKey, updateId)
    const createRelativeProperty = inputSelectionExists || nextElInput ? updateId : null

    //get the ordering value of each item from the UI
    const { createItemOrdering, itemsOrdering } = this._getItemsOrdering(inputType, createRelativeProperty)

    console.log("the itemsOrdering", itemsOrdering)
    const payload = {
      itemId: this._state.itemId,
      tableId: this._state.tableId,
      modelProperty: {
        checkedProperty,
        property: {
          create: {
            value: this._setPayloadCreateValue(inputSelection, inputSelectionExists, selectionAnchorOffset),
            relativeProperty: createRelativeProperty,
            ordering: createItemOrdering
          },
          update,
          orderingList: itemsOrdering,
          key: inputModelKey,
          updateAndAddProperty: true,
        },

      },
    };
    this._updateAndAddTriggeredBeforeUpdateDelay = true;

    console.log("payload updatee and create", payload)
    //callback after update
    payload.refreshCallBack = this._refreshAndUpdateUICallBack.bind(this, inputSelectionExists, nextElInput, inputType, updateId)

    //update the item
    // debugger;
    this._state.eventHandlers.tableItemControllers.controlUpdateTableItem(
      payload,
      null,
      null,
      payload.modelProperty.property.key
    );

  }

  _getItemsOrdering(inputType, createRelativeProperty) {
    let incrementOrderingIndex = false
    let createItemOrdering = null
    const itemsOrdering = Array.from(document.querySelectorAll(`.slide-${inputType}-list li`)).map((item, i) => {
      if (createRelativeProperty && item.dataset.id === createRelativeProperty) {
        incrementOrderingIndex = true
        createItemOrdering = i + 2
        return { id: item.dataset.id, ordering: i + 1 }
      }
      return { id: item.dataset.id, ordering: incrementOrderingIndex ? i + 2 : i + 1 }
    })

    return { createItemOrdering: createItemOrdering, itemsOrdering }
  }

  _setUpdateValueTextContent(updateVal, inputSelectionExists, inputSelection, selectionAnchorOffset) {
    if (updateVal) {
      if (inputSelectionExists && selectionAnchorOffset > 0 || !inputSelectionExists) updateVal.textContent = updateVal.textContent.trim()
      if (inputSelectionExists && selectionAnchorOffset === 0)
        updateVal.textContent = updateVal.textContent.split(inputSelection)[0].trim()
    }
  }

  _setPayloadCreateValue(inputSelection, inputSelectionExists, selectionAnchorOffset) {
    if (inputSelectionExists && selectionAnchorOffset > 0 || !inputSelectionExists) return ""
    if (inputSelectionExists && selectionAnchorOffset === 0) return inputSelection.trim()
  }

  _refreshAndUpdateUICallBack(inputSelectionExists, nextElInput, inputType, updateId) {
    const tableItemData =
      this._state.eventHandlers.tableItemControllers.controlGetTableItem(
        this._state.tableId,
        this._state.itemId
      );

    //refresh the content
    this.refreshContent(tableItemData);

    const relativeAddedItem =
      inputSelectionExists || nextElInput
        ? document
          .querySelector(`[data-id="${updateId}"]`)
          ?.nextElementSibling?.querySelector(`.slide-${inputType}-input`)
        : null;

    //focus on the relative or last element on content refresh
    const updatedInputContainer = this._getInputContainer(
      null,
      inputType,
      true
    );
    const addedItemInput =
      !relativeAddedItem &&
      updatedInputContainer.children[
        updatedInputContainer.children.length - 1
      ].querySelector(`.slide-${inputType}-input`);

    if (relativeAddedItem) {
      console.log("found relative added item")
      relativeAddedItem.focus();
      this._moveCursorToTextEnd(relativeAddedItem);
    }

    if (!relativeAddedItem) {
      console.log("could not find relative added item")
      addedItemInput.focus();
      this._moveCursorToTextEnd(addedItemInput);
    }

    //reset the trigger state after content rerender
    this._updateAndAddTriggeredBeforeUpdateDelay = false;

  }

  _clearPreviousTimer() {
    clearInterval(this._timer)
    this._timer = null
  }

  _handleInputUpdateEventDelay(e) {
    if (this._timer) this._clearPreviousTimer()
    this._timer = setTimeout(() => {
      if (!this._updateAndAddTriggeredBeforeUpdateDelay) {
        this._handleInputUpdateEvent(e)
        this._updateAndAddTriggeredBeforeUpdateDelay = false
      }

      if (this._updateAndAddTriggeredBeforeUpdateDelay) {
        clearInterval(this._timer)
        this._updateAndAddTriggeredBeforeUpdateDelay = false
      }
    }, 2 * 1000)
  }

  _handleInputUpdateEvent(e) {
    // debugger;
    if (this.getDeleteActivatedState()) {
      //prevent an update event from being triggered after a delete event
      this.setDeleteActivatedState(false)
      return
    }

    const inputType = this._getInputType(e);
    const [inputContainer, checkedValue, updateVal, updateId] =
      this._getInputAndChecked(e, inputType);

    const inputContainsCheckbox = inputType === "action-items" ? true : false;

    const checkedProperty = this._constructCheckedProperty(
      inputContainsCheckbox,
      checkedValue
    );

    const inputModelKey = this._formatInputTypeCamelCase(inputType);

    const update = this._constructUpdateProperty(
      updateVal,
      inputModelKey,
      updateId
    );

    const payload = {
      itemId: this._state.itemId,
      tableId: this._state.tableId,
      modelProperty: {
        checkedProperty,
        property: {
          update,
        },
        updateProperty: true,
      },
    };
    // debugger;
    this._state.eventHandlers.tableItemControllers.controlUpdateTableItem(
      payload,
      null,
      null,
      payload.modelProperty.property.update.key
    );
  }

  _handleInputDeleteEvent(e) {
    this.setDeleteActivatedState(true);
    const inputType = this._formatInputType(
      e.target
        .closest(".slide-options")
        .previousElementSibling.textContent.trim()
        .toLowerCase()
    );
    const inputContainer = e.target.closest("li");
    const input = e.target;

    const previousElInput =
      inputContainer?.previousElementSibling?.querySelector(
        `.slide-${inputType}-input`
      );

    const nextElInput = inputContainer?.nextElementSibling?.querySelector(
      `.slide-${inputType}-input`
    );
    const allInputTypeLength = Array.from(document.querySelectorAll(`.slide-${inputType}-input`)).length

    //prevent delete of last and only item except updating it
    if (allInputTypeLength === 1) {
      this.setDeleteActivatedState(false)
      return
    }


    const payload = {
      itemId: this._state.itemId,
      tableId: this._state.tableId,
      modelProperty: {
        property: {
          delete: {
            propertyId: inputContainer.dataset.id,
            key: this._formatInputTypeCamelCase(inputType),
          },
        },
      },
    };

    //add check against model access if empty value
    const propertyItems = inputContainer.closest(`.slide-${inputType}-list `);
    if (propertyItems.children.length >= 1)
      this._state.eventHandlers.tableItemControllers.controlDeleteTableItem(
        payload,
        null,
        inputType.trim(),
        false
      );
    if (!previousElInput && !nextElInput) return;

    if (previousElInput) {
      previousElInput.focus();
      this._moveCursorToTextEnd(previousElInput);
    }
    if (!previousElInput && nextElInput) {
      nextElInput.focus();
      this._moveCursorToTextEnd(nextElInput);
    }

    !input.textContent.length > 0 ? inputContainer.remove() : null;
  }

  _handleInputCheckboxEvent(e) {
    const inputType = this._formatInputType(
      e.target
        .closest(".slide-options")
        .previousElementSibling.textContent.trim()
        .toLowerCase()
    );
    const actionCheckbox = e.target.closest(".slide-action-items-checkbox");
    const actionText = e.target.parentElement.nextElementSibling;
    const actionId = e.target.closest("li").dataset.id;

    this._implementCheckLogic(e, actionCheckbox, actionText);

    const payload = {
      itemId: this._state.itemId,
      tableId: this._state.tableId,
      modelProperty: {
        property: {
          updateActionItem: {
            checked: actionCheckbox.checked,
            propertyId: actionId,
            value: actionText.textContent,
            key: this._formatInputTypeCamelCase(inputType),
          },
        },
      },
    };

    //update the item intentions
    this._state.eventHandlers.tableItemControllers.controlUpdateTableItem(
      payload,
      null,
      null,
      "actionItems"
    );
  }

  _handleCloseSliderEvent(e) {
    //remove slider styling from container
    const container = document.querySelector(".container");
    container.classList.toggle("side-peek");

    //url item remove
    // window.location.replace (`${window.location.origin}/#`)
    //reload not needed
    this.reloadTableComponent();

    //remove slider
    this.remove();
  }

  _handleNextSliderEvent(e) {
    const { item, position } =
      this._state.eventHandlers.tableItemControllers.controlGetTableItem(
        +this._state.tableId,
        +this._state.itemId,
        1
      );

    this.reRenderSidePeek(item, position);
  }

  _handlePrevSliderEvent(e) {
    const { item, position } =
      this._state.eventHandlers.tableItemControllers.controlGetTableItem(
        +this._state.tableId,
        +this._state.itemId,
        -1
      );

    this.reRenderSidePeek(item, position);
  }

  _constructCheckedProperty(inputContainsCheckbox, checkedValue) {
    const checkedProperty = {
      checkbox: inputContainsCheckbox,
      checked: inputContainsCheckbox ? checkedValue.checked : false,
    };
    return checkedProperty;
  }

  _constructUpdateProperty(updateVal, inputModelKey, updateId) {
    const update = {
      value: updateVal.textContent,
      key: inputModelKey,
      propertyId: updateId,
    };
    return update;
  }

  _getInputContainer(e, inputType, refresh = false) {
    return refresh
      ? document.querySelector(`.slide-${inputType}-list`)
      : e.target.closest(`.slide-${inputType}-list`);
  }

  _getInputAndChecked(e, inputType) {
    const inputContainer = this._getInputContainer(e, inputType);

    const checkedValue = e.target
      ?.closest("li")
      ?.querySelector(".slide-action-items-checkbox");

    const updateVal = e.target.closest(`.slide-${inputType}-input`);

    const updateId = updateVal.closest("li").dataset.id;

    return [inputContainer, checkedValue, updateVal, updateId];
  }

  _getInputType(e) {
    const type = this._formatInputType(
      e.target
        .closest(".slide-options")
        .previousElementSibling.textContent.toLowerCase()
    );

    return type;
  }

  _formatInputType(inputType) {
    const formatInput = inputType.includes(" ");
    const type = formatInput ? inputType.split(" ").join("-") : inputType;
    return type;
  }

  _formatInputTypeCamelCase(inputType) {
    const shouldFormatInput = inputType.includes("-");
    const formatInput = inputType.split("-");
    return shouldFormatInput
      ? formatInput[0] +
      (formatInput[1][0].toUpperCase() +
        formatInput[1].slice(1).toLowerCase())
      : inputType;
  }
  _splitFromInputVal(inputContainer, inputVal, valToSplit) {
    const val = inputVal.split(valToSplit)[0];
    if (val) inputContainer.textContent = val;
    return val;
  }

  _moveCursorToTextEnd(textContainer) {
    const selection = document.getSelection();
    selection.selectAllChildren(textContainer);
    selection.collapseToEnd();
  }

  _implementCheckLogic(e, checkbox, checkText) {
    if (checkbox.checked)
      this._wrapAndReplaceNodeWithStrikeThrough(e, checkText);

    if (!checkbox.checked) this._removeStrikeThroughFromNode(e, checkText);
  }

  _wrapAndReplaceNodeWithStrikeThrough(e, node) {
    const nodeClone = node.cloneNode(true);
    node.remove();

    const strikeThroughEl = document.createElement("s");
    strikeThroughEl.insertAdjacentElement("afterbegin", nodeClone);

    //insert the node into parent
    e.target.parentElement.insertAdjacentElement("afterend", strikeThroughEl);
  }

  _removeStrikeThroughFromNode(e, node) {
    const nodeClone = node.children[0].cloneNode(true);
    node.remove();
    e.target.parentElement.insertAdjacentElement("afterend", nodeClone);
  }

  refreshContent(updatedData) {
    //reset component itemData value
    this.setItemDataState(updatedData)

    const itemPropertyContainer = document.querySelector(".slide-content");
    const contentContainer = document.querySelector(".container-slide-content");

    const tableItemTags = this._generateSlideTagsMarkup(updatedData);
    const contentMarkup = this._generateSlideContent(
      updatedData,
      tableItemTags
    );
    itemPropertyContainer.innerHTML = "";
    contentContainer.innerHTML = "";
    itemPropertyContainer.insertAdjacentHTML("beforeend", contentMarkup);
  }

  reloadTableComponent() {
    let table;
    table = this._state.eventHandlers.tableControllers.controlGetTable();
    if (componentGlobalState.filterMethod)
      table.tableItems = componentGlobalState.filterMethod(table.tableItems);

    if (componentGlobalState.sortMethod)
      table.tableItems = componentGlobalState.sortMethod(table.tableItems);

    componentGlobalState.renderTableItem(
      table.tableItems,
      componentGlobalState.filterMethod
    );
  }

  reRenderSidePeek(item, position) {
    [
      this._state.itemData,
      this._state.itemId,
      this._state.position,
      this._state.toggle,
    ] = [item, item.id, position, "null"];
    this.remove();

    this.render();
  }

  remove() {
    const cls = this;
    this._events.forEach((ev) =>
      this._state.component.removeEventListener(ev, cls._handleEvents, true)
    );

    this._state.component.remove();
    // delete this;
  }
}

// export default new ContainerSidePeekComponentView();

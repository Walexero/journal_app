import { importComponentOptionsView } from "./componentOptionsView.js";
import notificationComponent from "./notificationComponent.js";
import cloneDeep from "../../../../node_modules/lodash-es/cloneDeep.js";
import { svgMarkup } from "../../helpers.js";

export default class TagEditComponent {
  _componentHandler = importComponentOptionsView.object;
  _state;
  _events = ["click", "keyup"];

  constructor(state) {
    this._state = state;
  }

  _generateCheckmarkMarkup() {
    return `
          <div class="color-row-icon">
            ${svgMarkup("row-icon icon-md", "checkmark")}
          </div>
        `;
  }

  _generateTagsColorOptionsMarkup(tagToEdit = undefined) {
    let colorOptionsMarkup = "";

    this._state.tagsColors.forEach((color) => {
      const checkmarkMarkup =
        color.color_value.toLowerCase() === tagToEdit.color.toLowerCase()
          ? this._generateCheckmarkMarkup()
          : "";

      colorOptionsMarkup += `
            <div class="colors">
              <div class="color ${color.color_value}"></div>
              <div class="color-text">${color.color}</div>
              ${checkmarkMarkup}
            </div>
          `;
    });

    return colorOptionsMarkup;
  }

  _generateMarkup(tagToEdit) {
    return `
          <div class="row-tag-options">
            <div class="row-tag-options-box">
              <div class="row-tag-edit-actions">
                
                <input
                  type="text"
                  class="tag-edit component-form" value="${tagToEdit.text}"
                />
                
                <div class="row-tag-delete">
                  <div class="row-tag-icon">
                    ${svgMarkup("row-icon", "trashcan-icon")}
                  </div>
                  <div class="row-tag-text">
                    Delete
                  </div>
                </div>
              </div>
              <div class="row-tag-colors">
                <div class="colors-info">
                  COLORS
                </div>
                <div class="colors-picker">
                  ${this._generateTagsColorOptionsMarkup(tagToEdit)}
                </div>
              </div>
            </div>
          </div>
        `;
  }

  render() {
    const cls = this;
    this._state.markup = this._generateMarkup(this._state.tagToEdit);

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
    if (this._optionsOptionColorSelectMatchStrategy(e))
      this._handleOptionsOptionColorSelectEvent(e);

    if (this._optionsOptionDeleteMatchStrategy(e))
      this._handleDeleteOptionsOptionEvent(e);

    if (this._optionsOptionEnterMatchStrategy(e))
      this._handleOptionsOptionEnterEvent(e);
  }

  _optionsOptionDeleteMatchStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("row-tag-delete") ||
        e.target.closest(".row-tag-delete");
      return matchStrategy;
    }
  }

  _optionsOptionColorSelectMatchStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("colors") || e.target.closest(".colors");
      return matchStrategy;
    }
  }

  _optionsOptionEnterMatchStrategy(e) {
    if (e.type === "keyup" && e.key === "Enter") {
      const matchStrategy =
        e.target.classList.contains("tag-edit") ||
        e.target.closest(".tag-edit");
      return matchStrategy;
    }
  }

  _handleOptionsOptionColorSelectEvent(e) {
    const allColorContainer = document.querySelectorAll(".colors");
    const colorContainer = e.target.closest(".colors");
    //remove and add checkmark
    const selectedColorIsChecked =
      colorContainer.querySelector(".color-row-icon");

    if (!selectedColorIsChecked) {
      //the color value is changed based on the API resolve value
      this.updateTagAndNotifyCallers(null, this._selectColor.bind(this, allColorContainer, colorContainer));
    }
  }

  _handleOptionsOptionEnterEvent(e) {
    const inputEl = e.currentTarget.querySelector(".tag-edit");

    if (inputEl.value.length > 0) this.updateTagAndNotifyCallers();

    this._componentHandler._componentRemover(
      this._state,
      this._state.component,
      false
    );
  }

  _handleDeleteOptionsOptionEvent(e) {
    const componentObj = {
      deleter: true,
      selector: ".notification-render",
      callBack: this.updateTagAndNotifyCallers.bind(this),
      parentOverlay: this._state.overlay,
      currentTarget: this._state.currentTarget,
      notify: true,
    };

    const component = new notificationComponent(componentObj).render();
  }

  _selectColor(allColorContainer, colorContainer) {
    allColorContainer.forEach((color) =>
      color.querySelector(".color-row-icon")?.remove()
    );

    colorContainer.insertAdjacentHTML(
      "beforeend",
      this._generateCheckmarkMarkup()
    );

  }

  _deleteElFromOptionContainer(el) {
    el.forEach((elm) => {
      if (elm) {
        if (elm.classList.contains("row-tag-tag"))
          elm.closest(".tags-option").remove();
        if (elm.classList.contains("tag-tag")) elm.remove();
      }
    });
  }

  _deleteTag(tagId, el) {
    this._state.eventHandlers.tableItemControllers.controlDeleteTag(tagId, this._deleteElFromOptionContainer.bind(this, el))
  }

  _updateElClassAndText(inputVal, colorVal, el, tag) {
    el.forEach((elm) => {
      if (elm) {
        elm.classList.remove(tag.color);
        elm.classList.add(colorVal);
        const elmDeleteIcon = elm.querySelector(".row-tag-icon")
        elm.textContent = inputVal.value.trim()
        if (elmDeleteIcon)
          elm.insertAdjacentElement("beforeend", elmDeleteIcon);

      }
    });
  }

  updateTagAndNotifyCallers(deleteTag = undefined, eventCallBack = undefined) {
    const cls = this;
    let cloneTagBeforeUpdate = null;

    //options item
    const updateParentOptionItemTag = this._state.currentTarget
      .querySelector(".tags-items")
      .querySelector(`.${this._state.tagToEdit.color}`);

    const updateParentOptionTag = this._state.currentTarget
      .querySelector(".tags-available")
      .querySelector(`.${this._state.tagToEdit.color}`);

    if (deleteTag) {
      // this._deleteTag(itemId)
      this._deleteTag(this._state.tagToEdit.id, [
        updateParentOptionItemTag,
        updateParentOptionTag,
      ]);
      return;
    }

    const tagInput = this._state.component.querySelector(".tag-edit");
    const tagSelectedColor = Array.from(
      this._state.component
        .querySelector(".color-row-icon")
        .closest(".colors")
        .querySelector(".color").classList
    ).find((color) => color.startsWith("color-"));

    const tagInputChanged =
      tagInput.value.trim().toLowerCase() !==
      this._state.tagToEdit.text.toLowerCase();

    const tagColorChanged =
      tagSelectedColor.toLowerCase() !==
      this._state.tagToEdit.color.toLowerCase();

    if (tagInputChanged || tagColorChanged || eventCallBack) {
      //check for existing tag with similar tag name
      const similarNamedTag = this._state.tags.find(
        (tg) => tg.text.toLowerCase() === tagInput.value.trim().toLowerCase()
      );

      if (similarNamedTag) {
        if (String(similarNamedTag.id) != String(this._state.tagToEdit.id)) {
          //render notification overlay

          const componentObj = {
            selector: ".notification-render",
            currentTarget: this._state.currentTarget,
            notify: true,
          };

          const component = new notificationComponent(componentObj).render();
          return;
        }
      }

      cloneTagBeforeUpdate = cloneDeep(this._state.tagToEdit);

      //format the update object
      const updateObj = {
        tag: this._state.tagToEdit,
        updateTag: true,
        tagBeforeUpdate: cloneTagBeforeUpdate,
      };


      this._state.eventHandlers.tableItemControllers.controlUpdateTag(updateObj, "tagsValue", this._updateUI.bind(this, { eventCallBack, tagInput, tagSelectedColor, updateParentOptionItemTag, updateParentOptionItemTag }))
    }
  }

  _updateUI(options) {

    //resolve any callback for any other event passed that updates the UI
    if (options.eventCallBack) options.eventCallBack()

    //change the color and text content of the elements
    this._updateElClassAndText(
      options.tagInput,
      options.tagSelectedColor,
      [options.updateParentOptionItemTag, options.updateParentOptionTag],
      this._state.tagToEdit
    );

    //update the tag
    //updates the model as well
    [this._state.tagToEdit.color, this._state.tagToEdit.text] = [
      options.tagSelectedColor,
      options.tagInput.value,
    ];

    //free mem
    options = {}
  }

  //use for search sanitization
  _inputEscaper(inputValue, attribs = undefined) {
    const ESC_MAP = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return inputValue.replace(attribs ? /[&<>'"]/g : /[&<>]/g, function (c) {
      return ESC_MAP[c];
    });
  }
}

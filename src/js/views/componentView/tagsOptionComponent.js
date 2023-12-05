import { importComponentOptionsView } from "./componentOptionsView.js";
import tagEditComponent from "./tagEditComponent.js";
import { componentGlobalState } from "./componentGlobalState.js";
import { formatTagRequestBody, svgMarkup, formatTagRenderedText } from "../../helpers.js";
import { importSignals } from "../../signals.js";
import { API } from "../../api.js";

export default class TagOptionComponent {
  _componentHandler = importComponentOptionsView.object;
  _state;
  _events = ["click", "keyup"];
  _signals = importSignals.object
  _inputCounter = 0;

  constructor(state) {
    this._state = state;
  }

  pass() { }

  _createAPITag(payload, refreshCallBack) {
    this._state.eventHandlers.tableItemControllers.controlAddTag(payload, refreshCallBack)
  }

  _createTagForCurrentItem(tag, refreshCallBack) {
    const tagClass = Array.from(tag.classList).find((cls) =>
      cls.startsWith("color")
    );
    const tagColor = this._state.tagsColors.find(color => color.color_value === tagClass.trim()
    )
    const tagText = tag.textContent.trim();
    const tagObj = {
      color: tagClass,
      text: tagText,
      id: tag.dataset.id,
      tagColor
    };


    const createTagMarkup = this._generateTagAddMarkup(tagObj, true);
    if (!tagObj.id) {
      const tagAPIRequestPayload = formatTagRequestBody(tagObj)

      this._createAPITag(tagAPIRequestPayload, refreshCallBack.bind(null, createTagMarkup))
    }

    return { createTagMarkup, tagObj };
  }


  _getRandomColor() {
    const randomColor = Math.trunc(Math.random() * 9) + 1;
    return this._state.tagsColors[randomColor].color_value;
  }

  _generateTagAddMarkup(tag, addXmark = false) {
    return `
      <div class=" ${addXmark ? "tag-tag" : "row-tag-tag"} ${tag.color
      }" data-id=${tag.id}>
        ${formatTagRenderedText(tag.text)}

        ${addXmark
        ? `
          <div class="row-tag-icon">
            ${svgMarkup("tags-items-icon", "xmark")}
          </div>
          `
        : ""
      }
      </div>
    `;
  }

  _generateCreateOptionsTagMarkup(inputVal) {
    return `
      <div class="tag-create">
        Create 
        <div class="tag-tag ${this._getRandomColor()}">
          ${formatTagRenderedText(inputVal)}
        </div>
      </div>
    `;
  }

  _generateTagsOptionsNudge() {
    return `
      <div class="row-option-icon">
        ${svgMarkup("row-icon icon-md", "ellipsis")}
      </div>
    `;
  }

  _generateTagsOptions(tags) {
    let tagsOptionsMarkup = "";
    tags.forEach((tag) => {
      tagsOptionsMarkup += `
        <div class="tags-option">
          <div class="row-drag-icon">
            ${svgMarkup("row-icon icon-md", "drag-icon")}
          </div>
          <div class="row-option-tag">
            ${this._generateTagAddMarkup(tag)}
          </div>
          ${this._state.disableOptionsNudge
          ? ""
          : this._generateTagsOptionsNudge()
        }
        </div>
      `;
    });
    return tagsOptionsMarkup;
  }

  _generateTagInput(tagItemsMarkup) {
    return `
      <div class="tag-input-container">
        <div class="tag-input">
          <div class="tags-items">
            ${tagItemsMarkup}
            <input
              type="text"
              class="tag-input-input"
              placeholder="Search or create tag..."
            />
          </div>
        </div>
      </div>

    `;
  }

  _generateMarkup(tagItems = undefined, itemId = undefined) {
    //restrict the item tags markup to only when the itemId is provided
    let tagItemsMarkup = "";
    if (tagItems) {
      const tagItemsExists = tagItems.length > 0
      if (tagItemsExists) {
        tagItemsMarkup = tagItems.map((tag, i) => {
          const tagProperty = componentGlobalState.tags.find(modelTag => modelTag.id === tag)
          if (!tagProperty || tagProperty === -1) {
            tagItems.splice(i, 1)
            return ""
          }

          return this._generateTagAddMarkup(tagProperty, true)

        }).join("")
      }
      if (!tagItemsExists) tagItemsMarkup = ""
    }

    const tagInputMarkup = this._state.disableInput
      ? ""
      : this._generateTagInput(tagItemsMarkup);

    return `
          <div class="row-tag-popup options-markup" data-id="${itemId}">
            <div class="row-tag-box">
              ${tagInputMarkup}
              <div class="tags-box">
                <div class="tags-info">Select an option or create one</div>
                <div class="tags-available">
                  ${this._generateTagsOptions(this._state.tags)}
                </div>
              </div>
            </div>
          </div>
        `;
  }

  render() {
    const cls = this;
    debugger;
    this._state.markup = this._generateMarkup(
      this._state.tagItems,
      this._state.itemId
    );

    const { overlay, overlayInterceptor, component } =
      this._componentHandler._componentOverlay(this._state);

    this._state = { ...this._state, overlay, overlayInterceptor, component };

    this._handleUpdateModelIfFilterActive();

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
    //form listener event, tag selection and tag creation markup
    if (this._createTagOrTagMatchStrategy(e))
      this._handleCreateTagOrTagSelectEvent(e);

    //tag create and add tag to tag item
    if (this._createTagItemMatchStrategy(e)) this._handleCreateTagItem(e);

    //tag add event
    if (this._addTagMatchStrategy(e)) this._handleAddTagToItemEvent(e);

    //remove tag click event
    if (this._removeTagClickMatchStrategy(e))
      this._handleRemoveTagClickEvent(e);

    //remove tag key event
    if (this._removeTagKeyMatchStrategy(e)) this._handleRemoveTagKeyEvent(e);

    //tags options options render event
    if (this._renderTagOptionOptionsMatchStrategy(e))
      this._handleTagOptionOptionsRenderEvent(e);
  }

  _createTagOrTagMatchStrategy(e) {
    if (e.type === "keyup") {
      const matchStrategy = e.target.classList.contains("tag-input-input");
      return matchStrategy;
    }
  }

  _createTagItemMatchStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("tag-create") ||
        e.target.closest(".tag-create");
      return matchStrategy;
    }

    if (e.type === "keyup" && e.key === "Enter") {
      const matchStrategy =
        e.target.classList.contains("tag-input-input") ||
        e.target.closest(".tag-input-input");

      return matchStrategy;
    }
  }

  _addTagMatchStrategy(e) {
    if (e.type === "click") {
      // debugger;
      const matchStrategy =
        e.target.classList.contains("row-tag-tag") ||
        e.target.classList.contains("tags-option") ||
        e.target.closest(".row-option-tag");

      if (matchStrategy) {
        //implements the signals observer here
        if (componentGlobalState.filterTagOptionActive) {
          componentGlobalState.tagItemFactory =
            this._createTagForCurrentItem.bind(this);
          componentGlobalState.tagItemMarkupFactory =
            this._generateTagAddMarkup.bind(this);

          //observe for add events to route to filter view if active
          this._signals.observe(e, "tagadd");
        }

        //if tags not active somewhere else, deliver to its handler
        if (!componentGlobalState.filterTagOptionActive) return matchStrategy;
      }
    }
  }

  _removeTagClickMatchStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("tags-items-icon") ||
        e.target.closest(".tags-items-icon");
      return matchStrategy;
    }
  }

  _removeTagKeyMatchStrategy(e) {
    if (e.type === "keyup") {
      const matchStrategy = e.key === "Backspace";
      return matchStrategy;
    }
  }

  _renderTagOptionOptionsMatchStrategy(e) {
    if (e.type === "click") {
      const matchStrategy =
        e.target.classList.contains("row-icon") ||
        (e.target.classList.contains("svg-icon") &&
          e.target.closest(".row-option-icon"));
      return matchStrategy;
    }
  }

  _handleCreateTagOrTagSelectEvent(e) {
    const cls = this;

    const tagsAvailableContainer =
      e.currentTarget.querySelector(".tags-available");
    const inputContainer = e.currentTarget.querySelector(".tag-input-input");

    const filteredTags = this._state.tags.filter((tag) =>
      tag.text.toLowerCase().includes(inputContainer.value.trim().toLowerCase())
    );

    const findEqualTag = this._state.tags.find(
      (tag) =>
        tag.text.toLowerCase() === inputContainer.value.trim().toLowerCase()
    );

    const filteredTagsExists = filteredTags.length > 0;
    const createTagMarkup = this._generateCreateOptionsTagMarkup(
      inputContainer.value.trim()
    );

    tagsAvailableContainer.innerHTML = "";

    if (filteredTagsExists) {
      //prevent tag creation and only select tag
      const filteredTagsMarkup = this._generateTagsOptions(filteredTags);
      // tagsAvailableContainer.innerHTML = "";
      tagsAvailableContainer.insertAdjacentHTML(
        "beforeend",
        filteredTagsMarkup
      );
    }

    if (!findEqualTag && inputContainer.value.length > 0) {
      //allow tag creation if it doesn't exist
      tagsAvailableContainer.insertAdjacentHTML("beforeend", createTagMarkup);
    }
  }

  _handleCreateTagItem(e) {
    const tagsAvailableContainer =
      e.currentTarget.querySelector(".tags-available");
    const inputContainer = e.currentTarget.querySelector(".tag-input-input");
    debugger;
    //guard clause against empty input val
    const inputValExists = inputContainer?.value.trim().length > 0;
    if (!inputValExists) return;

    //clear input
    inputContainer.value = "";
    // e.target.closest(".tag-tag")
    const tagContainer = e.currentTarget.querySelector(".tag-create .tag-tag");

    const { createTagMarkup: createdTagItem, tagObj } =
      this._createTagForCurrentItem(tagContainer, this._tagsOptionsMarkupReRender.bind(this, tagsAvailableContainer));
  }

  _tagsOptionsMarkupReRender(tagsAvailableContainer, createdTagItem) {
    this._tagItemAdder(createdTagItem);

    //update the _tags obj with the newly created tag
    // this._state.tags.push(tagObj);

    //render tags
    const tagsMarkup = this._generateTagsOptions(this._state.tags);
    tagsAvailableContainer.innerHTML = "";
    tagsAvailableContainer.insertAdjacentHTML("beforeend", tagsMarkup);
  }

  _handleRemoveTagClickEvent(e) {
    const tag = e.target.closest(".tag-tag");
    tag.remove();
  }

  _handleRemoveTagKeyEvent(e) {
    const inputContainer = e.currentTarget.querySelector(".tag-input-input");

    //logic to keep track of key presses
    this._inputCounter > 0
      ? this.pass()
      : inputContainer.value.length > 0
        ? (this._inputCounter = inputContainer.value.length + 1)
        : this.pass();
    this._inputCounter--;

    //protect against key delete deleting tags if input has text values
    if (this._inputCounter > -1) return;

    const tagItemsContainer = e.target.closest(".tags-items");
    const tagsArray = Array.from(tagItemsContainer.children);
    tagsArray.length < 2 ? this.pass() : tagsArray.at(-2).remove();
  }

  _handleAddTagToItemEvent(e) {
    const tagToAdd =
      e.target.closest(".row-tag-tag") ||
      e.target.querySelector(".row-tag-tag");

    //
    const tagsAvailableContainer =
      e.currentTarget.querySelector(".tags-available");
    const inputContainer = e.currentTarget.querySelector(".tag-input-input");

    const tagItemsContainer = document.querySelector(".tags-items");

    debugger;
    const addedTagItems = Array.from(tagItemsContainer.children)
      .map((tagItem) => tagItem.textContent.trim())
      .filter((tagItem) => tagItem.length > 0);

    // const { createTagMarkup: createdItemTag, tagObj } =
    // this._createTagForCurrentItem(tagToAdd);

    const { createTagMarkup: createdTagItem, tagObj } =
      this._createTagForCurrentItem(tagToAdd, this._tagsOptionsMarkupReRender.bind(this, tagsAvailableContainer));
    //check if tag in addedTags
    const duplicateCheck =
      addedTagItems.length > 0 &&
      addedTagItems.find(
        (tag) => tag.toLowerCase() === tagObj.text.toLowerCase()
      );

    //prevents duplicate addition of tag to tag items
    if (!duplicateCheck) {
      inputContainer.value = "";

      this._tagItemAdder(createdTagItem);
      const tagsMarkup = this._generateTagsOptions(this._state.tags);
      tagsAvailableContainer.innerHTML = "";
      tagsAvailableContainer.insertAdjacentHTML("beforeend", tagsMarkup);
    }
  }

  _handleTagOptionOptionsRenderEvent(e) {
    const state = this._state;

    const currentTarget = e.currentTarget;

    const cls = this;

    const itemId = e.currentTarget.dataset.id;

    const tagName = e.target
      .closest(".tags-option")
      .querySelector(".row-tag-tag");

    const tagToEdit = this._state.tags.find(
      (tag) => String(tag.id) === tagName.dataset.id
    );

    const optionNudge = e.target.closest(".row-option-icon");

    const { top, left, width, height } = optionNudge.getBoundingClientRect();

    const componentObj = {
      callBack: state.subComponentCallback,
      selector: ".row-tag-options",
      top,
      left,
      width,
      height,
      tags: state.tags,
      eventHandlers: this._state.eventHandlers,
      tagsColors: state.tagsColors,
      table: state.table,
      itemId: +currentTarget.dataset.id,
      tagToEdit,
      currentTarget,
    };

    const component = new tagEditComponent(componentObj);
    component.render();
  }

  _tagItemAdder(createdItemTag) {
    const tagsAddContainer = document.querySelector(".tags-items");
    //clone input
    const tagAddInputClone = document
      .querySelector(".tag-input-input")
      .cloneNode(true);

    //remove input
    document.querySelector(".tag-input-input").remove();

    //add tag and cloned input
    tagsAddContainer.insertAdjacentHTML("beforeend", createdItemTag);
    tagsAddContainer.insertAdjacentElement("beforeend", tagAddInputClone);
  }

  _handleUpdateModelIfFilterActive() {
    // debugger;
    let updateModel;
    if (componentGlobalState.filterMethod) {
      updateModel = this._state.updateModel?.bind(
        null,
        componentGlobalState.filterMethod,
        componentGlobalState.sortMethod,
        this._state.payloadType ?? "tags"
      );
      this._state.updateModel = updateModel;
    }

    if (componentGlobalState.sortMethod && !componentGlobalState.filterMethod) {
      updateModel = this._state.updateModel?.bind(
        null,
        componentGlobalState.filterMethod,
        componentGlobalState.sortMethod,
        this._state.payloadType ?? "tags"
      );
      this._state.updateModel = updateModel;
    }

    if (!componentGlobalState.sortMethod && !componentGlobalState.filterMethod) {
      updateModel = this._state.updateModel?.bind(
        null,
        componentGlobalState.filterMethod,
        componentGlobalState.sortMethod,
        this._state.payloadType ?? "tags"
      );
      this._state.updateModel = updateModel;
    }
  }
}

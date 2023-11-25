class ComponentOptionsView {
  _overlayCount = 0;
  _overlayContainer = document.querySelector(".overlay-container");

  static _convertHTMLStringToElement(html) {
    const template = document.createElement("template");
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
  }

  static createHTMLElement(html) {
    return ComponentOptionsView._convertHTMLStringToElement(html)
  }

  _componentRender(componentObj) {
    const container = document.querySelector(componentObj.container);
    const componentContainer = document.querySelector(
      componentObj.componentContainer
    );
    container.insertAdjacentHTML(
      componentObj.insertPosition,
      componentObj.markup
    );

    const component = container.querySelector(componentObj.selector);

    //toggle the component active on the container
    componentObj?.toggle
      ? container.classList.toggle(componentObj.toggle)
      : null;

    return component;
  }

  _addOverlayDefault(
    componentObj,
    overlay,
    overlayCount,
    disableOverlayInterceptor
  ) {
    //content styling
    overlay
      .querySelector(".overlay-content")
      .setAttribute(
        "style",
        `top: ${componentObj.top}px; left: ${componentObj.left}px;`
      );

    //content filler styling
    overlay
      .querySelector(".overlay-content-fill")
      .setAttribute(
        "style",
        `width: ${componentObj.width + "px"}; height: ${overlayCount > 1 ? componentObj.height : "0px"
        }`
      );

    if (!disableOverlayInterceptor)
      overlay.querySelector(".overlay-filler").classList.toggle("fill");
  }

  _addOverlayNotifier(overlay, disableOverlayInterceptor) {
    if (!disableOverlayInterceptor) {
      overlay.querySelector(".overlay-filler").style.backgroundColor =
        "rgba(15, 15, 15, 0.6)";

      overlay.querySelector(".overlay-filler").classList.toggle("fill");
    }

    overlay
      .querySelector(".overlay-content")
      .setAttribute("style", "top: 40%; left: 40%");
  }

  _componentOverlay(componentObj, disableOverlayInterceptor = false) {
    this._overlayCount < 1 ? (this._overlayCount = 1) : this._overlayCount++;

    const overlayMarkup = this._generateOverlayMarkup(componentObj.markup);

    //FIXME: check to make sure implementation reesolves
    const overlay = this.constructor._convertHTMLStringToElement(overlayMarkup);

    //set the positioning of
    this._overlayCount === 1
      ? (overlay.style.zIndex = 1)
      : (overlay.style.zIndex = this._overlayCount);

    if (componentObj.notify)
      this._addOverlayNotifier(overlay, disableOverlayInterceptor);

    if (!componentObj.notify)
      this._addOverlayDefault(
        componentObj,
        overlay,
        this._overlayCount,
        disableOverlayInterceptor
      );
    console.log("this overlaycontaineer", this)
    this._overlayContainer.insertAdjacentElement("beforeend", overlay);

    const component = overlay.querySelector(componentObj.selector);

    const overlayInterceptor = overlay.querySelector(".overlay-filler");

    return { overlay, overlayInterceptor, component };
  }

  _componentRemover(componentObj, component = undefined, mutate = true) {
    debugger;
    if (componentObj.componentInput) {
      componentObj.component.textContent =
        componentObj.componentInput.textContent;
      componentObj.componentInput.remove();
      componentObj.overlay.remove();
      //an empty update obj as to be passed with the updateModel function
      componentObj.updateObj.title = componentObj.component.textContent;
    }

    if (!componentObj.componentInput) {
      if (componentObj.updateTag) {
        const addedTags = componentObj.component.querySelector(".tags-items");
        componentObj.updateObj.tags = Array.from(addedTags.children).slice(
          0,
          -1
        );
      }
      componentObj.component?.remove() ?? component?.remove();
      componentObj.overlay.remove();
    }

    if (mutate) {
      if (componentObj.callBack)
        Array.isArray(componentObj.callBack)
          ? componentObj.callBack.forEach((cb) => cb())
          : componentObj.callBack();

      if (componentObj.updateModel) {
        //update model gets called with the bounded updateObj
        componentObj.updateModel();
      }

      //logic to rerender the side-peek content
      if (componentObj.refreshCaller) {
        const updatedData = componentObj.getUpdatedData();
        componentObj.refreshCaller(updatedData);
      }
    }

    //reset overlayCount relative to the overlays on page
    this._overlayCount > 0 ? this._overlayCount-- : this._overlayCount;
  }

  _updateOverlayCounter() {
    this._overlayCount > 0 ? this._overlayCount-- : this._overlayCount;
  }

  _removeElements(...elements) {
    elements.forEach((el) => el.remove());
  }

  _generateOverlayMarkup(optionsMarkup) {
    return `
        <div class="overlay">
          <div>
            <div class="overlay-filler">
            </div>
            <div class="overlay-content">
              <div class="overlay-content-fill">
              </div>
              <div class="overlay-content-holder">
                <div class="overlay-content-content">
                  ${optionsMarkup}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
  }
}


// export default new ComponentOptionsView();

export const importComponentOptionsView = {
  cls: ComponentOptionsView,
  import: (() => new ComponentOptionsView()),
  object: null
}

import journalInfoComponentView from "../views/journalInfoComponentView";
import tableComponentView from "../views/tableComponentView";

class ContentContainerListener {
  _parentElement = document.querySelector(".content-container");
  _events = ["click", "keyup"];

  activateListener() {
    console.log("the par el", this._parentElement)
    this._events.forEach((ev) =>
      this._parentElement.addEventListener(ev, this._registerSubscribers)
    );
  }

  _registerSubscribers(e) {
    e.stopPropagation();
    if (e.type === "click") {
      tableComponentView.addDelegationEventListener(e);
    }
    if (journalInfoComponentView._events.find((ev) => ev === e.type)) {
      journalInfoComponentView.addDelegationEventListener(e);
    }
  }

  _subscribers() { }
}


export const importContentContainerListener = (() => new ContentContainerListener());

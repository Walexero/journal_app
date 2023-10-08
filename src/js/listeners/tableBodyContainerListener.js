import tableBodyProcessorView from "../views/tableBodyProcessorView";
import signals from "../signals";

class TableBodyContainerListener {
  _parentElement;
  _events = ["mouseover", "click"];

  activateListener(element) {
    const cls = this;
    this._parentElement = element;
    this._events.forEach((ev) =>
      this._parentElement.addEventListener(ev, function (e) {
        e.stopPropagation();
        cls._registerSubscribers(e);
      })
    );
  }

  _registerSubscribers(e) {
    tableBodyProcessorView._handleDelegatedEvents(e);

    if (signals.eventsToListenFor().find((events) => events === e.type))
      signals.observe(e, "tablebody");
  }

  _subscribers() {}

  activate(element) {
    this.activateListener(element);
  }
}

export default new TableBodyContainerListener();

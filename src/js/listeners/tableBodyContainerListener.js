import tableBodyProcessorView from "../views/tableBodyProcessorView";
// import signals from "../signals";
import { importSignals } from "../signals";
class TableBodyContainerListener {
  _parentElement;
  _events = ["mouseover", "click"];
  _signals = importSignals.object ? importSignals.object : (importSignals.object = importSignals.import())

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

    if (this._signals.eventsToListenFor().find((events) => events === e.type))
      this._signals.observe(e, "tablebody");
  }

  _subscribers() { }

  activate(element) {
    this.activateListener(element);
  }
}

export const importTableBodyContainerListener = { import: (() => new TableBodyContainerListener()), object: null };

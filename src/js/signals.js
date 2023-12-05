// import tableBodyContainerListener from "./listeners/tableBodyContainerListener";
import { importTableBodyContainerListener } from "./listeners/tableBodyContainerListener.js";

class Signals {
  _subscribers = [];
  _eventsToListenFor = ["click"];
  _listeners = [
    { listenerType: "tablebody", listener: importTableBodyContainerListener.object },
  ];

  observe(e, source) {
    this._subscribers.forEach((subscriber) => {
      if (subscriber.source.find((src) => src === source)) {
        subscriber.component._handleEvents(e, true);
      }
    });
  }

  subscribe(subscriberObj) {
    this._subscribers.push(subscriberObj);
  }

  unsubscribe(subscriber) {
    const subscriberToRemove = this._subscribers.findIndex(
      (sub) => sub.component === subscriber
    );
    this._subscribers.splice(subscriberToRemove, 1);
  }

  eventsToListenFor() {
    return this._eventsToListenFor;
  }

  activateListener(listenerToActivate, element) {
    const listenerClass = this._listeners.find(
      (ls) => ls.listenerType === listenerToActivate
    );
    listenerClass.listener.activate(element);
  }
}

//export default new Signals();
export const importSignals = { import: (() => new Signals), object: null }
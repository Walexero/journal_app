import componentOptionsView from "./componentOptionsView.js";
import {
  NOTIFICATION_CONF_MSG,
  NOTIFICATION_DELETE_MSG,
} from "../../config.js";

export default class NotificationComponent {
  _componentHandler = componentOptionsView;
  _state;
  _events = ["click"];

  constructor(state) {
    this._state = state;
  }

  _generateNotificationConfirmationMarkup() {
    return `
      <div class="notification-btn notification-confirm-btn">okay</div>
    `;
  }

  _generateNotificationDeleteBtnMarkup() {
    return `
    <div class="notification-action-container">
      <div class="notification-btn notification-cancel-btn hover-deep-dull">Cancel</div>
      <div class="notification-btn notification-delete-btn hover-tomato">Remove</div>
    </div>
    `;
  }

  _generateMarkup(text, btnMarkup) {
    return `
        <div class="notification-render">
          <div class="notification-render-box">
            <div class="notification-text">
              ${text}
            </div>
           ${btnMarkup}
          </div>
        </div>
    `;
  }

  render() {
    const cls = this;
    const markupArgs = this._state.deleter
      ? [NOTIFICATION_DELETE_MSG, this._generateNotificationDeleteBtnMarkup()]
      : [NOTIFICATION_CONF_MSG, this._generateNotificationConfirmationMarkup()];

    this._state.markup = this._generateMarkup(...markupArgs);

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
    if (this._handleNotificationDeleteMatchStrategy(e))
      this._handleNotificationDeleteEvent(e);

    if (this._handleNotificationCancelMatchStrategy(e))
      this._handleNotificationCancelEvent(e);

    if (this._handleNotificationConfirmationMatchStrategy(e)) {
      this._componentHandler._componentRemover(
        this._state,
        this._state.component,
        false
      );
    }
  }

  _handleNotificationDeleteMatchStrategy(e) {
    const matchStrategy = e.target.classList.contains(
      "notification-delete-btn"
    );
    return matchStrategy;
  }

  _handleNotificationConfirmationMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("notification-confirm-btn") ||
      e.target.closest(".notification-confirm-btn");
    return matchStrategy;
  }

  _handleNotificationCancelMatchStrategy(e) {
    const matchStrategy =
      e.target.classList.contains("notification-cancel-btn") ||
      e.target.closest(".notification-cancel-btn");
    return matchStrategy;
  }

  _handleNotificationDeleteEvent(e) {
    this.remove(true);
  }

  _handleNotificationCancelEvent(e) {
    this._state.overlay.remove();
  }

  remove(callBack = false) {
    const cls = this;
    if (callBack) this._state.callBack(true);
    this._state.overlayInterceptor.click();
    this._events.forEach((ev) =>
      this._state.component.removeEventListener(ev, cls._handleEvents, true)
    );
    this._state.parentOverlay.remove();
  }
}

import { BaseForm } from "./baseForm.js";
import { API } from "../../api.js";
import { formatJournalHeadingName } from "../../helpers.js";

export class UpdateInfoForm extends BaseForm {
  constructor() {
    super()
  }

  _handleEvents(ev) {
    if (this.activeFormErrors) this._clearErrorSignal()
    if (ev.type === "submit") this._handleSubmit(ev)
  }

  _handleSubmit(ev) {
    const payload = this.destructureFormData(this.createPayload(ev)?.body)

    if (!payload) return

    //query create endpoint
    const queryObj = {
      endpoint: API.APIEnum.USER.UPDATE_INFO,
      token: this._token,
      sec: null,
      actionType: "updateInfo",
      queryData: payload,
      callBack: this._updateInfoAPICallback.bind(this),
      spinner: true,
      alert: true,
      successAlert: true,
      type: "PUT",
      callBackParam: true,
    }
    API.queryAPI(queryObj)
  }

  _updateInfoAPICallback(returnData, requestState = false) {
    this._renderFormErrors(returnData, requestState)

    if (requestState) {
      const usernameContainer = document.querySelector(".options-heading-title")
      usernameContainer.textContent = formatJournalHeadingName(returnData.username)
    }

  }

  _generateMarkup() {
    return `
      <form action="">
        <div class="form-div">
          <label for="first_name">First Name</label>
          <input type="text" class="first_name" id="first_name" name="first_name" placeholder="eg. John" required>
        </div>
        <div class="form-div">
          <label for="last_name">Last Name</label>
          <input type="text" class="last_name" id="last_name" name="last_name" placeholder="eg. Doe" required>
        </div>
        <div class="form-div">
          <label for="email">Email</label>
          <input type="email" class="email" id="email" name="email" placeholder="eg. johndoe@example.com" required>
        </div>
        <div class="form-div">
          <label for="username">Username</label>
          <input type="text" class="username" id="username" name="username" placeholder="johndoe" required>
        </div>
        <button class="form-submit" type="submit">Update Info</button>
      </form>   
    `
  }

  formType() {
    return "updateInfo"
  }
}
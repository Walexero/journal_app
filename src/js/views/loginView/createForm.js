import componentOptionsView from "../componentView/componentOptionsView.js";
import { BaseForm } from "./baseForm.js";
import { API } from "../../api.js";

export class CreateForm extends BaseForm {
  constructor() {
    super()
  }

  _handleEvents(ev) {
    if (this.activeFormErrors) this._clearErrorSignal()
    if (ev.type === "submit") this._handleSubmit(ev)
  }

  _handleSubmit(ev) {
    const payload = this.createPayload(ev)
    if (!payload) return

    //query create endpoint
    const queryObj = {
      endpoint: API.APIEnum.USER.CREATE,
      sec: null,
      actionType: "create",
      queryData: payload,
      callBack: this._renderFormErrors.bind(this),
      spinner: true,
      alert: true,
      // type: "POST"
    }
    API.queryAPI(queryObj)
  }

  _generateMarkup() {
    return `
      <form action="" enctype="multipart/form-data" id="create-form">
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
          <input type="email" class="email" name="email" id="email" placeholder="eg. johndoe@example.com" required>
        </div>
        <div class="form-div">
          <label for="username">Username</label>
          <input type="text" class="username" id="username" name="username" placeholder="johndoe" required>
        </div>
        <div class="form-div">
          <label for="password">Password</label>
          <input type="password" class="password" id="password" name="password" placeholder="Create a strong password" required>
        </div>
        <div class="form-div">
          <label for="Confirm password">Confirm Password</label>
          <input type="password" name="password2" class="password2" id="password2" placeholder="Re-type your password" required>
        </div>

        <button class="form-submit" type="submit">Create account</button>
      </form>
        `
  }

  formType() {
    return "create"
  }
}
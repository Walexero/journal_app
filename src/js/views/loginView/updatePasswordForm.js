import { BaseForm } from "./baseForm.js";
import { API } from "../../api.js";

export class UpdatePasswordForm extends BaseForm {
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
      endpoint: API.APIEnum.USER.UPDATE_PWD,
      token: this._token,
      sec: null,
      actionType: "updatePwd",
      queryData: payload,
      spinner: true,
      alert: true,
      successAlert: true,
      callBack: this._renderFormErrors.bind(this),
      callBackParam: true,
      type: "PUT",
    }
    API.queryAPI(queryObj)
  }

  _generateMarkup() {
    return `
            <form action="">
              <div class="form-div">
                <label for="old_password">Old Password</label>
                <input type="password" class="old_password" id="old_password" name="old_password" placeholder="Old Password" required>
              </div>
              <div class="form-div">
                <label for="password">New Password</label>
                <input type="password" class="password" id="password" name="password" placeholder="Enter your new password" required>
              </div>
              <div class="form-div">
                <label for="password2">password2</label>
                <input type="password" class="password2" id="password2" name="password2" placeholder="Confirm password" required>
              </div>
              <button class="form-submit" type="submit">Update Password</button>
            </form>   
        `
  }

  formType() {
    return "updatePwd"
  }
}
import { BaseForm } from "./baseForm";
import { API } from "../../api";

export class LoginForm extends BaseForm {
  constructor() {
    super()
  }

  _handleEvents(ev) {
    if (ev.type === "submit") this._handleSubmit(ev)
  }

  _handleSubmit(ev) {
    const payload = this.createPayload(ev)
    if (!payload) return

    //query create endpoint
    const queryObj = {
      endpoint: API.APIEnum.USER.TOKEN,
      sec: null,
      actionType: "login",
      queryData: payload,
      callBack: this.loginWithToken.bind(this),
      spinner: true,
      alert: true,
      successAlert: true
      // type: "POST"
    }
    API.queryAPI(queryObj)
  }

  loginWithToken(token, success) { //NOTE: do not remove success param
    if (token)
      //offload to controller
      this.controlHandler(token)

  }

  _generateMarkup() {
    return `
      <form action="">
        <div class="form-div">
          <label for="email">Email</label>
          <input type="email" class="email" id="email" name="email" placeholder="eg. johndoe@example.com">
        </div>
        <div class="form-div">
          <label for="password">Password</label>
          <input type="password" class="password"  name="password" id="password" placeholder="Create a strong password">
        </div>
        <button class="form-submit" type="submit">Login</button>
      </form>   
      `
  }

  formType() {
    return "login"
  }
}
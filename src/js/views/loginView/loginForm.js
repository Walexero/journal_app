import { BaseForm } from "./baseForm";

export class LoginForm extends BaseForm {
    constructor() {
        super()
    }

    _handleEvents(ev) {
        if (this.activeFormErrors) this._clearErrorSignal()
        if (ev.type === "submit") this._handleSubmit(ev)
    }

    _handleSubmit(ev) { }

    _generateMarkup() {
        return `
            <div class="login-form-container">
                ${this._generateCloseFormNudge()}
                <h1 class="form-heading">
                  Login
                </h1>
                <div class="form-content">
                  <div class="form-content-info">
                    Enter your information below to login to your account
                  </div>
                  <div class="form-content-form">
                    <form action="">

                      <div class="form-div">
                        <label for="email">Email</label>
                        <input type="text" class="email" id="email" placeholder="eg. johndoe@example.com">
                      </div>

                      <div class="form-div">
                        <label for="password">Password</label>
                        <input type="password" class="password" id="password" placeholder="Create a strong password">
                      </div>

                      <button class="form-submit" type="submit">Login</button>
                    </form>
                  </div>
                </div>
            </div>
        `
    }
}
import componentOptionsView from "../componentView/componentOptionsView.js";
import { BaseForm } from "./baseForm.js";

export class CreateForm extends BaseForm {
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
            <div class="create-form-container">
                ${this._generateCloseFormNudge()}
                <h1 class="form-heading">
                  Create Account
                </h1>
                <div class="form-content">
                  <div class="form-content-info">
                    Enter your information below to signup for an account
                  </div>
                  <div class="form-content-form">
                    <form action="">
                      <div class="form-div">
                        <label for="first_name">First Name</label>
                        <input type="text" class="first_name" id="first_name" placeholder="eg. John">
                      </div>
                      <div class="form-div">
                        <label for="last_name">Last Name</label>
                        <input type="text" class="last_name" id="last_name" placeholder="eg. Doe">
                      </div>
                      <div class="form-div">
                        <label for="email">Email</label>
                        <input type="text" class="email" id="email" placeholder="eg. johndoe@example.com">
                      </div>
                      <div class="form-div">
                        <label for="username">Username</label>
                        <input type="text" class="username" id="username" placeholder="johndoe">
                      </div>
                      <div class="form-div">
                        <label for="password">Password</label>
                        <input type="password" class="password" id="password" placeholder="Create a strong password">
                      </div>
                      <div class="form-div">
                        <label for="Confirm password">Confirm Password</label>
                        <input type="password" class="password2" id="password2" placeholder="Re-type your password">
                      </div>

                      <button class="form-submit" type="submit">Create account</button>
                    </form>
                  </div>
                </div>
            </div>
        `
    }

    formType() { }
}
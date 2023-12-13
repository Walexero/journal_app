import { BaseForm } from "./baseForm.js"
import { API } from "../../api.js";
// import componentOptionsView from "../componentView/componentOptionsView.js";
import { delegateMatch, delegateMatchId, delegateMatchChild, selector } from "../../helpers.js";

export class ResetPasswordForm extends BaseForm {
    _token;

    constructor() {
        super()
    }

    _handleEvents(ev) {
        if (this.activeFormErrors) this._clearErrorSignal()
        if (ev.type === "submit") this._handleSubmit(ev)
    }

    _handleSubmit(ev) {
        if (delegateMatchChild(ev, "reset-reset")) this._handleResetSubmit(ev)
        if (delegateMatchChild(ev, "reset-confirm")) this._handleResetConfirmSubmit(ev)
    }

    _handleResetSubmit(ev) {
        const cls = this;
        let payload = this.destructureFormData(this.createPayload(ev).body)
        if (!payload) return;
        //entrypoint to api
        const queryObj = {
            endpoint: API.APIEnum.USER.RESET_PWD,
            sec: null,
            actionType: "resetPwd",
            queryData: payload,
            callBack: this._switchResetFormType.bind(cls),
            spinner: true,
            alert: true,
            successAlert: true,
            type: "POST"
        }
        API.queryAPI(queryObj)
    }

    _switchResetFormType(returnData, success = false) {
        if (success) {
            const resetForm = selector(".reset-reset", this._component)
            resetForm.replaceWith(this.getResetConfirmForm())
        }

        if (!success)
            this._renderFormErrors(returnData)
    }

    _removeResetForm(returnData, success = false) {
        if (success) {
            debugger;
            this.controlHandler();
            // this.remove(true)
            return
        }
        if (!success) this._renderFormErrors(returnData, success)
    }

    _handleResetConfirmSubmit(ev) {
        const cls = this;
        let payload = this.destructureFormData(this.createPayload(ev).body)
        if (!payload) return;
        //entrypoint to api
        const queryObj = {
            endpoint: API.APIEnum.USER.RESET_PWD_CONFIRM,
            sec: null,
            actionType: "resetConfirmPwd",
            queryData: payload,
            callBack: this._removeResetForm.bind(this),
            spinner: true,
            alert: true,
            successAlert: true,
            type: "POST"
        }
        API.queryAPI(queryObj)
    }

    _generateMarkup() {
        return `
            <form action="" id="reset-pwd-form" class="form-class">  
                <div class="reset-reset">
                    <div class="form-div">
                        <label for="email">Email</label>
                        <input type="email" name="email" placeholder="email" class="bd-radius" required>
                    </div>
                </div>              
                <button class="form-submit">Submit</button>
            </form>

        `
    }

    getResetConfirmForm() {
        const markup = this._generateResetConfirmMarkup()
        const markupEl = this._componentHandler.createHTMLElement(markup)
        return markupEl
    }

    _generateResetConfirmMarkup() {
        return `
            <div class="reset-confirm">
                <div class="form-div">
                    <label for="token">Token</label>
                    <input type="text" name="token"  class="token" placeholder="eg. df93fa-vdsa23-klvadf32..." id="token" required>
                </div>
                <div class="form-div">
                    <label for="uid">UID</label>
                    <input type="text" name="uid" placeholder="eg. MQT" class="uid" id="uid" required>
                </div>
                <div class="form-div">
                    <label for="new_password1">New Password</label>
                    <input type="password" name="new_password1" placeholder="Create a strong password" class="new_password1" id="new_password1" required>
                </div>
                <div class="form-div">
                    <label for="new_password2">Confirm Password</label>
                    <input type="password" name="new_password2" placeholder="Re-type your password" class="new_password2" id="new_password2" required>
                </div>
            </div>
        `
    }

    formType() {
        return "reset"
    }
}
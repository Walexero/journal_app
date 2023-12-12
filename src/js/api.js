import { timeout, timeoutWithoutPromise } from "./helpers.js"
import { BASE_API_URL, HTTP_204_SUCCESS_NO_CONTENT, ALERT_STATUS_ERRORS, HTTP_400_RESPONSE_LOGIN_USER, HTTP_400_RESPONSE_CREATE_USER, HTTP_200_RESPONSE, PREVENT_DESTRUCTURING_FROM_API_ENDPOINT_RESP } from "./config.js"
import { Loader } from "./components/loader.js"
import { Alert } from "./components/alerts.js"

export class API {
    static APIEnum = {

        USER: {
            CREATE: "user/create/",
            GET: "user/me/",
            PUT: "user/me/",
            PATCH: "user/me/",
            TOKEN: "user/token/",
            UPDATE_INFO: "user/update_info/",
            UPDATE_PWD: "user/change_password/",
            RESET_PWD: "user/password-reset/",
            RESET_PWD_CONFIRM: "user/password-reset-confirm/"
        },

        JOURNAL: {
            CREATE: "journal/journals/",
            LIST: "journal/journals/",
            // BATCH_CREATE: "todo/todos/batch_create/",
            GET: ((journalId) => `journal/journals/${journalId}/`),
            PUT: ((journalId) => `journal/journals/${journalId}/`),
            PATCH: ((journalId) => `journal/journals/${journalId}/`),
            // BATCH_UPDATE_ORDERING: "todo/todos/batch_update_ordering/",
            // BATCH_UPDATE: "todo/todos/batch_update/",
            DELETE: ((journalId) => `journal/journals/${journalId}/`),
            // BATCH_DELETE: "todo/todos/batch_delete",
        },

        JOURNAL_TABLES: {
            CREATE: "journal/journal-tables/",
            LIST: "journal/journal-tables/",
            // BATCH_CREATE: "todo/todos/batch_create/",
            GET: ((tableId) => `journal/journal-tables/${tableId}/`),
            PUT: ((tableId) => `journal/journal-tables/${tableId}/`),
            PATCH: ((tableId) => `journal/journal-tables/${tableId}/`),
            // BATCH_UPDATE_ORDERING: "todo/todos/batch_update_ordering/",
            // BATCH_UPDATE: "todo/todos/batch_update/",
            DELETE: ((tableId) => `journal/journal-tables/${tableId}/`),

        },

        TAG: {
            CREATE: "journal/tags/",
            CREATED: "journal/kljdaslkfjdl",
            LIST: "journal/tags/",
            BATCH_TAG: "journal/tags/batch_tag_processor/",
            // BATCH_CREATE: "todo/todos/batch_create/",
            GET: ((tagId) => `journal/tags/${tagId}/`),
            PUT: ((tagId) => `journal/tags/${tagId}/`),
            PATCH: ((tagId) => `journal/tags/${tagId}/`),
            PATCHED: "journal/tags/lkdjiovjafdadf/",
            // BATCH_UPDATE_ORDERING: "todo/todos/batch_update_ordering/",
            // BATCH_UPDATE: "todo/todos/batch_update/",
            DELETE: ((tagId) => `journal/tags/${tagId}/`),
            DELETED: "journal/tags/kldsjflkasdjfdfs/"
        },

        ACTIVITIES: {
            CREATE: "journal/activities/",
            LIST: "journal/activities/",
            // BATCH_CREATE: "todo/todos/batch_create/",
            GET: ((activityId) => `journal/activities/${activityId}/`),
            PUT: ((activityId) => `journal/activities/${activityId}/`),
            PATCH: ((activityId) => `journal/activities/${activityId}/`),
            PATCHED: "journal/activities/kdjfalsdfasddf/",
            BATCH_UPDATE_ACTIVITIES: "journal/activities/batch_update_activities/",
            BATCH_DELETE_ACTIVITIES: "journal/activities/batch_delete_activities/",
            BATCH_DUPLICATE_ACTIVITIES: "journal/activities/batch_duplicate_activities/",
            DELETE: ((activityId) => `journal/activities/${activityId}/`),
        },

        SUBMODEL: {
            CREATE: ((subModel, subModelId) => `journal/${subModel}/`),
            LIST: ((subModel, subModelId) => `journal/${subModel}/`),
            GET: ((subModel, subModelId) => `journal/${subModel}/${subModelId}/`),
            PUT: ((subModel, subModelId) => `journal/${subModel}/${subModelId}/`),
            PATCH: ((subModel, subModelId) => `journal/${subModel}/${subModelId}/`),
            DELETE: ((subModel, subModelId) => `journal/${subModel}/${subModelId}/`),
            DELETED: "journal/djfldsjflakdfsdfd/dsfkasdfjdsfdsfdf/"
        },
    }
    static timeout = 20 //timeout in 20s

    static getSubmodelEndpoint(subModel, method, subModelId = undefined) {
        return API.APIEnum.SUBMODEL[method](subModel, subModelId)
    }

    static getBatchEndpoint(type) {
        if (type === "selectTags") return API.APIEnum.ACTIVITIES.BATCH_UPDATE_ACTIVITIES

        if (type === "deleteTableItems") return API.APIEnum.ACTIVITIES.BATCH_DELETE_ACTIVITIES
    }

    static queryAPI(queryObj) {
        //switch the timeout secs if null
        queryObj.sec = queryObj.sec ?? API.timeout
        //create the loader based on the queryObj
        API.loaderCreator(queryObj);

        (async () => await API.querier(queryObj))().then(returnData => {
            if (returnData) {
                queryObj.loader ? queryObj.loader.remove() : null

                if (queryObj.successAlert)
                    queryObj.alert ? new Alert(HTTP_200_RESPONSE[queryObj.actionType](returnData), null, "success").component() : null
                if (queryObj.callBack)
                    queryObj.callBack(returnData, queryObj.callBackParam ?? true)


                queryObj = {};
            }

            if (!returnData && queryObj.callBack)
                queryObj.callBack()
            //call the fallback to handle thee failure

            //if token expired render credeential issues msg and logout user
            if (queryObj.resStatus === 401) {
                new Alert(HTTP_200_RESPONSE[queryObj.actionType](returnData), null, "success").component()
                timeoutWithoutPromise(5, API.logoutUser)
            }
        })
    }

    static async querier(queryObj) {
        let data = null;

        try {
            const res = await Promise.race([API.makeRequest(queryObj), timeout(queryObj.sec, queryObj.actionType)]) //TODO: Add fns to the timeout function

            const resContent = res.status !== HTTP_204_SUCCESS_NO_CONTENT ? await res.json() : {}

            if (!res.ok) throw new Error(`${ALERT_STATUS_ERRORS.find(s => s === res.status) ? API.getResponseToRender(resContent, queryObj, res.status) : res.message} (${res.status})`)

            if (!resContent.non_field_errors) data = API.destructureSuccessResponse(resContent, queryObj)
        } catch (err) {
            if (queryObj.loader) await queryObj.loader.remove()
            if (queryObj.alert) await new Alert(!queryObj.successAlert ? "Request Failed Please try again later" : err.message ?? err, null, "error").component()
            // if(queryObj.resStatus === 401) API.logoutUser()

        } finally {
            return data
        }
    }

    static getResponseToRender(response, queryObj, resStatus) {
        if (!queryObj.alert) return
        //set the resStatus on the queryObj
        if (resStatus) queryObj.resStatus = resStatus

        if (response.non_field_errors)
            return HTTP_400_RESPONSE_LOGIN_USER

        if (response instanceof Array) return response[0]

        const formError = Object.getOwnPropertyNames(response)
        const formErrorsLength = Object.getOwnPropertyNames(response).length

        if (formErrorsLength > 0) return (() => {
            // const formDataRequests = ["login","updatePwd","updateInfo","create","resetPwd","resetConfirmPwd"]

            if (queryObj.callBack) queryObj.callBack(response);
            return formErrorsLength >= 1 ? API.destructureError(response[formError[0]], formError[0]) : queryObj.actionType === "create" ? HTTP_400_RESPONSE_CREATE_USER : API.destructureError(response[formError[0]], formError[0])
        })()
    }

    static loaderCreator(queryObj) {
        if (queryObj.spinner) {
            //add the loader to the queryObj
            queryObj.loader = new Loader(queryObj.sec)
            queryObj.loader.component();
        }
    }

    static destructureError(error, key) {
        if (error instanceof Object) return error[key] ?? error.join("\n")
        if (error instanceof Array) return error.join("\n")
        return error
    }

    static destructureSuccessResponse(resp, queryObj) {

        const preventDestructureList = PREVENT_DESTRUCTURING_FROM_API_ENDPOINT_RESP
        let preventDestructure = false;
        //if theres an empty data value returned as an empty array reeturn it
        if (resp instanceof Array && resp.length === 0) return resp
        //if its not empty destructure
        if (resp instanceof Object) {
            preventDestructure = preventDestructureList.some(listItem => listItem === queryObj.actionType)

            if (!preventDestructure) {
                const respKey = Object.keys(resp)
                return resp[respKey[0]]
            }
        }
        return resp
    }

    static makeRequest(queryObj) {
        switch (queryObj.type) {
            case "POST":
                return API.requestJSON(queryObj)
                break;
            case "PATCH":
                return API.requestJSON(queryObj)
            case "DELETE":
                return API.requestJSON(queryObj)
            case "PUT":
                return API.requestJSON(queryObj)
            case "GET":
                return API.requestJSON(queryObj)
            default:
                return fetch(`${BASE_API_URL}${queryObj.endpoint}`, queryObj.queryData)
                break;
        }
    }

    static requestJSON(queryObj) {

        const fetchParams = {
            method: queryObj.type,
            headers: {
                "Content-Type": "application/json"
            },
        }
        if (queryObj.queryData) fetchParams.body = JSON.stringify(queryObj.queryData)
        if (queryObj.token) fetchParams.headers.Authorization = `Token ${queryObj.token}`

        return fetch(`${BASE_API_URL}${queryObj.endpoint}`, fetchParams)
    }

    static logoutUser() {
        localStorage.removeItem("token")
        window.location.reload()
    }
}
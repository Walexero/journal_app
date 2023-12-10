import { Loader } from "./components/loader.js";
import { importComponentOptionsView } from "./views/componentView/componentOptionsView.js";
import { delegateMatchTarget, formatAPIRequestBody, formatAPIResp, formatAPIResponseBody, formatTagRequestBody } from "./helpers.js";
import { API } from "./api.js";
import { cloneDeep } from "lodash";

class SyncLocalStorageToAPI {
    _container = document.querySelector(".container .row")
    _modelState;
    _diffState;
    _componentHandler = importComponentOptionsView.cls
    _token;
    _syncNotifyActive = false;
    _init;
    _syncState = { count: 0 };

    _eventListeners = ["click"]

    startModelInit(init) {
        debugger;
        this._init = init
        this._createLoader()
        this._loader.component()
        this._handleStartSync()
    }

    _completeSyncAndLoadData() {
        if (this._syncState.count <= 0) {
            this._syncState.count = 0;

            this._diffState.diffActive = false

            if (!this._diffObj) {
                this._removeLoader()
                this._component.remove()
                if (this._persistDiff) this._persistDiff()
            }

            if (this._diffObj) {
                this._removeLoader()
                this._diffObj = this._diffState
                if (this._persistDiff) this._persistDiff()
                this._init();
                this._clearInitData()
            }
        }
    }

    _clearInitData() {
        this._init = this._loader = this._modelState = this._diffState = this._diffObj = null
    }

    notifyUIToSyncChanges() {
        if (this._syncNotifyActive) return;
        this._container.insertAdjacentElement("afterbegin", this._component)
    }

    component() {
        const cls = this;
        console.log(this._componentHandler)
        this._component = this._componentHandler.createHTMLElement(this._generateMarkup())
        this._eventListeners.forEach(ev => this._component.addEventListener(ev, cls._handleEvents.bind(cls)))
    }

    addModelData(modelState, diffState, diffObj, persistDiff, token) {
        this._modelState = modelState
        this._diffState = diffState
        this._diffObj = diffObj
        this._persistDiff = persistDiff
        if (!this._token && token) this._token = token
    }

    _handleEvents(ev) {
        if (delegateMatchTarget(ev, "btn-sync-now")) this._handleStartSync(ev)
        if (delegateMatchTarget(ev, "btn-sync-later")) this._removeNotifier()
    }

    _initializeSyncProperties() {
        this.pendingTables = this._diffState.tableToCreate
        this.pendingTableItems = this._diffState.tableItemToCreate
        this.pendingTablesToDelete = this._diffState.tableToDelete
        this.pendingTableItemToDelete = this._diffState.tableItemToDelete;
        this.pendingTableToUpdate = this._diffState.tableToUpdate;
        this.pendingTableItemToUpdate = this._diffState.tableItemToUpdate
        this.pendingTableToDuplicate = this._diffState.pendingTableToDuplicate
        this.pendingTableItemToDuplicate = this._diffState.pendingTableItemToDuplicate
        this.pendingJournalInfoToUpdate = this._diffState.JournalInfoToUpdate

        //submodels
        this.pendingSubmodelToCreate = this._diffState.submodelToCreate
        this.pendingSubmodelToUpdate = this._diffState.submodelToUpdate
        this.pendingSubmodelToDelete = this._diffState.submodelToDelete

        //tags
        this.pendingTagsToDelete = Array.from(new Set(this._diffState.tagToDelete));
        this.pendingTagsToUpdate = this._diffState.tagsToUpdate
        this.pendingTags = this._diffState.tagsToCreate

        this.createPendingTable = []
        this.createPendingTableToUpdate = []
        this.createPendingTableItem = []
        this.createPendingTableToUpdate = []
        this.createPendingTags = []
        this.createPendingTagsToUpdate = []
        this.createPendingSubmodels = []
        this.createPendingSubmodelsToUpdate = []


        this.createPendingTableItemLinkedToAPITableItem = []
        this.createPendingSubmodelLinkedToAPISubmodel = []

        this.createPendingTableItemLinkedToAPITodoToUpdate = []
        this.createTagsPayload = { payload: [], ids: [] }
        this.createTagsToUpdatePayload = { payload: [], ids: [] }
        this.createSubmodelsPayload = { payload: [], ids: [] }
        this.createSubmodlsToUpdatePayload = { payload: [], ids: [] }

        // this.createTodoPayload = { payload: [], ids: [] }
        // this.createTaskPayload = { payload: [], ids: [] }
        // this.createTodoToUpdatePayload = { payload: [], ids: [] };
        // this.createTaskToUpdatePayload = { payload: [], ids: [] };
        // 
    }

    _handleStartSync() {
        if (!this._diffObj) {
            this._createLoader()
            this._loader.component()
        }

        //make new token request
        // this.

        this._initializeSyncProperties()

        debugger;
        this._filterProperties()

        this._createPropertiesPayload()

        this._makePropertiesRequest()

        //try to complete sync if no data is to be synced after request
        this._completeSyncAndLoadData()
    }

    _filterProperties() {

        /**Done */
        //tag to create passes deleted check
        // this._filterDeletedObjectsFromObjects(this.pendingTags, this.pendingTagsToDelete, null, this.createPendingTags, "tags")

        //tag to update passes deleted check
        // this._filterDeletedObjectsFromObjects(this.pendingTagsToUpdate, this.pendingTagsToDelete, null, this.createPendingTagsToUpdate, "tags")

        /**End of done */
        debugger;
        //submodels to create passes delete cheeck
        this._filterDeletedObjectsFromObjects(this.pendingSubmodelToCreate, this.pendingSubmodelToDelete, null, this.createPendingSubmodels, "submodels")


        // this._filterDeletedObjectsFromObjects(this.pendingTodoToUpdate, this.pendingTodosToDelete, null, this.createPendingTodosToUpdate, "todo")
        // 
        // task to create passes deleted check
        // this._filterDeletedObjectsFromObjects(this.pendingTasks, this.pendingTasksToDelete, this.pendingTodosToDelete, this.createPendingTasks, "task")
        // 
        // task to update passes deleted check
        // this._filterDeletedObjectsFromObjects(this.pendingTaskToUpdate, this.pendingTasksToDelete, this.pendingTodosToDelete, this.createPendingTasksToUpdate, "task")
    }

    _createPropertiesPayload() {

        //create tags payload
        this._createTagsPayload(this.createPendingTags, this.createTagsPayload)

        debugger
        //create tags payload
        this._createTagToUpdatePayload(this.createPendingTagsToUpdate, this.createPendingTags, this.createTagsToUpdatePayload)

        // this._createTodoPayload(this.pendingTodos, this.createPendingTodos, this.createTodoPayload)

        //create todo to update payload
        // this._createTodoUpdatePayload(this.pendingTodoToUpdate, this.createPendingTodosToUpdate, this.createPendingTodos, this.createTodoToUpdatePayload)

        //sort tasks which are not linked to todos to create
        // this._filterPendingTaskLinkedToAPITodo(this.pendingTasks, this.createPendingTasks, this.createPendingTodos, this.createPendingTaskLinkedToAPITodo)

        //sort tasks which are not linked to todos to update
        // this._filterPendingTaskLinkedToAPITodo(this.pendingTaskToUpdate, this.createPendingTasksToUpdate, this.createPendingTodos, this.createPendingTaskLinkedToAPITodoToUpdate)

        //task not linked to todos to create payload body
        // this._createTaskLinkedToAPITodoBody(this.pendingTasks, this.createPendingTaskLinkedToAPITodo, this.createTaskPayload)

        //sort tasks which are to be updated not in createPendingTaskLinkedToAPITodo Array
        // this._createTaskToUpdateBody(this.pendingTaskToUpdate, this.createPendingTaskLinkedToAPITodoToUpdate, this.createPendingTaskLinkedToAPITodo, this.createTaskToUpdatePayload)
    }

    _makePropertiesRequest() {
        debugger
        //create batch tags
        this._makeTagRequest(this.createTagsPayload, this.pendingTags, "POST")

        //batch delete tags
        this._makeTagRequest(this.pendingTagsToDelete, this.pendingTagsToDelete, "DELETE")

        //update batch tags
        this._makeTagRequest(this.createTagsToUpdatePayload, this.pendingTagsToUpdate, "PATCH")

        //create batch taskToCreate
        // this._makeTaskToCreateRequest(this.createTaskPayload, this.pendingTasks)
        // 
        // create batch taskToDelete
        // this._makeTaskToDeleteRequest(this.pendingTasksToDelete)
        // 
        // create batch taskToUpdate
        // this._makeTaskToUpdateRequest(this.createTaskToUpdatePayload, this.pendingTaskToUpdate)
        // 
        // update ordering todo
        // if (this.pendingTodoOrdering.length > 0) {
        // this._syncState.count += 1
        // this._makeOrderingUpdateRequest(this.pendingTodoOrdering, "todo", this._updateTodoOrderingBatchCallback)
        // }

        //update ordering task
        // if (this.pendingTaskOrdering.length > 0) {
        // this._syncState.count += 1
        // this._makeOrderingUpdateRequest(this.pendingTaskOrdering, "task", this._updateTaskOrderingBatchCallBack)
        // }

    }

    _batchTagRequestCallBack(diffPayload, requestMethod, returnData, requestState = false) {
        debugger
        if (requestState) {
            if (requestMethod === "POST") {
                returnData.forEach(data => {
                    //replace model data for other diffs that need to call the api with the updated data
                    const formattedReturnData = formatAPIResp(data, "apiTags")

                    const modelItemIndex = this._modelState.tags.findIndex(modelTag => modelTag.text.toLowerCase() === data.tag_name.toLowerCase())
                    this._modelState.tags.splice(modelItemIndex, 1)
                    this._modelState.tags.splice(modelItemIndex, 0, formattedReturnData)
                })
                //TODO: match diff data that need tags with text

                this._diffState.pendingTags = []
                this._syncState.count -= 1
            }

            if (requestMethod === "PATCH") {
                returnData.forEach(data => {
                    const formattedReturnData = formatAPIResp(data, "apiTags")

                    const modelItemIndex = this._modelState.tags.findIndex(modelTag => modelTag.id === data.id)
                    this._modelState.tags.splice(modelItemIndex, 1)
                    this._modelState.tags.splice(modelItemIndex, 0, formattedReturnData)
                })
                this._diffState.pendingTags = []
                this._syncState.count -= 1
            }

            if (requestMethod === "DELETE") {
                this._diffState.pendingTags = []
                this._syncState.count -= 1
            }
        }
    }

    _makeTagRequest(tagPayload, diffPayload, requestMethod) {
        const payloadLength = tagPayload?.length ? tagPayload.length > 0 : tagPayload?.payload?.length > 0
        if (payloadLength) {
            this._makeBatchRequest(API.APIEnum.TAG.BATCH_TAG, this._batchRequestWrapper(tagPayload?.payload ?? tagPayload, "tags"), diffPayload, "batchTags", this._batchTagRequestCallBack.bind(this, diffPayload, requestMethod), requestMethod, true)
            this._syncState.count += 1
        }
    }

    _makeTodoCreateRequest(createTodoPayload, pendingTodos) {
        //create batch todoToCreate
        if (createTodoPayload.payload.length > 0) {
            const createTodoPayloadLength = createTodoPayload.payload.length

            if (createTodoPayloadLength > 1) {
                this._makeBatchRequest(
                    API.APIEnum.TODO.BATCH_CREATE, this._batchRequestWrapper(createTodoPayload.payload, "batch_create"), pendingTodos, "createBatchTodo", this._createTodoBatchCallBack.bind(this, createTodoPayload.ids), "POST", true
                )
                this._syncState.count += 1
            }

            if (createTodoPayloadLength == 1) {
                this._makeBatchRequest(
                    API.APIEnum.TODO.CREATE, createTodoPayload.payload[0], pendingTodos, "createTodo", this._createTodoBatchCallBack.bind(this, createTodoPayload.ids), "POST", true
                )
                this._syncState.count += 1
            }
        }

    }

    _makeTodoDeleteRequest(pendingTodosToDelete) {
        //create batch todoToDelete
        if (pendingTodosToDelete.length > 0) {
            const todosToDeleteLength = pendingTodosToDelete.length

            //if todo doesn't exist in API it should return a NOT FOUND so no need to keep track of type of todo
            if (todosToDeleteLength > 1) {
                this._makeBatchRequest(API.APIEnum.TODO.BATCH_DELETE, this._batchRequestWrapper(pendingTodosToDelete, "batch_delete"), pendingTodosToDelete, "deleteTodoBatch", this._deleteTodoBatchCallBack.bind(this, pendingTodosToDelete), "DELETE", true)
                this._syncState.count += 1
            }

            if (todosToDeleteLength == 1) {
                this._makeBatchRequest(API.APIEnum.TODO.DELETE(pendingTodosToDelete[0]), pendingTodosToDelete[0], pendingTodosToDelete, "deleteTodo", this._deleteTodoBatchCallBack.bind(this, pendingTodosToDelete[0]), "DELETE", true)
                this._syncState.count += 1
            }


        }

    }

    _makeTodoUpdateRequest(createTodoToUpdatePayload, pendingTodoToUpdate) {
        //create batch todoUpdate
        if (createTodoToUpdatePayload.payload.length > 0) {
            const todosToUpdateLength = createTodoToUpdatePayload.payload.length

            if (todosToUpdateLength > 1) {
                this._makeBatchRequest(
                    API.APIEnum.TODO.BATCH_UPDATE, this._batchRequestWrapper(createTodoToUpdatePayload.payload, "batch_update"), pendingTodoToUpdate, "updateBatchTodo", this._updateTodoBatchCallBack.bind(this, createTodoToUpdatePayload.ids), "PATCH", true
                )
                this._syncState.count += 1
            }

            if (todosToUpdateLength == 1) {
                this._makeBatchRequest(API.APIEnum.TODO.PATCH(Number(createTodoToUpdatePayload.payload[0].id)), createTodoToUpdatePayload.payload[0], pendingTodoToUpdate, "updateTodo", this._updateTodoBatchCallBack.bind(this, createTodoToUpdatePayload.ids), "PATCH", true)
                this._syncState.count += 1
            }
        }

    }

    _makeTaskToCreateRequest(createTasksPayload, pendingTasks) {
        //create batch taskToCreate
        if (createTasksPayload.payload.length > 0) {
            const tasksToCreateLength = createTasksPayload.payload.length

            if (tasksToCreateLength > 1) {
                this._makeBatchRequest(
                    API.APIEnum.TASK.BATCH_CREATE, this._batchRequestWrapper(createTasksPayload.payload, "batch_create"), pendingTasks, "createBatchTask", this._createTaskBatchCallBack.bind(this, createTasksPayload.ids), "POST", true
                )
                this._syncState.count += 1
            }

            if (tasksToCreateLength == 1) {
                this._makeBatchRequest(API.APIEnum.TASK.CREATE, createTasksPayload.payload[0], pendingTasks, "createTask", this._createTaskBatchCallBack.bind(this, createTasksPayload.ids), "POST", true)
                this._syncState.count += 1
            }
        }


    }

    _makeTaskToDeleteRequest(pendingTasksToDelete) {
        //create batch taskToDelete
        if (pendingTasksToDelete.length > 0) {
            const tasksToDeleteLength = pendingTasksToDelete.length

            const pendingTasksToDeletePayload = pendingTasksToDelete.map(task => task.taskId)

            if (tasksToDeleteLength > 1) {
                this._makeBatchRequest(API.APIEnum.TASK.BATCH_DELETE, this._batchRequestWrapper(pendingTasksToDeletePayload, "batch_delete"), pendingTasksToDelete, "deleteBatchTask", this._deleteTaskBatchCallBack.bind(this, pendingTasksToDelete), "DELETE", true
                )
                this._syncState.count += 1
            }

            if (tasksToDeleteLength == 1) {
                this._makeBatchRequest(API.APIEnum.TASK.DELETE(pendingTasksToDeletePayload[0]), pendingTasksToDeletePayload[0], pendingTasksToDelete, "deleteTask", this._deleteTaskBatchCallBack.bind(this, pendingTasksToDelete), "DELETE", true)
                this._syncState.count += 1
            }
        }

    }

    _makeTaskToUpdateRequest(createTaskToUpdatePayload, pendingTaskToUpdate) {
        //create batch taskToUpdate
        if (pendingTaskToUpdate.length > 0) {
            const taskToUpdateLength = createTaskToUpdatePayload.payload.length

            if (taskToUpdateLength > 1) {
                this._makeBatchRequest(
                    API.APIEnum.TASK.BATCH_UPDATE, this._batchRequestWrapper(createTaskToUpdatePayload.payload, "batch_update"), pendingTaskToUpdate, "updateBatchTask", this._updateTaskBatchCallBack.bind(this, createTaskToUpdatePayload.ids), "PATCH", true
                )
                this._syncState.count += 1
            }

            if (taskToUpdateLength == 1) {
                this._makeBatchRequest(API.APIEnum.TASK.PATCH(createTaskToUpdatePayload.payload[0].id), createTaskToUpdatePayload.payload[0], pendingTaskToUpdate, "updateTask", this._updateTaskBatchCallBack.bind(this, createTaskToUpdatePayload.ids), "PATCH", true)
                this._syncState.count += 1
            }
        }

    }

    _getOrderingUrlFromType(orderingLength, orderingType, objId = undefined) {
        if (orderingLength > 1) {
            if (orderingType === "todo") return API.APIEnum.TODO.BATCH_UPDATE_ORDERING
            if (orderingType === "task") return API.APIEnum.TASK.BATCH_UPDATE_ORDERING
        }
        if (orderingLength === 1) {
            if (orderingType === "todo") return API.APIEnum.TODO.PATCH(objId)
            if (orderingType === "task") return API.APIEnum.TASK.PATCH(objId)
        }
    }

    _makeOrderingUpdateRequest(orderingPayload, type, orderingCallBack) {
        if (orderingPayload.length > 1) {
            this._makeBatchRequest(this._getOrderingUrlFromType(orderingPayload.length, type), this._batchRequestWrapper(orderingPayload, "batch_update_ordering"), null, "updateOrdering", orderingCallBack, "PATCH", true)
        }

        if (orderingPayload.length === 1) {

            this._makeBatchRequest(this._getOrderingUrlFromType(orderingPayload.length, type, orderingPayload[0].id), orderingPayload, null, "updateOrdering", orderingCallBack, "PATCH", true)
        }
    }

    _formatBatchCreatedReturnData(returnData, objType) {
        let formattedReturnedData = [];

        if (Array.isArray(returnData)) {
            returnData.forEach((data, i) => formattedReturnedData.push(formatAPIResponseBody(data, objType)))
        }
        if (!Array.isArray(returnData)) formattedReturnedData.push(formatAPIResponseBody(returnData, objType))

        return formattedReturnedData
    }

    _createTodoBatchCallBack(payloadIds, returnData, requestStatus) {


        if (requestStatus) {

            const formattedReturnedData = this._formatBatchCreatedReturnData(returnData, "todo")

            payloadIds.forEach((payloadId, i) => {
                let todo = this._modelState.todo.find(todoId => todoId.todoId === payloadId)

                if (todo) todo = formattedReturnedData[i]

                if (this.pendingTodoOrdering.length > 0) {
                    const todoOrderingIdUpdateIfCreatedByFallback = this.pendingTodoOrdering.find(todoOrder => todoOrder.id === payloadId)
                    if (todoOrderingIdUpdateIfCreatedByFallback) todoOrderingIdUpdateIfCreatedByFallback.id = todo.todoId
                }
            })
            //clear the data from the diff
            this._diffState.todoToCreate = []
        }
        this._syncState.count -= 1
        this._completeSyncAndLoadData()
    }
    _deleteTodoBatchCallBack(deletePayload, returnData, requestStatus) {


        if (requestStatus) this._diffState.todoToDelete = []
        this._syncState.count -= 1
        this._completeSyncAndLoadData()
    }

    _updateTodoBatchCallBack(payloadIds, returnData, requestStatus) {


        if (requestStatus) this._diffState.todoToUpdate = []
        this._syncState.count -= 1
        this._completeSyncAndLoadData()
    }

    _updateTodoOrderingBatchCallback(returnData, requestStatus) {
        if (requestStatus) this._diffState.todoOrdering = []
        this._syncState.count -= 1
        this._completeSyncAndLoadData()
    }

    _createTaskBatchCallBack(payloadIds, returnData, requestStatus) {


        if (requestStatus) {
            const formattedReturnedData = this._formatBatchCreatedReturnData(returnData, "task")

            payloadIds.forEach((payloadId, i) => {
                let task = this._filterToGetTaskBody(payloadId.taskId, payloadId.todoId, false)


                if (task) task = formattedReturnedData[i]

                if (this.pendingTaskOrdering.length > 0) {
                    const taskOrderingIdUpdateIfCreatedByFallback = this.pendingTaskOrdering.find(taskOrder => taskOrder.id === payloadId.taskId)
                    if (taskOrderingIdUpdateIfCreatedByFallback) taskOrderingIdUpdateIfCreatedByFallback.id = task.taskId
                }

            })
            //clear the data from the diff
            this._diffState.taskToCreate = []
        }
        this._syncState.count -= 1
        this._completeSyncAndLoadData()
    }

    _deleteTaskBatchCallBack(payloadIds, returnData, requestStatus) {


        if (requestStatus)
            this._diffState.taskToDelete = [];
        this._syncState.count -= 1
        this._completeSyncAndLoadData()
    }

    _updateTaskBatchCallBack(payloadIds, returnData, requestStatus) {


        if (requestStatus) this._diffState.taskToUpdate = [];
        this._syncState.count -= 1
        this._completeSyncAndLoadData()
    }

    _updateTaskOrderingBatchCallBack(returnData, requestStatus) {
        if (requestStatus) this._diffState.taskOrdering = []
        this._syncState.count -= 1
        this._completeSyncAndLoadData()
    }


    _filterDeletedObjectsFromObjects(object, deletedObjects, deletedObjectParent, returnList, objectType) {
        if (object.length > 0) {
            const deletedObjectsExists = deletedObjects.length > 0;
            if (deletedObjectsExists) {

                object.forEach(obj => {
                    const deletedObjectExistsInObject = deletedObjects.some(deletedObjId =>
                        this._returnDeleteObjId(objectType, deletedObjId) === this._returnObjType(objectType, obj)
                    )
                    if (!deletedObjectExistsInObject) returnList.push(obj)
                })
            }
            if (!deletedObjectsExists) returnList.push(...object)// && objectType === "todo"

            //FIXME: adapt to code
            if (objectType === "tableItems" && returnList.length > 0) {

                for (let i = returnList.length - 1; i > -1; i--) {
                    const taskTodoIdInTodoToDeleteExists = deletedObjectParent.some(objId => objId === returnList[i].todoId)

                    //check against null values
                    if (Object.keys(returnList[i]).includes("todoId")) if (!returnList[i]?.todoId) returnList.splice(i, 1)

                    if (taskTodoIdInTodoToDeleteExists) returnList.splice(i, 1)
                }
            }
        }
    }

    _createTagsPayload(tagsToCreateFilteredArray, tagsToCreatePayloadArray) {
        //create tag payload
        if (tagsToCreateFilteredArray.length > 0) {
            tagsToCreateFilteredArray.forEach(tag => {
                //get tag from modelStatee    
                const modelTags = this._modelState.tags
                const tagModelIndex = modelTags.findIndex(modelTag => modelTag.id === tag.id)

                const tagBody = modelTags[tagModelIndex]
                tagsToCreatePayloadArray.ids.push(tagBody.id)

                //add formatted data to tags to create
                const formattedTagBody = formatTagRequestBody(tagBody, true, this._modelState.tagsColor)
                tagsToCreatePayloadArray["payload"].push(formattedTagBody)

            })
        }
        else this._diffState.tagsToCreate = []
    }

    _createTagToUpdatePayload(tagToUpdateFilteredArray, tagToCreateFilteredArray, tagToUpdatePayloadArray) {
        if (tagToUpdateFilteredArray.length > 0) {
            tagToUpdateFilteredArray.forEach(tag => {

                const tagToUpdateExistsInTagToCreate = tagToCreateFilteredArray.some(createTag => createTag.id === tag.id)

                if (!tagToUpdateExistsInTagToCreate) {
                    tagToUpdatePayloadArray.ids.push(tag.id)
                    tagToUpdatePayloadArray.payload.push(formatTagRequestBody(tag, true, this._modelState.tagsColor))
                }

                if (tagToUpdateExistsInTagToCreate) {
                    const tagIndex = tagToUpdateFilteredArray.findIndex(updateTag => updateTag.id === tag.id)
                    tagToUpdateFilteredArray.splice(tagIndex, 1)
                }
            })
        }
        else this._diffState.tagsToUpdate = []
    }


    _createTodoUpdatePayload(todoToUpdateDiffArray, todoToUpdateFilteredArray, todoToCreateFilteredArray, todoToUpdatePayloadArray) {

        //create todo to update payload
        if (todoToUpdateDiffArray.length > 0 && todoToUpdateFilteredArray.length > 0)
            todoToUpdateFilteredArray.forEach(todo => {
                const todoToUpdateExistsInTodoToCreate = todoToCreateFilteredArray.some(pendingTodo => pendingTodo.todoId === todo.todoId)

                if (!todoToUpdateExistsInTodoToCreate) {
                    todoToUpdatePayloadArray.payload.push(formatAPIRequestBody(todo, "todo", "update"))
                    todoToUpdatePayloadArray.ids.push(todo.todoId)
                }

                if (todoToUpdateExistsInTodoToCreate) {
                    //fallback for removing the object from the diffState if it already exists elsewhere
                    const todoIndex = todoToUpdateDiffArray.findIndex(updateTodo => updateTodo.todoId === todo.todoId)
                    if (todoIndex > -1) this._diffState.todoToUpdate.splice(todoIndex, 1)
                }
            })
        else {
            this._diffState.todoToUpdate = []
        }


    }

    _filterPendingTaskLinkedToAPITodo(tasksToCreateDiffArray, tasksToCreateFilteredArray, todoToCreateFilteredArray, pendingTaskLinkedToAPITodoArray) {
        //sort tasks which are not linked to todos to create
        if (tasksToCreateDiffArray.length > 0 && tasksToCreateFilteredArray.length > 0)
            tasksToCreateFilteredArray.forEach(task => {
                const pendingTaskTodoExistsInPendingTodos = todoToCreateFilteredArray.some(todo => todo.todoId === task.todoId)

                if (!pendingTaskTodoExistsInPendingTodos) pendingTaskLinkedToAPITodoArray.push(task)
            })

    }

    _createTaskLinkedToAPITodoBody(taskToCreateDiffArray, pendingTaskLinkedToAPITodoArray, taskToCreatePayloadArray) {

        //task not linked to todos to create payload body
        if (taskToCreateDiffArray.length > 0 && pendingTaskLinkedToAPITodoArray.length > 0)
            pendingTaskLinkedToAPITodoArray.forEach(task => {
                const taskBody = this._filterToGetTaskBody(task.taskId, task.todoId)

                if (taskBody) {
                    taskToCreatePayloadArray.ids.push({ taskId: task.taskId, todoId: task.todoId })

                    //add todoId to taskBody
                    taskBody.todoId = task.todoId
                    //remove id from task
                    delete taskBody.taskId
                    //add formatted data to tasks to create
                    taskToCreatePayloadArray.payload.push(formatAPIRequestBody(taskBody, "task", "create"))
                }
                if (!taskBody) {
                    //fallback for deleting the task from the diffState incase the task has already been deleted and passed through the filter
                    const taskIndex = this._diffState.taskToCreate.findIndex(createTask => createTask.taskId === task.taskId)
                    if (taskIndex > -1) this._diffState.taskToCreate.splice(taskIndex, 1)
                }
            })
        else {
            this._diffState.taskToCreate = []
        }

    }

    _createTaskToUpdateBody(taskToUpdateDiffArray, pendingTaskLinkedToAPITodoToUpdate, pendingTaskLinkedToAPITodo, taskToUpdatePayloadArray) {
        //sort tasks which are to be updated not in createPendingTaskLinkedToAPITodo Array
        if (taskToUpdateDiffArray.length > 0 && pendingTaskLinkedToAPITodoToUpdate.length > 0)
            pendingTaskLinkedToAPITodoToUpdate.forEach(task => {
                // const taskToUpdateExists
                const taskToUpdateExistsInTaskAPITodo = pendingTaskLinkedToAPITodo.some(APITodoTask => APITodoTask.taskId === task.taskId)

                if (!taskToUpdateExistsInTaskAPITodo) {
                    const taskBody = this._filterToGetTaskBody(task.taskId, task.todoId)
                    if (taskBody) {
                        taskToUpdatePayloadArray.ids.push({ taskId: task.taskId, todoId: task.todoId })

                        //add the time added to the taskBody
                        taskBody.todoLastAdded = task.todoLastAdded
                        //remove id from task
                        // delete taskBody.taskId
                        taskToUpdatePayloadArray.payload.push(formatAPIRequestBody(taskBody, "task", "update"))
                    }
                    if (!taskBody) {
                        //fallback for deleting objects from the diffState if they passed through the filter
                        const taskIndex = this._diffState.taskToUpdate.findIndex(updateTask => updateTask.taskId === task.taskId)
                        if (taskIndex > -1) this._diffState.taskToUpdate.splice(taskIndex, 1)

                    }
                }
            })
        else {
            this._diffState.taskToUpdate = [];
        }

    }

    _filterToGetTaskBody(taskId, todoId, clone = true) {
        //get todo from modelState
        const modelTodos = this._modelState.todo
        const todoModelIndex = this._modelState.todo.findIndex(modelTodo => modelTodo.todoId === todoId)
        const taskIndex = modelTodos[todoModelIndex].tasks.findIndex(modelTask => modelTask.taskId === taskId)
        if (!clone) return modelTodos[todoModelIndex]?.tasks[taskIndex]

        const taskBody = modelTodos[todoModelIndex]?.tasks[taskIndex]
        return taskBody ? cloneDeep(taskBody) : taskBody
    }

    _makeBatchRequest(requestURL, requestPayload, requestDiffArray, requestActionType, requestCallBack, requestType, requestCallBackParam = false) {
        const queryObj = {
            endpoint: requestURL,
            token: this._token.value,
            sec: 5,
            actionType: requestActionType,
            queryData: requestPayload,
            callBack: requestCallBack.bind(this),
            spinner: false,
            alert: false,
            type: requestType,
            callBackParam: requestCallBackParam
        }
        API.queryAPI(queryObj)
    }

    _wrapper(wrapperName, requestBody) {
        const wrapper = {}
        wrapper[wrapperName] = requestBody

        return wrapper

    }

    _batchRequestWrapper(requestBody, requestType) {
        if (requestType === "tags") {
            return this._wrapper("tags_list", requestBody)
        }
        if (requestType === "batch_update") {
            return this._wrapper("update_list", requestBody)
        }

        if (requestType === "batch_update_ordering") {
            return this._wrapper("ordering_list", requestBody)
        }

        if (requestType === "batch_create") {
            return this._wrapper("create_list", requestBody)
        }

        if (requestType === "batch_delete") {
            return this._wrapper("delete_list", requestBody)
        }
    }

    updateAndGetToken() {

    }

    _returnObjType(objType, obj) {
        if (objType === "tags") return obj.id
        if (objType === "task") return obj.taskId
    }

    _returnDeleteObjId(objType, deleteObj) {
        if (objType === "tags") return deleteObj
        if (objType === "task") return deleteObj.taskId
    }


    _generateMarkup() {
        return `
                <div class="sync-alert">
                    <div class="sync-msg">
                      Network Connectivity Issue Detected, its advisable to save data now to prevent data Loss If connectivity Still available
                    </div>
                    <div class="sync-btns">
                      <button class="btn-sync btn-sync-now bd-radius">Sync Now</button>
                      <button class="btn-sync btn-sync-later bd-radius">Sync Later</button>
                    </div>
                </div>
            `
    }

    _createLoader() {
        this._loader = new Loader(null, null, true)
    }

    _removeLoader() {
        if (this._loader) this._loader.remove()
        this._loader = null;
    }

    _removeNotifier() {
        const cls = this
        this._eventListeners.forEach(ev => this._component.removeEventListener(ev, cls._handleEvents))
        this._component.remove()
        this._syncNotifyActive = false;
    }

    remove() {
        this._removeNotifier()
        this._component = null
        delete this;
    }

}
export const importSyncLocalStorageToAPI = (() => new SyncLocalStorageToAPI());

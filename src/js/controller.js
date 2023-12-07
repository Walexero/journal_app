import * as model from "./model.js";
import { swapItemIndex, formatAPITableItems, formatAPIRequestUpdateTableItemPayload, formatAPISub, getAPICreatedTagFromModel, formatAPIRequestTagPayload, formatAPIResp, isoDate, createTableItemAPIRequestPayload, createNewTableFunc } from "./helpers.js";
import { LoginTemplate } from "./templates/loginTemplate.js"
import { JournalTemplate } from "./templates/journalTemplate.js"

import { importContentContainerListener } from "./listeners/contentContainerListener.js";
import { importTableComponentView } from "./views/tableComponentView.js";
import { importSideBarComponentView } from "./views/sidebarComponentView.js";
import { importJournalInfoComponentView } from "./views/journalInfoComponentView.js";
import { importComponentOptionsView } from "./views/componentView/componentOptionsView.js";
import { importTableBodyContainerListener } from "./listeners/tableBodyContainerListener.js";
import { componentGlobalState } from "./views/componentView/componentGlobalState.js";
import Login from "./views/loginView/login.js";
import "core-js/stable";
import { Loader } from "./components/loader.js";
import { DEFAULT_LOGIN_PAGE_TIMEOUT } from "./config.js";
import { API } from "./api.js";

let contentContainerListener;
let sidebarComponentView;
let tableComponentView;
let journalInfoComponentView;

const pass = () => { };

const controlGetJournalNameAndUsername = function () {
  return { journalName: model.state.name, username: model.state.username };
};

const controlAPIUpdateJournalInfoFallback = function (payload, returnData, requestState) {
  if (!requestState) {
    const key = Object.keys(payload)
    model.diff.journalInfoToUpdate[key] = payload[key]
    model.persistDiff()
  }

  if (requestState) {
    model.updateJournalInfo(payload);
  }
}

const controlUpdateJournalInfo = function (updateVal) {
  debugger
  const apiPayload = {
  }
  if (updateVal.name) apiPayload.journal_name = updateVal.name
  if (updateVal.description) apiPayload.journal_description = updateVal.description

  const queryObj = {
    endpoint: API.APIEnum.JOURNAL.PATCH(model.state.id),
    token: model.token.value,
    sec: null,
    queryData: apiPayload,
    actionType: "updateJournalInfo",
    spinner: false,
    alert: false,
    type: "PATCH",
    callBack: controlAPIUpdateJournalInfoFallback.bind(null, updateVal),
    callBackParam: true
  }
  API.queryAPI(queryObj)
};

const controlGetModel = function () {
  return model.state;
};

const controlAddSideBar = function () {
  sidebarComponentView.render(controlGetJournalNameAndUsername());
};

const controlAddJournalInfo = function () {
  journalInfoComponentView.render(controlGetModel());
};

const controlGetTableHeads = function () {
  return model.state.tables.map((table) => [table.tableTitle, table.id]);
};

const controlRenderUpdatedTableHeads = (tableId) => {
  let tableHeads;
  model.setCurrentTable(+tableId);

  const getTable = model.getCurrentTable(+tableId);
  const formatTable = [getTable.tableTitle, getTable.id];
  tableHeads = controlGetTableHeads();
  if (tableHeads.length > 4) {
    tableHeads = swapItemIndex(tableHeads, formatTable);
  }
  tableComponentView.render(tableHeads, getTable);
  tableComponentView.renderTableItem(getTable.tableItems);
};

const controlGetActiveTableFuncType = function (currentTable) {
  const funcType = { sort: false, filter: false }
  const tableFunc = controlGetPersistedTableFunc(currentTable.id)
  if (tableFunc) {
    const fnTypes = Object.keys(tableFunc)
    fnTypes.forEach(type => {
      const fn = tableFunc[type]
      const fnProps = Object.keys(fn).map(fnKey => fn[fnKey] ? true : false)
      fnActive = fnProps.find(prop => prop === true) ? true : false
      if (fnActive) funcType[type] = true
    })
    return funcType
  }
  return false
}

const controlSetCurrentTable = function (
  currentTable,
  tableToDisplayId = undefined
) {
  if (!tableToDisplayId) {
    model.setCurrentTable(currentTable);
    const table = model.getCurrentTable(currentTable);
    const activeFuncTypes = controlGetActiveTableFuncType(table)
    if (!activeFuncTypes)
      tableComponentView.renderTableItem(table.tableItems, null, null, true, null);
    if (activeFuncTypes)
      tableComponentView.renderTableItem(table.tableItems, null, null, true, activeFuncTypes);

  }

  //render to display currentTable
  if (tableToDisplayId) controlRenderUpdatedTableHeads(tableToDisplayId);
};

const controlPersistTableFunc = function (fnProps, fnType) {
  const tableId = fnProps.tableId
  const tableFnExists = model.tableFunc[tableId] ?? null
  if (!tableFnExists) createNewTableFunc(tableId, model.tableFunc)

  model.tableFunc[tableId][fnType] = fnProps;
  model.persistFunc()

  const apiPayload = {
    "journal_table_func": model.tableFunc
  }

  const queryObj = {
    endpoint: API.APIEnum.JOURNAL.PATCH(model.state.id),
    token: model.token.value,
    sec: null,
    queryData: apiPayload,
    actionType: "updateJournal",
    spinner: false,
    alert: false,
    type: "PATCH",
  }
  API.queryAPI(queryObj)
}

const controlGetPersistedTableFunc = function (tableId) {
  return model.tableFunc[tableId] ?? false
}

const controlRemovePersistedTableFunc = function (fnType) {
  const currentTable = model.getCurrentTable()
  model.tableFunc[currentTable.id][fnType] = {}
  model.persistFunc()

  const apiPayload = {
    "journal_table_func": model.tableFunc
  }

  const queryObj = {
    endpoint: API.APIEnum.JOURNAL.PATCH(model.state.id),
    token: model.token.value,
    sec: null,
    queryData: apiPayload,
    actionType: "updateJournal",
    spinner: false,
    alert: false,
    type: "PATCH",
  }
  API.queryAPI(queryObj)
}

const controlGetTable = function (tableId = undefined) {
  return model.getCurrentTable(tableId);
};

const controlAddTable = function () {
  //add the initial tags from the model
  tableComponentView.addTableTagMetaData(
    model.state.tags,
    model.state.tagsColor
  );
};

const controlRenameOptionFallback = function (payload, returnData, requestStatus) {
  debugger;
  if (!requestStatus) {
    const tableToUpdateExists = model.tableToUpdate.find(table => table.id === payload.journal)
    if (tableToUpdateExists && tableToUpdate !== -1) {
      tableToUpdateExists["tableName"] = payload.table_name
    }
    if (tableToUpdateExists === -1)
      model.tableToUpdate.push({ id: payload.journal, tableName: payload.table_name })
  }
  // if (requestStatus) { }
}

const controlRenameOption = function (...args) {
  const apiPayload = {
    "table_name": args[0],
    "journal": args[1]
  }
  const queryObj = {
    endpoint: API.APIEnum.JOURNAL_TABLES.PATCH(apiPayload.journal),
    token: model.token.value,
    sec: null,
    queryData: apiPayload,
    actionType: "updateTableName",
    spinner: false,
    alert: false,
    type: "PATCH",
    callBack: controlRenameOptionFallback.bind(null, apiPayload),
    callBackParam: true
  }
  API.queryAPI(queryObj)

  const updateTableName = model.updateTableName(...args);
};

const controlAPIDuplicateTableFallback = function (payload, returnData, requestStatus) {
  debugger;
  if (!requestStatus) {
    const duplicateTableId = model.duplicateJournal(payload.journal_table);
    model.tableToCreate.push(duplicateTableId)
    controlRenderUpdatedTableHeads(duplicateTableId);
  }
  if (requestStatus) {
    const formattedData = formatAPIResp(returnData, "journalTables")
    model.state.tables.push(formattedData)
    controlRenderUpdatedTableHeads(returnData.id);
  }
}

const controlDuplicateOption = function (tableId) {
  debugger;
  const apiPayload = {
    "journal_table": tableId,
    "journal": model.state.id,
    "duplicate": true
  }
  const queryObj = {
    endpoint: API.APIEnum.JOURNAL_TABLES.CREATE,
    token: model.token.value,
    sec: null,
    queryData: apiPayload,
    actionType: "duplicateTable",
    spinner: false,
    alert: false,
    type: "POST",
    callBack: controlAPIDuplicateTableFallback.bind(null, apiPayload),
    callBackParam: true
  }
  API.queryAPI(queryObj)
};

const controlAPIDeleteTableFallback = function (tableId, returnData, requestStatus) {
  if (!requestStatus) {
    model.tableToDelete.push(tableId)
  }
}

const controlDeleteOption = function (journalId) {
  const queryObj = {
    endpoint: API.APIEnum.JOURNAL_TABLES.DELETE(journalId),
    token: model.token.value,
    sec: null,
    actionType: "deleteTable",
    spinner: false,
    alert: false,
    type: "DELETE",
    callBack: controlAPIDeleteTableFallback.bind(null, journalId),
    callBackParam: true
  }
  API.queryAPI(queryObj)

  model.deleteJournal(journalId);
  const tableHeads = controlGetTableHeads();

  controlRenderUpdatedTableHeads(tableHeads[0][1]);
};

const controlAPIAddNewTableFallback = function (callBack, returnData, requestState) {
  let tableId;

  if (!requestState)
    tableId = model.addNewTable();


  if (requestState) {
    const formattedData = formatAPIResp(returnData, "journalTables")
    tableId = formattedData.id
    model.state.tables.push(formattedData)
  }

  const tableHeads = controlGetTableHeads();

  if (callBack) callBack()
  if (tableHeads.length <= 4) {
    const table = model.getCurrentTable(tableId);
    tableComponentView.render(tableHeads);
    tableComponentView.renderTableItem(table.tableItems);
  }

  if (tableHeads.length > 4) controlRenderUpdatedTableHeads(tableId);
}

const controlAddNewTable = function (callBack) {
  const apiPayload = {
    "journal": model.state.id
  }
  const queryObj = {
    endpoint: API.APIEnum.JOURNAL_TABLES.CREATE,
    token: model.token.value,
    sec: null,
    queryData: apiPayload,
    actionType: "createNewTable",
    spinner: false,
    alert: false,
    type: "POST",
    callBack: controlAPIAddNewTableFallback.bind(null, callBack)
  }
  API.queryAPI(queryObj)
};

const filterSortRenderTableItem = function (addTableItemParam, renderAddedItem = false, renderUpdatedItem = false) {//currentTable, filter, sort, itemId) {
  let tableItems;
  //returns the filtered tableItems using the filterMethod from the Component or returns all the tableItems for the current Table
  addTableItemParam.filter
    ? (tableItems = addTableItemParam.filter(addTableItemParam.currentTable.tableItems))
    : (tableItems = addTableItemParam.currentTable.tableItems);

  addTableItemParam.sort ? addTableItemParam.sort(tableItems) : pass();

  if (tableItems && !Array.isArray(tableItems)) tableItems = [tableItems];


  if (renderAddedItem)
    tableComponentView.updateTableItem(
      addTableItemParam.currentTable,
      tableItems,
      addTableItemParam.itemId,
      addTableItemParam.callBack
    );

  if (renderUpdatedItem)
    tableComponentView.renderTableItem(tableItems, addTableItemParam.filter)

  //free mem
  addTableItemParam = {}
}

const controlAddTableItemFallback = function (addTableItemParam, returnData, requestStatus = false) {
  debugger;
  const currentTable = model.getCurrentTable();

  if (!requestStatus) {
    const itemId = model.addTableItem(addTableItemParam.payload, addTableItemParam.relativeItem);
    model.diff.tableItemToCreate.push({ table: currentTable.id, item: itemId })
    model.persistDiff()
    addTableItemParam.currentTable = currentTable
    addTableItemParam.itemId = itemId

    //filter,sort and render the table items
    filterSortRenderTableItem(addTableItemParam, true)
  }
  if (requestStatus) {
    const formattedAPIResp = formatAPITableItems([returnData])
    const itemId = model.addTableItem(...formattedAPIResp, addTableItemParam.relativeItem, true);
    addTableItemParam.currentTable = currentTable
    addTableItemParam.itemId = itemId

    //filter,sort and render the table items
    filterSortRenderTableItem(addTableItemParam, true)
  }
}

const controlAPIAddTagFallback = function (callBack, returnData, requestState = false) {
  if (requestState) {
    debugger;
    const formattedData = formatAPISub(Array.isArray(returnData) ? returnData : [returnData], "apiTags")
    model.state.tags.push(...formattedData)
  }
  //TODO: add fallback handling for failure in creating tags
  callBack()

}

const controlAddTag = function (payload, callBack) {
  const queryObj = {
    endpoint: API.APIEnum.TAG.CREATE,
    token: model.token.value,
    sec: null,
    queryData: payload,
    actionType: "createTag",
    spinner: false,
    alert: false,
    type: "POST",
    callBack: controlAPIAddTagFallback.bind(null, callBack)
  }
  API.queryAPI(queryObj)
}

/**
 *
 * @param {*Object} payload - To add new Item to the curreentTable
 * @param {*Number } relativeItem  - If this controller is called from the Hover itemAdd create, it positions the createdItem relative to the Hovered Item
 * @param {*function} filter - The filter component uses this to filter  the rendered result for the table when the filter is Active
 */
const controlAddTableItem = function (
  payload = undefined,
  relativeItem = undefined,
  filter = false,
  sort = false,
  callBack = false,
) {
  const currentTableBeforeUpdate = model.getCurrentTable()
  const apiPayload = createTableItemAPIRequestPayload(currentTableBeforeUpdate, relativeItem)

  const queryObj = {
    endpoint: API.APIEnum.ACTIVITIES.CREATE,
    token: model.token.value,
    sec: null,
    queryData: apiPayload,
    actionType: "createTableItem",
    spinner: false,
    alert: false,
    type: "POST",
    callBack: controlAddTableItemFallback.bind(null, { payload, relativeItem, filter, sort, callBack }),
    callBackParam: true
  }

  API.queryAPI(queryObj)
};

const controlGetTableItem = function (
  tableId,
  itemId,
  position = undefined,
  tableLength
) {
  const table = model.getCurrentTable(tableId);
  const tableItem = model.getTableItem(table, itemId, position, tableLength);
  //returns an obj if position is supplied
  return tableItem;
};

const controlGetTableItemWithMaxTags = function (tableId, itemsId) {
  const table = model.getCurrentTable(tableId);
  const tableItemWithMaxTags = model.getTableItemWithMaxTags(table, itemsId);
  return tableItemWithMaxTags;
};

const controlUpdateTableItemFallback = function (addTableItemParam, returnData, requestStatus = false) {
  const currentTable = model.getCurrentTable();
  const batchItems = ["selectTags", "deleteActivities"]
  if (!requestStatus) {
    const subModels = ["intentions", "happenings", "actionItems", "gratefulFor"]
    model.updateTableItem(addTableItemParam.payload);
    const tableItems = ["tags", "title"]

    if (addTableItemParam.payloadType === subModels.find(sub => sub === addTableItemParam.payloadType)) {
      const updateAndCreate = addTableItemParam?.payload?.modelProperty?.property?.updateAndAddProperty
      const updateOnly = addTableItemParam?.payload?.modelProperty?.property?.updateProperty
      if (updateAndCreate) {
        //add the model to create
        model.diff.submodelToCreate.push({ subModel: addTableItemParam.payloadType, id: addTableItemParam.payload.createdItemId, date: isoDate() })

        //check against dups
        const subModelExists = model.diff.submodelToUpdate.find(subModel => subModel.id === addTableItemParam.payload.updatedItemId)
        if (subModelExists && subModelExists !== -1) { }

        if (!subModelExists || subModelExists === -1) {
          //add the submodel to the update obj
          model.diff.submodelToUpdate.push({ subModel: addTableItemParam.payloadType, id: addTableItemParam.payload.updatedItemId, date: isoDate() })
        }
      }
      if (!updateAndCreate && updateOnly) {
        //TODO: refactor
        //check against dups
        const subModelExists = model.diff.submodelToUpdate.find(subModel => subModel.id === addTableItemParam.payload.updatedItemId)
        if (subModelExists && subModelExists !== -1) { }

        if (!subModelExists || subModelExists === -1) {
          //add the submodel to the update obj
          model.diff.submodelToUpdate.push({ subModel: addTableItemParam.payloadType, id: addTableItemParam.payload.updatedItemId, date: isoDate() })
        }
      }
    }



    //TODO: switch save type payloadType to diff
    //tableItems
    if (addTableItemParam.payloadType === tableItems.find(item => item === addTableItemParam.payloadType)) {
      const itemExists = model.diff.tableItemToUpdate.find(itemObj => itemObj.itemId === addTableItemParam.itemId)
      if (itemExists && itemExists !== -1) { }
      if (!itemExists || itemExists === -1) {
        model.diff.tableItemToUpdate.push({ table: currentTable.id, item: addTableItemParam.itemId, date: isoDate() })
      }

    }
    model.persistDiff()
  }

  if (requestStatus) {
    //TODO: add fallback imp for batch actions

    const formattedData = formatAPITableItems(Array.isArray(returnData) ? returnData : [returnData])
    const batchTypes = addTableItemParam.payloadType === batchItems.find(item => item === addTableItemParam.payloadType)
    if (!batchTypes)
      model.updateAPITableItem(formattedData[0], true, currentTable.id)
    if (batchTypes) formattedData.forEach(data => model.replaceTableItemWithAPITableItem(data))

    console.log("state model", model.state)
  }
  //callback for the sidepeekinput
  if (addTableItemParam.payload.refreshCallBack) {
    addTableItemParam.payload.getUpdatedData ? addTableItemParam.payload.refreshCallBack(controlGetTableItem(addTableItemParam.payload.tableId, addTableItemParam.payload.itemId)) : addTableItemParam.payload.refreshCallBack()
  }

  addTableItemParam.currentTable = currentTable
  filterSortRenderTableItem(addTableItemParam, null, addTableItemParam.updateUI ? true : null)
  //free mem
  addTableItemParam = {}
}


const controlUpdateTableItem = function (
  payload,
  filter = undefined,
  sort = false,
  payloadType = undefined,
  updateUI = true
) {
  let tableItems;
  debugger
  console.log('the upd payload', payload)
  if (!payload) return
  let apiPayload = formatAPIRequestUpdateTableItemPayload(payload, payloadType)
  if (payloadType === "tags") apiPayload = { "tags": apiPayload }
  getAPICreatedTagFromModel(apiPayload, payload, model.state, payloadType)
  console.log("the api payload", apiPayload)
  const batchTypes = ["selectTags"]
  const batchAction = payloadType === batchTypes.find(type => type === payloadType)
  let queryObj;

  if (batchAction)
    queryObj = {
      endpoint: API.getBatchEndpoint(payloadType),
      token: model.token.value,
      sec: null,
      queryData: apiPayload,
      actionType: "batchAddTags",
      spinner: false,
      alert: false,
      type: "PATCH",
      callBack: controlUpdateTableItemFallback.bind(null, { payload, filter, sort, updateUI, payloadType }),
      callBackParam: true
    }

  if (!batchAction)
    queryObj = {
      endpoint: API.APIEnum.ACTIVITIES.PATCH(payload.itemId),
      token: model.token.value,
      sec: null,
      queryData: apiPayload,
      actionType: "updateTableItem",
      spinner: false,
      alert: false,
      type: "PATCH",
      callBack: controlUpdateTableItemFallback.bind(null, { payload, filter, sort, updateUI, payloadType }),
      callBackParam: true
    }
  // debugger;

  API.queryAPI(queryObj)
};

const controlUpdateTagFallback = function (payload, returnData, requestStatus) {
  debugger
  console.log(model.state.tags)
  if (!requestStatus) {
    model.checkForAndUpdateTag(payload)
    model.diff.tagsToUpdate.push(payload)
    model.persistDiff()
  }

  if (requestStatus) {
    //val updated from thee tagEdit comp
    const formattedData = formatAPIResp(returnData, "tags")
    model.checkForAndUpdateTag(formattedData)
  }
}

const controlUpdateTag = function (payload, payloadType) {
  const apiPayload = formatAPIRequestTagPayload(payload, payloadType)
  const queryObj = {
    endpoint: API.APIEnum.TAG.PATCH(payload.tag.id),
    token: model.token.value,
    sec: null,
    queryData: apiPayload,
    actionType: "updateTag",
    spinner: false,
    alert: false,
    type: "PATCH",
    callBack: controlUpdateTagFallback.bind(null, payload.tag)
  }
  API.queryAPI(queryObj)

}

const controlAPIDeleteTagFallback = function (tagId, returnData, requestStatus) {
  if (!requestStatus) {
    model.diff.tagToDelete.push(tagId)
    model.persistDiff()
  }
}

const controlDeleteTag = function (tagId) {
  const queryObj = {
    endpoint: API.APIEnum.TAG.DELETE(tagId),
    token: model.token.value,
    sec: null,
    actionType: "deleteTag",
    spinner: false,
    alert: false,
    type: "DELETE",
    callBack: controlAPIDeleteTagFallback.bind(null, tagId)
  }
  API.queryAPI(queryObj)

  model.deleteTag(tagId)
}

const controlDeleteTableItemFallback = function (deleteTableItemParam, returnData, requestStatus = false) {
  if (!requestStatus) {
    if (deleteTableItemParam.payloadType === "deleteTableItems") {
      model.tableItemToDelete.push(...deleteTableItemParam.payload.delete_list)
    } else {
      model.diff.submodelToDelete.push({ subModel: deleteTableItemParam.payloadType, id: deleteTableItemParam.payload[deleteTableItemParam.payloadType].delete.id })
    }
    model.persistDiff()
  }
  //free mem
  deleteTableItemParam = {}
}

const controlDeleteTableItem = function (
  payload,
  filter = undefined,
  payloadType = undefined,
  updateUI = true
) {
  debugger;
  let tableItems;
  if (!payload) return
  const batchType = ["deleteTableItems"] //(s)

  const apiPayload = formatAPIRequestUpdateTableItemPayload(payload, payloadType)
  const queryObj = {
    endpoint: payloadType === "deleteTableItems" ? API.getBatchEndpoint(payloadType) : API.getSubmodelEndpoint(payloadType, "DELETE", apiPayload[payloadType].delete.id),
    token: model.token.value,
    sec: null,
    actionType: "deleteTableItem",
    spinner: false,
    alert: false,
    type: "DELETE",
    callBack: controlDeleteTableItemFallback.bind(null, { payload: apiPayload, filter, payloadType }),
    callBackParam: true
  }
  if (payloadType === "deleteTableItems") queryObj["queryData"] = apiPayload
  API.queryAPI(queryObj)

  model.deleteTableItem(payload);
  const currentTable = model.getCurrentTable();

  filter
    ? (tableItems = filter(currentTable.tableItems))
    : (tableItems = currentTable.tableItems);

  if (tableItems && !Array.isArray(tableItems)) tableItems = [tableItems];

  //render current table
  updateUI ? tableComponentView.renderTableItem(tableItems) : pass();
};

const controlDuplicateTableItemFallback = function (duplicateTableItemParam, returnData, requestStatus = false) {
  if (!requestStatus) {

    const duplicates = model.duplicateTableItem(payload);
    duplicateTableItemParam.payload.duplicate_list[0].ids.forEach((duplicate, i) => {

      model.tableItemToDuplicate.push({ "originalId": duplicate, "duplicateId": duplicates[i].id })
    })
    model.persistDiff()
  }

  if (requestStatus) {
    const formattedData = formatAPITableItems(Array.isArray(returnData) ? returnData : [returnData])
    const currentTable = model.getCurrentTable()
    currentTable.tableItems.push(...formattedData)
    duplicateTableItemParam.currentTable = currentTable
    filterSortRenderTableItem(duplicateTableItemParam, null, duplicateTableItemParam.updateUI ? true : null)
  }
  //free mem
  duplicateTableItemParam = {}
}

const controlDuplicateTableItem = function (
  payload,
  filter = undefined,
  sort = undefined,
  updateUI = true) {
  const apiPayload = formatAPIRequestUpdateTableItemPayload(payload, "duplicateTableItems")
  const queryObj = {
    endpoint: API.APIEnum.ACTIVITIES.BATCH_DUPLICATE_ACTIVITIES,
    token: model.token.value,
    sec: null,
    queryData: apiPayload,
    actionType: "duplicateTableItems",
    spinner: true,
    alert: false,
    type: "POST",
    callBack: controlDuplicateTableItemFallback.bind(null, { apiPayload, filter, sort, updateUI }),
    callBackParam: true
  }

  API.queryAPI(queryObj)
};

const controlLogin = function (loginComponentCallBack, token) {
  const loader = new Loader(DEFAULT_LOGIN_PAGE_TIMEOUT)
  loader.component()

  //set model token
  model.token.value = token
  model.persistToken()

  //remove auth components
  loginComponentCallBack()

  //switch template
  init();
  loader.remove()
}

const controlAddTemplate = function (templateType) {
  if (templateType === "login") {
    document.body.classList.remove("journal-template")
    document.body.classList.add("login-template")
    document.body.innerHTML = LoginTemplate.template();
    // LoginTemplate.templateStyling();
    Login.addEventListeners(controlLogin)
  }

  if (templateType === "journal") {
    console.log("loading emp")
    document.body.innerHTML = ""
    document.body.classList.remove("login-template")
    document.body.classList.add("journal-template")
    document.body.innerHTML = JournalTemplate.template();
    JournalTemplate.templateStyling();
  }
}

const controlLoadUI = function () {

  const infoControllers = {
    controlGetJournalNameAndUsername,
    controlUpdateJournalInfo,
  };

  const tableControllers = {
    controlAddNewTable,
    controlGetTableHeads,
    controlGetTable,
    controlGetJournalNameAndUsername,
    controlSetCurrentTable,
    controlPersistTableFunc,
    controlGetPersistedTableFunc,
    controlRemovePersistedTableFunc,
  };

  const tableItemControllers = {
    controlAddTableItem,
    controlDeleteTableItem,
    controlUpdateTableItem,
    controlGetTableItem,
    controlGetTableItemWithMaxTags,
    controlDuplicateTableItem,
    controlAddTag,
    controlDeleteTag,
    controlUpdateTag
  };

  const optionControllers = {
    controlRenameOption,
    controlDuplicateOption,
    controlDeleteOption,
  };

  const componentControllers = {
    tableControllers,
    tableItemControllers,
    optionControllers,
  };

  const [tableHeads, currentTable] = [
    controlGetTableHeads(),
    model.getCurrentTable(),
  ];

  //create module objects
  importTableBodyContainerListener.object = importTableBodyContainerListener.import()

  contentContainerListener = importContentContainerListener.object = importContentContainerListener.import()

  journalInfoComponentView = importJournalInfoComponentView.object = importJournalInfoComponentView.import()

  //init the componentOptionsView
  importComponentOptionsView.object = importComponentOptionsView.import()

  sidebarComponentView = importSideBarComponentView.object = importSideBarComponentView.import();

  tableComponentView = importTableComponentView.object = importTableComponentView.import()

  contentContainerListener.init(journalInfoComponentView, tableComponentView)
  // contentContainerListener.activateListener();

  sidebarComponentView.init(controlAddSideBar, model.token.value);

  journalInfoComponentView.init(controlAddJournalInfo);

  tableComponentView.init(
    controlAddTable,
    controlSetCurrentTable,
    tableHeads,
    currentTable,
  );

  sidebarComponentView.addComponentHandlers(componentControllers);
  journalInfoComponentView.addComponentHandlers(infoControllers);
  tableComponentView.addComponentHandlers(componentControllers);

  //get and apply currentTable tableFunc
  const persistedFunc = controlGetActiveTableFuncType(currentTable)
  tableComponentView.addActiveTableFunc(persistedFunc)

  //componentGlobalState inherits all controller methods all components have
  componentGlobalState.eventHandlers = {
    infoControllers,
    tableControllers,
    tableItemControllers,
    optionControllers,
    componentControllers,
  };
}

const init = function (loadTemplate = true) {
  model.loadToken()
  if (model.token.value) {
    if (loadTemplate) {
      controlAddTemplate("journal")
      model.init(init)
    }

    if (!loadTemplate) controlLoadUI()

  }
  if (!model.token.value) controlAddTemplate("login")
};
init();

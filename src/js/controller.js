import * as model from "./model.js";
import { swapItemIndex, formatAPITableItems, formatAPIRequestUpdateTableItemPayload, formatAPISub, getAPICreatedTagFromModel } from "./helpers.js";
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

const controlGetJournalName = function () {
  return model.state.name;
};

const controlUpdateJournalInfo = function (updateVal) {
  model.updateJournalInfo(updateVal);
};

const controlGetModel = function () {
  return model.state;
};

const controlAddSideBar = function () {
  sidebarComponentView.render(controlGetJournalName());
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

const controlSetCurrentTable = function (
  currentTable,
  tableToDisplayId = undefined
) {
  if (!tableToDisplayId) {
    model.setCurrentTable(currentTable);
    const table = model.getCurrentTable(currentTable);
    tableComponentView.renderTableItem(table.tableItems);
  }

  //render to display currentTable
  if (tableToDisplayId) controlRenderUpdatedTableHeads(tableToDisplayId);
};

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

const controlRenameOption = function (...args) {
  const updateTableName = model.updateTableName(...args);
};

const controlDuplicateOption = function (tableId) {
  const duplicateTableId = model.duplicateJournal(tableId);

  controlRenderUpdatedTableHeads(duplicateTableId);
};

const controlDeleteOption = function (journalId) {
  model.deleteJournal(journalId);
  const tableHeads = controlGetTableHeads();

  controlRenderUpdatedTableHeads(tableHeads[0][1]);
};

const controlAddNewTable = function () {
  const tableId = model.addNewTable();
  const tableHeads = controlGetTableHeads();

  if (tableHeads.length <= 4) {
    const table = model.getCurrentTable(tableId);
    tableComponentView.render(tableHeads);
    tableComponentView.renderTableItem(table.tableItems);
  }

  if (tableHeads.length > 4) controlRenderUpdatedTableHeads(tableId);
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

const controlAPIAddTagFallback = function (returnData, requestState = false) {
  if (requestState) {
    const formattedData = formatAPISub(Array.isArray(returnData) ? returnData : [returnData], "tags")
    model.state.tags.push(...formattedData)
  }

}

const controlAddTag = function (payload) {
  const queryObj = {
    endpoint: API.APIEnum.TAG.CREATE,
    token: model.token.value,
    sec: null,
    queryData: payload,
    actionType: "createTag",
    spinner: false,
    alert: false,
    type: "POST",
    callBack: controlAPIAddTagFallback
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
  const apiPayload = {
    "name": "",
    "journal_table": currentTableBeforeUpdate.id,
  }
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
  debugger;
  const currentTable = model.getCurrentTable();
  if (!requestStatus) {
    model.updateTableItem(addTableItemParam.payload);
  }

  if (requestStatus) {
    const formattedData = formatAPITableItems(Array.isArray(returnData) ? returnData : [returnData])
    model.updateAPITableItem(formattedData[0], null, currentTable.id)
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
  //TODO: add payload typee to every interface that calls this func
  //FIXME: make sure the payload is updated to capture other payload types apart from title update
  const apiPayload = formatAPIRequestUpdateTableItemPayload(payload, payloadType)
  getAPICreatedTagFromModel(apiPayload, payload, model.state, payloadType)
  const queryObj = {
    endpoint: API.APIEnum.ACTIVITIES.PATCH(payload.itemId),
    token: model.token.value,
    sec: null,
    queryData: apiPayload,
    actionType: "updateTableItem",
    spinner: false,
    alert: false,
    type: "PATCH",
    callBack: controlUpdateTableItemFallback.bind(null, { payload, filter, sort, updateUI }),
    callBackParam: true
  }
  debugger;

  API.queryAPI(queryObj)
};

const controlDeleteTableItem = function (
  payload,
  filter = undefined,
  updateUI = true
) {
  let tableItems;
  model.deleteTableItem(payload);
  const currentTable = model.getCurrentTable();

  filter
    ? (tableItems = filter(currentTable.tableItems))
    : (tableItems = currentTable.tableItems);

  if (tableItems && !Array.isArray(tableItems)) tableItems = [tableItems];

  //render current table
  updateUI ? tableComponentView.renderTableItem(tableItems) : pass();
};

const controlDuplicateTableItem = function (payload, updateUI = true) {
  model.duplicateTableItem(payload);
  const currentTable = model.getCurrentTable();
  updateUI
    ? tableComponentView.renderTableItem(currentTable.tableItems)
    : pass();
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
    LoginTemplate.templateStyling();
    Login.addEventListeners(controlLogin)
  }

  if (templateType === "journal") {
    document.body.innerHTML = ""
    document.body.classList.remove("login-template")
    document.body.classList.add("journal-template")
    document.body.innerHTML = JournalTemplate.template();
    JournalTemplate.templateStyling();
  }
}

const controlLoadUI = function () {
  const infoControllers = {
    controlGetJournalName,
    controlUpdateJournalInfo,
  };

  const tableControllers = {
    controlAddNewTable,
    controlGetTableHeads,
    controlGetTable,
    controlGetJournalName,
    controlSetCurrentTable,
  };

  const tableItemControllers = {
    controlAddTableItem,
    controlDeleteTableItem,
    controlUpdateTableItem,
    controlGetTableItem,
    controlGetTableItemWithMaxTags,
    controlDuplicateTableItem,
    controlAddTag,
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

  sidebarComponentView.init(controlAddSideBar);

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

import * as model from "./model.js";
import { swapItemIndex } from "./helpers.js";
import contentContainerListener from "./listeners/contentContainerListener.js";
import tableComponentView from "./views/tableComponentView.js";
import sidebarComponentView from "./views/sidebarComponentView.js";
import journalInfoComponentView from "./views/journalInfoComponentView.js";
import { componentGlobalState } from "./views/componentView/componentGlobalState.js";
import "core-js/stable";

const pass = () => {};

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
  callBack = false
) {
  // debugger;
  let tableItems;
  const itemId = model.addTableItem(payload, relativeItem);
  const currentTable = model.getCurrentTable();

  //returns the filtered tableItems using the filterMethod from the Component or returns all the tableItems for the current Table
  filter
    ? (tableItems = filter(currentTable.tableItems))
    : (tableItems = currentTable.tableItems);

  sort ? sort(tableItems) : pass();

  if (tableItems && !Array.isArray(tableItems)) tableItems = [tableItems];

  tableComponentView.updateTableItem(
    currentTable,
    tableItems,
    itemId,
    callBack
  );
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

const controlUpdateTableItem = function (
  payload,
  filter = undefined,
  sort = false,
  updateUI = true
) {
  // debugger;
  let tableItems;
  // tableId,itemId,updateObj previous param
  model.updateTableItem(payload);
  const currentTable = model.getCurrentTable();

  filter
    ? (tableItems = filter(currentTable.tableItems))
    : (tableItems = currentTable.tableItems);

  sort ? sort(tableItems) : pass();

  if (tableItems && !Array.isArray(tableItems)) tableItems = [tableItems];
  //render current table
  updateUI ? tableComponentView.renderTableItem(tableItems, filter) : pass();
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

const init = function () {
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

  contentContainerListener.activateListener();

  sidebarComponentView.init(controlAddSideBar);

  journalInfoComponentView.init(controlAddJournalInfo);

  tableComponentView.init(
    controlAddTable,
    controlSetCurrentTable,
    tableHeads,
    currentTable
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
};
init();

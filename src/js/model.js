import { API } from "./api.js";
import {
  NEW_JOURNAL_NAME,
  TABLE_TAGS,
  TAGS_COLORS,
  DEFAULT_JOURNAL_DESC,
} from "./config.js";

import {
  getMaxDuplicateNum,
  occurences,
  createDuplicateName,
  formatUpdateObjTags,
  getUpdateTableItemTagId,
  stringToHash,
  dynamicArithmeticOperator,
  indexVal,
  formatAPIResp,
  formatAPITableItems,
  getCreatedTagFromModel,

} from "./helpers.js";

import cloneDeep from "../../node_modules/lodash-es/cloneDeep.js";

import { v4 as uuid4 } from "uuid";

export let state = {
  name: "",
  description: DEFAULT_JOURNAL_DESC,
  tables: [],
  tableHeads: [],
  tags: TABLE_TAGS.tags,
  tagsColor: TAGS_COLORS.colors,
};

export let diff = {
  tableItemToCreate: [],
  tableItemToUpdate: [],
  tableItemToDelete: [],
  tableItemToDuplicate: [],
  journalInfoToUpdate: [],
  tagToDelete: [],
  tagsToUpdate: [],
  tagsToCreate: [],
  submodelToCreate: [],
  submodelToUpdate: [],
  submodelToDelete: [],
  tableToUpdate: [],
  tableToCreate: [],
  tableToDuplicate: [],
  tableToDelete: [],
  diffActive: false
}

export let tableFunc = {
  // 1:{ //tableId
  // filter: {}, //filterTagList in the filter,table value
  // sort: {},

  // }

}

export let token = {}

const pass = () => { };

export const updateJournalInfo = (payload) => {
  if (payload?.name?.length >= 0) {
    state.name = payload.name;
  }
  if (payload?.description?.length >= 0) {
    state.description = payload.description;
  }
  persistData();
};

export const getCurrentTable = (tableId = undefined) => {
  //returns current table or tableId passed into it
  const currentTable = state.tables.find(
    (table) => table.id === tableId || table.id === state.currentTable
  );
  return currentTable;
};

export const setCurrentTable = (currentTable) => {
  state.currentTable = currentTable;
  persistData();
};

//deprc
const checkForAndAddNewTag = (updateObj) => {
  updateObj.forEach((obj) => {
    const objExistInTableTags = state.tags.find(
      (tag) => tag.text.toLowerCase() === obj.text.toLowerCase()
    );

    if (!objExistInTableTags) state.tags.push(obj);
  });
};

export const checkForAndUpdateTag = (payload) => {
  let tagToUpdate = state.tags.find(
    (tag) => tag.id === payload.id && tag.text.toLowerCase() === payload.text.toLowerCase()
  );

  //FIXME: make sure obj is replaced
  if (tagToUpdate) tagToUpdate = payload
}

const getItemFromTableItems = (table, item, index = false, convert = true) => {
  if (!index)
    return table.tableItems.find(
      (tableItem) => tableItem.id === (convert ? Number(item) : item)
    );

  if (index)
    return table.tableItems.findIndex(
      (tableItem) => tableItem.id === (convert ? Number(item) : item)
    );
};

const createTable = function (table, i = undefined, date = undefined) {
  const tableObj = {
    id: date
      ? Number(date) + Number(new Date().getMilliseconds() + (i ? i : 0))
      : Number(Date.now()),
    tableTitle: table,
    tableItems: [],
  };
  state.tables.push(tableObj);

  //set initial active table
  i === 0 ? (state.currentTable = tableObj.id) : pass();
  persistData();

  return tableObj.id;
};

const createTableItem = function (title = "", payload = undefined) {
  const itemTitle =
    payload?.action && payload.action !== "createEmpty"
      ? payload.itemTitle
      : title;
  const itemTags = payload?.itemTags ? payload.itemTags : [];
  const itemObj = {
    id: Date.now(),
    itemTitle: itemTitle,
    itemTags: itemTags,
    intentions: [{ id: uuid4(), text: "" }],
    happenings: [{ id: uuid4(), text: "" }],
    gratefulFor: [{ id: uuid4(), text: "" }],
    actionItems: [
      {
        id: uuid4(),
        text: "",
        checkbox: true,
        checked: false,
      },
    ],
  };

  persistData();
  return itemObj;
};

export const getTableItem = function (
  table,
  itemId,
  position = undefined,
  tableLength = false
) {
  if (!position && !tableLength)
    return table.tableItems.find((item) => {
      return item.id === itemId;
    });

  if (!position && tableLength) {
    const itemIdIndex = table.tableItems.findIndex((item) => {
      return item.id === itemId;
    });

    const positionNext = table.tableItems.length - itemIdIndex >= 2 ? 1 : 0;
    const positionPrev =
      table.tableItems.length - itemIdIndex < table.tableItems.length - 1
        ? -1
        : -2;
    const positionItemTwoLengthNext = !positionNext
      ? table.tableItems.length - itemIdIndex === 1
        ? 0
        : -1
      : null;
    const positionItemTwoLengthPrev =
      positionPrev === -2
        ? table.tableItems.length - itemIdIndex === table.tableItems.length - 1
          ? -1
          : 0
        : null;

    if (positionItemTwoLengthNext || positionItemTwoLengthPrev === -1) {
      //applies only when positionNext || positionPrev is null
      return {
        item: table.tableItems[itemIdIndex],
        position: positionItemTwoLengthNext || positionItemTwoLengthPrev,
      };
    }

    if (!positionNext && positionPrev === -2 && table.tableItems.length > 1)
      return { item: table.tableItems[itemIdIndex], position: null };

    if (!positionNext && positionPrev === -2 && table.tableItems.length === 1)
      return { item: table.tableItems[itemIdIndex], position: "only" };

    if (positionNext || positionPrev)
      return {
        item: table.tableItems[itemIdIndex],
        position: positionNext || positionPrev,
      };
  }
  if (position) {
    const itemIdIndex = table.tableItems.findIndex((item) => {
      return item.id === itemId;
    });

    const indexToReturn = indexVal(itemIdIndex, position);

    if (
      // positionalValues.some((val) => val === position) &&
      table.tableItems.length - (indexToReturn + 1) >= 1 &&
      table.tableItems.length - indexToReturn - 1 < table.tableItems.length - 1
    ) {
      return {
        item: dynamicArithmeticOperator(
          table.tableItems,
          itemIdIndex,
          position
        ),
        position: null,
      };
    }

    if (position === 1 && table.tableItems.length - (itemIdIndex + 1) > 1) {
      return { item: table.tableItems[itemIdIndex + 1], position };
    }

    if (position === 1 && table.tableItems.length - (itemIdIndex + 1) === 1) {
      return { item: table.tableItems[itemIdIndex + 1], position: 0 };
    }

    // if (
    //   position === -1 &&
    //   table.tableItems.length - (itemIdIndex - 1) < table.tableItems.length
    // ) {
    //   return { item: table.tableItems[itemIdIndex - 1], position };
    // }

    if (
      position === -1 &&
      table.tableItems.length - (itemIdIndex - 1) === table.tableItems.length
    ) {
      return { item: table.tableItems[itemIdIndex - 1], position: -2 };
    }
  }
};

export const getTableItemWithMaxTags = function (table, itemsId) {
  const filteredTableItems = [];

  itemsId.forEach((itemId) => {
    const item = table.tableItems.find((item) => item.id === Number(itemId));
    if (item) filteredTableItems.push(item);
  });

  return filteredTableItems.reduce(
    (acc, item) => (acc.itemTags.length > item.itemTags.length ? acc : item),
    filteredTableItems[0]
  );
};

export const updateTableName = function (...args) {
  const [formData, journalId] = args;
  const journalToUpdate = state.tables.find(
    (journal) => journal.id === journalId
  );
  journalToUpdate.tableTitle = formData;
  persistData();
};

export const duplicateJournal = function (journalId) {
  const TableToClone = state.tables.find((journal) => journal.id === journalId);
  const clone = cloneDeep(TableToClone);

  //update clone id
  clone.id = Number(Date.now());

  //get clone occurences
  // const occurrence = occurences(cloneTable);
  const [occurrence, duplicateNum] = [
    occurences(TableToClone.tableTitle, state),
    getMaxDuplicateNum(TableToClone.tableTitle, state),
  ];

  //construct clone name
  clone.tableTitle = createDuplicateName(
    occurrence > duplicateNum ? occurrence : duplicateNum,
    clone.tableTitle
  );

  state.tables.push(clone);

  persistData();

  return clone.id;
};

export const deleteJournal = function (journalId) {
  //delete journal data
  const tableToDelete = state.tables.findIndex(
    (journal) => journal.id === journalId
  );
  state.tables.splice(tableToDelete, 1);
  persistData();
};

export const addNewTable = function () {
  const occurrence = occurences(NEW_JOURNAL_NAME, state);

  const journalName = createDuplicateName(occurrence, NEW_JOURNAL_NAME);

  const createdTableId = createTable(journalName, undefined);
  persistData();
  return createdTableId;
};

export const addTableItem = function (payload, relativeItem = undefined, APIResp = false) {
  let tableItem
  const currentTable = getCurrentTable();
  if (!APIResp) tableItem = createTableItem("", payload);
  if (APIResp) tableItem = payload

  if (!relativeItem) currentTable.tableItems.push(tableItem);
  if (relativeItem) {
    const relativeItemIndex = getItemFromTableItems(
      currentTable,
      relativeItem,
      true
    );
    const insertIndex =
      relativeItemIndex - 1 === 0 || relativeItemIndex === 0
        ? relativeItemIndex + 1
        : relativeItemIndex + 1;
    currentTable.tableItems.splice(insertIndex, 0, tableItem);
  }
  persistData();
  return tableItem.id;
};

export const deleteTag = function (tagId) {
  const tagToDelete = state.tags.findIndex(
    (tag) => String(tag.id) === String(tagId)
  );
  state.tags.splice(tagToDelete, 1);
}

export const deleteTableItem = function (payload) {
  const tableToDeleteFrom = getCurrentTable(payload.tableId);

  if (payload?.items) {
    payload.items.forEach((item) => {
      const itemToDelete = getItemFromTableItems(tableToDeleteFrom, item, true);
      tableToDeleteFrom.tableItems.splice(itemToDelete, 1);
    });
  }

  //delete side peek addeed properties
  if (payload?.modelProperty) {
    const deleteVal = payload.modelProperty.property.delete;
    const itemToDeleteFrom = getItemFromTableItems(
      tableToDeleteFrom,
      payload.itemId,
      false,
      false
    );

    const itemIndex = itemToDeleteFrom[deleteVal.key].findIndex(
      (item) => item.id === deleteVal.propertyId
    );

    const itemGreaterThanOne = itemToDeleteFrom[deleteVal.key].length > 1;
    if (itemGreaterThanOne)
      itemToDeleteFrom[deleteVal.key].splice(itemIndex, 1);

    if (!itemGreaterThanOne)
      //clear the item value
      itemToDeleteFrom[deleteVal.key][itemIndex].text = "";
  }

  persistData();
};

export const createTagObject = function (payload) {
  //triggers only for fallback tag create
  //create temp id for tag
  payload.id = stringToHash(payload.tag_name)

  let formatFailedRequestPayload = formatAPIResp(payload, "apiTags")
  state.tags.push(formatFailedRequestPayload)
  formatFailedRequestPayload = {}
  persistData()
  return payload.id
}

export const updateAPITableItem = function (payload, api = true, tableId) {
  const updateSingleItem = payload?.id
  const updateMultipleItems = payload?.itemIds;
  const tableToUpdate = getCurrentTable(tableId ?? null);

  if (updateSingleItem) {
    //logic runs for single item update
    if (api) {
      //FIXME: make sure implementation doesn't contradict with any other interfacee implementation
      //replace value with api value
      const tableAPIItem = getItemFromTableItems(tableToUpdate, payload.id, true, true)
      tableToUpdate.tableItems.splice(tableAPIItem, 1)
      tableToUpdate.tableItems.splice(tableAPIItem, 0, payload)
      persistData()
      return
    }

    const itemToUpdate = getTableItem(tableToUpdate, payload.id);
    payload?.itemTitle ? (itemToUpdate.itemTitle = payload.itemTitle) : pass();

    payload?.itemTags ? (itemToUpdate.itemTags = payload.itemTags) : pass();

    //create new tag object if it doesn't exist in the tag table
    //TODO: use the createtagendpoint to update the journal tags or a fallback
    //TODO: implement prev logic with check against model update
    // payload.tags ? checkForAndAddNewTag(formattedTags) : pass();

    if (payload.modelProperty) {
      if (payload.modelProperty.property.update) {
        const updateValue = payload.modelProperty.property.update;
        const propertyToUpdate = itemToUpdate[updateValue.key].find(
          (propItem) => propItem.id === updateValue.propertyId
        );
        if (propertyToUpdate) {
          propertyToUpdate.text = updateValue.value;
          propertyToUpdate.checkbox
            ? (propertyToUpdate.checkbox =
              payload.modelProperty.checkedProperty.checkbox) &&
            (propertyToUpdate.checked =
              payload.modelProperty.checkedProperty.checked)
            : pass();
        }
      }

      if (payload.modelProperty.property.create) {
        const payloadValue = payload.modelProperty.property.create;
        const updateObj = {
          id: uuid4(),
          text: payloadValue.value,
        };

        const hasCheckbox = payload.modelProperty.checkedProperty.checkbox;

        hasCheckbox
          ? (updateObj.checkbox = true) && (updateObj.checked = false)
          : pass();

        if (payloadValue.relativeProperty) {
          const relativePropertyIndex = itemToUpdate[
            payload.modelProperty.property.key
          ].findIndex(
            (property) => property.id === payloadValue.relativeProperty
          );

          itemToUpdate[payload.modelProperty.property.key].splice(
            relativePropertyIndex + 1,
            0,
            updateObj
          );
        } else itemToUpdate[payload.modelProperty.property.key].push(updateObj);
      }

      if (payload.modelProperty.property.updateActionItem) {
        const updateValue = payload.modelProperty.property.updateActionItem;
        const propertyToUpdate = itemToUpdate[updateValue.key].find(
          (propItem) => propItem.id === updateValue.propertyId
        );
        propertyToUpdate.text = updateValue.value;
        propertyToUpdate.checked = updateValue.checked;
      }
    }
  }

  if (!updateSingleItem && updateMultipleItems) {
    const formattedTags = payload?.tags
      ? formatUpdateObjTags(payload?.tags)
      : pass();

    //create new tag object if it doesn't exist in the tag table
    payload?.tags ? checkForAndAddNewTag(formattedTags) : pass();

    const itemsToUpdate = payload.itemIds.map((item) =>
      getItemFromTableItems(tableToUpdate, Number(item))
    );
    itemsToUpdate.forEach((item) => (item.itemTags = [...formattedTags]));
  }

  persistData();
}

export const updateTableItem = function (payload) {
  const updateSingleItem = payload?.itemId;
  const updateMultipleItems = payload?.itemIds;
  const tableToUpdate = getCurrentTable(payload?.tableId);

  if (updateSingleItem) {
    //logic runs for single item update
    let itemToUpdate = getTableItem(tableToUpdate, payload.itemId);

    payload?.title ? (itemToUpdate.itemTitle = payload.title) : pass();

    //get the tags from the model state
    const getTagsId = payload?.tags
      ? getUpdateTableItemTagId(payload, state)
      : pass();

    //add the tag to the item to update
    getTagsId?.length > 0 ? (itemToUpdate.itemTags = getTagsId) : pass();

    if (payload.modelProperty) {
      if (payload.modelProperty.property.update) {
        const updateValue = payload.modelProperty.property.update;
        const propertyToUpdate = itemToUpdate[updateValue.key].find(
          (propItem) => propItem.id === updateValue.propertyId
        );
        //add the update item id to the payload
        payload.updatedItemId = updateValue.propertyId
        //FIXME: check against the updatedItem being null to add as create for the diff
        if (propertyToUpdate) {
          propertyToUpdate.text = updateValue.value;
          propertyToUpdate.checkbox
            ? (propertyToUpdate.checkbox =
              payload.modelProperty.checkedProperty.checkbox) &&
            (propertyToUpdate.checked =
              payload.modelProperty.checkedProperty.checked)
            : pass();
        }
      }

      if (payload.modelProperty.property.create) {
        const payloadValue = payload.modelProperty.property.create;
        const updateObj = {
          id: uuid4(),
          text: payloadValue.value,
        };
        //add the create submodel id to the payload for the diff
        payload.createdItemId = updateObj.id

        const hasCheckbox = payload.modelProperty.checkedProperty.checkbox;

        hasCheckbox
          ? (updateObj.checkbox = true) && (updateObj.checked = false)
          : pass();

        if (payloadValue.relativeProperty) {
          const relativePropertyIndex = itemToUpdate[
            payload.modelProperty.property.key
          ].findIndex(
            (property) => property.id === payloadValue.relativeProperty
          );

          itemToUpdate[payload.modelProperty.property.key].splice(
            relativePropertyIndex + 1,
            0,
            updateObj
          );
        } else itemToUpdate[payload.modelProperty.property.key].push(updateObj);
      }

      if (payload.modelProperty.property.updateActionItem) {
        const updateValue = payload.modelProperty.property.updateActionItem;
        const propertyToUpdate = itemToUpdate[updateValue.key].find(
          (propItem) => propItem.id === updateValue.propertyId
        );
        if (propertyToUpdate) {
          //TODO: make sure values are getting updated
          propertyToUpdate.text = updateValue.value;
          propertyToUpdate.checked = updateValue.checked;

        }
      }
    }
  }

  if (!updateSingleItem && updateMultipleItems) {
    const formattedTags = payload?.tags
      ? formatUpdateObjTags(payload?.tags)
      : pass();

    //create new tag object if it doesn't exist in the tag table
    payload?.tags ? checkForAndAddNewTag(formattedTags) : pass();

    const itemsToUpdate = payload.itemIds.map((item) =>
      getItemFromTableItems(tableToUpdate, Number(item))
    );
    itemsToUpdate.forEach((item) => (item.itemTags = [...formattedTags]));
  }

  persistData();
};

export const duplicateTableItem = function (payload) {
  const tableToDuplicateItem = getCurrentTable(payload.tableId);
  const duplicateCreateList = []
  payload.items.forEach((item) => {
    const itemToDuplicate = cloneDeep(
      getItemFromTableItems(tableToDuplicateItem, item)
    );

    itemToDuplicate.id = Date.now();
    //list to be returned to the controller
    duplicateCreateList.push(itemToDuplicate)

    tableToDuplicateItem.tableItems.push(itemToDuplicate);
  });

  persistData();
  return duplicateCreateList
};

const persistData = () => {
  localStorage.setItem("userJournal", JSON.stringify(state));
  console.log("saveed state", state)
};

export const persistToken = function () {
  localStorage.setItem("token", JSON.stringify(token))
}

export const persistDiff = () => {
  localStorage.setItem("diffState", JSON.stringify(diff));
  console.log("saveed diff", diff)
};

export const persistFunc = () => {
  localStorage.setItem("funcState", JSON.stringify(tableFunc));
  console.log("saveed func", tableFunc)
};

const getPersistedFunc = () => {
  const funcFromDb = localStorage.getItem("funcState");
  return JSON.parse(funcFromDb)
}

const getPersistedData = () => {
  const stateFromDb = localStorage.getItem("userJournal");
  return JSON.parse(stateFromDb);
};

const getPersistedDiffData = () => {
  const diffFromDb = localStorage.getItem("diffState");
  return JSON.parse(diffFromDb);
};


export const loadToken = () => {
  const storedToken = localStorage.getItem("token")
  if (storedToken) token = JSON.parse(storedToken)
}

export const replaceTableItemWithAPITableItem = function (tableItem) {
  const currentTable = getCurrentTable()
  const currentTableTableItemIndex = getItemFromTableItems(currentTable, tableItem.id, true)
  const formatAPITableItem = formatAPITableItems(tableItem, "activities")
  currentTable.tableItems.splice(currentTableTableItemIndex, 1)
  currentTable.tableItems.splice(currentTableTableItemIndex, 0, formatAPITableItem)

}

// const replace

const requestJournalTableCallback = function (callBack, journalTableAPIResp, requestState) {
  let tableItems = [];
  if (requestState) {
    journalTableAPIResp.forEach(tableItem => tableItems.push(formatAPIResp(tableItem, "journalTables")))
    //replace state data with api data
    replaceStateJournalDataWithAPIData(tableItems, "journalTables")

    //re-call the model init
    callBack()
  }

}

const replaceStateJournalDataWithAPIData = function (formattedAPIData, type) {
  if (type === "journal") {

    state.name = formattedAPIData.name
    state.description = formattedAPIData.description
    state.tableHeads = formattedAPIData.tableHeads
    state.currentTable = formattedAPIData.currentTable
    state.tags = formattedAPIData.tags
    state.id = formattedAPIData.id
    state.username = formattedAPIData.username

    tableFunc = formattedAPIData.tableFunc
  }

  if (type === "journalTables") {
    state.tables.splice(0, state.tables.length)
    state.tables.push(...formattedAPIData)
  }
}

const requestJournalTableData = function (callBack, journalAPIResp, requestState) {
  if (requestState) {
    const queryObjJournalActiveTable = {
      endpoint: API.APIEnum.JOURNAL_TABLES.LIST, //.GET(journalAPIResp[0].current_table),
      token: token.value,
      sec: null,
      actionType: "getActiveTable",
      // queryData
      spinner: true,
      alert: false,
      type: "GET",
      callBack: requestJournalTableCallback.bind(null, callBack),
      callBackParam: true
    }

    API.queryAPI(queryObjJournalActiveTable)

    const formattedJournalAPIResp = formatAPIResp(...journalAPIResp, "journal")

    //replace state data for journal
    replaceStateJournalDataWithAPIData(formattedJournalAPIResp, "journal")
  }
}

const requestJournalData = function (callBack) {
  const queryObjJournal = {
    endpoint: API.APIEnum.JOURNAL.LIST,
    token: token.value,
    sec: null,
    actionType: "getJournal",
    spinner: true,
    alert: true,
    type: "GET",
    callBack: requestJournalTableData.bind(null, callBack),
    callBackParam: true
  }
  API.queryAPI(queryObjJournal)
}

// const loadDataFromAPI = ()

export const init = function (sync, controllerInit = undefined, loadController = false) {
  // debugger
  if (!loadController) {

    if (sync) {
      const dataLoadedFromDb = getPersistedData();
      const diffLoadedData = getPersistedDiffData()


      //add diff state
      // const diffLocalState = diffLoadedData
      // diffLoadedData.diffActive = true
      if (!token.value) loadToken()

      //TODO: add prev against when local dt doesnt exist
      if (diffLoadedData && diffLoadedData?.diffActive) {
        //TODO: add check for diffactive state
        sync.addModelData(dataLoadedFromDb, diffLoadedData, diff, persistDiff, token)
        sync.startModelInit(init.bind(this, null,))
      }
      if (!diffLoadedData?.diffActive && dataLoadedFromDb || !dataLoadedFromDb) {
        //FIXME: do not replace the whole state object only the required parts cause of the tags and tagscolor val
        state = dataLoadedFromDb ?? state
        const initCallBack = init.bind(null, null, controllerInit, true)
        requestJournalData(initCallBack)
      };
    }

    if (!sync) {
      //create default tables
      const initCallBack = init.bind(null, controllerInit, true)
      requestJournalData(initCallBack)

      //create ids for tags
      state.tags.forEach((tag) => (tag.id = stringToHash(tag.text)));
    }
  }

  if (loadController) {
    //load the table persisted func
    const funcState = getPersistedFunc()
    if (funcState) tableFunc = funcState

    //load the UI
    controllerInit(false)
  }
};
// init();

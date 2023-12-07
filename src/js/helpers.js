import { LOCALE_TIME, TAG_TEXT_RENDER_LENGTH } from "./config.js";
import icons from "url:../icons.svg";
import { TAGS_COLORS } from "./config.js";

const pass = () => { };

export const capitalize = (value) => {
  return value.slice(0, 1).toUpperCase() + value.slice(1)
}

export const formatTagRenderedText = (tagText) => {
  if (tagText.length > TAG_TEXT_RENDER_LENGTH) return tagText.slice(0, TAG_TEXT_RENDER_LENGTH) + "..."
  return tagText
}

export const createNewTableFunc = (tableId, tableFuncModel) => {
  tableFuncModel[tableId] = {
    filter: {},
    sort: {}
  }
}

export const timeout = (sec, actionType, fn = undefined) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      const error = new Error(`Could not ${actionType} at this moment, Please try again later!`)
      reject(fn ? fn() && error : error)
    }, sec * 1000)
  })
}

export const timeoutWithoutPromise = (s, fn) => {
  setTimeout(() => fn(), s * 1000);
};

export const getMaxDuplicateNum = (val, state) => {
  let duplicateNums = [];

  state.tables.forEach((table) => {
    const tempTable = table.tableTitle.split("(");

    const occurenceExists =
      tempTable[0].trim() === val.split("(")[0].trim() &&
      tempTable[1]?.split(")")[0];

    //if the occurence number from the tables, push to dup array
    if (occurenceExists) {
      duplicateNums.push(occurenceExists);
    }
    if (!occurenceExists) duplicateNums.push(0);
  });
  const maxNum = duplicateNums.reduce(
    (acc, nums) => (acc > nums ? acc : nums),
    0
  );
  return maxNum;
};

export const selector = (identifier, nodeObj = undefined) => {
  if (nodeObj) return nodeObj.querySelector(identifier)

  if (!nodeObj) return document.querySelector(identifier)
};

export const matchStrategy = (e, className, evType = undefined) => {
  if (!evType)
    return e.target.classList.contains(className) || e.target.closest(`.${className}`)
  if (evType)
    return e.type === evType && e.target.classList.contains(className) || e.target.closest(`.${className}`)

};

export const occurences = (val, state) => {
  const occurrence = state.tables.reduce(
    (acc, table) =>
      table.tableTitle.split("(")[0].trim() === val.split("(")[0].trim()
        ? acc + 1
        : acc + 0,
    0
  );
  return occurrence;
};

export const createDuplicateName = (occurrence, duplicateName) =>
  `${duplicateName} (${+occurrence + 1})`;

export const dateTimeFormat = (date) => {
  const dateTimeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  };
  const formattedDate = new Intl.DateTimeFormat(
    LOCALE_TIME,
    dateTimeOptions
  ).format(date);
  return formattedDate.replace("at", ",");
};

export const formatUpdateObjTags = (tagsToFormat) => {
  const formattedTag = [];
  tagsToFormat.forEach((tags) => {
    const tagObj = {};
    tags.classList.forEach((tag) =>
      tag.startsWith("color") ? (tagObj.color = tag) : pass()
    );
    tagObj.text = tags.textContent.trim();
    formattedTag.push(tagObj);
  });

  return formattedTag;
};

export const formatTagRequestBody = (tagToCreate) => {
  let formattedTags;
  formattedTags = {
    "tag_name": tagToCreate.text,
    "tag_color": tagToCreate.tagColor.color,
    "tag_class": tagToCreate.tagColor.color_value
  }
  return formattedTags
}

export const stringToHash = (string) => {
  let hash = 0;

  if (string.length == 0) return hash;

  Array.from(string).forEach((str, i) => {
    const char = string.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  });

  return hash;
};

export const dynamicArithmeticOperator = (item, i, pos) => {
  return String(pos).includes("-") ? item[i - 1] : item[i + 1];
};

export const indexVal = (i, pos) => (String(pos).includes("-") ? i - 1 : i + 1);

export const valueEclipser = (value, len) => {
  if (value.length < len) return value;
  if (value.length === len) return value + "...";
  if (value.length > len) return value.slice(0, len) + "...";
};

export const swapItemIndex = (items, itemToAdd) => {
  items.splice(3, 0, itemToAdd);
  items.reverse();
  const valueIndex = items.findIndex((item) => item[1] === itemToAdd[1]);
  items.splice(valueIndex, 1);
  items.reverse();
  return items;
};

export const swapItemIndexInPlace = (items, itemToSwapId) => {
  const itemLength = items.length;
  if (itemLength > 4) {
    const itemToSwapIndex = items.findIndex((item) => item[1] === itemToSwapId);
    if (itemToSwapIndex > 3) {
      const itemToSwap = items.splice(itemToSwapIndex, 1)[0];
      items.splice(3, 0, itemToSwap);
    }
  }
  return items;
};

export const tableRowActivator = (currentTableId, itemId, i) => {
  if (!currentTableId & (i < 1)) return "table-row-active";

  if (currentTableId)
    return currentTableId && itemId === currentTableId
      ? "table-row-active"
      : "";
};

export const svgMarkup = (classList, fragId) => {
  return `
    <div class="svg-icon-box ${classList}">
      <svg class="svg-icon">
        <use href="${icons}#${fragId}"></use>
      </svg>
    </div>
  `;
};


export const delegateMatchTarget = (ev, className) => {
  //on selects based on thee classlist and not with closest
  if (ev.target.classList.contains(className)) return true
}

export const delegateMatch = (ev, className, optional = undefined) => {
  if (ev.target.classList.contains(className) || ev.target.closest(`.${className}`))
    return true

  if (optional && ev.target.nodeName.toLowerCase() === optional) return true;
}

export const delegateMatchId = (ev, id, optional = undefined) => {
  if (ev.target.id === id || ev.target.closest(`#${id}`)) return true
}

export const delegateMatchChild = (ev, className) => {
  if (ev.target.querySelector(`.${className}`)) return true
}

export const delegateConditional = (ev, className, optional = undefined) => {
  const condition = ev.key === "Escape" || ev.type === "click"
  if (condition) return delegateMatch(ev, className, optional)
}

export const formatAPISub = function (APIResp, type) {
  let formatList = [];
  if (APIResp.length > 1 || APIResp.length === 1) {
    APIResp.forEach(resp => formatList.push(formatAPIResp(resp, type)))
    return formatList
  }
  return APIResp
}

export const formatTagPayload = function (APIResp, type) {
  let formatList = []
  if (APIResp.length > 1 || APIResp.length === 1) {
    APIResp.forEach(resp => formatList.push(+resp.dataset.id))
    return formatList
  }
  return APIResp

}

export const formatAPIRequestTagPayload = function (payload, type) {
  let formattedRequest;
  if (type === "tagsValue") {
    formattedRequest = {
      "tag_class": payload.tag.color,
      "tag_name": payload.tag.text,
      "tag_color": TAGS_COLORS.colors.find(color => color.color_value == payload.tag.color).color,

    }
  }
  return formattedRequest
}

export const formatAPITableItems = function (APIResp, type) {
  let formattedData = [];
  if (APIResp.length > 0) {
    APIResp.forEach(resp => {
      let formatAPITableItem = {
        "id": resp.id,
        "itemTitle": resp.name,
        "itemTags": formatAPISub(resp.tags, "tags"),
        "actionItems": formatAPISub(resp.action_items, "actionItems"),
        "intentions": formatAPISub(resp.intentions, "intentions"),
        "happenings": formatAPISub(resp.happenings, "happenings"),
        "gratefulFor": formatAPISub(resp.grateful_for, "gratefulFor"),
        "created": Date.now(resp.created)
      }
      formattedData.push(formatAPITableItem)
    })
    return formattedData
  }
  if (!APIResp.length > 0) return APIResp
}

export const formatAPIResp = function (APIResp, type) {
  let formattedData;
  console.log("APIResp before form", APIResp)
  if (type === "journal") {
    formattedData = {
      "id": APIResp.id,
      "name": APIResp.journal_name,
      "description": APIResp.journal_description,
      "tableHeads": APIResp.journal_tables,
      "currentTable": APIResp.current_table,
      "tags": formatAPISub(APIResp.tags, "apiTags"),
      "tableFunc": APIResp.journal_table_func,
      "username": APIResp.username
    }
  }

  if (type === "apiTags") {
    formattedData = {
      "id": APIResp.id,
      "text": APIResp.tag_name,
      "color": APIResp.tag_class
    }
  }

  if (type === "journalTables") {
    formattedData = {
      "id": APIResp.id,
      "tableTitle": APIResp.table_name,
      "tableItems": formatAPITableItems(APIResp.activities, "activities"),
    }
  }

  if (type === "actionItems") {
    formattedData = {
      "id": APIResp.id,
      "text": APIResp.action_item,
      "checkbox": true,
      "checked": APIResp.checked
    }
  }

  if (type === "intentions") {
    formattedData = {
      "id": APIResp.id,
      "text": APIResp.intention
    }
  }

  if (type === "happenings") {
    formattedData = {
      "id": APIResp.id,
      "text": APIResp.happening
    }
  }

  if (type === "gratefulFor") {
    formattedData = {
      "id": APIResp.id,
      "text": APIResp.grateful_for
    }
  }

  if (type === "tags") {
    formattedData = APIResp.id
  }

  return formattedData
}

const getSubModelField = (submodel) => {
  if (submodel !== "grateful_for")
    return submodel.slice(0, submodel.length - 1)
  return submodel
}

const createSubModelPayload = function (payload, submodel) {
  let formattedRequest = {}
  const subModelField = getSubModelField(submodel)

  //submodel value
  formattedRequest[submodel] = {
    activity: payload.itemId,
    update_and_create: payload?.modelProperty?.property?.updateAndAddProperty,
    update_only: payload?.modelProperty?.updateProperty,
    type: submodel,
    delete_only: payload?.modelProperty?.property?.delete ? true : false
  }

  //add update value
  payload?.modelProperty?.property?.update ? formattedRequest[submodel].update = {
    id: payload?.modelProperty?.property?.update?.propertyId.length > 0 ? Number(payload?.modelProperty?.property?.update?.propertyId) : null
  } : null

  //add subfield value
  if (formattedRequest[submodel].update)
    formattedRequest[submodel].update[subModelField] = payload?.modelProperty?.property?.update?.value ?? null

  //add create value
  payload?.modelProperty?.property?.create ? formattedRequest[submodel].create = {
    relative_item: payload?.modelProperty?.property?.create?.relativeProperty,
    ordering: payload?.modelProperty?.property?.create?.ordering,
  } : formattedRequest[submodel].create = null

  if (formattedRequest[submodel]?.create) {
    formattedRequest[submodel].create[subModelField] = payload?.modelProperty?.property?.create?.value
  }

  //add ordering list value
  if (payload?.modelProperty?.property?.orderingList)
    formattedRequest[submodel].ordering_list = payload.modelProperty.property.orderingList

  //add action item checkbox
  if (payload?.modelProperty?.property?.updateActionItem) {
    formattedRequest[submodel].update_action_item_checked = {
      checked: payload?.modelProperty.property.updateActionItem.checked,
      key: payload?.modelProperty.property.updateActionItem.key,
      id: Number(payload?.modelProperty.property.updateActionItem.propertyId),
      update_checked: true,
      type: "action_items"
    }
  }

  if (payload?.modelProperty?.property?.delete) {
    formattedRequest[submodel].delete = {
      id: payload.modelProperty.property.delete.propertyId,
    }
  }

  return formattedRequest
}

const getIdsFromTagsDiv = (tags) => {
  const tagsWithId = tags.map(tag => tag?.dataset?.id ? +tag.dataset.id : pass()).filter(tag => tag)
  return tagsWithId
}

export const formatAPIRequestUpdateTableItemPayload = function (payload, type) {
  let formattedRequest;
  if (type === "title") {
    formattedRequest = {
      "name": payload?.title ?? "",
    }
  }

  if (type === "tags") {

    formattedRequest = getIdsFromTagsDiv(payload.tags)
  }

  if (type === "selectTags") {
    formattedRequest = {
      "activities_list": [{
        "ids": payload.itemIds.map(id => +id),
        "tags": getIdsFromTagsDiv(payload.tags)
      }
      ]
    }
  }

  if (type === "deleteTableItems") {
    formattedRequest = {
      "delete_list": payload.items.map(id => +id)
    }
  }

  if (type === "duplicateTableItems") {
    formattedRequest = {
      "duplicate_list": [{ "ids": payload.items.map(id => +id) }]
    }
  }

  if (type === "intentions")
    formattedRequest = createSubModelPayload(payload, "intentions")

  if (type === "happenings")
    formattedRequest = createSubModelPayload(payload, "happenings")

  if (type === "actionItems")
    formattedRequest = createSubModelPayload(payload, "action_items")

  if (type === "gratefulFor")
    formattedRequest = createSubModelPayload(payload, "grateful_for")

  return formattedRequest
}

export const getAPICreatedTagFromModel = function (apiPayload, payload, state, type) {
  if (type === "tags") {
    const tagsWithoutId = payload.tags.map(tag => tag.dataset?.id === "undefined" ? tag : pass()).filter(tag => tag)
    tagsWithoutId.forEach(tagObj => {
      const objExistInTableTags = state.tags.find(
        (tag) => tag.text.toLowerCase() === tagObj.textContent.replaceAll("\n", "").trim().toLowerCase()
      );
      if (objExistInTableTags) apiPayload.tags.push(objExistInTableTags.id)
    })
  }
}

export const isoDate = function () {
  return new Date(Date.now()).toISOString()
}

export const tableItemOrdering = function (createRelativeProperty) {
  let incrementOrderingIndex = false
  let createItemOrdering = null
  const itemsOrdering = Array.from(document.querySelectorAll(`.row-actions-handler-container`)).map((item, i) => {
    if (createRelativeProperty && Number(item.dataset.id) === createRelativeProperty) {
      incrementOrderingIndex = true
      createItemOrdering = i + 2
      return { id: Number(item.dataset.id), ordering: i + 1 }
    }
    return { id: Number(item.dataset.id), ordering: incrementOrderingIndex ? i + 2 : i + 1 }
  })

  return { create_item_ordering: createItemOrdering, table_items_ordering: itemsOrdering }
}

export const createTableItemAPIRequestPayload = function (currentTable, relativeItem = false) {
  debugger;
  const payload = {
    "name": "",
    "journal_table": currentTable.id
  }
  if (relativeItem) payload["ordering_list"] = tableItemOrdering(relativeItem)
  return payload
}

export const formatJournalHeadingName = (username) => {
  return `${username.slice(0, 1).toUpperCase() + username.slice(1)}'s Journal`
}
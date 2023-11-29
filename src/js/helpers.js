import { LOCALE_TIME } from "./config.js";
import icons from "url:../icons.svg";
import { TAGS_COLORS } from "./config.js";

const pass = () => { };

// export const timeout = function (s, fn, param = undefined) {
//   return new Promise(function (resolve) {
//     setTimeout(function () {
//       // console.log(fn);

//       //condition to resolve on
//       param ? resolve(fn(param), s * 1000) : resolve(fn(), s * 1000);
//     });
//   });
// };

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
}

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
  debugger;
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
        "gratefulFor": formatAPISub(resp.grateful_for, "gratefulFor")
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
      "tags": formatAPISub(APIResp.tags, "tags")
    }
  }

  if (type === "tags") {
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
    formattedData = {
      "id": APIResp.id,
      "color": APIResp.tag_class,
      "text": APIResp.tag_name,
      // "color_value": APIResp.tag_class
    }
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
  console.log("the submodele fields", subModelField)
  //submodel value
  formattedRequest[submodel] = {
    activity: payload.itemId,
    // update: {
    //   id: payload?.modelProperty?.property?.update?.propertyId.length > 0 ? Number(payload?.modelProperty?.property?.update?.propertyId) : null
    // },
    update_and_create: payload?.modelProperty?.property?.updateAndAddProperty,
    update_only: payload?.modelProperty?.updateProperty,
    type: submodel
  }

  //add update value
  payload?.modelProperty.property.update ? formattedRequest[submodel].update = {
    id: payload?.modelProperty?.property?.update?.propertyId.length > 0 ? Number(payload?.modelProperty?.property?.update?.propertyId) : null
  } : null

  //add subfield value
  formattedRequest[submodel].update[subModelField] = payload?.modelProperty?.property?.update?.value //FIXME: check for edgecase for the conditional

  //add create value
  payload?.modelProperty.property.create ? formattedRequest[submodel].create = {
    relative_item: payload?.modelProperty?.property?.create?.relativeProperty,
    ordering: payload?.modelProperty?.property?.create?.ordering,
  } : formattedRequest[submodel].create = null

  if (formattedRequest[submodel].create) {
    formattedRequest[submodel].create[subModelField] = payload?.modelProperty?.property?.create?.value


  }

  //add ordering list value
  if (payload?.modelProperty?.property?.orderingList)
    formattedRequest[submodel].ordering_list = payload.modelProperty.property.orderingList



  //add action item checkbox
  if (payload?.modelProperty.property.updateActionItem) {
    formattedRequest[submodel].update_action_item_checked = {
      checked: payload?.modelProperty.property.updateActionItem.checked,
      key: payload?.modelProperty.property.updateActionItem.key,
      id: Number(payload?.modelProperty.property.updateActionItem.propertyId),
      update_checked: true,
      type: "action_items"
      //TODO: decide to add the field value
    }

  }

  return formattedRequest
}


export const formatAPIRequestUpdateTableItemPayload = function (payload, type) {
  let formattedRequest;
  if (type === "title") {
    formattedRequest = {
      "name": payload?.title ?? "",
      // "journal_table": currentTableId
    }
  }

  if (type === "tags") {
    const tagsWithId = payload.tags.map(tag => tag?.dataset?.id ? +tag.dataset.id : pass()).filter(tag => tag)
    formattedRequest = {
      tags: tagsWithId//formatTagPayload(tagsWithId, type)
    }
  }

  if (type === "intentions")
    formattedRequest = createSubModelPayload(payload, "intentions")

  if (type === "happenings")
    formattedRequest = createSubModelPayload(payload, "happenings")

  if (type === "actionItems") //TODO: add checkbox data
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
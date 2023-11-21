import { LOCALE_TIME } from "./config.js";
import icons from "url:../icons.svg";

const pass = () => { };

export const timeout = function (s, fn, param = undefined) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log(fn);

      //condition to resolve on
      param ? resolve(fn(param), s * 1000) : resolve(fn(), s * 1000);
    });
  });
};

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
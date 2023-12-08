export const BASE_API_URL = "http://0.0.0.0:9008/api/"
const subModelEndpoints = ["grateful-for", "happenings", "action-items", "intentions"];
export const USER = "Strapchay Proj";
export const DEFAULT_JOURNAL_DESC = `
Document your life - daily happenings, special occasions,
and reflections on your goals. Categorize entries with
tags and automatically capture the date.
<br />
<br />
↓ Click through the different database tabs to filter
entries by a specific category such as daily or personal.
`;
export const HEADER_TITLE_LENGTH = 24
export const TABLE_VIEW_OPTION_REPLACE_TABLE_OPTION = "(max-width: 1008px)"
export const LAYOUT_BREAKPOINT = "(max-width: 1008px)"
export const SIDEBAR_JOURNAL_TITLE_LENGTH = 14
export const NEW_JOURNAL_NAME = "Table";
export const TABLE_HEAD_LIMIT = 4;
export const TABLE_BODY_LOAD_AFTER = 1; //seconds
export const TABLE_NOT_FOUND_RESPONSE = "No result";
export const LOCALE_TIME = "en-US";
export const NOTIFICATION_CONF_MSG = "This select option already exists.";
export const NOTIFICATION_DELETE_MSG =
  "Are you sure you want to remove this option?";
export const COPY_ALERT = "Copied property to Clipboard";
export const TABLE_ROW_PLACEHOLDER = "Empty. Click to add a row.";
export const TABLE_ROW_FILTER_PLACEHOLDER =
  "No filter results. Click to add a row.";
export const JOURNAL_HEADING_NAME_LENGTH = 15

export const TABLE_DEFAULT_JOURNALS = [
  "All entries",
  "Daily entries",
  "Personal entries",
];

export const FILTER_RULE_CONTAINER_TOP_DIFF = 225;

export const TABLE_ACTION_OPTIONS = {
  properties: [
    {
      text: "Filter",
      icon: "filter",
      class: "table-filter"

    },
    {
      text: "Sort",
      icon: "sort",
      class: "table-sort"
    },
    {
      text: "New",
      icon: "plus",
      class: "table-button-content"
    }
  ]
}

export const TABLE_PROPERTIES = {
  properties: [
    {
      text: "Name",
      icon: "alphabet-icon",
    },
    {
      text: "Created",
      icon: "clock",
    },
    {
      text: "Tags",
      icon: "list-icon",
    },
  ],
};

export const TABLE_TAGS = {
  tags: [
    {
      text: "Daily",
      color: "color-gray",
    },
    {
      text: "Personal",
      color: "color-green",
    },
    {
      text: "Urgent",
      color: "color-red",
    },
    {
      text: "Work",
      color: "color-army-green",
    },
  ],
};

export const TAGS_COLORS = {
  colors: [
    {
      color: "Off Gray",
      color_value: "color-gray",
    },
    {
      color: "Midnight Green",
      color_value: "color-green",
    },
    {
      color: "Wine Red",
      color_value: "color-red",
    },
    {
      color: "Army Green",
      color_value: "color-army-green",
    },
    {
      color: "Yellow",
      color_value: "color-yellow",
    },
    {
      color: "Light Blue",
      color_value: "color-blue",
    },
    {
      color: "Peach",
      color_value: "color-peach",
    },
    {
      color: "Teal",
      color_value: "color-teal",
    },
    {
      color: "Deep Purple",
      color_value: "color-purple",
    },
    {
      color: "Brown",
      color_value: "color-brown",
    },
  ],
};

export const PREPOSITIONS = [
  {
    condition: "Is not",
    name: true,
    tags: false,
  },
  {
    condition: "Is",
    name: true,
    tags: false,
  },
  {
    condition: "Contains",
    name: true,
    tags: true,
  },
  {
    condition: "Does not contain",
    name: true,
    tags: true,
  },
  {
    condition: "Starts with",
    name: true,
    tags: false,
  },
  {
    condition: "Ends with",
    name: true,
    tags: false,
  },
  {
    condition: "Is empty",
    name: true,
    tags: true,
  },
  {
    condition: "Is not empty",
    name: true,
    tags: true,
  },
];

export const TABLE_SORT_TYPE = [
  {
    text: "Ascending",
    icon: "ascend-icon",
  },
  { text: "Descending", icon: "descend-icon" },
];

export const TAG_TEXT_RENDER_LENGTH = 36;
export const DEFAULT_ALERT_TIMEOUT = 10;
export const DEFAULT_LOGIN_PAGE_TIMEOUT = 5;
export const DEFAULT_REQUEST_TIMEOUT = 5;
export const PASSWORD_NOT_MATCH_ERROR = "Passwords Do Not Match"
export const INVALID_NAME_FORMAT = "Space not Expected in Name Field"
export const INVALID_USERNAME_FORMAT = "Space not Expected in Username Field"
export const HTTP_204_SUCCESS_NO_CONTENT = 204
export const ALERT_STATUS_ERRORS = [400, 401, 404]
export const HTTP_400_RESPONSE_LOGIN_USER = "Email or Password Incorrect";
export const HTTP_400_RESPONSE_CREATE_USER = "Invalid Data Supplied";
export const HTTP_200_RESPONSE = {
  "login": ((placeholder) => "Authentication Successful"), "create": ((placeholder) => "Account Created Successfully"), "loadTodos": ((placeholder) => "Data Loading Completed"), "updatePwd": ((placeholder) => "Password Changed Successfully"), "updateInfo": ((placeholder) => "User Info Updated Successfully"),
  "resetPwd": ((APIResp) => `${APIResp}\n Please fill in the form with the email details`),
  "resetConfirmPwd": ((APIResp) => APIResp),
  "getJournal": ((APIResp) => "Loading completed"),
  "getActiveTable": ((APIResp) => APIResp),
}
export const PREVENT_DESTRUCTURING_FROM_API_ENDPOINT_RESP = ["create", "getJournal", "getActiveTable", "createTableItem", "updateTableItem", "createTag", "deleteTag", "updateTag", "deleteTableItem", "batchAddTags", "batchDeleteActivities", "duplicateTableItems", "updateTableName", "deleteTable", "duplicateTable", "createNewTable", "updateJournal", "updateJournalInfo", "updateInfo", "updatePwd"]
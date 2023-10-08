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

export const TABLE_DEFAULT_JOURNALS = [
  "All entries",
  "Daily entries",
  "Personal entries",
];

export const FILTER_RULE_CONTAINER_TOP_DIFF = 225;

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
      color: "Off gray",
      color_value: "color-gray",
    },
    {
      color: "Midnight green",
      color_value: "color-green",
    },
    {
      color: "Wine red",
      color_value: "color-red",
    },
    {
      color: "Army green",
      color_value: "color-army-green",
    },
    {
      color: "Yellow",
      color_value: "color-yellow",
    },
    {
      color: "Light blue",
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

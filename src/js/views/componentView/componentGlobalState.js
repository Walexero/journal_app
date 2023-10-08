// import containerSidePeekComponentView from "../containerSidePeekComponentView";
//Controls passing state between different components if

export const componentGlobalState = {};

//Methods
/*
tagItemMarkupFactory : generates tagItem markups
tagItemFactory
filterTagList: holds a list of current tags that are being filtered
tagItemFactory: generates a tagItem object and Its markup which can be gotten from using the tagItemMarkupFactory
conditional: holds the conditional for the current filter applied at a table
filterMethod: method for filtering the tableItems and holds the most recent filter
sortMethod: method for sorting the tableItems and holds the most recent sorter
renderTableItem: method for rerendering the table items, clone of tableComponent method
*/

//State Holder
/*
filterTagOptionActive: notifies other component that the filter is using the tag option
sideBarListActive: notifies tableActionProcess if sideBarList is active to update Tables
hoverEl: holds the hoverEl on eventListener Instantiation
eventHandlers: holds access to all controller methods available to all components
 */

//returns a containerSidePeekComponentObj to instantiate a side peek
componentGlobalState.containerSidePeekComponentObj = (
  itemId,
  itemData = undefined,
  position = undefined
) => {
  const currentTable = document.querySelector(".table-row-active");

  const callUpdateItemHandler =
    componentGlobalState.eventHandlers.tableItemControllers
      .controlUpdateTableItem;

  const getItemData =
    itemData ??
    componentGlobalState.eventHandlers.tableItemControllers.controlGetTableItem(
      +currentTable.dataset.id,
      +itemId
    );

  const updateObj = {
    tableId: +currentTable.dataset.id,
    itemId: +itemId,
  };

  const componentObj = {
    itemData: getItemData,
    position,
    insertPosition: "beforeend",
    container: ".container",
    componentContainer: ".content-container .row",
    selector: ".container-slide-template",
    toggle: "side-peek",
    tableId: +currentTable.dataset.id,
    itemId: +itemId,
    tags: componentGlobalState.tags,
    tagsColors: componentGlobalState.tagsColor,
    modelControllers: { callUpdateItemHandler },
    eventHandlers: componentGlobalState.eventHandlers,
  };

  return componentObj;
};

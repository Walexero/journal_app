import { importTableComponentView } from "../../tableComponentView"
import { capitalize } from "../../../helpers.js";
import { componentGlobalState } from "../componentGlobalState";

export class TableFuncMixin {
    _checkTableFuncActive(fnType) {
        let fnActive = false
        const fn = this._state.eventHandlers.tableControllers.controlGetPersistedTableFunc()[fnType]
        console.log("the fn", fn)
        const fnProps = Object.keys(fn).map(fnKey => fn[fnKey] ? true : false)
        fnActive = fnProps.find(prop => prop === true) ? true : false
        return fnActive
        return false
    }

    _removeComponentTableFunc(fnType) {
        this._state.eventHandlers.tableControllers.controlRemovePersistedTableFunc(fnType)
    }

    _setFilterRuleBoxAddedValue(el) {
        const filterValue = this._getFunc("filter").value
        const filterValueExists = filterValue?.length > 0
        const filterType = this._getFunc("filter").type
        const filterTags = this._getFunc("filter").tags
        if (filterValueExists) {
            if (filterType === "itemTags" || filterType.toLowerCase() === "tags") {
                const textValue = filterTags.map(tag => tag.text).join(",")
                return textValue
            }
            return filterValue
        }
        if (!filterValueExists) {
            const conditionalsAllowedAsValue = ["Is empty", "Is not empty"]
            const conditionalValue = this._getFunc("filter").conditional
            const conditionalInConditionalsAllowedAsValue = conditionalsAllowedAsValue.find(value => value.toLowerCase() === conditionalValue.toLowerCase()) ? true : false

            if (conditionalInConditionalsAllowedAsValue) return capitalize(conditionalValue)
            else return ""
        }
    }


    _renderFiltered(table) {
        if (table.tableItems.length > 0) {
            //filter the tablebody
            const filteredTableItems = this._state.filterMethod(table.tableItems);

            this._renderFilteredTableItems(filteredTableItems, true);
        }

        if (!table.tableItems.length > 0) this._renderFilteredTableItems([], true);
    }

    _renderSorted(table) {
        let filteredTableItems;
        if (table.tableItems.length > 0) {
            //check if filter methods exist
            if (componentGlobalState.filterMethod) {
                filteredTableItems = componentGlobalState.filterMethod(
                    table.tableItems
                );
            }

            const sortedTableItems =
                filteredTableItems?.length > 0
                    ? componentGlobalState.sortMethod(filteredTableItems)
                    : componentGlobalState.sortMethod(table.tableItems);
            this._renderSortedTableItems(sortedTableItems);
        }
    }

    _renderSortedTableItems(sortedItems, filterPlaceHolder = false) {
        importTableComponentView.object.renderTableItem(sortedItems, null);
    }

    _renderFilteredTableItems(filteredItems, filterPlaceHolder = false) {

        importTableComponentView.object.renderTableItem(filteredItems, null, filterPlaceHolder);
    }

}
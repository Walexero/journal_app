import { importTableComponentView } from "../../tableComponentView"

export class TableFuncMixin {
    _checkTableFuncActive(fnType) {
        let fnActive = false
        const fn = this._state.eventHandlers.tableControllers.controlGetPersistedTableFunc()[fnType]
        console.log("the fn", fn)
        const fnProps = Object.keys(fn).map(fnKey => fn[fnKey] ? true : false)
        fnActive = fnProps.find(prop => prop === true) ? true : false
        // return fnActive
        return false
    }

    _renderFiltered(table) {
        if (table.tableItems.length > 0) {
            //filter the tablebody
            const filteredTableItems = this._state.filterMethod(table.tableItems);

            this._renderFilteredTableItems(filteredTableItems, true);
        }

        if (!table.tableItems.length > 0) this._renderFilteredTableItems([], true);
    }

    _renderFilteredTableItems(filteredItems, filterPlaceHolder = false) {

        importTableComponentView.object.renderTableItem(filteredItems, null, filterPlaceHolder);
    }

}
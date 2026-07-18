/**
 * The table-verification data shapes, in their own module so SPECS can import
 * them without touching the UI handlers (the layer-contract lint rule bans
 * specs from @core/ui/* — except this file; element access belongs to page
 * objects).
 */

/** One expected table record: identifiers locate the row, data asserts its cells. */
export interface ITableValidationPair {
    identifiers: ColumnValuePair<string | number>
    data: ColumnValuePair<string | number>
    searchText?: string
}

/** Map of column header text → expected cell value. */
export type ColumnValuePair<T> = {
    [columnHeader: string]: T
}

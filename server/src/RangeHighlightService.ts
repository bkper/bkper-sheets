namespace RangeHighlightService {
    const ERROR_BACKGROUND_ = '#ea9999';

    export interface Cell {
        row: number;
        column: number;
    }

    export function clearValidationErrors(
        range: GoogleAppsScript.Spreadsheet.Range
    ): void {
        const backgrounds = getBackgrounds_(range);
        let changed = false;
        for (let row = 0; row < backgrounds.length; row++) {
            for (let column = 0; column < backgrounds[row].length; column++) {
                const background = backgrounds[row][column];
                if (
                    background != null &&
                    background.toLowerCase() == ERROR_BACKGROUND_
                ) {
                    backgrounds[row][column] = null;
                    changed = true;
                }
            }
        }
        setBackgroundsIfChanged_(range, backgrounds, changed);
    }

    export function highlightErrors(
        range: GoogleAppsScript.Spreadsheet.Range,
        cells: Cell[]
    ): void {
        highlightCells_(range, cells, ERROR_BACKGROUND_);
    }

    export function highlightRows(
        range: GoogleAppsScript.Spreadsheet.Range,
        rows: number[],
        color: string
    ): void {
        if (rows.length == 0) {
            return;
        }

        const backgrounds = getBackgrounds_(range);
        let changed = false;
        for (const row of rows) {
            for (let column = 0; column < backgrounds[row].length; column++) {
                if (backgrounds[row][column] != color) {
                    backgrounds[row][column] = color;
                    changed = true;
                }
            }
        }
        setBackgroundsIfChanged_(range, backgrounds, changed);
    }

    function highlightCells_(
        range: GoogleAppsScript.Spreadsheet.Range,
        cells: Cell[],
        color: string
    ): void {
        if (cells.length == 0) {
            return;
        }

        const backgrounds = getBackgrounds_(range);
        let changed = false;
        for (const cell of cells) {
            if (backgrounds[cell.row][cell.column] != color) {
                backgrounds[cell.row][cell.column] = color;
                changed = true;
            }
        }
        setBackgroundsIfChanged_(range, backgrounds, changed);
    }

    function getBackgrounds_(
        range: GoogleAppsScript.Spreadsheet.Range
    ): (string | null)[][] {
        return range.getBackgrounds();
    }

    function setBackgroundsIfChanged_(
        range: GoogleAppsScript.Spreadsheet.Range,
        backgrounds: (string | null)[][],
        changed: boolean
    ): void {
        if (changed) {
            range.setBackgrounds(backgrounds);
        }
    }
}

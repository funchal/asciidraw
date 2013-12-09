'use strict';

module ascii_draw {
    export module grid {
        import CellPosition = utils.Point;

        export var container: HTMLDivElement;
        var nrows: number = 0;
        var ncols: number = 0;

        export interface Row extends HTMLDivElement {};
        export interface Cell extends HTMLSpanElement {};

        export function init(): void {
            container = <HTMLDivElement>document.getElementById('grid');
            changeFont();
            setSize(50, 120);
        }

        export function getRow(index: number): Row {
            return <Row>container.children[index];
        }

        export function getCell(index: number, row: Row): Cell {
            return <Cell>row.children[index];
        }


        export function getCellPosition(cell: Cell): CellPosition {
            return new CellPosition(utils.indexInParent(cell.parentElement),
                                    utils.indexInParent(cell));
        }

        export function getTargetCell(target: EventTarget): Cell {
            if (target instanceof HTMLSpanElement) {
                return <Cell>target;
            } else {
                return null;
            }
        }

        function setSize(new_nrows: number, new_ncols: number): void {
            for (var r = nrows; r < new_nrows; r++) {
                container.appendChild(document.createElement('div'));
            }

            for (var r = nrows; r > new_nrows; r--) {
                container.removeChild(container.children[r]);
            }

            for (var r = 0; r < new_nrows; r++) {
                var row = getRow(r);
                for (var c = ncols; c < new_ncols; c++) {
                    var cell = row.appendChild(document.createElement('span'));
                    cell.textContent = emptyCell;
                }

                for (var c = ncols; c > new_ncols; c--) {
                    row.removeChild(row.children[r]);
                }
            }

            nrows = new_nrows;
            ncols = new_ncols;

            gridstatus.textContent = 'Grid size: ' + nrows + 'x' + ncols + ' (' + nrows*ncols + ')';
        }

        function changeFont(): void {
            utils.changeStyleRule('#grid span', 'width', 'auto');
            utils.changeStyleRule('#grid span', 'height', 'auto');
            utils.changeStyleRule('#grid div', 'height', 'auto');

            var font_size = utils.computeFontSize();

            utils.changeStyleRule('#grid span', 'width', font_size.width + 'px');
            utils.changeStyleRule('#grid span', 'height', font_size.height + 'px');
            utils.changeStyleRule('#grid div', 'height', font_size.height + 'px');
        }
    }
}
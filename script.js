/* jshint bitwise:true, browser:true, strict:true, undef:true, unused:true */
/* jshint curly:true, indent:4, forin:true, latedef:true, quotmark:single */
/* jshint trailing:true, maxlen:80, devel:true */

var ascii_draw = (function() {
    'use strict';

    var me = {};

    var start_selection = [0, 0];  // [row, col]
    var end_selection = [0, 0];  // [row, col]
    var selecting = false;

    var getCellAt = function(coord) {
        var drawingarea = document.getElementById('drawingarea');
        return drawingarea.rows[coord[0]].cells[coord[1]];
    };

    var removeClass = function(elem, old_class) {
        var re = new RegExp('(?:^|\\s)' + old_class + '(?!\\S)', 'g');
        elem.className = elem.className.replace(re, '');
    };

    var addClass = function(elem, new_class) {
        elem.className = elem.className + ' ' + new_class;
    };

    /* find the index of a given element in its parent */
    var indexInParent = function(element) {
        var children = element.parentElement.children;
        for (var i = 0; i < children.length; i++) {
            if (children[i] == element) {
                return i;
            }
        }
        return -1;
    };

    /* resize the table by adding or removing rows and columns */
    var resizeTable = function(new_rows, new_cols, grow_only) {
        var drawingarea = document.getElementById('drawingarea');

        var rows = drawingarea.rows.length;

        if (grow_only) {
            new_rows = Math.max(new_rows, rows);
        }

        var i;
        if (new_rows < rows) {
            for (i = rows - new_rows; i > 0; i--) {
                drawingarea.deleteRow(i);
            }
        } else if (new_rows > rows) {
            for (i = 0; i < (new_rows - rows); i++) {
                drawingarea.insertRow();
            }
        }

        if (grow_only) {
            new_cols = Math.max(new_cols, drawingarea.rows[0].cells.length);
        }

        for (i = 0; i < new_rows; i++) {
            var row = drawingarea.rows[i];
            var cols = row.cells.length;
            var j;
            if (new_cols < cols) {
                for (j = cols - new_cols; j > 0; j--) {
                    row.deleteCell(i);
                }
            } else {
                for (j = 0; j < (new_cols - cols); j++) {
                    var cell = row.insertCell();
                    cell.appendChild(document.createTextNode(' '));
                }
            }H
        }
    };

    /* return the selection content for copy */
    var getSelectionContent = function() {
        return 'content\ncontent\ncontent\ncontent\ncontent\ncontent\n' +
               'content\ncontent\ncontent\ncontent\ncontent\ncontent\n' +
               'content\ncontent\ncontent\ncontent\ncontent\ncontent\n' +
               'content\ncontent\ncontent\ncontent\ncontent\ncontent\n' +
               'content\ncontent\ncontent\ncontent\ncontent\ncontent\n';
    };

    var copyAction = function() {
        if (window.getSelection && document.createRange) {
            var copypastearea = document.getElementById('copypastearea');
            copypastearea.textContent = getSelectionContent();
            var sel = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(copypastearea);
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            console.log('fail to copy');
        }
    };

    var initiatePasteAction = function() {
        var copypastearea = document.getElementById('copypastearea');
        copypastearea.value = '';
        copypastearea.focus();
    };

    var completePasteAction = function() {
        var copypastearea = document.getElementById('copypastearea');
        console.log('paste: ' + copypastearea.value);
    };

    var onKeyUp = function(event) {
        var e = event || window.event;

        console.log('onKeyUp: ' + e.keyCode);
        if (e.ctrlKey && !e.altKey && !e.shiftKey) {
            switch (e.keyCode) {
                case 86: /*CTRL+V*/
                    completePasteAction();
                    break;
            }
        }
    };

    var onKeyDown = function(event) {
        var e = event || window.event;
        console.log('onKeyDown: ' + e.keyCode);

        var shift = null;
        switch (e.keyCode) {
            case 37: // left arrow
                shift = [0, -1key];
                break;
            case 38: // up arrow
                shift = [-1, 0];
                break;
            case 39: // right arrow
                shift = [0, 1];
                break;
            case 40: // down arrow
                shift = [1, 0];
                break;
        }

        if (shift) {
            selecting = false;
            var new_selection = [end_selection[0] + shift[0],
                                 end_selection[1] + shift[1]];
            changeSelectedArea(new_selection, new_selection);
        }

        /* user pressed CTRL, prepare for copy/paste action */
        if (e.ctrlKey && !e.altKey && !e.shiftKey) {
            switch (e.keyCode) {
                case 67: /*CTRL+C*/
                    copyAction();
                    break;
                case 86: /*CTRL+V*/
                    initiatePasteAction();
                    break;
            }
        }
    };

    var onKeyPress = function(event) {
        var e = event || window.event;

        console.log('onKeyPress: ' + e.keyCode);
        if (e.keyCode == 13) {  // 'enter' key
            // TODO: move the selected cell to the cell immediately below the
            // first cell we entered text in.
            return;
        }

        var printable = isPrintableKeyPress(e);
        if (printable) {
            var writeIntoCell = function(cell) {
                cell.textContent = String.fromCharCode(e.charCode);
            };
            applyToArea(start_selection, end_selection, writeIntoCell);

            // Move selected cell to the right if only one cell is selected.
            if (start_selection[0] == end_selection[0] &&
                    start_selection[1] == end_selection[1]) {
                var new_selection = [start_selection[0], 
                                     start_selection[1] + 1];
                changeSelectedArea(new_selection, new_selection);
            }
        }
    };

    var init = function() {
        var drawingarea = document.getElementById('drawingarea');

        me.changeFontAction();

        // create cells in the drawing area table
        resizeTable(25, 80, false);

        // hightlight selected cell
        var cell = getCellAt(start_selection);
        addClass(cell, 'highlight');

        drawingarea.addEventListener('mousedown', onMouseDown, false);
        drawingarea.addEventListener('mouseup', onMouseUp, false);
        drawingarea.addEventListener('mouseover', onMouseOver, false);

        // keydown: A key is pressed down. Gives scan-code.
        window.addEventListener('keydown', onKeyDown, false);
        // keypress: A character key is pressed. Gives char-code.
        window.addEventListener('keypress', onKeyPress, false);
        window.addEventListener('keyup', onKeyUp, false);
    };

    var isPrintableKeyPress = function(evt) {
        if (typeof evt.which == 'undefined') {
            // This is IE, which only fires keypress events for printable keys
            return true;
        } else if (typeof evt.which == 'number' && evt.which > 0) {
            // In other browsers except old versions of WebKit, evt.which is
            // only greater than zero if the keypress is a printable key.
            // We need to filter out backspace and ctrl/alt/meta keys
            return !evt.ctrlKey && !evt.metaKey &&
                   !evt.altKey && evt.which != 8;
        }
        return false;
    };

    var applyToArea = function(start_area, end_area, fun) {
        var drawingarea = document.getElementById('drawingarea');
        var min_row = Math.min(start_area[0], end_area[0]);
        var max_row = Math.max(start_area[0], end_area[0]);
        var min_col = Math.min(start_area[1], end_area[1]);
        var max_col = Math.max(start_area[1], end_area[1]);
        for (var r = min_row; r <= max_row; r++) {
            var row = drawingarea.rows[r];
            for (var c = min_col; c <= max_col; c++) {
                var cell = row.cells[c];
                fun(cell);
            }
        }
    };

    var removeHighlight = function(cell) {
        removeClass(cell, 'highlight');
    };

    var addHighlight = function(cell) {
        addClass(cell, 'highlight');
    };

    var changeSelectedArea = function(new_start, new_end) {
        /*
         * update start_selection and end_selection and update cell highlight
         * If new_sart is undefined, does not update start_selection.
         */
        // un-highlight previous selection
        applyToArea(start_selection, end_selection, removeHighlight);

        // update start_selection and end_selection with the cell under cursor.
        start_selection = new_start || start_selection;
        end_selection = new_end;

        // highlight new selection
        applyToArea(start_selection, end_selection, addHighlight);
    };

    var onMouseDown = function(element) {
        var cell = element.target;
        var col = indexInParent(cell);
        var row = indexInParent(cell.parentElement);

        selecting = true;
        changeSelectedArea([row, col], [row, col]);
    };

    var onMouseOver = function(element) {
        if (selecting) {
            var cell = element.target;
            var col = indexInParent(cell);
            var row = indexInParent(cell.parentElement);

            changeSelectedArea(undefined, [row, col]);

            /* scroll to the selected cell */
            // FIXME this is bugged
            // drawingarea.rows[new_y].cells[new_x].scrollIntoView(false);
        }
    };

    var onMouseUp = function() {
        selecting = false;
    };

    var changeStyleRule = function (selector, style, value) {
        var rules = document.styleSheets[0].cssRules ||
                    document.styleSheets[0].rules;

        var match = null;
        for (var i = 0; i != rules.length; i++) {
            if (rules[i].type === CSSRule.STYLE_RULE &&
                rules[i].selectorText == selector) {
                match = rules[i].style;
                break;
            }
        }

        if (match === null) {
            if (document.styleSheets[0].insertRule) {
                 document.styleSheets[0].insertRule(selector + ' {' + style +
                                                    ':' + value + "}",
                                                    rules.length);
            } else {
                document.styleSheets[0].addRule(selector, style + ':' + value);
            }
        } else {
            match[style] = value;
            console.log(value);
        }
    };

    me.changeFontAction = function() {
        changeStyleRule('td', 'width', 'auto');
        changeStyleRule('td', 'height', 'auto');

        var t = document.createElement('table');
        var row = t.insertRow();
        var cell = row.insertCell();
        cell.appendChild(document.createTextNode('M'));
        document.body.appendChild(t);

        changeStyleRule('td', 'width', cell.clientWidth + 'px');
        changeStyleRule('td', 'height', cell.clientHeight + 'px');

        document.body.removeChild(t);
    };

    window.addEventListener('load', init, false);

    return me;
})();

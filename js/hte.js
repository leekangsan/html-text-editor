/*!
 * ----------------------------------------------------------
 *  HTML TEXT EDITOR PLUGIN 1.0.0
 * ----------------------------------------------------------
 * Author: Taufik Nurrohman <http://latitudu.com>
 * Licensed under the MIT license.
 *
 * REQUIRES:
 * ==========================================================
 * [1]. https://github.com/tovic/simple-text-editor-library
 * [2]. https://fortawesome.github.io/Font-Awesome/icons
 * ==========================================================
 * ----------------------------------------------------------
 *
 */

var HTE = function(elem, o) {

    var base = this,
        win = window,
        doc = document,
        editor = new Editor(elem),
        defaults = {
            tabSize: '    ',
            toolbar: true,
            shortcut: false,
            toolbarClass: 'editor-toolbar',
            toolbarPosition: "before", // before or after `<textarea>` ?
            iconClassPrefix: 'fa fa-', // for `<i class="fa fa-ICON_NAME"></i>`
            buttons: {
                ok: 'OK',
                yes: 'Yes',
                no: 'No',
                cancel: 'Cancel',
                bold: 'Bold',
                italic: 'Italic',
                underline: 'Underline',
                strike: 'Strike',
                code: 'Code',
                paragraph: 'Paragraph',
                quote: 'Quote',
                heading: 'H1 \u2013 H6',
                link: 'Link',
                image: 'Image',
                ol: 'Ordered List',
                ul: 'Unordered List',
                rule: 'Horizontal Rule',
                undo: 'Undo',
                redo: 'Redo'
            },
            prompt: {
                link_title: 'link title goes here...',
                link_title_title: 'Link Title',
                link_url: 'http://',
                link_url_title: 'Link URL',
                image_url: 'http://',
                image_url_title: 'Image URL'
            },
            placeholder: {
                heading_text: 'Heading',
                link_text: 'link text',
                list_ul_text: 'List Item',
                list_ol_text: 'List Item',
                image_alt: 'Image'
            },
            keydown: function() {},
            click: function() {},
            ready: function() {}
        };

    var overlay = doc.createElement('div'),
        modal = doc.createElement('div');

    // Base Modal
    base.modal = function(type, callback) {
        type = type || 'modal';
        var page = doc.body;
        overlay.className = 'custom-modal-overlay custom-' + type + '-overlay';
        modal.className = 'custom-modal custom-' + type;
        modal.innerHTML = '<div class="custom-modal-header custom-' + type + '-header"></div><div class="custom-modal-content custom-' + type + '-content"></div><div class="custom-modal-action custom-' + type + '-action"></div>';
        page.appendChild(overlay);
        page.appendChild(modal);
        if (typeof callback == "function") callback(overlay, modal);
    };

    // Close Modal
    base.close = function(select) {
        if (overlay) doc.body.removeChild(overlay);
        if (modal) doc.body.removeChild(modal);
        if (typeof select != "undefined" && select === true) {
            var s = editor.selection();
            editor.select(s.start, s.end);
        }
    };

    // Custom Prompt Modal
    base.prompt = function(title, value, isRequired, callback) {
        base.modal('prompt', function(o, m) {
            var onSuccess = function(value) {
                if (typeof callback == "function") {
                    base.close();
                    callback(value);
                } else {
                    base.close(true);
                }
            };
            var input = doc.createElement('input');
                input.type = "text";
                input.value = value;
                input.onkeyup = function(e) {
                    if (isRequired) {
                        if (e.keyCode == 13 && this.value !== "" && this.value !== value) onSuccess(this.value);
                    } else {
                        if (e.keyCode == 13) onSuccess(this.value == value ? "" : this.value);
                    }
                };
            var OK = doc.createElement('button');
                OK.innerHTML = opt.buttons.ok;
                OK.onclick = function() {
                    if (isRequired) {
                        if (input.value !== "" && input.value !== value) onSuccess(input.value);
                    } else {
                        onSuccess(input.value == value ? "" : input.value);
                    }
                };
            var CANCEL = doc.createElement('button');
                CANCEL.innerHTML = opt.buttons.cancel;
                CANCEL.onclick = function() {
                    base.close(true);
                };
            m.children[0].innerHTML = title ? title : "";
            m.children[1].appendChild(input);
            m.children[2].appendChild(OK);
            m.children[2].appendChild(doc.createTextNode(' '));
            m.children[2].appendChild(CANCEL);
            input.select();
        });
    };

    // Custom Alert Modal
    base.alert = function(title, message, callback) {
        base.modal('alert', function(o, m) {
            var OK = doc.createElement('button');
                OK.innerHTML = opt.buttons.ok;
                OK.onclick = function() {
                    if (typeof callback == "function") {
                        base.close();
                        callback();
                    } else {
                        base.close(true);
                    }
                };
            m.children[0].innerHTML = title ? title : "";
            m.children[1].innerHTML = message ? message : "";
            m.children[2].appendChild(OK);
        });
    };

    // Custom Confirm Modal
    base.confirm = function(title, message, callback) {
        base.modal('confirm', function(o, m) {
            var OK = doc.createElement('button');
                OK.innerHTML = opt.buttons.ok;
                OK.onclick = function() {
                    if (typeof callback == "undefined") {
                        base.close(true);
                    } else {
                        if (typeof callback.OK == "function") {
                            base.close();
                            callback.OK();
                        } else {
                            base.close(true);
                        }
                    }
                };
            var CANCEL = doc.createElement('button');
                CANCEL.innerHTML = opt.buttons.cancel;
                CANCEL.onclick = function() {
                    if (typeof callback == "undefined") {
                        base.close(true);
                    } else {
                        if (typeof callback.CANCEL == "function") {
                            base.close();
                            callback.CANCEL();
                        } else {
                            base.close(true);
                        }
                    }
                    return false;
                };
            m.children[0].innerHTML = title ? title : "";
            m.children[1].innerHTML = message ? message : "";
            m.children[2].appendChild(OK);
            m.children[2].appendChild(doc.createTextNode(' '));
            m.children[2].appendChild(CANCEL);
        });
    };

    function extend(target, source) {
        target = target || {};
        for (var prop in source) {
            if (typeof source[prop] === "object") {
                target[prop] = extend(target[prop], source[prop]);
            } else {
                target[prop] = source[prop];
            }
        }
        return target;
    }

    var opt = extend(defaults, o), nav = doc.createElement('span');

    if (opt.toolbar) {
        nav.className = opt.toolbarClass;
        editor.area.parentNode.insertBefore(nav, opt.toolbarPosition == "before" ? editor.area : null);
    }

    base.button = function(key, data) {
        if (data.title === false) return;
        var a = doc.createElement('a');
            a.href = '#' + key;
            a.setAttribute('tabindex', -1);
            a.innerHTML = '<i class="' + opt.iconClassPrefix + key + '"></i>';
            a.onclick = function(e) {
                data.click(e, base);
                opt.click(e, base, key);
                return false;
            };
        if (data.title) a.title = data.title;
        if (data.position) {
            nav.insertBefore(a, nav.children[data.position - 1]);
        } else {
            nav.appendChild(a);
        }
    };

    editor.toggle = function(open, close, callback) {
        var s = editor.selection();
        if (s.before.slice(-open.length) != open && s.after.slice(0, close.length) != close) {
            editor.wrap(open, close);
        } else {
            var clean_B = s.before.slice(-open.length) == open ? s.before.substring(0, s.before.length - open.length) : s.before,
                clean_A = s.after.substring(0, close.length) == close ? s.after.substring(close.length) : s.after;
            editor.area.value = clean_B + s.value + clean_A;
            editor.select(clean_B.length, clean_B.length + s.value.length, function() {
                editor.updateHistory();
            });
        }
        if (typeof callback == "function") callback();
    };

    var T = 0, btn = defaults.buttons;

    var toolbars = {
        'bold': {
            title: btn.bold,
            click: function() {
                editor.toggle('<strong>', '</strong>');
            }
        },
        'italic': {
            title: btn.italic,
            click: function() {
                editor.toggle('<em>', '</em>');
            }
        },
        'underline': {
            title: btn.underline,
            click: function() {
                editor.toggle('<u>', '</u>');
            }
        },
        'strikethrough': {
            title: btn.strike,
            click: function() {
                var today = new Date(),
                    day = today.getDate(),
                    month = today.getMonth() + 1,
                    year = today.getFullYear();
                if (day < 10) day = '0' + day;
                if (month < 10) month = '0' + month;
                editor.toggle('<del datetime="' + year + '-' + month + '-' + day + '">', '</del>');
            }
        },
        'code': {
            title: btn.code,
            click: function() {
                var v = editor.selection().value;
                if (v.indexOf('\n') !== -1) {
                    editor.toggle('<pre><code>', '</code></pre>');
                } else {
                    editor.toggle('<code>', '</code>');
                }
            }
        },
        'paragraph': {
            title: btn.paragraph,
            click: function() {
                var v = editor.selection().value;
                if (v.indexOf('\n') !== -1) {
                    editor.replace(/^/, '<p>');
                    editor.replace(/$/, '</p>')
                    editor.replace(/\n/g, '</p>\n<p>');
                    editor.replace(/<p><\/p>/g, "");
                } else {
                    editor.toggle('<p>', '</p>');
                }
            }
        },
        'quote-right': {
            title: btn.quote,
            click: function() {
                editor.toggle('<blockquote>', '</blockquote>');
            }
        },
        'header': {
            title: btn.heading,
            click: function() {
                var s = editor.selection();
                T = T < 6 ? T + 1 : 0;
                if (s.value.length > 0) {
                    if (!s.before.match(/<h[1-6]>$/)) {
                        editor.wrap((T > 0 ? '<h' + T + '>' : ""), (T > 0 ? '</h' + T + '>' : ""), function() {
                            editor.replace(/^<h[1-6]>|<\/h[1-6]>$/g, "");
                        });
                    } else {
                        var clean_B = s.before.replace(/<h[1-6]>$/, ""),
                            clean_V = s.value.replace(/^<h[1-6]>|<\/h[1-6]>$/g, ""),
                            clean_A = s.after.replace(/^<\/h[1-6]>/, "");
                        editor.area.value = clean_B + (T > 0 ? '<h' + T + '>' : "") + clean_V + (T > 0 ? '</h' + T + '>' : "") + clean_A;
                        editor.select(clean_B.length + (T > 0 ? 4 : 0), clean_B.length + (T > 0 ? 4 : 0) + clean_V.length, function() {
                            editor.updateHistory();
                        });
                    }
                } else {
                    var placeholder = opt.placeholder.heading_text;
                    T = 1;
                    editor.insert('<h' + T + '>' + placeholder + '</h' + T + '>', function() {
                        s = editor.selection().end;
                        editor.select(s - placeholder.length - 5, s - 5, function() {
                            editor.updateHistory();
                        });
                    });
                }
            }
        },
        'link': {
            title: btn.link,
            click: function() {
                var s = editor.selection(),
                    title, url, placeholder = opt.placeholder.link_text;
                base.prompt(opt.prompt.link_title_title, opt.prompt.link_title, false, function(r) {
                    title = r;
                    base.prompt(opt.prompt.link_url_title, opt.prompt.link_url, true, function(r) {
                        url = r;
                        if (s.value.length === 0) {
                            editor.insert('<a href="' + url + '"' + (title !== "" ? ' title=\"' + title + '\"' : "") + '>' + placeholder + '</a>', function() {
                                var end = editor.selection().end;
                                editor.select(end - placeholder.length - 4, end - 4, function() {
                                    editor.updateHistory();
                                });
                            });
                        } else {
                            editor.wrap('<a href="' + url + '"' + (title !== "" ? ' title=\"' + title + '\"' : "") + '>', '</a>');
                        }
                    });
                });
            }
        },
        'image': {
            title: btn.image,
            click: function() {
                base.prompt(opt.prompt.image_url_title, opt.prompt.image_url, true, function(r) {
                    var alt = decodeURIComponent(
                        r.substring(
                            r.lastIndexOf('/') + 1, r.lastIndexOf('.')
                        ).replace(/[\-\+\.\_]+/g, ' ')
                    ).toLowerCase()
                        .replace(/(?:^|\s)\S/g, function(a) {
                            return a.toUpperCase();
                        });
                    alt = alt.indexOf('/') === -1 && r.indexOf('.') !== -1 ? alt : opt.placeholder.image_alt;
                    editor.insert('\n<img alt="' + alt + '" src="' + r + '">\n');
                });
            }
        },
        'list-ol': {
            title: btn.ol,
            click: function() {
                var s = editor.selection(),
                    placeholder = opt.placeholder.list_ol_text;
                if (s.value.length > 0) {
                    if (s.value == placeholder) {
                        editor.select(s.start, s.end);
                    } else {
                        editor.insert('<ol>\n' + opt.tabSize + '<li>' + s.value.replace(/\n/g, '</li>\n' + opt.tabSize + '<li>').replace(new RegExp('\n(' + opt.tabSize + ')?<li></li>\n', 'g'), '\n</ol>\n\n<ol>\n') + '</li>\n</ol>');
                    }
                } else {
                    editor.insert('<ol>\n' + opt.tabSize + '<li>' + placeholder + '</li>\n</ol>', function() {
                        editor.select(s.start + opt.tabSize.length + 9, s.start + opt.tabSize.length + 9 + placeholder.length, function() {
                            editor.updateHistory();
                        });
                    });
                }
            }
        },
        'list-ul': {
            title: btn.ul,
            click: function() {
                var s = editor.selection(),
                    placeholder = opt.placeholder.list_ul_text;
                if (s.value.length > 0) {
                    if (s.value == placeholder) {
                        editor.select(s.start, s.end);
                    } else {
                        editor.insert('<ul>\n' + opt.tabSize + '<li>' + s.value.replace(/\n/g, '</li>\n' + opt.tabSize + '<li>').replace(new RegExp('\n(' + opt.tabSize + ')?<li></li>\n', 'g'), '\n</ul>\n\n<ul>\n') + '</li>\n</ul>');
                    }
                } else {
                    editor.insert('<ul>\n' + opt.tabSize + '<li>' + placeholder + '</li>\n</ul>', function() {
                        editor.select(s.start + opt.tabSize.length + 9, s.start + opt.tabSize.length + 9 + placeholder.length, function() {
                            editor.updateHistory();
                        });
                    });
                }
            }
        },
        'ellipsis-h': {
            title: btn.rule,
            click: function() {
                editor.insert('\n<hr>\n');
            }
        },
        'rotate-left': {
            title: btn.undo,
            click: function() {
                editor.undo();
            }
        },
        'rotate-right': {
            title: btn.redo,
            click: function() {
                editor.redo();
            }
        }
    };

    for (var i in toolbars) base.button(i, toolbars[i]);

    var insert = function(chars, s) {
        editor.insert(chars, function() {
            editor.select(s.end + 1, s.end + 1);
        });
        return false;
    };

    editor.area.onkeydown = function(e) {

        var s = editor.selection(),
            k = e.keyCode,
            ctrl = e.ctrlKey,
            shift = e.shiftKey,
            alt = e.altKey;

        win.setTimeout(function() {
            opt.keydown(e, base);
        }, 10);

        // Disable the end bracket key if the character before
        // cursor is matched with the character after cursor
        var b = s.before, a = s.after[0];
        if (
            b.indexOf('(') !== -1 && shift && k == 48 && a == ')' && b.slice(-1) != '\\' ||
            b.indexOf('{') !== -1 && shift && k == 221 && a == '}' && b.slice(-1) != '\\' ||
            b.indexOf('[') !== -1 && k == 221 && a == ']' && b.slice(-1) != '\\' ||
            b.indexOf('"') !== -1 && shift && k == 222 && a == '"' && b.slice(-1) != '\\' ||
            b.indexOf('\'') !== -1 && !shift && k == 222 && a == '\'' && b.slice(-1) != '\\' ||
            b.indexOf('`') !== -1 && !shift && k == 192 && a == '`' && b.slice(-1) != '\\' ||
            b.indexOf('<') !== -1 && shift && k == 190 && a == '>' && b.slice(-1) != '\\'
        ) {
            editor.select(s.end + 1, s.end + 1); // move caret by 1 character to the right
            return false;
        }

        // Auto close for `(`
        if (shift && k == 57) {
            return insert('(' + s.value + ')', s);
        }

        // Auto close for `{`
        if (shift && k == 219) {
            return insert('{' + s.value + '}', s);
        }

        // Auto close for `[`
        if (!shift && k == 219) {
            return insert('[' + s.value + ']', s);
        }

        // Auto close for `"`
        if (shift && k == 222) {
            return insert('\"' + s.value + '\"', s);
        }

        // Auto close for `'`
        if (!shift && k == 222) {
            return insert('\'' + s.value + '\'', s);
        }

        // Auto close for ```
        if (!shift && k == 192) {
            return insert('`' + s.value + '`', s);
        }

        // Auto close for `<`
        if (shift && k == 188) {
            return insert('<' + s.value + '>', s);
        }

        // `Shift + Tab` to outdent
        if (shift && k == 9) {
            editor.outdent(opt.tabSize);
            return false;
        }

        // `Tab` to indent
        if (k == 9) {
            editor.indent(opt.tabSize);
            return false;
        }

        // `Ctrl + Z` to undo
        if (ctrl && k == 90) {
            editor.undo();
            return false;
        }

        // `Ctrl + Y` or `Ctrl + R` to redo
        if (ctrl && k == 89 || ctrl && k == 82) {
            editor.redo();
            return false;
        }

        if (defaults.shortcut) {

            // `Ctrl + B` for "bold"
            if (ctrl && k == 66) {
                toolbars.bold.click();
                return false;
            }

            // `Ctrl + I` for "italic"
            if (ctrl && k == 73) {
                toolbars.italic.click();
                return false;
            }

            // `Ctrl + Q` for "blockquote"
            if (ctrl && k == 81) {
                toolbars['quote-right'].click();
                return false;
            }

            // `Alt + Q` or `Alt + Shift + Q` for "quote"
            if (alt && k == 81) {
                if (shift) {
                    editor.toggle('&ldquo;', '&rdquo;'); // double quote
                } else {
                    editor.toggle('&lsquo;', '&rsquo;'); // single quote
                }
                return false;
            }

            // `Ctrl + H` for heading
            if (ctrl && k == 72) {
                toolbars.header.click();
                return false;
            }

            // `Ctrl + L` for link
            if (ctrl && k == 76) {
                toolbars.link.click();
                return false;
            }

            // `Ctrl + G` for image
            if (ctrl && k == 71) {
                toolbars.image.click();
                return false;
            }

        }

        // `Enter` key was pressed
        if (k == 13) {

            // `Ctrl + Enter` for "paragraph"
            if (ctrl) {
                toolbars.paragraph.click();
                return false;
            }

            // `Shift + Enter` for "break"
            if (shift) {
                editor.insert('<br>\n');
                return false;
            }

            // Case `<li>List Item</li>{{press Enter key here!}}`
            if (s.before.match(/<\/li>$/)) {
                editor.insert('\n' + opt.tabSize + '<li></li>', function() {
                    editor.select(s.end + opt.tabSize.length + 5, s.end + opt.tabSize.length + 5, function() {
                        editor.updateHistory();
                    });
                });
                return false;
            }

            // Case `<li>List Item{{press Enter key here!}}</li>`
            if (s.after.match(/^<\/li>/)) {
                editor.insert('</li>\n' + opt.tabSize + '<li>');
                return false;
            }

            // Automatic indentation
            var indentBefore = (new RegExp('(^|\n)((' + opt.tabSize + ')+)(.*?)$')).exec(s.before),
                indent = indentBefore ? indentBefore[2] : "";
            if (s.before.match(/[\(\{\[]$/) && s.after.match(/^[\]\}\)]/) || s.before.match(/<[^\/]*?>$/) && s.after.match(/^<\//)) {
                editor.insert('\n' + indent + opt.tabSize + '\n' + indent, function() {
                    editor.select(s.start + indent.length + opt.tabSize.length + 1, s.start + indent.length + opt.tabSize.length + 1, function() {
                        editor.updateHistory();
                    });
                });
                return false;
            }

            editor.insert('\n' + indent);

            return false;

        }

        // `Backspace` was pressed
        if (k == 8) {

            if (s.value.length === 0) {

                // Remove indentation quickly
                if(s.before.match(new RegExp(opt.tabSize + '$'))) {
                    editor.outdent(opt.tabSize);
                    return false;
                }

                // Remove closing bracket and quotes quickly
                switch (s.before.slice(-1)) {
                    case '(':
                        editor.toggle('(', ')');
                        return false;
                    break;
                    case '{':
                        editor.toggle('{', '}');
                        return false;
                    break;
                    case '[':
                        editor.toggle('[', ']');
                        return false;
                    break;
                    case '"':
                        editor.toggle('"', '"');
                        return false;
                    break;
                    case '\'':
                        editor.toggle('\'', '\'');
                        return false;
                    break;
                    case '<':
                        editor.toggle('<', '>');
                        return false;
                    break;
                    case '`':
                        editor.toggle('`', '`');
                        return false;
                    break;
                }

            }

        }

        // `Right Arrow` key was pressed
        if (k == 39) {

            // Jump out from the closing tag quickly
            if (s.after.match(/^<\/.*?>/)) {
                var end = s.end + s.after.indexOf('>');
                editor.select(end, end, function() {
                    editor.updateHistory();
                });
            }

        }

        editor.updateHistory();

    };

    opt.ready(base);

    // Make all selection method to be accessible outside the plugin
    base.grip = editor;

};
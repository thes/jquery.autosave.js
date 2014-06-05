/**=====================================================================================================================
 *
 *  Autosave plugin
 *
 *  Usage: $('form').autosave();
 *
 *  Note:
 *      For correct work, each field in form should have not empty [name] parameter
 *      If you use TinyMCE for <textarea>, then you should set [id] parameter for each <textarea>
 *      One form = one plugin instance.
 *
 *  ====================================================================================================================
 */
(function ($) {

    var local       = {
        'scratches_box_label'       : 'Резервные Копии',
        'exit'                      : 'Вы действительно хотите уйти?',

        'backup_creation_prepare'   : 'Создание резервной копии документа... Не обновляйте страницу',
        'backup_created'            : 'Резервная копия создана',
        'backup_creation_bad'       : 'Ошибка при создании или обновлении резервной копии',
        'backup_creation_error'     : 'Ошибка при создании или обновлении резервной копии. Возможно, соединение с интернетом потеряно',

        'backup_loading_error'      : 'Ошибка при получении резервной копии. Возможно, соединение с интернетом потеряно',
        'backup_loading_prepare'    : 'Загрузка резервной копии',
        'backup_loading_done'       : 'Резервная копия успешно загружена',

        'backups_loading_error'     : 'Ошибка при получении списка резервных копий. Возможно, соединение с интернетом потеряно',
        'backups_empty'             : '',

        'backup_get_id_error'       : 'Ошибка при попытке доступа к резервным копиям. Возможно, соединение с интернетом потеряно',
        'backup_get_id_done'        : 'Поиск резервных копий документа завершен',
        'backup_get_id_prepare'     : 'Не покидайте страницу - идет поиск резервных копий документа',

        'scratch_delete_error'      : 'Ошибка при сохранении. Проверьте соединение с интернетом и повторите попытку',
        'scratch_delete_prepare'    : 'Удаление резервной копии. . .'
    };

    var common      = {
        'changed'   : false,
        'tinymce'   : false,
        'hash'      : false
    };

    var elements    = {
        'form'      : false,
        'body'      : false,
        'note'      : false,
        'textarea'  : false
    };

    var settings    = {
        'interval'                  : 30000,
        'ajax_add'                  : '',
        'ajax_get_backup_list'      : '',
        'ajax_get_backup'           : '',
        'ajax_find_id'              : '',
        'ajax_remove'               : '',
        'ajax_data'                 : {},
        'disable_selection'         : true
    };

    var methods     = {
        init: function (options) {

            elements.form           = this;
            elements.body           = $('body');
            elements.window         = $(window);
            elements.body.append('<div id="autosave_notify"></div>');

            elements.body.append('<div id="autosave_scratches"><span>' + local.scratches_box_label + '</span><ul></ul></div>');
            elements.scratches      = $('#autosave_scratches');
            elements.scratches_list = elements.scratches.find('ul');

            elements.note           = $('#autosave_notify');
            elements.textarea       = $('textarea');

            $.extend(settings, options);

            if (typeof(tinyMCE) != "undefined") {
                common.tinymce = true;
            }

            if (settings.disable_selection) {
                disableSelection(elements.scratches);
            }

            $.ajaxSetup({
                timeout: 15000
            });
        }
    };

    $.fn.autosave = function (method) {
        if (methods[method]) {

            methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            autosave_run();

            // handles hover for notification
            elements.note.bind('hover', function() {
                elements.note.animate({"top": "-40", "opacity": "0"}, 700);
            });

            // Handles restore buttton click
            elements.body.on('click', '.autosave_restore_btn', function(e) {
                e.preventDefault();
                backup_get_one($(this).attr('data-id'));
            });

            // handles click on backups list
            elements.body.on('click', '#autosave_scratches', function() {
                elements.scratches_list.toggle();
            });

            // handles form submit
            elements.form.bind('submit', function() {
                var no_errors = true;
                common.changed = false;
                if (backup_list_find_item(common.hash).length) {
                    $.ajax({
                        url: settings.ajax_remove,
                        data: $.extend(settings.ajax_data, { 'hash' : common.hash }),
                        type: 'post',
                        async: false,
                        beforeSend: function() {
                            notify(local.scratch_delete_prepare);
                        },
                        error: function() {
                            error(local.scratch_delete_error);
                            notify_set_text(local.scratch_delete_error);
                            no_errors = false;
                        }
                    });
                }
                return no_errors;
            });

            // handle for changing values / states of elements
            elements.form.find(':input:not([type="file"])').bind('keydown', function(){
                common.changed = true;
            });

            // handle leaving page without applied changes
            elements.window.bind('beforeunload', function(){
                // check tinymce for changes
                tinymce_apply_function(function(editor){
                    if (editor.isDirty()){
                        return local.exit;
                    }
                    return false;
                });
                if (common.changed) {
                    return local.exit;
                }
                return null;
            });

            // handle value changed event in tinymce
            elements.window.load(function(){
                tinymce_apply_function(function(editor){
                    editor.onKeyDown.add(function(){
                        common.changed = true;
                    });
                });
            });

        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' not found');
        }
        return true;
    };

    /**
     * restore document form fields values (only if it have [name])
     * @param data
     */
    function restore_document(data) {

        $.each(elements.form.find(':checkbox, :radio'), function() {
            $(this).prop('checked', false);
        });

        $.each(data, function(i, field){
            var tmp_el = $('[name=' + field.name + ']');
            if (tmp_el.length) {
                if (tmp_el.prop("tagName") == 'TEXTAREA') {
                    tmp_el.html(field.value);
                    if (common.tinymce && typeof(tmp_el.attr('id')) !== 'undefined' && typeof(tinyMCE.get(tmp_el.attr('id'))) !== 'undefined') {
                        tinyMCE.get(tmp_el.attr('id')).setContent($('<div/>').html(tmp_el.html()).text());
                    }
                } else {
                    if (tmp_el.attr('type') == 'checkbox' || tmp_el.attr('type') == 'radio') {
                        tmp_el.prop('checked', true);
                    } else {
                        tmp_el.val(field.value);
                    }
                }
            } else {
                log('WARNING: [name=' + field.name + '] not exists + ' + console.log(field));
            }
        });
        common.changed = false;
    }

    /** run daemon, which will save form content each x seconds */
    function daemon_start() {
        setTimeout(function() {
            if (common.changed) {
                backup_create();
            }
            daemon_start();
        }, settings.interval);
    }

    /** call for run saving in background */
    function backup_create() {
        if (common.tinymce) {
            tinymce_apply_function(function(editor){
                $(editor.getElement()).html(editor.getContent());
            });
        }

        settings.ajax_data.uri  = $(location).attr('href');
        if (common.hash) {
            settings.ajax_data.id   = common.hash;
        }
        settings.ajax_data.data = elements.form.find(':input').serializeArray();

        $.ajax({
            url         : settings.ajax_add,
            data        : settings.ajax_data,
            type        : 'post',
            dataType    : 'json',
            beforeSend  : function() {
                notify(local.backup_creation_prepare);
            },
            success     : function(res) {
                notify_set_text(local.backup_created);
                if (typeof(res.id) !== 'undefined') {
                    common.hash = res.id;
                    backup_list_add_item(common.hash, res['user_name'], res.date, true);
                    common.changed = false;
                    elements.scratches.show();
                } else {
                    notify(local.backup_creation_bad);
                }
            },
            error       : function() {
                error(local.backup_creation_error);
            }
        });
    }

    /**
     * second step for run backup daemon
     * load list of saved docs */
    function backup_get_all() {
        $.ajax({
            url         : settings.ajax_get_backup_list,
            data        : {'uri': $(location).attr('href')},
            dataType    : 'json',
            beforeSend  : function() {},
            success     : function(res) {
                if (res.length) {
                    $.each(res, function(key, value) {
                        backup_list_add_item(value.id, value['user_name'], value.date, false);
                    });
                    elements.scratches.show();
                }
                daemon_start();
            },
            error       : function() {
                error(local.backups_loading_error);
            }
        });
    }

    /**
     * add item in backup list
     * @param id
     * @param user_name
     * @param date
     * @param in_start      - if true, then item will placed in start of the list
     */
    function backup_list_add_item(id, user_name, date, in_start) {
        var old_item = backup_list_find_item(id);
        if (!backup_list_is_empty()) {
            elements.scratches_list.html('');
        }
        if (!old_item.length) {
            var tmp_html = '<li>Ред. от ' + date + ' (' + user_name + ')&nbsp;&nbsp;<a class="autosave_restore_btn" data-id="' + id + '">Восстановить</a></li>';
            if (in_start) {
                elements.scratches_list.prepend(tmp_html);
            } else {
                elements.scratches_list.append(tmp_html);
            }
        } else {
            old_item.parent().html('Ред. от ' + date + ' (' + user_name + ')&nbsp;&nbsp;<a class="autosave_restore_btn" data-id="' + id + '">Восстановить</a>');
        }
    }

    /**
     * Search (and return if found) item in backup list
     * @param id
     * @returns {*}
     */
    function backup_list_find_item(id) {
        return elements.scratches_list.find('[data-id=' + id + ']');
    }

    /**
     * return elements length of backup list
     * @returns {Number|number|f.length|*|p.length|v.length}
     */
    function backup_list_is_empty() {
        return elements.scratches_list.find('[data-id]').length;
    }

    /**
     * load data of saved page and restore document
     * @param scratch_id
     */
    function backup_get_one(scratch_id) {
        $.ajax({
            url: settings.ajax_get_backup,
            data: {'id': scratch_id},
            dataType: 'json',
            beforeSend: function() {
                notify(local.backup_loading_prepare);
            },
            success: function(res) {
                common.hash = scratch_id;
                restore_document(res);
                notify(local.backup_loading_done);
            },
            error: function() {
                error(local.backup_loading_error);
            }
        });
    }

    /**
     * show notify bout saving in background mode
     * @param text  - notify text
     */
    function notify(text) {
        notify_set_text(text);
        elements.note.animate({"top": "0", "opacity": "1.0"}, 700);
        setTimeout(function() {
            elements.note.animate({"top": "-40", "opacity": "0"}, 700);
        }, 3000);
    }

    /**
     * change text of notify
     * @param text
     */
    function notify_set_text(text) {
        elements.note.text(text);
    }

    /**
     * enter point for run backup daemon
     * search id for current docs in backups */
    function autosave_run() {
        $.ajax({
            url: settings.ajax_find_id,
            data: { 'uri': $(location).attr('href'), 'user_id': settings.ajax_data.user_id },
            type: 'get',
            beforeSend: function() {
                notify(local.backup_get_id_prepare);
            },
            success: function(res) {
                notify(local.backup_get_id_done);
                common.hash = res;
                backup_get_all();
            },
            error: function() {
                error(local.backup_get_id_error);
            }
        });
    }

    /**
     * disable text selection
     * @param target
     */
    function disableSelection(target) {
        target.children().each(function(i, elem) {
            if (typeof elem.onselectstart != "undefined")
                elem.onselectstart = function() { return false };
            else if (typeof elem.style.MozUserSelect != "undefined")
                elem.style.MozUserSelect = "none";
            else
                elem.onmousedown = function() { return false };

            elem.style.cursor = "pointer";
        });
    }

    /**
     * applies function for all editors
     * @param par_callback
     */
    function tinymce_apply_function(par_callback) {
        if (common.tinymce) {
            for (var i = 0; i < tinyMCE.editors.length; i++) {
                par_callback(tinyMCE.editors[i]);
            }
        }
    }

    /**
     * show alert message and do write to console.error
     * @param text
     */
    function error(text) {
        alert(text);
        console.error(text);
    }

    /**
     * write to console log
     * @param text
     */
    function log(text) {
        console.log(text);
    }

})(jQuery);
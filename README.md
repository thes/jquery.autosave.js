Thes : Autosave
==================

JQuery plugin for backup form values

Usage
=================
1. Copy (or copy and adapt for your site) AutosaveController.php and Autosave.php to your site
2. Copy jquery.autosave.js into your js catalog
3. Copy and include style.css into your site
4. Init plugin

Example
=================
  $(function(){
      $('form').autosave('init', {
          'ajax_add'              : 'autosave/add',
          'ajax_get_backup_list'  : 'autosave/get',
          'ajax_get_backup'       : 'autosave/load',
          'ajax_find_id'          : 'autosave/get_id',
          'ajax_remove'           : 'autosave/remove',
  
          'ajax_data'             : {
              'token'             : get_token(),
              'user_id'           : '<?= $user_id ?>'
          }
      });
  });

Parameters
=================
interval                - (default: 30000 (miliseconds))
                        Interval for backups creation

ajax_add                - (default: '')
                        Ajax request for backup creation (or updating) will sended to this uri

ajax_get_backup_list    - (default: '')
                        Ajax request for get backups list will sended to this uri
                        
ajax_get_backup         - (default: '')
                        Ajax request for get backup will sended to this uri

ajax_find_id            - (default: '')
                        Ajax request for search backups for current page will sended to this uri

ajax_remove             - (default: '')
                        Ajax request for remove backup for current page will sended to this uri

ajax_data               - (default: {})
                        Will merged with ajax 'data'

disable_selection       - (default: true)
                        Disallow text selection in backups list

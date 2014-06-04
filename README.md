Thes : Autosave
==================

> JQuery plugin for backup form values

Usage
=================
1. Copy (or copy and adapt for your site) AutosaveController.php and Autosave.php to your site
2. Copy jquery.autosave.js into your js catalog
3. Copy and include style.css into your site
4. Init plugin

Example
=================
<pre lang="javascript"><code>
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
</code></pre>

Parameters
=================

Parameter | Default value | Description
------------ | ------------- | -------------

`interval` | 30000 | Interval for backups creation

`ajax_add` | '' | Ajax request for backup creation (or updating) will sended to this uri

`ajax_get_backup_list` | '' | Ajax request for get backups list will sended to this uri
                        
`ajax_get_backup` | '' | Ajax request for get backup will sended to this uri

`ajax_find_id` | '' | Ajax request for search backups for current page will sended to this uri

`ajax_remove` | '' | Ajax request for remove backup for current page will sended to this uri

`ajax_data` | '' | Will merged with ajax 'data'

`disable_selection` | true | Disallow text selection in backups list

Thes : Autosave [ Pre-Alpha version ]
==================

> JQuery plugin for backup form values

Usage
=================
1. Copy (or copy and adapt for your site) AutosaveController.php and Autosave.php to your site (these files - just examples. you can use your own files)
2. Copy jquery.autosave.js into your js catalog
3. Copy and include style.css into your site
4. Init plugin

Example
=================
<pre lang="javascript">
<code>
   $(function(){
      $('form').autosave('init', {
          'ajax_add'              : 'autosave/add',
          'ajax_get_backup_list'  : 'autosave/get',
          'ajax_get_backup'       : 'autosave/load',
          'ajax_find_id'          : 'autosave/get_id',
          'ajax_remove'           : 'autosave/remove',
          'ajax_data'             : {
              'token'             : get_token()
          }
      });
  });
</code>
</pre>

Parameters
=================

Parameter | Default value | GET | POST | Description | PHP
--------- | ------------- | --- | ---- | ----------- | ---
`interval` | 30000 | | | Interval for backups creation | 
`ajax_add` | '' | | id, uri, data | Ajax request for backup creation (or updating) will sended to this uri | function should return (json) array [id => 'value', 'user_name' => 'some', 'date' => 'd.m.y blah'] of updated (or added) row)
`ajax_get_backup_list` | '' | uri | | Ajax request for get backups list will sended to this uri | function should return (json) array of backups with fields, like in ajax_add
`ajax_get_backup` | '' | id | | Ajax request for get backup will sended to this uri | function should return value of `data` field from requested backup
`ajax_find_id` | '' | uri | | Ajax request for search backups for current page will sended to this uri | function should return id of backup
`ajax_remove` | '' | | hash (same with id) | Ajax request for remove backup for current page will sended to this uri | function should remove backup
`ajax_data` | '' | | | Will merged with ajax 'data' | 
`disable_selection` | true | | | Disallow text selection in backups list | 

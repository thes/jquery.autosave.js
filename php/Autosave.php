<?php

/**
 * EXAMPLE FILE | EXAMPLE FILE | EXAMPLE FILE | EXAMPLE FILE | EXAMPLE FILE | EXAMPLE FILE | EXAMPLE FILE | EXAMPLE FILE
 * Class Autosave
 */
class Autosave
{

    /**
     * Returns id of saved backup
     * @param $user_id
     * @param $uri
     * @return bool|string
     */
    public function get_id($user_id, $uri)
    {
        return db_get_one('SELECT id FROM autosave WHERE user_id = ?i AND uri = ?s', $user_id, $uri);
    }

    /**
     * Returns value of field `data` form backup with requested `id`
     * @param $id
     * @return bool|string
     */
    public function get_scratch($id)
    {
        return db_get_one('SELECT `data` FROM autosave WHERE id = ?i', $id);
    }

    /**
     * Returns values of fields `id` / `user_name` / `date` from backup with requested id
     * @param $id
     * @return array|bool
     */
    public function get_scratch_info($id)
    {
        $data = db_get_assoc('
            SELECT
                autosave.id,
                admin_users.name AS user_name,
                autosave.date
            FROM
                autosave
                JOIN admin_users ON autosave.user_id = admin_users.id
            WHERE autosave.id = ?i',
            $id
        );
        $data['date'] = format_date($data['date'], 'd.m.Y H:i:s');
        return $data;
    }

    /**
     * Save in backups
     * @param $values
     * @return bool|int|mixed
     */
    public function add_scratch($values)
    {
        return db_insert('autosave', $values);
    }

    /**
     * Update backup values
     * @param $id
     * @param $values
     * @return mixed
     */
    public function update_scratch($id, $values)
    {
        return db_update('autosave', $values, array('id' => $id));
    }

    /**
     * Remove from backups
     * @param $hash
     * @return resource
     */
    public function remove_scratch($hash)
    {
        return db_query("DELETE FROM autosave WHERE id = ?s", $hash);
    }

    /**
     * Get backups for uri
     * @param $uri
     * @return array|bool
     */
    public function get_scratches($uri)
    {
        $scratches = db_get_all("
            SELECT
                autosave.id,
                autosave.date,
                admin_users.name AS user_name
            FROM autosave
                JOIN admin_users ON autosave.user_id = admin_users.id
            WHERE uri = ?s",
            $uri
        );
        foreach ($scratches as $key => $scratch) {
            $scratches[$key]['date'] = format_date($scratch['date'], 'd.m.Y H:i:s');
        }
        return $scratches;
    }

}
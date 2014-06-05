<?php

/**
 * EXAMPLE FILE | EXAMPLE FILE | EXAMPLE FILE | EXAMPLE FILE | EXAMPLE FILE | EXAMPLE FILE | EXAMPLE FILE | EXAMPLE FILE
 * Class AutosaveController
 */
class AutosaveController
{
    private $model;
    private $user_id;

    public function __construct()
    {
        $this->model = new Autosave();
        $this->user_id = $_SESSION['admin_user']['id'];
    }

    /** create or update backup */
    public function add()
    {
        $data = build_array('id, uri, data', $_POST);
        if (isset($data['data']['token'])) {
            unset($data['data']['token']);
        }
        $data['data'] = json_encode($data['data']);
        $data['user_id'] = $this->user_id;

        if (!$data['id']) {
            $scratch_id = $this->model->add_scratch($data);
        } else {
            $scratch_id = $data['id'];
            unset($data['id']);
            $this->model->update_scratch($scratch_id, $data);
        }

        echo json_encode($this->model->get_scratch_info($scratch_id));
    }

    /** remove backup */
    public function remove()
    {
        $this->model->remove_scratch(post('hash'));
    }

    /** get backups list for uri  */
    public function get()
    {
        echo json_encode($this->model->get_scratches(get('uri')));
    }

    /** backup id */
    public function get_id()
    {
        echo $this->model->get_id($this->user_id, get('uri'));
    }

    /** get value of field `data` */
    public function load()
    {
        echo $this->model->get_scratch(get('id'));
    }

}
<?php

class ResourcesSelected extends Plugin 
{
    public function render_content()
    {
        $uuid = $this->uuid;
//$plugin_uuid, $options)
        Plugins::add_js('/ResourcesSelected/ResourcesSelected.js');
        Plugins::add_css('/ResourcesSelected/ResourcesSelected.css');
        Plugins::add_js('//ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.3/jquery.dataTables.js');
        //Plugins::add_css('/DataTables/DataTables.css');
        $out = <<<EOF
<table class='display' id='table-$uuid'>
  <thead>
    <tr>
      <th>status</th>
      <th>urn</th>
      <th>slot</th>
      <th>+/-</th>
    </tr>
  </thead>
</table>
EOF;
        return $out;
    }
}

Plugins::register_plugin('ResourcesSelected', 'ResourcesSelected');
?>

NITOScheduler plugin
====================

Instructions:
In order to integrate NITOScheduler plugin in your MySlice frontend, you have to follow the ordinary procedure, just like for any other MySlice plugin http://trac.myslice.info/wiki/PluginDeveloperGuide.

The only difference, is to add the parameter that informs the plugin about your testbed.
So put this line of code at the file /usr/share/myslice/joomla/components/com_tophat/includes/plugins/myslice/slice.php where you instantiate the plugin.

'testbed' => "omf"

The code in order to see NITOS resources is :

// *************************************

$nitos = Plugins::get('NITOScheduler');

$nitos->set_params(Array(

	'query_uuid' => $q_rsrc->uuid,

	'testbed' => "omf"

));

$tab->add("NITOScheduler",$nitos);

// *************************************

<?php

#
# Copyright (c) 2012 NITLab, University of Thessaly, CERTH, Greece
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
#
# This is a MySlice plugin for the NITOS Scheduler
# NITOScheduler v0.8
#

class NITOSchedulerClass extends Plugin
{
    public function render_content() {
        // Related JS and CSS files
       	Plugins::add_css('/NITOScheduler/css/reservation.css');
        Plugins::add_css('/NITOScheduler/javascript/datepicker/css/jquery.datepick.css');
        Plugins::add_css('/NITOScheduler/javascript/tabber/example.css');

        Plugins::add_js('/NITOScheduler/javascript/datepicker/js/jquery.datepick.js');
        Plugins::add_js('/NITOScheduler/javascript/tabber/tabber.js');

	Plugins::add_js('/NITOScheduler/javascript/scheduler/NITOScheduler.js');
        Plugins::add_js('/NITOScheduler/javascript/reserve_controls.js');

 

        // Rendering code here
        $out=Array();
	$out[] = "<div class='plugin scrollx scrolly'>";
        $out[] = <<<END
	<script type="text/javascript">

        document.write('<style type="text/css">.tabber{display:none;}<\/style>');
    </script>
     <div id="nitos_scheduler">
        <div id="image">
            <h2 style="font-family:Book Antiqua; color:Blue;">Topology</h2>
            <img src="/components/com_tophat/includes/plugins/NITOScheduler/icons/nitos_topo.png" alt="nitos topology" />
        </div>
	<br>
        <div id="date_block">
            <h2 style="float:left; margin-right:10px; font-family:Book Antiqua; color:Blue;""> Choose your time slot:</h2>
	    <div style="margin-top:7px">
            	<input type="text" style="float:left; margin-left:0; margin-right:10px; width:100px;" readonly="true" id="datepick" value="" />
	    </div>
        </div>
        <input type="text" hidden="hidden" id="hidden_date" />
        <div class="tabber">
            <div class="tabbertab">
                <h2>Grid</h2>
                <div  id="place_commel"></div>  
                <div id="buttons_div_commel">
                    <input type="button" id="reserveBtn_commel" value="Reserve" />
                    <input type="button" id="clearBtn_commel" value="Clear" /> 
                    <ul id="seatDescription_commel">
                        <li style="background:url('/components/com_tophat/includes/plugins/NITOScheduler/icons/circle_grey.png') no-repeat scroll 0 0 transparent; background-position:bottom;">Available</li>
                        <li style="background:url('/components/com_tophat/includes/plugins/NITOScheduler/icons/circle_red.png') no-repeat scroll 0 0 transparent; background-position:bottom;">Not Available</li>
                        <li style="background:url('/components/com_tophat/includes/plugins/NITOScheduler/icons/circle_blue.png') no-repeat scroll 0 0 transparent; background-position:bottom;">Selected</li>
                    </ul>
                </div>
            </div>
            <div class="tabbertab">
                <h2>Orbit</h2>
                <div  id="place_orbit"></div>  
                <div id="buttons_div_orbit">
                    <input type="button" id="reserveBtn_orbit" value="Reserve"/>
                    <input type="button" id="clearBtn_orbit" value="Clear"/>  
                    <ul id="seatDescription_orbit">
                        <li style="background:url('/components/com_tophat/includes/plugins/NITOScheduler/icons/circle_grey.png') no-repeat scroll 0 0 transparent; background-position:bottom;">Available</li>
                        <li style="background:url('/components/com_tophat/includes/plugins/NITOScheduler/icons/circle_red.png') no-repeat scroll 0 0 transparent; background-position:bottom;">Not Available</li>
                        <li style="background:url('/components/com_tophat/includes/plugins/NITOScheduler/icons/circle_blue.png') no-repeat scroll 0 0 transparent; background-position:bottom;">Selected</li>
                    </ul>
                </div>
            </div>
            <div class="tabbertab">
                <h2>Diskless</h2>
                <div  id="place_diskless"></div>  
                <div id="buttons_div_diskless">
                    <input type="button" id="reserveBtn_diskless" value="Reserve"/>
                    <input type="button" id="clearBtn_diskless" value="Clear"/> 
                    <ul id="seatDescription_diskless">
                        <li style="background:url('/components/com_tophat/includes/plugins/NITOScheduler/icons/circle_grey.png') no-repeat scroll 0 0 transparent; background-position:bottom;">Available</li>
                        <li style="background:url('/components/com_tophat/includes/plugins/NITOScheduler/icons/circle_red.png') no-repeat scroll 0 0 transparent; background-position:bottom;">Not Available</li>
                        <li style="background:url('/components/com_tophat/includes/plugins/NITOScheduler/icons/circle_blue.png') no-repeat scroll 0 0 transparent; background-position:bottom;">Selected</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
END;
        $out[] = "</div>";
        return implode($out);
    }
}

Plugins::register_plugin('NITOScheduler', 'NITOSchedulerClass');
?>

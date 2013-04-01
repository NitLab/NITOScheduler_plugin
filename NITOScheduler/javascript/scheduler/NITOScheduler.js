/* Copyright (c) 2012 NITLab, University of Thessaly, CERTH, Greece
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
*/

// Utility, creates the Object.create if it does not supported by the browser
if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {};
		F.prototype = obj;
		return new F();
	};
}


(function( $, window, document, undefined ) {
	////////////////////////
	////	OBJECT	////////
	////////////////////////
	
	var Reservation = {
	    init: function() {
	        var settings = {
		        cols: 48,
		        rowCssPrefix: 'row-',
		        colCssPrefix: 'col-',
		        slotWidth: 35,
		        slottHeight: 35,
		        slottCss: 'slot',
		        selectedSlotCss: 'selectedSlot',
		        selectingSlotCss: 'selectingSlot',
			subgroup_nodes: [],
			reserved_nodes: [5, 20, 13, 6],
			subtestbed_id: "none",
		        parent: null
		    };
		 
	         return settings; 
           },
		
	   // Filter what you need from the testbed nodes
	   subgroup: function( nodes, settings ){
		var subgroup_name = settings.subtestbed_id;
		if(nodes.length > 0){
		    var sub_nodes = new Array();
		    for(var i=0; i<nodes.length; i++){
			if(nodes[i].hardware_type == subgroup_name){
				sub_nodes.push(nodes[i]);
			}
		    }
		    settings.subgroup_nodes = sub_nodes;
		
		}
	   },

	   // Create the content for the tab
	   display: function ( settings ) {
			var self = this;
			var now = new Date();
			var str = [], timeNo, className, time_num;
			
			// Options passed by the user or default
			var reservedSlot = settings.reserved_nodes;
			var numofnodes = settings.subgroup_nodes.length;
			var my_nodes = settings.subgroup_nodes;
			var element_id = settings.subtestbed_id;

			for (i = 0; i < numofnodes; i++) {
			    str.push('<ul class="node"><a title="' + my_nodes[i].component_id + '">' +  my_nodes[i].hostname + '</a>');
                k = 0;
			    for (j = 0; j < settings.cols; j++) {
			        // Create the time labels
			        (j % 2) ? k++ : k;
			        hour = (j - k).toString();
			        min = (j % 2) ? ":30" : ":00";
			        min_ah = (j % 2) ? ":00" : ":30";
			        min_ah == ":30" ? hour_ah = hour : hour_ah = (j - k + 1).toString();
			        timeNo = hour + min + "-" + hour_ah + min_ah;
			        // End of time labels

			        // Create the class name : row an column tag
			        className = settings.slottCss + ' ' + settings.rowCssPrefix + i.toString() + ' ' + settings.colCssPrefix + j.toString();
			        if ($.isArray(reservedSlot)) {
			            for (t = 0; t < reservedSlot.length; t++) {
			                row = Math.round(reservedSlot[t] / settings.cols);
			                col = reservedSlot[t] % settings.cols - 1;
			                if (row == i && col == j) {
			                    className += ' ' + settings.selectedSlotCss;
			                } //if
			            } //for

			        } //if
			        str.push('<li class="' + className + '">' + '<a title="' + timeNo + '">' + timeNo + '</a>' + '</li>');
			    } //for
			    str.push('</ul>');
			} //for
			$('#place_' + element_id).html(str.join(''));


		    // Selecting time slots
			$('#place_' + element_id + ' .slot').click(function () {
			    if ($.trim($('#hidden_date').val()) != "") {
			       if ($(this).hasClass(settings.selectedSlotCss)) {
			           alert('This slot is already reserved.');
			       }
			       else {
				    var date = $.trim($('#hidden_date').val());
				    if ($(this).hasClass(settings.selectingSlotCss)) {
					// Remove table entry
					$(this).removeClass(settings.selectingSlotCss);
					    
					var time_slot = $(this).children('a').attr('title');
					var node = $(this).closest('.node').children(':first').attr('title');
					    
					var entry = {node:'none',timeslot:0};
					var gentry = {node:'none', timeslot:0, date:'none'};


					entry.node = node
					entry.timeslot = time_slot + "+" + date;

					gentry.node = node;
					gentry.timeslot = time_slot;
					gentry.date = date;

					// Remove the selected item from the resources selected
					// Use combination of grep and map
					tmp = $.grep(settings.parent.current_resources, function(x) { return x.node != entry.node || x.timeslot != entry.timeslot; });

					tmp_ = $.map(tmp, function(x) { return { node : x.node, timeslot : x.timeslot }; });

					// Remove items from global list
					tmpg = $.grep(jQuery.fn.ResourcesArray, function(x) { return x.node != gentry.node || x.timeslot != gentry.timeslot || x.date != gentry.date; });

					tmp_g = $.map(tmpg, function(x) { return { node : x.node, timeslot : x.timeslot, date: x.date }; });

					// List of objects after removing the data that i do not want
					jQuery.fn.ResourcesArray = tmp_g;
		    			settings.parent.current_resources = tmp_;
					/* inform slice that our selected resources have changed */
					$.publish('/update-set/' + settings.parent.options.query_uuid, [settings.parent.current_resources, true]);

				     } else {
					 // Add table entry
					 $(this).addClass(settings.selectingSlotCss);

					 var time_slot = $(this).children('a').attr('title');
					 var node = $(this).closest('.node').children(':first').attr('title');
					    
					 var entry = {node:'none',timeslot:0};
					 var gentry = {node:'none', timeslot:0, date:'none'};

					 entry.node = node
					 entry.timeslot = time_slot + "+" + date;
					    
					 gentry.node = node;
					 gentry.timeslot = time_slot;
					 gentry.date = date;
					 
					 jQuery.fn.ResourcesArray.push(gentry);
					 settings.parent.current_resources.push(entry);
					 /* inform slice that our selected resources have changed */
					 $.publish('/update-set/' + settings.parent.options.query_uuid, [settings.parent.current_resources, true]);

				     }// else
				 } // if: Reserved slot
			    }else{
			       alert("Pick a date.");
	                    }// if: date
			}); //click

		    // Reserve the blue slots
			$('#reserveBtn_' + element_id).click(function () {
			    var node_time = [];
			    var i = 0;

			    if ($.trim($('#hidden_date').val()) != "") {
			        var selections = []; // Create an object
			        $('#place_' + element_id + ' .slot').each(function () {
			            if ($(this).hasClass(settings.selectingSlotCss)) {
			                // Push the data to the server
			                var data = $('#hidden_date').val() + ">";
			                data += $(this).children('a').attr('title');
			                var node = $(this).closest('.node').children(':first').attr('title');

			                selections.push(node + ">" + data);
			                i++;
			            }
			        });

			        if (selections.length > 0) {

			            // Send data to server
			            var request = $.ajax({
			                url: "http://nitlab.inf.uth.gr/crash_report.php",
			                type: "POST",
			                data: { array: JSON.stringify(selections) },

			                success: function (response) {
			                    alert("Submitted successfully.\n" + response);
			                    $('#place_' + element_id + ' .slot').each(function () {
			                        if ($(this).hasClass(settings.selectingSlotCss)) {
			                            $(this).removeClass(settings.selectingSlotCss);
			                            $(this).addClass(settings.selectedSlotCss);
			                        }
			                    });
			                },
			                error: function (jqXHR, exception) {
			                    /*
                                    Status zero happens when 
    
                                    1) Page is being served from file protocol 
                                    2) Page exits/refreshes as an active XMLHttpRequest 
                                       is still being processed. It throws an "INVALID_STATE_ERR " 
                                       error and sets the status to zero.
                                    3) The response of the server was empty
                                */
			                    if (jqXHR.status === 0) {
			                        alert('Not connected.\nVerify Network.');
			                    } else if (jqXHR.status == 404) {
			                        alert('Requested page not found. [404]');
			                    } else if (jqXHR.status == 500) {
			                        alert('Internal Server Error [500].');
			                    } else if (exception === 'parsererror') {
			                        alert('Requested parse failed.');
			                    } else if (exception === 'timeout') {
			                        alert('Time out error.');
			                    } else if (exception === 'abort') {
			                        alert('Ajax request aborted.');
			                    } else {
			                        alert('Uncaught Error.\n' + jqXHR.responseText);
			                    }

			                    // Trigger Clear button
			                    $('#clearBtn_' + element_id).trigger('click');
			                }//error
			            });

			        }
			        // Clear data
			        selections = null;
			        i = 0;

			    } else {
			        alert('Pick a date!');
			    }


			}); //click

			$('#clearBtn_' + element_id).click(function () {
			    $('#place_' + element_id + ' .slot').each(function () {
			        if ($(this).hasClass(settings.selectingSlotCss)) {
			            $(this).removeClass(settings.selectingSlotCss);
			        }
			    });
			}); //click
			
		}

		
	};


    ////////////////////////////
    ///	     FUNCTIONS	    ////
    ////////////////////////////

    function NITOScheduler(options)
    {
        /* member variables */
        this.options = options;

        /* constructor */
        this.current_query = null;
	this.current_resources = new Array(); // hold the resources selected
        var object = this;
        /* methods */
	this.get_leases = function(rows, options){
		function node_info(duration, timeslot, year, month, day, time, type, resource){
			var self = this;
			
			self.duration = duration;
			self.timeslot = timeslot;
			self.year = year;
			self.month = month;
			self.day = day;
			self.time = time;
			self.type = type;
			self.resource = resource;
		};

		var node_info_list = new Array();
		var nodes = new Array();

		// Find the nitos reserved nodes and channels
		for(var i=0; i<rows.length; i++){
			if(rows[i].network == options.testbed){
				nodes.push(rows[i]);
			}
		}
		// Take the data i need from the retrieved list and create a new one
		for(var i=0; i<nodes.length; i++){
			var date = new Date(nodes[i].start_time*1000);
			granularity = nodes[i].granularity;

			(typeof(granularity) !== 'undefined') ? timeslot = granularity/60 : timeslot = 30;
			duration = parseInt(nodes[i].duration);
			year = date.getFullYear();
			month = date.getMonth();
			day = date.getDay();
			time = date.getHours() + ":" + date.getMinutes();
			type = nodes[i].type;
			var resource_array = nodes[i].hrn.split('.'); 
			resource = resource_array[resource_array.length - 1];

			var ob = new node_info(duration, timeslot, year, month, day, time, type, resource);
			node_info_list.push( ob );

		}

		// Clean the nodes list
		nodes = null;

		// 
		//console.log(node_info_list);
	}


	this.update_resources = function(e, resources, instances){
  	     console.log(e);
	     console.log(resources);
 	     console.log(instances);
	};

	// Get Resources
        this.get_resources = function(rows, options)
        {
		var str = [];
		var nodes = new Array();
		var oResources = $('#resources-'+ options.plugin_uuid);
		str.push("<h3>NB Resources = "+ rows.length +"</h3><br>");
		for(var i=0; i<rows.length; i++){
			if(rows[i].network == options.testbed){
				nodes.push(rows[i]);
			}
		}

		// Create the object tha will make the tab visualization
		var reserve = Object.create( Reservation );
		// Reservation object initialize					
		var reservation_settings = reserve.init();
		reservation_settings.parent = object;
		
		////// CREATE THE TABS  /////////////////		
		reservation_settings.subtestbed_id = "commel";
		reserve.subgroup(nodes, reservation_settings);
		reserve.display(reservation_settings);

		reservation_settings.subtestbed_id = "orbit";
		reserve.subgroup(nodes, reservation_settings);
		reserve.display(reservation_settings);

		reservation_settings.subtestbed_id = "diskless";
		reserve.subgroup(nodes, reservation_settings);
		reserve.display(reservation_settings);
		
 		/////////////////////////////////////////
        };// get_resources	
	       
    }// FUNCTION NITOScheduler

 // Global Varialble that holds my reservation
    jQuery.fn.ResourcesArray = [];
   

	$.fn.NITOSchedulerClass = function( options ) {
		return this.each(function() {
			self = this;
			// Take the options passed by the user
	                self.options = $.extend({}, options);
			
 			var s = new NITOScheduler(self.options);
			$(this).data('NITOScheduler', s);

			////////// 	QUERY	///////////

			// jQuery : selector of the Plugin
			var oPlugin = $('#'+ options.plugin_uuid);
			/* subscribe to channels */
			// to get all the resources from mySlice API
			var QUERY_RESOURCES   = '/query/' + self.options.query_uuid + '/changed';
			var RESULTS_RESOURCES = '/results/' + self.options.query_uuid + '/changed';
		        var UPDATE_RESOURCES = '/update-set/' + self.options.query_uuid + '/changed';
			var RESULTS_LEASES    = '/results/' + self.options.lease_query_uuid + '/changed';

			$.subscribe(RESULTS_RESOURCES, function(e, rows) { s.get_resources(rows, self.options); });			
			$.subscribe(RESULTS_RESOURCES, function(e, resources) { /*s.set_resources(resources);*/   });
		        $.subscribe(RESULTS_LEASES,    function(e, leases)    { s.get_leases(leases, self.options);});
		        $.subscribe(UPDATE_RESOURCES,  function(e, resources, instance) { s.update_resources(e,resources,instance); });

			///////////////////////////////////
	
		});
	};
     

})( jQuery, window, document );

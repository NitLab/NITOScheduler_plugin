/*
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
*/
jQuery.noConflict();
﻿jQuery(document).ready(function() {

    // DatePicker
    jQuery("#datepick").datepicker({
	showOn:'button',
	buttonImage:'/components/com_tophat/includes/plugins/NITOScheduler/icons/calendar-blue.gif',
	buttonText:'',
	minDate: new Date(),// show only the dates from today and future
	buttonImageOnly:true,
   	onSelect: function(value,currentDate){

		// Check if i am choosing the same date
		// if so return
		if(value == jQuery('#hidden_date').val())
		   return;

		// Each time you choose a date clear all the chosen slots
		// TODO:put/replace with your plugin tabs in here, like in the example		
		jQuery("#place_commel .slot").each(function(){
		  if(jQuery(this).hasClass("selectingSlot")){
		    jQuery(this).removeClass("selectingSlot");
		  }
		});
		
		jQuery("#place_grid .slot").each(function(){
		  if(jQuery(this).hasClass("selectingSlot")){
		    jQuery(this).removeClass("selectingSlot");
		  }
		});
		
		jQuery("#place_diskless .slot").each(function(){
		  if(jQuery(this).hasClass("selectingSlot")){
		    jQuery(this).removeClass("selectingSlot");
		  }
		});
		
		var resource_list = new Array();

		//////////////////////////////////////////////////////////////
		//  Find if i already have selected resources for this day  //
		//////////////////////////////////////////////////////////////
/*
		var table_plugin_id = jQuery('.plugin.ResourcesSelected').attr('id');
		jQuery('#table-' + table_plugin_id + ' tr:not(:first)').each(function(){
			jQuery('td',this).each(function(){
				jQuery('span',this).each(function(){

				      if(jQuery(this).attr('class')){
				        // do nothing
				      }else{
					 {// Force creation of new resource object
					  var resource = {node:'none', timeslot:'none', date:'none'};
					 
   					  resource.node = jQuery(this).attr('id').replace('resource_urn:','urn:');
					  if(jQuery(this).text() == "0" || jQuery(this).text() == "unknown"){
					     resource.timeslot = "0";
					     resource.date = "0";
					  }else{
					     // if i use .slice property the it creates an array
					     resource.timeslot = jQuery(this).text().split('+')[0];
					     resource.date = jQuery(this).text().split('+')[1];
					  }
					    resource_list.push(resource);
					 }  
				      }// else
				   
				});//each
			});//each
		});//each
*/	
		// Iterate through the selected items
		jQuery.each(jQuery.fn.ResourcesArray, function(idx,obj){
			/*jQuery.each(obj,function(key,value){
 			     console.log(key + ": " + value);
			});*/

			// Locate the timeslot if it exists
			if(obj.date == value){

			    jQuery(".node a[title='" + obj.node + "']").siblings('li').each(function(){
				if(jQuery("a[title='" + obj.timeslot + "']",this).text() == obj.timeslot){
	 			   jQuery(this).addClass('selectingSlot');			
				}
			    });				    
			}
		});
		


		// Change the value of the hidden date field
		jQuery("#hidden_date").val(value);
        },//on select
	onClose: function(value){ }
    });

});


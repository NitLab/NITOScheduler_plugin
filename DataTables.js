/**
 * MySlice DataTables plugin
 * Version: 0.1.0
 * URL: http://www.myslice.info
 * Description: Google maps display of geolocated data
 * Requires: 
 * Author: The MySlice Team
 * Copyright: Copyright 2012 UPMC Sorbonne Universités
 * License: GPLv3
 */

/*
 * It's a best practice to pass jQuery to an IIFE (Immediately Invoked Function
 * Expression) that maps it to the dollar sign so it can't be overwritten by
 * another library in the scope of its execution.
 */
(function( $ ){

    /***************************************************************************
     * Public methods
     ***************************************************************************/

    var methods = {

        /**
         * @brief Plugin initialization
         * @param options : an associative array of setting values
         * @return : a jQuery collection of objects on which the plugin is
         *     applied, which allows to maintain chainability of calls
         */
        init : function( options ) {

            /* Default settings */
            var options = $.extend( {
                'checkboxes': false
            }, options);

            return this.each(function() {
         
                var $this = $(this);

                /* Events */
                $(this).on('show.Datatables', methods.show);

                /* An object that will hold private variables and methods */
                /* An object that will hold private variables and methods */
                var s = new DataTables(options);
                $(this).data('DataTables', s);

                var QUERY_RESOURCES   = '/query/' + options.query_uuid + '/changed';
                var UPDATE_RESOURCES  = '/update-set/' + options.query_uuid;
                var RESULTS_RESOURCES = '/results/' + options.query_uuid + '/changed';

                $.subscribe(QUERY_RESOURCES,  function(e, query) { s.set_query(query); });;
                $.subscribe(UPDATE_RESOURCES, function(e, resources, instance) { s.set_resources(resources, instance); });
                $.subscribe(RESULTS_RESOURCES, function(e, rows) { s.update_table(rows); });

                /* TODO REMOVE */
//                $.subscribe('selected', {instance: $this}, selected_changed);

            }); // this.each
        }, // init

        /**
         * @brief Plugin desctruction
         * @return : a jQuery collection of objects on which the plugin is
         *     applied, which allows to maintain chainability of calls
         */
        destroy : function( ) {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('DataTables');

                // Unbind all events using namespacing
                $(window).unbind('DataTables');

                // Remove associated data
                data.DataTables.remove();
                $this.removeData('DataTables');
            });
        }, // destroy

        /**
         * @brief Plugin desctruction
         * @return : a jQuery collection of objects on which the plugin is
         *     applied, which allows to maintain chainability of calls
         */
        show : function( ) {
            var oTable = $($('.dataTable', jQuery(this))[1]).dataTable();
            oTable.fnAdjustColumnSizing()
    
            /* Refresh DataTables if click on the menu to display it : fix DataTables 1.9.x Bug */        
            $(this).each(function(i,elt) {
                if (jQuery(elt).hasClass('DataTables')) {
                    var myDiv=jQuery('#table-' + this.id).parent();
                    if(myDiv.height()==0) {
                        var oTable=$('#table-' + this.id).dataTable();            
                        oTable.fnDraw();
                    }
                }
            });
        } // show

    }; // var methods;


    /***************************************************************************
     * Method calling logic
     ***************************************************************************/

    /*
     * We add a new function property to the jQuery.fn object where the name of the property is the name of the 
     * plugin.
     */
    $.fn.DataTables = function( method ) {
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.DataTables' );
        }    
    };

    /***************************************************************************
     * DataTables object
     ***************************************************************************/
    
    function DataTables(options)
    {

        /* member variables */

        this.options = options;

        /* constructor */

        this.table = null;
        this.current_query = null;
        this.query_update = null;
        this.current_resources = Array(); // ioi: here the plugin sets the current resources array

        var object = this;


        /* Transforms the table into DataTable, and keep a pointer to it */
        this.table = $('#table-' + options.plugin_uuid).dataTable({
            // Customize the position of Datatables elements (length,filter,button,...)
            // inspired from : 
            // http://datatables.net/release-datatables/examples/advanced_init/dom_toolbar.html
            // http://www.datatables.net/forums/discussion/3914/adding-buttons-to-header-or-footer/p1
            //"sDom": 'lf<"#datatableSelectAll-'+ options.plugin_uuid+'">rtip',
            sDom: '<"H"Tfr>t<"F"ip>',
            bJQueryUI: true,
            sPaginationType: 'full_numbers',
            // Handle the null values & the error : Datatables warning Requested unknown parameter
            // http://datatables.net/forums/discussion/5331/datatables-warning-...-requested-unknown-parameter/p2
            aoColumnDefs: [{sDefaultContent: '',aTargets: [ '_all' ]}],
            bRetrieve: true,
            sScrollX: '100%',       /* Horizontal scrolling */
            bProcessing: true,      /* Loading */
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $(nRow).attr('id', get_value(aData[3]));
                return nRow;
            },
            fnDrawCallback: function() { datatables_draw_callback.call(object, options); }
        });

        /* Setup the SelectAll button in the dataTable header */
        var oSelectAll = $('#datatableSelectAll-'+ options.plugin_uuid);
        oSelectAll.html("<span class='ui-icon ui-icon-check' style='float:right;display:inline-block;'></span>Select All");
        oSelectAll.button();
        oSelectAll.css('font-size','11px');
        oSelectAll.css('float','right');
        oSelectAll.css('margin-right','15px');
        oSelectAll.css('margin-bottom','5px');
        oSelectAll.unbind('click');
        oSelectAll.click(selectAll);

        /* Spinner (could be done when the query is received = a query is in progress, also for update) */
        $('#' + options.plugin_uuid).spin()

        /* Add a filtering function to the current table 
         * Note: we use closure to get access to the 'options'
         */
        $.fn.dataTableExt.afnFiltering.push(function( oSettings, aData, iDataIndex ) { 
            /* No filtering if the table does not match */
            if (oSettings.nTable.id != "table-" + options.plugin_uuid)
                return true;
            return datatables_filter.call(object, oSettings, aData, iDataIndex);
        });


        /* methods */

        this.set_query = function(query)
        {
            var o = this.options;

            /* Compare current and advertised query to get added and removed fields */
            previous_query = this.current_query;

            /* Save the query as the current query */
            this.current_query = query;
            
            /* We check all necessary fields : in column editor I presume XXX */
            // XXX ID naming has no plugin_uuid
            if (typeof(query.fields) != 'undefined') {        
                $.each (query.fields, function(index, value) { 
                    if (!$('#datatables-checkbox-' + o.plugin_uuid + "-" + value).attr('checked'))
                        $('#datatables-checkbox-' + o.plugin_uuid + "-" + value).attr('checked', true);
                });
            }
            /*Process updates in filters / current_query must be updated before this call for filtering ! */
            this.table.fnDraw();

            /*
             * Process updates in fields
             */
            if (typeof(query.fields) != 'undefined') {     
                /* DataTable Settings */
                var oSettings = this.table.dataTable().fnSettings();
                var cols = oSettings.aoColumns;
                var colnames = cols.map(function(x) {return x.sTitle});
                colnames = $.grep(colnames, function(value) {return value != "+/-";});

                if (previous_query == null) {
                    var added_fields = query.fields;
                    var removed_fields = colnames;            
                    removed_fields = $.grep(colnames, function(x) { return $.inArray(x, added_fields) == -1});
                } else {
                    var tmp = previous_query.diff_fields(query);
                    var added_fields = tmp.added;
                    var removed_fields = tmp.removed;
                }

                /* Hide/unhide columns to match added/removed fields */
                var object = this;
                $.each(added_fields, function (index, field) {            
                    var index = object.getColIndex(field,cols);
                    if(index != -1)
                        object.table.fnSetColumnVis(index, true);
                });
                $.each(removed_fields, function (index, field) {
                    var index = object.getColIndex(field,cols);
                    if(index != -1)
                        object.table.fnSetColumnVis(index, false);
                });            
            }
        }

        this.set_resources = function(resources, instance)
        {
	    
            var o = this.options;
            var previous_resources = this.current_resources;
            this.current_resources = resources;

            /* We uncheck all checkboxes ... */
            $('datatables-checkbox-' + o.plugin_uuid).attr('checked', false);
            /* ... and check the ones specified in the resource list */
            $.each(this.current_resources, function(index, urn) {
                $('#datatables-checkbox-' + o.plugin_uuid + "-" + urn).attr('checked', true)
            });
            
        }

        /**
         * @brief Determine index of key in the table columns 
         * @param key
         * @param cols
         */
        this.getColIndex = function(key, cols)
        {
            var tabIndex = $.map(cols, function(x, i) { if (x.sTitle == key) return i; });
            return (tabIndex.length > 0) ? tabIndex[0] : -1;
        }
    
        /**
         * @brief
         * XXX will be removed/replaced
         */
        this.selected_changed = function(e, change)
        {
            var actions = change.split("/");
            if (actions.length > 1) {
                var oNodes = this.table.fnGetNodes();
                var myNode = $.grep(oNodes, function(value) {
                    if (value.id == actions[1]) { return value; }
                });                
                if( myNode.length>0 ) {
                    if ((actions[2]=="add" && actions[0]=="cancel") || actions[0]=="del")
                        checked='';
                    else
                        checked="checked='checked' ";
                    var newValue = this.checkbox(actions[1], 'node', checked, false);
                    var columnPos = this.table.fnSettings().aoColumns.length - 1;
                    this.table.fnUpdate(newValue, myNode[0], columnPos);
                    this.table.fnDraw();
                }
            }
        }
    
        /**
         * @brief
         * @param plugin_uuid
         * @param header
         * @param field 
         * @param selected_str
         * @param disabled_str
         */
        this.checkbox = function(plugin_uuid, header, field, selected_str, disabled_str)
        {
            /* Prefix id with plugin_uuid */
            return "<input class='datatables-checkbox-" + plugin_uuid + "' id='datatables-checkbox-" + plugin_uuid + "-" + get_value(header) + "' name='" + get_value(field) + "' type='checkbox' " + selected_str + disabled_str + "autocomplete='off' value='" + get_value(header) + "'></input>";
        }
    
        this.update_table = function(rows)
        {
            var o = this.options;
            var object = this;
    
            $('#' + o.plugin_uuid).spin(false)
            if (rows.length==0) {
                this.table.html(errorDisplay("No Result"));   
                return;
            } else {
                if (typeof(rows[0].error) != 'undefined') {
                    this.table.html(errorDisplay(rows[0].error));
                    return;
                }
            }
            newlines = new Array();
    
            this.current_resources = Array();
    
            $.each(rows, function(index, obj) {
                newline = new Array();
                // go through table headers to get column names we want
                // in order (we have temporarily hack some adjustments in names)
                var cols = object.table.fnSettings().aoColumns;
                var colnames = cols.map(function(x) {return x.sTitle})
                var nb_col = colnames.length;
                if (o.checkboxes)
                    nb_col -= 1;
                for (var j = 0; j < nb_col; j++) {
                    if (typeof colnames[j] == 'undefined') {
                        newline.push('...');
                    } else if (colnames[j] == 'hostname') {
                        if (obj['type'] == 'resource,link')
                            //TODO: we need to add source/destination for links
                            newline.push('');
                        else
                            newline.push(obj['hostname']);
                    } else {
                        if (obj[colnames[j]])
                            newline.push(obj[colnames[j]]);
                        else
                            newline.push('');
                    }
                }
    
                if (o.checkboxes) {
                    var checked = '';
                    if (typeof(obj['sliver']) != 'undefined') { /* It is equal to null when <sliver/> is present */
                        checked = 'checked ';
			// ioi: the following line adds the first object to the Modifications datatable.
			// Changed the input element from string to object
                        object.current_resources.push({node:obj['urn'], timeslot:0}); 
                    }
                    // Use a key instead of hostname (hard coded...)
                    newline.push(object.checkbox(o.plugin_uuid, obj['urn'], obj['type'], checked, false));
                }
    
                newlines.push(newline);
    
    
            });
    
            this.table.fnAddData(newlines);
    
        }
    

    }
    /***************************************************************************
     * Private methods
     ***************************************************************************/

    /** 
     * @brief Datatables filtering function
     */
    function datatables_filter(oSettings, aData, iDataIndex) {
        var cur_query = this.current_query;
        var ret = true;

        /* We have an array of filters : a filter is an array (key op val) 
         * field names (unless shortcut)    : oSettings.aoColumns  = [ sTitle ]
         *     can we exploit the data property somewhere ?
         * field values (unless formatting) : aData
         *     formatting should leave original data available in a hidden field
         *
         * The current line should validate all filters
         */
        $.each (cur_query.filter, function(index, filter) { 
            /* XXX How to manage checkbox ? */
            var key = filter[0]; 
            var op = filter[1];
            var value = filter[2];

            /* Determine index of key in the table columns */
            var col = $.map(oSettings.aoColumns, function(x, i) {if (x.sTitle == key) return i;})[0];

            /* Unknown key: no filtering */
            if (typeof(col) == 'undefined')
                return;

            col_value=get_value(aData[col]);
            /* Test whether current filter is compatible with the column */
            if (op == '=' || op == '==') {
                if ( col_value != value || col_value==null || col_value=="" || col_value=="n/a")
                    ret = false;
            }else if (op == '!=') {
                if ( col_value == value || col_value==null || col_value=="" || col_value=="n/a")
                    ret = false;
            } else if(op=='<') {
                if ( parseFloat(col_value) >= value || col_value==null || col_value=="" || col_value=="n/a")
                    ret = false;
            } else if(op=='>') {
                if ( parseFloat(col_value) <= value || col_value==null || col_value=="" || col_value=="n/a")
                    ret = false;
            } else if(op=='<=' || op=='≤') {
                if ( parseFloat(col_value) > value || col_value==null || col_value=="" || col_value=="n/a")
                    ret = false;
            } else if(op=='>=' || op=='≥') {
                if ( parseFloat(col_value) < value || col_value==null || col_value=="" || col_value=="n/a")
                    ret = false;
            }else{
                // How to break out of a loop ?
                alert("filter not supported");
                return false;
            }

        });
        return ret;
    }

    function datatables_draw_callback() 
    {
        var o = this.options;
        /* 
         * Handle clicks on checkboxes: reassociate checkbox click every time
         * the table is redrawn 
         */
        $('.datatables-checkbox-' + o.plugin_uuid).unbind('click');
        $('.datatables-checkbox-' + o.plugin_uuid).click({instance: this}, check_click);

        if (!this.table)
            return;

        /* Remove pagination if we show only a few results */
        var wrapper = this.table; //.parent().parent().parent();
        var rowsPerPage = this.table.fnSettings()._iDisplayLength;
        var rowsToShow = this.table.fnSettings().fnRecordsDisplay();
        var minRowsPerPage = this.table.fnSettings().aLengthMenu[0];

        if ( rowsToShow <= rowsPerPage || rowsPerPage == -1 ) {
            $('.dataTables_paginate', wrapper).css('visibility', 'hidden');
        } else {
            $('.dataTables_paginate', wrapper).css('visibility', 'visible');
        }

        if ( rowsToShow <= minRowsPerPage ) {
            $('.dataTables_length', wrapper).css('visibility', 'hidden');
        } else {
            $('.dataTables_length', wrapper).css('visibility', 'visible');
        }
    }

    function check_click (e) {
        var object = e.data.instance;
        var value = this.value;
	var data = {node:'none', timeslot:0}; // ioi
	data.node = value; // ioi

        if (this.checked) {
            //push new data
            // ioi:
	    object.current_resources.push(data); 
        } else {
	    // Remove the selected item from the resources selected
	    // Use combination of grep and map
	    // ioi:
	    tmp = $.grep(object.current_resources, function(x) { return x.node != data.node || x.timeslot != data.timeslot; });
            tmp_ = $.map(tmp, function(x) { return { node : x.node, timeslot : x.timeslot }; }); // ioi
	    object.current_resources = tmp_; 
	    // ioi
        }

        /* inform slice that our selected resources have changed */
        $.publish('/update-set/' + object.options.query_uuid, [object.current_resources, true]); // ioi

    }

    function selectAll() {
        // requires jQuery id
        var uuid=this.id.split("-");
        var oTable=$("#table-"+uuid[1]).dataTable();
        // Function available in DataTables 1.9.x
        // Filter : displayed data only
        var filterData = oTable._('tr', {"filter":"applied"});   
        /* TODO: WARNING if too many nodes selected, use filters to reduce nuber of nodes */        
        if(filterData.length<=100){
            $.each(filterData, function(index, obj) {
                var last=$(obj).last();
                var key_value=get_value(last[0]);
                if(typeof($(last[0]).attr('checked'))=="undefined"){
                    $.publish('selected', 'add/'+key_value);
                }
            });
        }
    }
    
})( jQuery );

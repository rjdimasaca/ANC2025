/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 *
 * Author       :       Rodmar Dimasaca / rod@joycloud.solutions / netrodsuite@gmail.com
 * Description  :       For ANC
 * File Name    :       ANC_SL_MINIMIZE_UI.js
 * Script Name  :       ANC SL MINIMIZE UI
 * Script Id    :       customscript_sl_minimize_ui
 * Deployment Id:       customdeploy_sl_minimize_ui
 * API Version  :       2.1
 * version      :       1.0.0
 */
define(['N/record', 'N/runtime', 'N/search', 'N/url', 'N/ui/serverWidget'],
    /**
     * @param{runtime} runtime
     * @param{search} search
     * @param{url} url
     */
    (record, runtime, search, url, uiSw) => {

        var globalrefs = {};
        var fitmentLineLimit = 2;
        var allowMultiGrade = false;
        var DEBUGMODE = false;
        var accountId = "";

        var uiSublistId = "custpage_itemfitmentandreservation";

        var elements = {};
        var globalrefs = {};


        const addElements = (scriptContext, form) => {
            elements = {
                "warehouse_and_logistics" : {
                    title : "Warehouse and Logistics",
                    bodyfieldgroups : {
                        list : [
                            {
                                id: "custpage_flgroup_source",
                                label: "Source"
                            },
                            {
                                id: "custpage_flgroup_input",
                                label: "Input"
                            }
                        ]
                    },
                    bodyfields : {
                        list : [
                            {
                                label : "Source",
                                type : "select",
                                id : "custpage_traninternalid",
                                source : "salesorder",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tran_internalid",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Item",
                                type : "select",
                                id : "custpage_tranlineitem",
                                source : "item",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_item",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Line Sequence",
                                type : "integer",
                                id : "custpage_tranlinesequence",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linesequence",
                                displayType : {
                                    displayType: "inline"
                                },
                            },
                            {
                                label : "Line Num",
                                type : "integer",
                                id : "custpage_tranlinenum",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linenum",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Origin Warehouse",
                                type : "select",
                                id : "custpage_tranlineoriginwhse",
                                source : "location",
                                container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_location",
                                displayType : {
                                    displayType: "entry"
                                }
                            },
                            {
                                label : "Transit Warehouse",
                                type : "select",
                                id : "custpage_tranlinetransitwhse",
                                source : "location",
                                container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_transitlocation",
                                displayType : {
                                    displayType: "entry"
                                }
                            },
                            {
                                label : "Transit Time",
                                type : "integer",
                                id : "custpage_tranlinetransittime",
                                container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_transittime",
                                displayType : {
                                    displayType: "entry"
                                }
                            },
                            {
                                label : "Transit Optimization Method",
                                type : "select",
                                id : "custpage_tranlinetransittom",
                                source : "customlist_anc_transitoptmethods",
                                container: "custpage_flgroup_input",
                                displayType : {
                                    displayType: "entry"
                                }
                            },
                        ]
                    },
                    sublists : {
                        list : [

                        ]
                    },
                    searchFilters : [
                        ["type","anyof","SalesOrd"],
                        "AND",
                        ["mainline","is","F"],
                    ],
                    searchColumns: [
                        search.createColumn({name: "internalid", label: "tran_internalid"}),
                        search.createColumn({name: "mainname", label: "tran_customer"}),
                        search.createColumn({name: "item", label: "tranline_item"}),
                        search.createColumn({name: "linesequencenumber", label: "tranline_linesequence"}),
                        search.createColumn({name: "line", label: "tranline_linenum"}),
                        search.createColumn({name: "location", label: "tranline_location"}),
                        search.createColumn({name: "location", label: "tranline_transitlocation"}),
                        search.createColumn({
                            name: "formulanumeric",
                            formula: "600",
                            label: "tranline_transittime"
                        }),
                        search.createColumn({
                            name: "formuladate",
                            formula: "{shipdate}",
                            label: "tranline_ldc_date"
                        }),
                        search.createColumn({
                            name: "formuladate",
                            formula: "{trandate}",
                            label: "tranline_pressrun_date"
                        }),
                        search.createColumn({
                            name: "formuladate",
                            formula: "{shipdate}",
                            label: "tranline_ship_date"
                        }),
                        search.createColumn({
                            name: "formuladate",
                            formula: "{shipdate}",
                            label: "tranline_production_date"
                        }),
                        search.createColumn({
                            name: "formuladate",
                            formula: "{custcol_anc_deliverydate}",
                            label: "tranline_delivery_date"
                        })
                    ]
                },
                "orderquantity_and_inventorystatus" : {
                    title : "Order Quantity and Inventory Status",
                    bodyfieldgroups : {
                        list : [
                            {
                                id: "custpage_flgroup_source",
                                label: "Source"
                            },
                            {
                                id: "custpage_flgroup_details",
                                label: "Details"
                            },
                            {
                                id: "custpage_flgroup_input",
                                label: "Input"
                            }
                        ]
                    },
                    bodyfields : {
                        list : [
                            {
                                label : "Source",
                                type : "select",
                                id : "custpage_traninternalid",
                                source : "salesorder",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tran_internalid",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Item",
                                type : "select",
                                id : "custpage_tranlineitem",
                                source : "item",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_item",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Line Sequence",
                                type : "integer",
                                id : "custpage_tranlinesequence",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linesequence",
                                displayType : {
                                    displayType: "inline"
                                },
                            },
                            {
                                label : "Line Num",
                                type : "integer",
                                id : "custpage_tranlinenum",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linenum",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Expected Tonnage",
                                type : "float",
                                id : "custpage_tranlineexpectedtonnage",
                                container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_expectedtonnage",
                                displayType : {
                                    displayType: "entry"
                                }
                            },
                            {
                                label : "Total Rolls",
                                type : "integer",
                                id : "custpage_tranlinetotalrolls",
                                container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_totalrolls",
                                displayType : {
                                    displayType: "entry"
                                }
                            },
                            {
                                label : "Rolls Onhand",
                                type : "integer",
                                id : "custpage_tranlinerollsonhand",
                                container: "custpage_flgroup_details",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Reserved Rolls(Commit)",
                                type : "integer",
                                id : "custpage_tranlinereservedrolls",
                                container: "custpage_flgroup_details",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Backorder Rolls(Commit)",
                                type : "integer",
                                id : "custpage_tranlinebackorderrolls",
                                container: "custpage_flgroup_details",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                        ]
                    },
                    sublists : {
                        list : [

                        ]
                    },
                    searchFilters : [
                        ["type","anyof","SalesOrd"],
                        "AND",
                        ["mainline","is","F"],
                    ],
                    searchColumns: [
                        search.createColumn({name: "internalid", label: "tran_internalid"}),
                        search.createColumn({name: "mainname", label: "tran_customer"}),
                        search.createColumn({name: "item", label: "tranline_item"}),
                        search.createColumn({name: "linesequencenumber", label: "tranline_linesequence"}),
                        search.createColumn({name: "line", label: "tranline_linenum"}),
                        search.createColumn({name: "location", label: "tranline_location"}),
                        search.createColumn({name: "location", label: "tranline_transitlocation"}),
                        search.createColumn({name: "custcol_anc_expectedtonnage", label: "tranline_expectedtonnage"}),
                        search.createColumn({name: "custcol_anc_totalrolls", label: "tranline_totalrolls"}),
                    ]
                },
                "product_and_packaging" : {
                    title : "Product and Packaging",
                    bodyfieldgroups : {
                        list : [
                            {
                                id: "custpage_flgroup_source",
                                label: "Source"
                            },
                            {
                                id: "custpage_flgroup_input",
                                label: "Input"
                            }
                        ]
                    },
                    bodyfields : {
                        list : [
                            {
                                label : "Source",
                                type : "select",
                                id : "custpage_traninternalid",
                                source : "salesorder",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tran_internalid",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Item",
                                type : "select",
                                id : "custpage_tranlineitem",
                                source : "item",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_item",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Line Sequence",
                                type : "integer",
                                id : "custpage_tranlinesequence",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linesequence",
                                displayType : {
                                    displayType: "inline"
                                },
                            },
                            {
                                label : "Line Num",
                                type : "integer",
                                id : "custpage_tranlinenum",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linenum",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Rolls Per Pack",
                                type : "integer",
                                id : "custpage_tranlinerollsperpack",
                                container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_rollsperpack",
                                displayType : {
                                    displayType: "entry"
                                }
                            },
                            {
                                label : "Wrap Type",
                                type : "select",
                                id : "custpage_tranlinewraptype",
                                source : "customlist_anc_wraptypes",
                                container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_wraptype",
                                displayType : {
                                    displayType: "entry"
                                }
                            },
                        ]
                    },
                    sublists : {
                        list : [

                        ]
                    },
                    searchFilters : [
                        ["type","anyof","SalesOrd"],
                        "AND",
                        ["mainline","is","F"],
                    ],
                    searchColumns: [
                        search.createColumn({name: "internalid", label: "tran_internalid"}),
                        search.createColumn({name: "mainname", label: "tran_customer"}),
                        search.createColumn({name: "item", label: "tranline_item"}),
                        search.createColumn({name: "linesequencenumber", label: "tranline_linesequence"}),
                        search.createColumn({name: "line", label: "tranline_linenum"}),
                        search.createColumn({name: "location", label: "tranline_location"}),
                        search.createColumn({name: "location", label: "tranline_transitlocation"}),
                        search.createColumn({name: "custcol_anc_rollsperpack", label: "tranline_rollsperpack"}), //TODO there is custcol_wm_rollsperpack
                        search.createColumn({name: "custcol_anc_wraptype", label: "tranline_wraptype"})
                    ]
                },
                "customer_and_shipping" : {
                    title : "Customer and Shipping",
                    bodyfieldgroups : {
                        list : [
                            {
                                id: "custpage_flgroup_source",
                                label: "Origin"
                            },
                            {
                                id: "custpage_flgroup_input",
                                label: "Input"
                            }
                        ]
                    },
                    bodyfields : {
                        list : [
                            {
                                label : "Source",
                                type : "select",
                                id : "custpage_traninternalid",
                                source : "salesorder",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tran_internalid",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Item",
                                type : "select",
                                id : "custpage_tranlineitem",
                                source : "item",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_item",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Line Sequence",
                                type : "integer",
                                id : "custpage_tranlinesequence",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linesequence",
                                displayType : {
                                    displayType: "inline"
                                },
                            },
                            {
                                label : "Line Num",
                                type : "integer",
                                id : "custpage_tranlinenum",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linenum",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            // {
                            //     label : "Customer Address",
                            //     type : "select",
                            //     id : "custpage_tranlinecustomeraddress",
                            //     source : "addressbook",
                            //     container: "custpage_flgroup_input",
                            //     displayType : {
                            //         displayType: "entry"
                            //     }
                            // },
                            {
                                label : "Customer Agreement",
                                type : "select",
                                id : "custpage_tranlinecustomeragreement",
                                source : "customrecord_anc_customeragreement",
                                container: "custpage_flgroup_input",
                                displayType : {
                                    displayType: "entry"
                                }
                            },
                            {
                                label : "Shipping Lane",
                                type : "select",
                                id : "custpage_tranlinelaneid",
                                source : "customrecord_anc_shippinglanes",
                                container: "custpage_flgroup_input",
                                displayType : {
                                    displayType: "entry"
                                }
                            },

                        ]
                    },
                    sublists : {
                        list : [

                        ]
                    },
                    searchFilters : [
                        ["type","anyof","SalesOrd"],
                        "AND",
                        ["mainline","is","F"],
                    ],
                    searchColumns: [
                        search.createColumn({name: "internalid", label: "tran_internalid"}),
                        search.createColumn({name: "mainname", label: "tran_customer"}),
                        search.createColumn({name: "item", label: "tranline_item"}),
                        search.createColumn({name: "linesequencenumber", label: "tranline_linesequence"}),
                        search.createColumn({name: "line", label: "tranline_linenum"}),
                        search.createColumn({name: "location", label: "tranline_location"}),
                        search.createColumn({name: "location", label: "tranline_transitlocation"}),
                        search.createColumn({name: "custcol_anc_rollsperpack", label: "tranline_rollsperpack"}), //TODO there is custcol_wm_rollsperpack
                        search.createColumn({name: "custcol_anc_wraptype", label: "tranline_wraptype"})
                    ]
                },
                "scheduling_and_keydates" : {
                    title : "Scheduling and Key Dates",
                    bodyfieldgroups : {
                        list : [
                            {
                                id: "custpage_flgroup_source",
                                label: "Origin"
                            },
                            {
                                id: "custpage_flgroup_input",
                                label: "Input"
                            }
                        ]
                    },
                    bodyfields : {
                        list : [
                            {
                                label : "Source",
                                type : "select",
                                id : "custpage_traninternalid",
                                source : "salesorder",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tran_internalid",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Item",
                                type : "select",
                                id : "custpage_tranlineitem",
                                source : "item",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_item",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Line Sequence",
                                type : "integer",
                                id : "custpage_tranlinesequence",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linesequence",
                                displayType : {
                                    displayType: "inline"
                                },
                            },
                            {
                                label : "Line Num",
                                type : "integer",
                                id : "custpage_tranlinenum",
                                container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linenum",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            // {
                            //     label : "Customer Address",
                            //     type : "select",
                            //     id : "custpage_tranlinecustomeraddress",
                            //     source : "addressbook",
                            //     container: "custpage_flgroup_input",
                            //     displayType : {
                            //         displayType: "entry"
                            //     }
                            // },
                            {
                                label : "LDC Date",
                                type : "date",
                                id : "custpage_tranlinecustomeragreement",
                                source : "customrecord_anc_customeragreement",
                                container: "custpage_flgroup_input",
                                displayType : {
                                    displayType: "entry"
                                }
                            },
                            {
                                label : "Ship Date",
                                type : "date",
                                id : "custpage_tranlineshipdate",
                                container: "custpage_flgroup_input",
                                displayType : {
                                    displayType: "entry"
                                }
                            },
                            {
                                label : "Press Run Date(Production Print Date)",
                                type : "date",
                                id : "custpage_tranlinepressrundate",
                                container: "custpage_flgroup_input",
                                displayType : {
                                    displayType: "entry"
                                }
                            },
                            {
                                label : "Production Date",
                                type : "date",
                                id : "custpage_tranlineproductiondate",
                                container: "custpage_flgroup_input",
                                displayType : {
                                    displayType: "entry"
                                }
                            },

                        ]
                    },
                    sublists : {
                        list : [

                        ]
                    },
                    searchFilters : [
                        ["type","anyof","SalesOrd"],
                        "AND",
                        ["mainline","is","F"],
                    ],
                    searchColumns: [
                        search.createColumn({name: "internalid", label: "tran_internalid"}),
                        search.createColumn({name: "mainname", label: "tran_customer"}),
                        search.createColumn({name: "item", label: "tranline_item"}),
                        search.createColumn({name: "linesequencenumber", label: "tranline_linesequence"}),
                        search.createColumn({name: "line", label: "tranline_linenum"}),
                        search.createColumn({name: "location", label: "tranline_location"}),
                        search.createColumn({name: "location", label: "tranline_transitlocation"}),
                        search.createColumn({name: "custcol_anc_rollsperpack", label: "tranline_rollsperpack"}), //TODO there is custcol_wm_rollsperpack
                        search.createColumn({name: "custcol_anc_wraptype", label: "tranline_wraptype"})
                    ]
                }
            }
        }

        const onRequest = (scriptContext) =>
        {
            accountId = runtime.accountId;
            try
            {
                if(accountId == "1116623-sb2" || accountId == "1116623-SB2" || accountId == "1116623_SB2" || accountId == "1116623_SB2")
                {
                    log.debug("SANDBOX");
                }
                else
                {
                    log.debug("NON SANDBOX");
                }

                if(scriptContext.request.method == "GET") {


                    addElements(scriptContext, form);

                    // log.debug("scriptContext.request.parameters.minimizeui", scriptContext.request.parameters.minimizeui);
                    //
                    // log.debug("elements", elements);

                    log.debug("elements[scriptContext.request.parameters.minimizeui]", elements[scriptContext.request.parameters.minimizeui]);

                    var form = uiSw.createForm({
                        title: elements[scriptContext.request.parameters.minimizeui].title,
                        hideNavBar: true
                    })


                    form.clientScriptModulePath = './ANC_CS_MINIMIZE_UI.js'


                    var sourceValSearchObj = null;
                    var firstResult = {};
                    //search and source the values
                    if(scriptContext.request.parameters.traninternalid && scriptContext.request.parameters.tranlinenum)
                    {
                        var searchFilters = [];
                        if(elements[scriptContext.request.parameters.minimizeui] &&
                            elements[scriptContext.request.parameters.minimizeui].searchFilters &&
                            elements[scriptContext.request.parameters.minimizeui].searchFilters.length > 0)
                        {
                            searchFilters = elements[scriptContext.request.parameters.minimizeui].searchFilters;
                        }

                        searchFilters.push("AND")
                        searchFilters.push(["internalid", "anyof", scriptContext.request.parameters.traninternalid])
                        searchFilters.push("AND")
                        searchFilters.push(["line", "equalto", scriptContext.request.parameters.tranlinenum])

                        log.debug("searchFilters", searchFilters);

                        sourceValSearchObj = search.create({
                            type: "salesorder",
                            settings:[{"name":"consolidationtype","value":"ACCTTYPE"}],
                            filters : searchFilters,
                            columns : elements[scriptContext.request.parameters.minimizeui].searchColumns,
                        })

                        var sr = getResults(sourceValSearchObj.run())

                        for(var a = 0 ; a < sr.length ; a++)
                        {
                            var res = sr[a];

                            var columns = res.columns;

                            var resObjByColumnKey = {}
                            columns.forEach(function(column) {
                                var label = column.label || column.name; // Fallback to name if label is unavailable
                                var value = res.getValue(column);
                                var text = res.getText(column);
                                resObjByColumnKey[label] = {value, text};
                            });

                            resObjByColumnKey.id = {value:res.id, text : res.id};
                            log.debug("resObjByColumnKey", resObjByColumnKey);
                            firstResult = resObjByColumnKey;
                            break;
                        }


                    }




                    for(var a = 0 ; a < elements[scriptContext.request.parameters.minimizeui].bodyfieldgroups.list.length ; a++)
                    {
                        var widgetObj = elements[scriptContext.request.parameters.minimizeui].bodyfieldgroups.list[a];
                        var uiWidgetObj = form.addFieldGroup(widgetObj);

                        globalrefs["uiWidgetObj_" + widgetObj.id] = uiWidgetObj;
                    }
                    for(var a = 0 ; a < elements[scriptContext.request.parameters.minimizeui].bodyfields.list.length ; a++)
                    {
                        var widgetObj = elements[scriptContext.request.parameters.minimizeui].bodyfields.list[a];
                        var uiWidgetObj = form.addField(widgetObj);
                        if(widgetObj.displayType)
                        {
                            uiWidgetObj.updateDisplayType(widgetObj.displayType)
                        }
                        if(widgetObj.defaultValue || widgetObj.defaultValue == "0" || widgetObj.defaultValue === false)
                        {
                            uiWidgetObj.defaultValue = widgetObj.defaultValue
                        }

                        if(firstResult && widgetObj.sourceSearchKey || widgetObj.sourceSearchKey == "0" || widgetObj.sourceSearchKey === false)
                        {
                            // uiWidgetObj.defaultValue = widgetObj.defaultValue
                            uiWidgetObj.defaultValue = firstResult[widgetObj.sourceSearchKey].value;
                            log.debug("set value firstResult[widgetObj.sourceSearchKey]", firstResult[widgetObj.sourceSearchKey])
                        }



                        globalrefs["uiWidgetObj_" + widgetObj.id] = uiWidgetObj;
                    }


                    form.addSubmitButton({
                        label : "Submit Line"
                    })

                    scriptContext.response.writePage(form);
                }
                else
                {
                    log.debug("POST, Submitted", scriptContext);

                }
            }
            catch(e)
            {
                log.error("ERROR in function onRequest", e);
            }
        }

        function getInputDetails(scriptContext, fitmentReservationSublist)
        {
            try
            {
                var filters = [
                    ["type","anyof","SalesOrd"],
                    "AND",
                    ["mainline","is","F"],
                    "AND",
                    ["taxline","is","F"],
                ];

                if(scriptContext.request.parameters["traninternalid"])
                {
                    filters.push("AND")
                    filters.push(["internalid","anyof",scriptContext.request.parameters["traninternalid"]])
                }
                if(scriptContext.request.parameters["tranlinenum"])
                {
                    filters.push("AND")
                    filters.push(["line","equalto",scriptContext.request.parameters["tranlinenum"]])
                }

                log.debug("filters", filters)

                var salesorderSearchObj = search.create({
                    type: "salesorder",
                    settings:[{"name":"consolidationtype","value":"ACCTTYPE"}],
                    filters: filters,
                    columns:
                        [
                            search.createColumn({name: "statusref", label: "status"}),
                            search.createColumn({name: "mainname", label: "entity"}),
                            search.createColumn({name: "item", label: "line_item"}),
                            search.createColumn({
                                name: "parent",
                                join: "item",
                                label: "line_item_parent"
                            }),
                            search.createColumn({
                                name: "cseg1",
                                join: "item",
                                label: "line_item_grade"
                            }),
                            search.createColumn({name: "quantity", label: "line_quantity"}),
                            search.createColumn({name: "location", label: "line_location"}),
                            search.createColumn({name: "line", label: "line_id"}),
                            search.createColumn({name: "linesequencenumber", label: "line_sequencenumber"}),
                            search.createColumn({name: "lineuniquekey", label: "line_uniquekey"}),
                            search.createColumn({name: "custcol_svb_vend_bill_lineno", label: "line_number"}),
                            search.createColumn({name: "custcol_010linememoinstruction", label: "line_memo"})
                        ]
                });
                var searchResultCount = salesorderSearchObj.runPaged().count;
                log.debug("salesorderSearchObj result count",searchResultCount);
                // salesorderSearchObj.run().each(function(result){
                //     // .run().each has a limit of 4,000 results
                //     return true;
                // });

                var sr = getResults(salesorderSearchObj.run());

                for(var a = 0 ; a < sr.length ; a++)
                {
                    var res = sr[a];

                    var columns = res.columns;

                    var resObjByColumnKey = {}
                    columns.forEach(function(column) {
                        var label = column.label || column.name; // Fallback to name if label is unavailable
                        var value = res.getValue(column);
                        resObjByColumnKey[label] = value;
                    });

                    resObjByColumnKey.id = res.id
                    log.debug("resObjByColumnKey", resObjByColumnKey)

                    var fitmentResponse = getFitmentResponse(scriptContext);

                        // custpage_ifr_percentage
                        // custpage_ifr_weightplanned
                        // custpage_ifr_loadnum
                        // custpage_ifr_location
                    var multiGradeIndex = 0;
                    for(var b = 0; b < fitmentLineLimit; b++)
                    {
                        if(resObjByColumnKey.line_item)
                        {
                            fitmentReservationSublist.setSublistValue({
                                id : "custpage_ifr_item",
                                line : multiGradeIndex || b,
                                value : resObjByColumnKey.line_item || globalrefs.tranItemVals.itemid
                            })
                        }
                        if(resObjByColumnKey.line_location)
                        {
                            fitmentReservationSublist.setSublistValue({
                                id : "custpage_ifr_location",
                                line : multiGradeIndex || b,
                                value : resObjByColumnKey.line_location
                            })
                        }

                        // loadid: "17424",
                        //     loadnumber: "4",
                        // weightplanned: "weight planned",
                        // percentage: "34.567"
                        if(fitmentResponse.list[b] && fitmentResponse.list[b].loadid)
                        {
                            fitmentReservationSublist.setSublistValue({
                                id : "custpage_ifr_loadid",
                                line : multiGradeIndex || b,
                                value : fitmentResponse.list[b].loadid
                            })
                        }
                        if(fitmentResponse.list[b] && fitmentResponse.list[b].loadnumber)
                        {
                            fitmentReservationSublist.setSublistValue({
                                id : "custpage_ifr_loadnum",
                                line : multiGradeIndex || b,
                                value : fitmentResponse.list[b].loadnumber
                            })
                        }
                        if(fitmentResponse.list[b] && fitmentResponse.list[b].weightplanned)
                        {
                            fitmentReservationSublist.setSublistValue({
                                id : "custpage_ifr_weightplanned",
                                line : multiGradeIndex || b,
                                value : fitmentResponse.list[b].weightplanned
                            })
                        }
                        if(fitmentResponse.list[b] && fitmentResponse.list[b].percentage)
                        {
                            fitmentReservationSublist.setSublistValue({
                                id : "custpage_ifr_percentage",
                                line : multiGradeIndex || b,
                                value : fitmentResponse.list[b].percentage
                            })
                        }
                        if(allowMultiGrade)
                        {
                            multiGradeIndex++;
                        }
                    }
                }

            }
            catch(e)
            {
                log.error("ERROR in function getInputDetails", e)
            }
        }

        function fillSublist(scriptContext, fitmentReservationSublist)
        {
            var inputDetails = getInputDetails(scriptContext, fitmentReservationSublist)


            // fitmentReservationSublist
        }

        function getFitmentResponse(scriptContext)
        {
            var fitmentResponse = {
                list : []
            };
            try
            {
                var fitmentObj = {
                    loadid: "1",
                    loadnumber: "1",
                    weightplanned: "weight planned",
                    percentage: "10",
                };
                fitmentResponse.list.push(fitmentObj)

                var fitmentObj = {
                    loadid: "17424",
                    loadnumber: "4",
                    weightplanned: "weight planned",
                    percentage: "34.567",
                };
                fitmentResponse.list.push(fitmentObj)
            }
            catch(e)
            {
                log.error("ERROR in function getFitmentResponse", e);
            }
            return fitmentResponse;
        }

        function getFitmentResponse(scriptContext)
        {
            var fitmentResponse = {
                list : []
            };
            try
            {
                var fitmentObj = {
                    loadid: "1",
                    loadnumber: "1",
                    weightplanned: "weight planned",
                    percentage: "10",
                };
                fitmentResponse.list.push(fitmentObj)

                var fitmentObj = {
                    loadid: "17424",
                    loadnumber: "4",
                    weightplanned: "weight planned",
                    percentage: "34.567",
                };
                fitmentResponse.list.push(fitmentObj)
            }
            catch(e)
            {
                log.error("ERROR in function getFitmentResponse", e);
            }
            return fitmentResponse;
        }

        const toMDY = (dateVal) => {
            var retVal = dateVal;
            try
            {
                if(dateVal)
                {
                    retVal = new Date(retVal);
                }

            }
            catch(e)
            {
                log.error("ERROR in function toMDY", e)
            }
            log.debug("retVal", retVal)
            return retVal;
        }


        function groupBy(array, key) {
            return array.reduce(function (acc, obj) {
                let groupKey = obj[key];
                acc[groupKey] = acc[groupKey] || [];
                acc[groupKey].push(obj);
                return acc;
            }, {});
        }

        var getResults = function getResults(set) {
            var holder = [];
            var i = 0;
            while (true) {
                var result = set.getRange({
                    start: i,
                    end: i + 1000
                });
                if (!result) break;
                holder = holder.concat(result);
                if (result.length < 1000) break;
                i += 1000;
            }
            return holder;
        };

        function convertArrayToConcat(arr, headerquantity)
        {
            var str = "";
            var newArr = [];


            var newArr = arr.map(function(elem){
                return elem.itemQty / (headerquantity || 1) + "-" + elem.itemText
            })
            str = newArr.join(",")

            return str;
        }

        return {
            onRequest: onRequest
        };

    });




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
define(['N/record', 'N/runtime', 'N/search', 'N/url', 'N/ui/serverWidget', 'N/redirect'],
    /**
     * @param{runtime} runtime
     * @param{search} search
     * @param{url} url
     */
    (record, runtime, search, url, uiSw, redirect) => {

        var globalrefs = {};
        var fitmentLineLimit = 2;
        var allowMultiGrade = false;
        var DEBUGMODE = false;
        var accountId = "";

        var uiSublistId = "custpage_itemfitmentandreservation";

        var elements = {};
        var globalrefs = {};
        var minimize_ui_processid = "";


        const getElements = (scriptContext) => {
            elements = {
                "warehouse_and_logistics" : {
                    title : "Logistics",
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
                                label : "Minimize UI / Process Id",
                                type : "text",
                                id : "custpage_minimizeui",
                                //container: "custpage_flgroup_source",
                                defaultValue:scriptContext.request.parameters.minimizeui || scriptContext.request.parameters.processid || scriptContext.request.parameters.custpage_minimizeui,
                                displayType : {
                                    displayType: "hidden"
                                }
                            },
                            {
                                label : "Source",
                                type : "select",
                                id : "custpage_traninternalid",
                                source : "salesorder",
                                //container: "custpage_flgroup_source",
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
                                //container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_item",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Line Sequence",
                                type : "integer",
                                id : "custpage_tranlinesequence",
                                //container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linesequence",
                                displayType : {
                                    displayType: "inline"
                                },
                            },
                            {
                                label : "Line Num",
                                type : "integer",
                                id : "custpage_tranlinenum",
                                //container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linenum",
                                displayType : {
                                    // displayType: "inline",
                                    displayType: "hidden"
                                }
                            },

                            {
                                label : "Shipping Lane",
                                type : "select",
                                id : "custpage_tranlinelaneid",
                                source : "customrecord_anc_shippinglanes",
                                sourceSearchKey : "tranline_shippinglane",
                                //container: "custpage_flgroup_input",
                                displayType : {
                                    displayType: "inline"
                                },
                                updateBreakType : {
                                    breakType : uiSw.FieldBreakType.STARTCOL
                                }
                            },
                            {
                                label : "Origin Warehouse",
                                type : "select",
                                id : "custpage_tranlineoriginwhse",
                                source : "location",
                                //container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_location",
                                targetColumnId : "location",
                                displayType : {
                                    displayType: "inline"
                                },
                            },
                            {
                                label : "Transit Warehouse",
                                type : "select",
                                id : "custpage_tranlinetransitwhse",
                                source : "location",
                                //container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_transitlocation",
                                targetColumnId : "custcol_anc_transitlocation",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Transit Time",
                                type : "integer",
                                id : "custpage_tranlinetransittime",
                                //container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_transittime",
                                targetColumnId : "custcol_anc_transittime",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Transit Optimization Method",
                                type : "select",
                                id : "custpage_tranlinetransittom",
                                source : "customlist_anc_transitoptmethods",
                                sourceSearchKey:"tranline_transitoptmethod",
                                targetColumnId : "custcol_anc_transitoptmethod",
                                //container: "custpage_flgroup_input",
                                displayType : {
                                    displayType: "entry"
                                }
                            },
                            {
                                label : "Equipment",
                                type : "select",
                                id : "custpage_tranlineequipment",
                                source : "customrecord_anc_equipment",
                                sourceSearchKey:"tranline_equipment",
                                targetColumnId : "custcol_anc_equipment",
                                //container: "custpage_flgroup_input",
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
                        search.createColumn({name: "custcol_anc_transitlocation", label: "tranline_transitlocation"}),
                        search.createColumn({name: "location", label: "tranline_laneoriginwarehouse"}),
                        search.createColumn({
                            name: "formulanumeric",
                            formula: "600",
                            label: "tranline_transittime"
                        }),
                        search.createColumn({name: "custcol_anc_ldcdate", label: "tranline_ldc_date"}),
                        search.createColumn({name: "custcol_anc_pressrundate", label: "tranline_pressrun_date"}),
                        search.createColumn({
                            name: "formuladate",
                            formula: "{custcol_anc_shipdate}",
                            label: "tranline_ship_date"
                        }),
                        search.createColumn({name: "shipdate", label: "tranline_stndship_date"}),
                        search.createColumn({name: "custcol_anc_productiondate", label: "tranline_production_date"}),
                        search.createColumn({
                            name: "formuladate",
                            formula: "{custcol_anc_deliverydate}",
                            label: "tranline_delivery_date"
                        }),
                        search.createColumn({name: "custcol_anc_pressrundate", label: "tranline_pressrundate"}),
                        search.createColumn({name: "custcol_anc_expectedtonnage", label: "tranline_expectedtonnage"}),
                        search.createColumn({name: "custcol_anc_totalrolls", label: "tranline_totalrolls"}),
                        search.createColumn({name: "custcol_anc_rollsperpack", label: "tranline_rollsperpack"}),
                        search.createColumn({name: "custcol_anc_wraptype", label: "tranline_wraptype"}),
                        search.createColumn({
                            name: "locationquantityavailable",
                            join: "item",
                            label: "tranline_availablequantity"
                        }),
                        search.createColumn({name: "custcol_anc_shippinglane", label: "tranline_shippinglane"}),
                        search.createColumn({name: "custcol_anc_rollsonhand", label: "tranline_rollsonhand"}),
                        search.createColumn({name: "custcol_anc_reservedrolls", label: "tranline_reservedrolls"}),
                        search.createColumn({name: "custcol_anc_backorderrolls", label: "tranline_backorderrolls"}),
                        search.createColumn({name: "custcol_anc_equipment", label: "tranline_equipment"}),
                        search.createColumn({name: "custcol_anc_transitoptmethod", label: "tranline_transitoptmethod"}),
                        search.createColumn({name: "custcol_anc_transittime", label: "tranline_transittime"}),
                        search.createColumn({name: "custcol_consignee", label: "tranline_consignee"})
                    ]
                },
                "orderquantity_and_inventorystatus" : {
                    title : "Inventory",
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
                                label : "Minimize UI / Process Id",
                                type : "text",
                                id : "custpage_minimizeui",
                                //container: "custpage_flgroup_source",
                                defaultValue:scriptContext.request.parameters.minimizeui || scriptContext.request.parameters.processid || scriptContext.request.parameters.custpage_minimizeui,
                                displayType : {
                                    displayType: "hidden"
                                }
                            },
                            {
                                label : "Source",
                                type : "select",
                                id : "custpage_traninternalid",
                                source : "salesorder",
                                //container: "custpage_flgroup_source",
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
                                //container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_item",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Line Sequence",
                                type : "integer",
                                id : "custpage_tranlinesequence",
                                //container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linesequence",
                                displayType : {
                                    displayType: "inline"
                                },
                            },
                            {
                                label : "Line Num",
                                type : "integer",
                                id : "custpage_tranlinenum",
                                //container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linenum",
                                displayType : {
                                    // displayType: "inline",
                                    displayType: "hidden"
                                },
                            },
                            {
                                label : "Expected Tonnage",
                                type : "float",
                                id : "custpage_tranlineexpectedtonnage",
                                //container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_expectedtonnage",
                                displayType : {
                                    displayType: "inline"
                                },
                                updateBreakType : {
                                    breakType : uiSw.FieldBreakType.STARTCOL
                                }
                            },
                            {
                                label : "Total Rolls",
                                type : "integer",
                                id : "custpage_tranlinetotalrolls",
                                //container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_totalrolls",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Rolls Onhand",
                                type : "integer",
                                id : "custpage_tranlinerollsonhand",
                                //container: "custpage_flgroup_details",
                                sourceSearchKey:"tranline_rollsonhand",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Reserved Rolls(Commit)",
                                type : "integer",
                                id : "custpage_tranlinereservedrolls",
                                //container: "custpage_flgroup_details",
                                sourceSearchKey:"tranline_reservedrolls",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Backorder Rolls(Commit)",
                                type : "integer",
                                id : "custpage_tranlinebackorderrolls",
                                //container: "custpage_flgroup_details",
                                sourceSearchKey:"tranline_backorderrolls",
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
                        search.createColumn({name: "custcol_anc_transitlocation", label: "tranline_transitlocation"}),
                        search.createColumn({name: "location", label: "tranline_laneoriginwarehouse"}),
                        search.createColumn({
                            name: "formulanumeric",
                            formula: "600",
                            label: "tranline_transittime"
                        }),
                        search.createColumn({name: "custcol_anc_ldcdate", label: "tranline_ldc_date"}),
                        search.createColumn({name: "custcol_anc_pressrundate", label: "tranline_pressrun_date"}),
                        search.createColumn({
                            name: "formuladate",
                            formula: "{custcol_anc_shipdate}",
                            label: "tranline_ship_date"
                        }),
                        search.createColumn({name: "shipdate", label: "tranline_stndship_date"}),
                        search.createColumn({name: "custcol_anc_productiondate", label: "tranline_production_date"}),
                        search.createColumn({
                            name: "formuladate",
                            formula: "{custcol_anc_deliverydate}",
                            label: "tranline_delivery_date"
                        }),
                        search.createColumn({name: "custcol_anc_pressrundate", label: "tranline_pressrundate"}),
                        search.createColumn({name: "custcol_anc_expectedtonnage", label: "tranline_expectedtonnage"}),
                        search.createColumn({name: "custcol_anc_totalrolls", label: "tranline_totalrolls"}),
                        search.createColumn({name: "custcol_anc_rollsperpack", label: "tranline_rollsperpack"}),
                        search.createColumn({name: "custcol_anc_wraptype", label: "tranline_wraptype"}),
                        search.createColumn({
                            name: "locationquantityavailable",
                            join: "item",
                            label: "tranline_availablequantity"
                        }),
                        search.createColumn({name: "custcol_anc_shippinglane", label: "tranline_shippinglane"}),
                        search.createColumn({name: "custcol_anc_rollsonhand", label: "tranline_rollsonhand"}),
                        search.createColumn({name: "custcol_anc_reservedrolls", label: "tranline_reservedrolls"}),
                        search.createColumn({name: "custcol_anc_backorderrolls", label: "tranline_backorderrolls"}),
                        search.createColumn({name: "custcol_anc_transitoptmethod", label: "tranline_transitoptmethod"}),
                        search.createColumn({name: "custcol_anc_transittime", label: "tranline_transittime"}),
                        search.createColumn({name: "custcol_consignee", label: "tranline_consignee"})
                    ]
                },
                "product_and_packaging" : {
                    title : "Packaging",
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
                                label : "Minimize UI / Process Id",
                                type : "text",
                                id : "custpage_minimizeui",
                                //container: "custpage_flgroup_source",
                                defaultValue:scriptContext.request.parameters.minimizeui || scriptContext.request.parameters.processid || scriptContext.request.parameters.custpage_minimizeui,
                                displayType : {
                                    displayType: "hidden"
                                }
                            },
                            {
                                label : "Source",
                                type : "select",
                                id : "custpage_traninternalid",
                                source : "salesorder",
                                //container: "custpage_flgroup_source",
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
                                //container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_item",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Line Sequence",
                                type : "integer",
                                id : "custpage_tranlinesequence",
                                //container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linesequence",
                                displayType : {
                                    displayType: "inline"
                                },
                            },
                            {
                                label : "Line Num",
                                type : "integer",
                                id : "custpage_tranlinenum",
                                //container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linenum",
                                displayType : {
                                    // displayType: "inline",
                                    displayType: "hidden"
                                }
                            },
                            {
                                label : "Rolls Per Pack",
                                type : "integer",
                                id : "custpage_tranlinerollsperpack",
                                //container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_rollsperpack",
                                displayType : {
                                    displayType: "entry"
                                },
                                updateBreakType : {
                                    breakType : uiSw.FieldBreakType.STARTCOL
                                }
                            },
                            {
                                label : "Wrap Type",
                                type : "select",
                                id : "custpage_tranlinewraptype",
                                source : "customlist_anc_wraptypes",
                                //container: "custpage_flgroup_input",
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
                        search.createColumn({name: "custcol_anc_transitlocation", label: "tranline_transitlocation"}),
                        search.createColumn({name: "location", label: "tranline_laneoriginwarehouse"}),
                        search.createColumn({
                            name: "formulanumeric",
                            formula: "600",
                            label: "tranline_transittime"
                        }),
                        search.createColumn({name: "custcol_anc_ldcdate", label: "tranline_ldc_date"}),
                        search.createColumn({name: "custcol_anc_pressrundate", label: "tranline_pressrun_date"}),
                        search.createColumn({
                            name: "formuladate",
                            formula: "{custcol_anc_shipdate}",
                            label: "tranline_ship_date"
                        }),
                        search.createColumn({name: "shipdate", label: "tranline_stndship_date"}),
                        search.createColumn({name: "custcol_anc_productiondate", label: "tranline_production_date"}),
                        search.createColumn({
                            name: "formuladate",
                            formula: "{custcol_anc_deliverydate}",
                            label: "tranline_delivery_date"
                        }),
                        search.createColumn({name: "custcol_anc_pressrundate", label: "tranline_pressrundate"}),
                        search.createColumn({name: "custcol_anc_expectedtonnage", label: "tranline_expectedtonnage"}),
                        search.createColumn({name: "custcol_anc_totalrolls", label: "tranline_totalrolls"}),
                        search.createColumn({name: "custcol_anc_rollsperpack", label: "tranline_rollsperpack"}),
                        search.createColumn({name: "custcol_anc_wraptype", label: "tranline_wraptype"}),
                        search.createColumn({
                            name: "locationquantityavailable",
                            join: "item",
                            label: "tranline_availablequantity"
                        }),
                        search.createColumn({name: "custcol_anc_shippinglane", label: "tranline_shippinglane"}),
                        search.createColumn({name: "custcol_anc_rollsonhand", label: "tranline_rollsonhand"}),
                        search.createColumn({name: "custcol_anc_reservedrolls", label: "tranline_reservedrolls"}),
                        search.createColumn({name: "custcol_anc_backorderrolls", label: "tranline_backorderrolls"}),
                        search.createColumn({name: "custcol_anc_transitoptmethod", label: "tranline_transitoptmethod"}),
                        search.createColumn({name: "custcol_anc_transittime", label: "tranline_transittime"}),
                        search.createColumn({name: "custcol_consignee", label: "tranline_consignee"})
                    ]
                },
                "customer_and_shipping" : {
                    title : "Shipping",
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
                                label : "Minimize UI / Process Id",
                                type : "text",
                                id : "custpage_minimizeui",
                                //container: "custpage_flgroup_source",
                                defaultValue:scriptContext.request.parameters.minimizeui || scriptContext.request.parameters.processid || scriptContext.request.parameters.custpage_minimizeui,
                                displayType : {
                                    displayType: "hidden"
                                }
                            },
                            {
                                label : "Source",
                                type : "select",
                                id : "custpage_traninternalid",
                                source : "salesorder",
                                //container: "custpage_flgroup_source",
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
                                //container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_item",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Line Sequence",
                                type : "integer",
                                id : "custpage_tranlinesequence",
                                //container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linesequence",
                                displayType : {
                                    displayType: "inline"
                                },
                            },
                            {
                                label : "Line Num",
                                type : "integer",
                                id : "custpage_tranlinenum",
                                //container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linenum",
                                displayType : {
                                    // displayType: "inline",
                                    displayType: "hidden"
                                }
                            },
                            // {
                            //     label : "Customer Address",
                            //     type : "select",
                            //     id : "custpage_tranlinecustomeraddress",
                            //     source : "addressbook",
                            //     //container: "custpage_flgroup_input",
                            //     displayType : {
                            //         displayType: "entry"
                            //     }
                            // },
                            {
                                label : "Customer Agreement?",
                                type : "select",
                                id : "custpage_tranlinecustomeragreement",
                                source : "customrecord_anc_customeragreement",
                                //container: "custpage_flgroup_input",
                                displayType : {
                                    displayType: "inline"
                                },
                                updateBreakType : {
                                    breakType : uiSw.FieldBreakType.STARTCOL
                                }
                            },
                            {
                                label : "Consignee",
                                type : "select",
                                id : "custpage_tranlineconsignee",
                                source : "customrecord_alberta_ns_consignee_record",
                                sourceSearchKey : "tranline_consignee",
                                //container: "custpage_flgroup_input",
                                targetColumnId : "custcol_consignee",
                                displayType : {
                                    displayType: "entry"
                                },
                            },
                            {
                                label : "Shipping Lane",
                                type : "select",
                                id : "custpage_tranlinelaneid",
                                source : "customrecord_anc_shippinglanes",
                                sourceSearchKey : "tranline_shippinglane",
                                //container: "custpage_flgroup_input",
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
                        search.createColumn({name: "custcol_anc_transitlocation", label: "tranline_transitlocation"}),
                        search.createColumn({name: "location", label: "tranline_laneoriginwarehouse"}),
                        search.createColumn({
                            name: "formulanumeric",
                            formula: "600",
                            label: "tranline_transittime"
                        }),
                        search.createColumn({name: "custcol_anc_ldcdate", label: "tranline_ldc_date"}),
                        search.createColumn({name: "custcol_anc_pressrundate", label: "tranline_pressrun_date"}),
                        search.createColumn({
                            name: "formuladate",
                            formula: "{custcol_anc_shipdate}",
                            label: "tranline_ship_date"
                        }),
                        search.createColumn({name: "shipdate", label: "tranline_stndship_date"}),
                        search.createColumn({name: "custcol_anc_productiondate", label: "tranline_production_date"}),
                        search.createColumn({
                            name: "formuladate",
                            formula: "{custcol_anc_deliverydate}",
                            label: "tranline_delivery_date"
                        }),
                        search.createColumn({name: "custcol_anc_pressrundate", label: "tranline_pressrundate"}),
                        search.createColumn({name: "custcol_anc_expectedtonnage", label: "tranline_expectedtonnage"}),
                        search.createColumn({name: "custcol_anc_totalrolls", label: "tranline_totalrolls"}),
                        search.createColumn({name: "custcol_anc_rollsperpack", label: "tranline_rollsperpack"}),
                        search.createColumn({name: "custcol_anc_wraptype", label: "tranline_wraptype"}),
                        search.createColumn({
                            name: "locationquantityavailable",
                            join: "item",
                            label: "tranline_availablequantity"
                        }),
                        search.createColumn({name: "custcol_anc_shippinglane", label: "tranline_shippinglane"}),
                        search.createColumn({name: "custcol_anc_rollsonhand", label: "tranline_rollsonhand"}),
                        search.createColumn({name: "custcol_anc_reservedrolls", label: "tranline_reservedrolls"}),
                        search.createColumn({name: "custcol_anc_backorderrolls", label: "tranline_backorderrolls"}),
                        search.createColumn({name: "custcol_anc_transitoptmethod", label: "tranline_transitoptmethod"}),
                        search.createColumn({name: "custcol_anc_transittime", label: "tranline_transittime"}),
                        search.createColumn({name: "custcol_consignee", label: "tranline_consignee"})
                    ]
                },
                "scheduling_and_keydates" : {
                    title : "Key Dates",
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
                                label : "Minimize UI / Process Id",
                                type : "text",
                                id : "custpage_minimizeui",
                                //container: "custpage_flgroup_source",
                                defaultValue:scriptContext.request.parameters.minimizeui || scriptContext.request.parameters.processid || scriptContext.request.parameters.custpage_minimizeui,
                                displayType : {
                                    displayType: "hidden"
                                }
                            },
                            {
                                label : "Source",
                                type : "select",
                                id : "custpage_traninternalid",
                                source : "salesorder",
                                //container: "custpage_flgroup_source",
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
                                //container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_item",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Line Sequence",
                                type : "integer",
                                id : "custpage_tranlinesequence",
                                //container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linesequence",
                                displayType : {
                                    displayType: "inline"
                                },
                            },
                            {
                                label : "Line Num",
                                type : "integer",
                                id : "custpage_tranlinenum",
                                //container: "custpage_flgroup_source",
                                sourceSearchKey:"tranline_linenum",
                                displayType : {
                                    // displayType: "inline",
                                    displayType: "hidden"
                                }
                            },
                            // {
                            //     label : "Customer Address",
                            //     type : "select",
                            //     id : "custpage_tranlinecustomeraddress",
                            //     source : "addressbook",
                            //     //container: "custpage_flgroup_input",
                            //     displayType : {
                            //         displayType: "entry"
                            //     }
                            // },
                            {
                                label : "LDC Date",
                                type : "date",
                                id : "custpage_tranlinecustomeragreement",
                                source : "customrecord_anc_customeragreement",
                                //container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_ldc_date",
                                displayType : {
                                    displayType: "inline"
                                },
                                updateBreakType : {
                                    breakType : uiSw.FieldBreakType.STARTCOL
                                }
                            },
                            {
                                label : "Ship Date",
                                type : "date",
                                id : "custpage_tranlineshipdate",
                                //container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_ship_date",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Production Date",
                                type : "date",
                                id : "custpage_tranlineproductiondate",
                                //container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_production_date",
                                displayType : {
                                    displayType: "inline"
                                }
                            },
                            {
                                label : "Press Run Date",
                                type : "date",
                                id : "custpage_tranlinepressrundate",
                                //container: "custpage_flgroup_input",
                                sourceSearchKey:"tranline_pressrundate",
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
                        search.createColumn({name: "custcol_anc_transitlocation", label: "tranline_transitlocation"}),
                        search.createColumn({name: "location", label: "tranline_laneoriginwarehouse"}),
                        search.createColumn({
                            name: "formulanumeric",
                            formula: "600",
                            label: "tranline_transittime"
                        }),
                        search.createColumn({name: "custcol_anc_ldcdate", label: "tranline_ldc_date"}),
                        search.createColumn({name: "custcol_anc_pressrundate", label: "tranline_pressrun_date"}),
                        search.createColumn({
                            name: "formuladate",
                            formula: "{custcol_anc_shipdate}",
                            label: "tranline_ship_date"
                        }),
                        search.createColumn({name: "shipdate", label: "tranline_stndship_date"}),
                        search.createColumn({name: "custcol_anc_productiondate", label: "tranline_production_date"}),
                        search.createColumn({
                            name: "formuladate",
                            formula: "{custcol_anc_deliverydate}",
                            label: "tranline_delivery_date"
                        }),
                        search.createColumn({name: "custcol_anc_pressrundate", label: "tranline_pressrundate"}),
                        search.createColumn({name: "custcol_anc_expectedtonnage", label: "tranline_expectedtonnage"}),
                        search.createColumn({name: "custcol_anc_totalrolls", label: "tranline_totalrolls"}),
                        search.createColumn({name: "custcol_anc_rollsperpack", label: "tranline_rollsperpack"}),
                        search.createColumn({name: "custcol_anc_wraptype", label: "tranline_wraptype"}),
                        search.createColumn({
                            name: "locationquantityavailable",
                            join: "item",
                            label: "tranline_availablequantity"
                        }),
                        search.createColumn({name: "custcol_anc_shippinglane", label: "tranline_shippinglane"}),
                        search.createColumn({name: "custcol_anc_rollsonhand", label: "tranline_rollsonhand"}),
                        search.createColumn({name: "custcol_anc_reservedrolls", label: "tranline_reservedrolls"}),
                        search.createColumn({name: "custcol_anc_backorderrolls", label: "tranline_backorderrolls"}),
                        search.createColumn({name: "custcol_anc_transitoptmethod", label: "tranline_transitoptmethod"}),
                        search.createColumn({name: "custcol_anc_transittime", label: "tranline_transittime"}),
                        search.createColumn({name: "custcol_consignee", label: "tranline_consignee"})
                    ]
                }
            }
        }

        function generateForm(scriptContext, form)
        {
            try
            {
                log.debug("generateForm scriptContext.request.method", scriptContext.request.method);

                log.debug("elements[minimize_ui_processid]", elements[minimize_ui_processid]);

                var form = uiSw.createForm({
                    title: elements[minimize_ui_processid].title,
                    hideNavBar: true
                })


                form.clientScriptModulePath = './ANC_CS_MINIMIZE_UI.js'


                var sourceValSearchObj = null;
                var firstResult = {};
                //search and source the values
                if(scriptContext.request.parameters.traninternalid && scriptContext.request.parameters.tranlinenum)
                {
                    var searchFilters = [];
                    if(elements[minimize_ui_processid] &&
                        elements[minimize_ui_processid].searchFilters &&
                        elements[minimize_ui_processid].searchFilters.length > 0)
                    {
                        searchFilters = elements[minimize_ui_processid].searchFilters;
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
                        columns : elements[minimize_ui_processid].searchColumns,
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

                for(var a = 0 ; a < elements[minimize_ui_processid].bodyfieldgroups.list.length ; a++)
                {
                    var widgetObj = elements[minimize_ui_processid].bodyfieldgroups.list[a];
                    var uiWidgetObj = form.addFieldGroup(widgetObj);

                    globalrefs["uiWidgetObj_" + widgetObj.id] = uiWidgetObj;
                }
                for(var a = 0 ; a < elements[minimize_ui_processid].bodyfields.list.length ; a++)
                {
                    var widgetObj = elements[minimize_ui_processid].bodyfields.list[a];
                    var uiWidgetObj = form.addField(widgetObj);
                    if(widgetObj.displayType)
                    {
                        uiWidgetObj.updateDisplayType(widgetObj.displayType)
                    }
                    if(widgetObj.updateBreakType)
                    {
                        uiWidgetObj.updateBreakType(widgetObj.updateBreakType)
                    }
                    if(widgetObj.defaultValue || widgetObj.defaultValue == "0" || widgetObj.defaultValue === false)
                    {
                        uiWidgetObj.defaultValue = widgetObj.defaultValue
                    }

                    if(firstResult && widgetObj.sourceSearchKey || widgetObj.sourceSearchKey == "0" || widgetObj.sourceSearchKey === false)
                    {
                        // uiWidgetObj.defaultValue = widgetObj.defaultValue
                        log.debug("firstResult[widgetObj.sourceSearchKey]", firstResult[widgetObj.sourceSearchKey]);
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
            catch(e)
            {
                log.error("ERROR in function generateForm", e);
            }
        }

        function updateRecord(scriptContext)
        {
            try
            {
                var custpage_minimizeui = scriptContext.request.parameters.custpage_minimizeui;
                var custpage_traninternalid = scriptContext.request.parameters.custpage_traninternalid;
                var custpage_tranlinenum = scriptContext.request.parameters.custpage_tranlinenum;
                if(custpage_minimizeui)
                {
                    getElements(scriptContext);
                    if(elements[custpage_minimizeui])
                    {
                        var bodyFieldsList = elements[custpage_minimizeui].bodyfields.list;

                        var colsToUpdateCount = 0;
                        if(bodyFieldsList && bodyFieldsList.length > 0)
                        {
                            var soRecObj = record.load({
                                type : "salesorder",
                                id : custpage_traninternalid
                            });

                            var targetIndex = soRecObj.findSublistLineWithValue({
                                sublistId : "item",
                                fieldId : "line",
                                value : custpage_tranlinenum
                            });

                            if(targetIndex != -1)
                            {
                                for(var a = 0 ; a < bodyFieldsList.length; a++)
                                {

                                    if(bodyFieldsList[a].targetColumnId)
                                    {
                                        var oldValue = soRecObj.getSublistValue({
                                            sublistId : "item",
                                            fieldId : bodyFieldsList[a].targetColumnId,
                                            line : targetIndex,
                                            value : targetColumnValue
                                        })

                                        var targetColumnValue = scriptContext.request.parameters[bodyFieldsList[a].id];


                                        if(oldValue != targetColumnValue)
                                        {
                                            soRecObj.setSublistValue({
                                                sublistId : "item",
                                                fieldId : bodyFieldsList[a].targetColumnId,
                                                line : targetIndex,
                                                value : targetColumnValue
                                            })
                                            colsToUpdateCount++;
                                        }
                                    }

                                }



                                //05122025 - UE now handles optimization method
                                // var targetColumnValue = scriptContext.request.parameters["custpage_tranlinetransittom"];
                                //
                                // var searchFilters = [
                                //     ["type","anyof","SalesOrd"],
                                //     "AND",
                                //     ["mainline","is","F"],
                                //     "AND",
                                //     ["taxline","is","F"],
                                // ];
                                // if(searchFilters)
                                // {
                                //     searchFilters.push("AND")
                                //     searchFilters.push(["internalid", "anyof", scriptContext.request.parameters.custpage_traninternalid])
                                //     searchFilters.push("AND")
                                //     searchFilters.push(["line", "equalto", scriptContext.request.parameters.custpage_tranlinenum])
                                //
                                // }
                                //
                                //
                                // log.debug("searchFilters", searchFilters);
                                //
                                // var post_searchObj = search.create({
                                //     type: "salesorder",
                                //     settings:[{"name":"consolidationtype","value":"ACCTTYPE"}],
                                //     filters : searchFilters,
                                //     columns : [
                                //         search.createColumn({
                                //             name : "location"
                                //         }),
                                //         search.createColumn({
                                //             name : "custrecord_alberta_ns_city",
                                //             join : "custcol_consignee",
                                //             label : "consignee city"
                                //         }),
                                //         search.createColumn({
                                //             name : "location"
                                //         }),
                                //     ],
                                // })
                                //
                                // var sr = getResults(post_searchObj.run());
                                // log.debug("sr", sr)
                                // var originloc = "";
                                // var destCity = "";
                                // for(var a = 0 ; a < sr.length ; a++)
                                // {
                                //     originloc = sr[a].getValue(search.createColumn({
                                //         name : "location"
                                //     }))
                                //
                                //     destCity = sr[a].getValue(search.createColumn({
                                //         name : "custrecord_alberta_ns_city",
                                //         join : "custcol_consignee",
                                //         label : "consignee city"
                                //     }))
                                //
                                // }
                                //
                                // log.debug("{targetColumnValue, originloc, destCity}", {targetColumnValue, originloc, destCity})
                                // var newLineDetails = resolveLane(targetColumnValue, originloc, destCity);
                                //
                                // log.debug("bodyFieldsList[a].targetColumnId", {colId : bodyFieldsList[a].targetColumnId, colVal : targetColumnValue})
                                //
                                // soRecObj.setSublistValue({
                                //     sublistId : "item",
                                //     fieldId : "custcol_anc_shippinglane",
                                //     value : newLineDetails.laneid,
                                //     line : targetIndex
                                // })
                                //
                                // soRecObj.setSublistValue({
                                //     sublistId : "item",
                                //     fieldId : "custcol_anc_equipment",
                                //     value : newLineDetails.eqid,
                                //     line : targetIndex
                                // })





                                if(colsToUpdateCount > 0)
                                {
                                    var submittedSoRecId = soRecObj.save({
                                        ignoreMandatoryFields : true,
                                        enableSourcing : true
                                    });

                                    log.debug("submittedSoRecId", submittedSoRecId);
                                }
                            }
                            else
                            {
                                log.error("CANNOT FIND SUBLIST LINE", {targetIndex, custpage_tranlinenum})
                            }

                        }
                    }
                }
            }
            catch(e)
            {
                log.error("ERROR in function updateRecord", e);
            }
        }


        function resolveLane(tom, originloc, targetloc)
        {
            var resolveLaneObj = {};
            if(tom && originloc && targetloc)
            {
                var tomFilter = [];
                var LCTT_EQUIP = search.createColumn({
                    name : "custrecord_anc_lane_lce",
                    join : null,
                    label : "LCTT_equip",
                    sort : "ASC"
                });
                var LCTT_BASIS = search.createColumn({
                        name : "custrecord_anc_lane_lctt",
                        join : null,
                        label : "LCTT",
                        sort : "ASC",
                        eqfield : JSON.parse(JSON.stringify(LCTT_EQUIP)) //TODO this does not work!!!
                    });

                var FTT_EQUIP = search.createColumn({
                    name : "custrecord_anc_lane_ftte",
                    join : null,
                    label : "FTT_equip",
                    sort : "ASC"
                });
                var FTT_BASIS = search.createColumn({
                    name : "custrecord_anc_lane_ftt",
                    join : null,
                    label : "LCTT",
                    sort : "ASC",
                    eqfield : JSON.parse(JSON.stringify(FTT_EQUIP))
                });

                var defining_basis = LCTT_BASIS;
                var defining_eq = LCTT_EQUIP;
                if(tom == 1)
                {
                    defining_basis = LCTT_BASIS;
                    defining_eq = LCTT_EQUIP
                    tomFilter = [LCTT_BASIS.name, "notempty"]
                }
                else if(tom == 2)
                {
                    defining_basis = FTT_BASIS;
                    defining_eq = FTT_EQUIP
                    tomFilter = [FTT_BASIS.name, "notempty"]
                }
                else
                {
                    defining_basis = LCTT_BASIS;
                    defining_eq = LCTT_EQUIP
                    tomFilter = [LCTT_BASIS.name, "notempty"]
                }

                var laneSearchObj = search.create({
                    type : "customrecord_anc_shippinglanes",
                    filters :
                        [
                            ["custrecord_anc_lane_originwarehouse", "anyof", [originloc]],
                            "AND",
                            ["custrecord_anc_lane_destinationcity", "is", targetloc],
                            // "AND",
                            // tomFilter
                        ],
                    columns : [
                        defining_basis,
                        FTT_EQUIP,FTT_BASIS,LCTT_EQUIP,LCTT_BASIS,
                        defining_eq

                    ]
                });

                log.debug("laneSearchObj", laneSearchObj);
                // laneSearchObj.title = "customsearch_anc0429rod_DBFIRST" + new Date().getTime();
                // laneSearchObj.save();

                laneSearchObj.run().each(function(res){
                    resolveLaneObj.laneid = res.id
                    // resolveLaneObj.eqid = res.getValue(defining_basis.eqfield);
                    resolveLaneObj.eqid = res.getValue(laneSearchObj.columns[5]);
                    return false;
                })
            }
            else
            {
                throw "Cannot resolve lane, origin/destination/Transport Optimization Method Missing"
            }
            log.debug("resolveLaneObj", resolveLaneObj);
            return resolveLaneObj;
        }

        const onRequest = (scriptContext) =>
        {
            minimize_ui_processid = scriptContext.request.parameters.minimizeui || scriptContext.request.parameters.custpage_minimizeui

            log.debug("minimize_ui_processid", minimize_ui_processid);

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


                    getElements(scriptContext);

                    // log.debug("scriptContext.request.parameters.minimizeui", scriptContext.request.parameters.minimizeui);
                    //
                    // log.debug("elements", elements);

                    generateForm(scriptContext)
                }
                else
                {
                    log.debug("POST, Submitted", scriptContext);


                    updateRecord(scriptContext)


                    var currScript = runtime.getCurrentScript()
                    redirect.toSuitelet({
                        scriptId : currScript.id,
                        deploymentId : currScript.deploymentId,
                        parameters : {
                            minimizeui : scriptContext.request.parameters.custpage_minimizeui,
                            traninternalid : scriptContext.request.parameters.custpage_traninternalid,
                            tranlinenum : scriptContext.request.parameters.custpage_tranlinenum,
                            tranlinesequence : scriptContext.request.parameters.custpage_tranlinesequence,
                            sl_posted : "T",
                        }
                    })


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




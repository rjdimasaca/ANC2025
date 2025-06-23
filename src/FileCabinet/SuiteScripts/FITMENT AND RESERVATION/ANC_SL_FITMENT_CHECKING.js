/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['/SuiteScripts/ANC_lib.js', 'N/https', 'N/record', 'N/redirect', 'N/runtime', 'N/search', 'N/url', 'N/ui/serverWidget'],
    /**
     * @param{runtime} runtime
     * @param{search} search
     * @param{url} url
     */
    (ANC_lib, https, record, redirect, runtime, search, url, uiSw) => {

        var globalrefs = {};
        var orderLineLimit = 0;
        var fitmentLineLimit = 1;
        var allowMultiGrade = true;
        var DEBUGMODE = false;
        var accountId = "";
        var form = "";
        var CONSIGNEE_REC_TYPE = "customrecord_alberta_ns_consignee_record"


        var SUBMITTED_FITMENT_RESULT_COLUMNS = [
            search.createColumn({name: "tranid", label: "Document Number"}),
            search.createColumn({name: "custcol_anc_relatedtransaction", label: "Related Transaction"}),
            search.createColumn({name: "custcol_anc_relatedlineuniquekey", label: "Related Line Unique Key"}),
            search.createColumn({name: "item", label: "Item"}),
            search.createColumn({name: "custcol_anc_actualitemtobeshipped", label: "Actual Item To Be Shipped"}),
            search.createColumn({name: "custbody_anc_carrier", label: "Carrier(vendor)"}),
            search.createColumn({name: "custbody_anc_vehicleno", label: "Vehicle Number"}),
            search.createColumn({name: "custbody_anc_trackingno", label: "Tracking No"}),
            search.createColumn({name: "lineuniquekey", label: "Line Unique Key"})
        ];

        var TEMPORARY_SHIPMENT_ITEM = 188748;

        var BASE_SUBLIST_ID = "custpage_sublist_fitmentcheck";
        var BASE_SUBTAB_ID = "custpage_tab_fc";

        var SHIPMENT_CONSIGNEE_FIELD_ID = "custbody_consignee";

        const onRequest = (scriptContext) =>
        {
            var script_timeStamp_start = new Date().getTime();

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
                    form = uiSw.createForm({
                        title: "FITMENT CHECK",
                        hideNavBar: true
                    })

                    form.clientScriptModulePath = './ANC_CS_FITMENT_AND_RESERVE.js'

                    form.addFieldGroup({
                        id: "custpage_flgroup_source",
                        label: "Basis"
                    })

                    var tranRefField = form.addField({
                        label: "REF#",
                        type: "select",
                        id: "custpage_traninternalid",
                        source: "salesorder",
                        container: "custpage_flgroup_source"
                    })
                    tranRefField.defaultValue = scriptContext.request.parameters["traninternalid"]
                    tranRefField.updateDisplayType({
                        displayType: "inline"
                    });
                    globalrefs["tranRefField"] = tranRefField;


                    var tranRecObj = record.load({
                        type : "salesorder",
                        id : scriptContext.request.parameters["traninternalid"]
                    });
                    globalrefs.tranBodyVals = {};
                    globalrefs.tranItemVals = {};
                    globalrefs.tranBodyVals.trandate = tranRecObj.getText({
                        fieldId : "trandate"
                    })
                    globalrefs.tranBodyVals.location = tranRecObj.getValue({
                        fieldId : "location"
                    })
                    globalrefs.tranBodyVals.entity = tranRecObj.getValue({
                        fieldId : "entity"
                    })
                    if(scriptContext.request.parameters["tranlinenum"])
                    {
                        var index = tranRecObj.findSublistLineWithValue({
                            sublistId : "item",
                            fieldId : "line",
                            value : scriptContext.request.parameters["tranlinenum"]
                        })
                        globalrefs.tranItemVals.itemid = tranRecObj.getSublistValue({
                            sublistId : "item",
                            fieldId : "item",
                            line : index
                        })
                        globalrefs.tranItemVals.quantity = tranRecObj.getSublistValue({
                            sublistId : "item",
                            fieldId : "quantity",
                            line : index
                        })
                        globalrefs.tranItemVals.deliverydate = tranRecObj.getText({
                            fieldId : "trandate"
                        })
                        globalrefs.tranItemVals.destination = tranRecObj.getSublistText({
                            sublistId : "item",
                            fieldId : "cseg_anc_dstnation",
                            line : index
                        })
                        globalrefs.tranItemVals.destinationid = tranRecObj.getSublistValue({
                            sublistId : "item",
                            fieldId : "cseg_anc_dstnation",
                            line : index
                        })
                    }

                    log.debug("globalrefs", globalrefs)

                    //rest of the fields
                    if(globalrefs.tranBodyVals.entity)
                    {
                        var entityField = form.addField({
                            label : "Customer",
                            type : "select",
                            id : "custpage_trancustomer",
                            source : "customer",
                            container: "custpage_flgroup_source"
                        }).updateDisplayType({
                            displayType : "inline"
                        })
                        entityField.defaultValue = globalrefs.tranBodyVals.entity;
                        globalrefs["entityField"] = entityField;
                    }

                    var trandateField = form.addField({
                        label : "Date",
                        type : "date",
                        id : "custpage_trandate",
                        source : "item",
                        container: "custpage_flgroup_source"
                    }).updateDisplayType({
                        displayType : "inline"
                    })
                    trandateField.defaultValue = globalrefs.tranBodyVals.trandate;
                    globalrefs["trandateField"] = trandateField;

                    var tranlineseqField = form.addField({
                        label : "LINE SEQUENCE",
                        type : "integer",
                        id : "custpage_tranlineseq",
                        container: "custpage_flgroup_source"
                    }).updateDisplayType({
                        // displayType: "inline",
                        displayType: "hidden"
                    })
                    // tranlineseqField.defaultValue = scriptContext.request.parameters["tranlinesequence"]
                    globalrefs["tranlineseqField"] = tranlineseqField;

                    var tranlinenumField = form.addField({
                        label : "LINE#",
                        type : "integer",
                        id : "custpage_tranlinenum",
                        container: "custpage_flgroup_source"
                    }).updateDisplayType({
                        // displayType: "inline",
                        displayType: "hidden"
                    })
                    tranlinenumField.defaultValue = scriptContext.request.parameters["tranlinenum"]
                    globalrefs["tranlinenumField"] = tranlinenumField;

                    if(globalrefs.tranItemVals.itemid)
                    {
                        var tranlineitemField = form.addField({
                            label : "LINE ITEM GRADE TO RESERVE",
                            type : "select",
                            id : "custpage_tranlineitem",
                            source : "item",
                            container: "custpage_flgroup_source"
                        }).updateDisplayType({
                            // displayType: "inline",
                            displayType: "hidden"
                        })
                        tranlineitemField.defaultValue = globalrefs.tranItemVals.itemid;
                        globalrefs["tranlineitemField"] = tranlineitemField;
                    }


                    var equipmentField = form.addField({
                        label : "Equipment",
                        type : "text",
                        id : "custpage_equipment",
                        container: "custpage_flgroup_source"
                    }).updateDisplayType({
                        // displayType : "inline"
                        displayType : "hidden"
                    })
                    globalrefs["equipmentField"] = equipmentField;
                    if(globalrefs.tranBodyVals.equipment)
                    {
                        equipmentField.defaultValue = globalrefs.tranBodyVals.equipment
                    }

                    if(globalrefs.tranBodyVals.location)
                    {
                        var tranlinelocField = form.addField({
                            label : "LOCATION",
                            type : "select",
                            id : "custpage_tranlineloc",
                            source : "location",
                            container: "custpage_flgroup_source"
                        }).updateDisplayType({
                            displayType : "hidden"
                        }).defaultValue = globalrefs.tranBodyVals.location
                        globalrefs["tranlinelocField"] = tranlinelocField;
                    }


                    var tranlineqtyField = form.addField({
                        label : "ORDER QUANTITY",
                        type : "float",
                        id : "custpage_tranlineqty",
                        container: "custpage_flgroup_source"
                    }).updateDisplayType({
                        displayType : "hidden"
                    }).defaultValue = globalrefs.tranItemVals.quantity
                    globalrefs["tranlineqtyField"] = tranlineqtyField;

                    // if(globalrefs.tranItemVals.deliverydate)
                    // {
                    //     var tranlinedeldateField = form.addField({
                    //         label : "Delivery Date",
                    //         type : "date",
                    //         id : "custpage_tranlinedeldate",
                    //         container: "custpage_flgroup_source"
                    //     }).updateDisplayType({
                    //         displayType : "inline"
                    //     }).defaultValue = globalrefs.tranItemVals.deliverydate
                    //     globalrefs["tranlinedeldateField"] = tranlinedeldateField;
                    // }

                    if(globalrefs.tranBodyVals.location)
                    {
                        var tranlineoriginField = form.addField({
                            label : "ORIGIN",
                            type : "select",
                            id : "custpage_tranlineorigin",
                            source : "location",
                            container: "custpage_flgroup_source"
                        }).updateDisplayType({
                            displayType : "inline"
                        }).defaultValue = globalrefs.tranBodyVals.location
                        globalrefs["tranlineoriginField"] = tranlineoriginField;
                    }

                    // if(globalrefs.tranItemVals.destination)
                    // {
                    var tranlinedestField = form.addField({
                        label : "DESTINATION",
                        type : "text",
                        id : "custpage_tranlinedest",
                        container: "custpage_flgroup_source"
                    }).updateDisplayType({
                        displayType : "hidden"
                    }).defaultValue = globalrefs.tranItemVals.destination
                    globalrefs["tranlinedestField"] = tranlinedestField;
                    // }

                    // troubleShootTabs(form);


                    fillSublist(scriptContext)

                    form.addSubmitButton({
                        label : "Save Fitment Check Results"
                    })

                    scriptContext.response.writePage(form);
                }
                else
                {
                    fitmentCheckFormSubmitted(scriptContext)
                }
            }
            catch(e)
            {
                log.error("ERROR in function onRequest", e);
            }

            var script_timeStamp_end = new Date().getTime();
            log.debug("script time stats", {script_timeStamp_start, script_timeStamp_end, duration: script_timeStamp_start - script_timeStamp_end})

        }

        function troubleShootTabs(form)
        {
            var tab1 = form.addTab({
                label : "tab1",
                id : "custpage_tab1"
            })

            var subtabA = form.addSubtab({
                label : "subtab1",
                id : "custpage_subtab1",
                tab : "custpage_tab1"
            })

            var subtabB = form.addSubtab({
                label : "subtab2",
                id : "custpage_subtab2",
                tab : "custpage_tab1"
            })

            // var field1 = form

            var fitmentReservationSublist = form.addSublist({
                label : "custpage_sublist_test1" + "_" + 1 + "_" + 1,
                type : "INLINEEDITOR",
                id : "custpage_sublist_test1",
                // tab : subtabs[`${srGroupedByDeliveryDate[date][0].origkeys}`].id
                // tab : mapping[`${srGroupedByDeliveryDate[date][0].origkeys}`]
                // tab : finalSubtabId,
                tab : "custpage_subtab1"
            });

            fitmentReservationSublist.addField({
                label : "field test 1",
                id : "custpage_fld_test1",
                // tab : "custpage_sublist_test1",
                // container : "custpage_sublist_test1",
                type : "text"
            })
            fitmentReservationSublist.addField({
                label : "field test 2",
                id : "custpage_fld_test2",
                // tab : "custpage_sublist_test1",
                // container : "custpage_sublist_test1",
                type : "text"
            })

            var fitmentReservationSublist = form.addSublist({
                label : "custpage_sublist_test1" + "_" + 1 + "_" + 2,
                type : "LIST",
                id : "custpage_sublist_test2",
                // tab : subtabs[`${srGroupedByDeliveryDate[date][0].origkeys}`].id
                // tab : mapping[`${srGroupedByDeliveryDate[date][0].origkeys}`]
                // tab : finalSubtabId,
                tab : "custpage_subtab1"
            });

            fitmentReservationSublist.addField({
                label : "field test 1",
                id : "custpage_fld_test1",
                // tab : "custpage_sublist_test1",
                // container : "custpage_sublist_test1",
                type : "text"
            })
            fitmentReservationSublist.addField({
                label : "field test 2",
                id : "custpage_fld_test2",
                // tab : "custpage_sublist_test1",
                // container : "custpage_sublist_test1",
                type : "text"
            })


            var fitmentReservationSublist = form.addSublist({
                label : "custpage_sublist_test1" + "_" + 2 + "_" + 1,
                type : "LIST",
                id : "custpage_sublist_test3",
                // tab : subtabs[`${srGroupedByDeliveryDate[date][0].origkeys}`].id
                // tab : mapping[`${srGroupedByDeliveryDate[date][0].origkeys}`]
                // tab : finalSubtabId,
                tab : "custpage_subtab2"
            });

            fitmentReservationSublist.addField({
                label : "field test 1",
                id : "custpage_fld_test1",
                // tab : "custpage_sublist_test1",
                // container : "custpage_sublist_test1",
                type : "text"
            })
            fitmentReservationSublist.addField({
                label : "field test 2",
                id : "custpage_fld_test2",
                // tab : "custpage_sublist_test1",
                // container : "custpage_sublist_test1",
                type : "text"
            })

            var fitmentReservationSublist = form.addSublist({
                label : "custpage_sublist_test1" + "_" + 2 + "_" + 2,
                type : "LIST",
                id : "custpage_sublist_test4",
                // tab : subtabs[`${srGroupedByDeliveryDate[date][0].origkeys}`].id
                // tab : mapping[`${srGroupedByDeliveryDate[date][0].origkeys}`]
                // tab : finalSubtabId,
                tab : "custpage_subtab2"
            });

            fitmentReservationSublist.addField({
                label : "field test 1",
                id : "custpage_fld_test1",
                // tab : "custpage_sublist_test1",
                // container : "custpage_sublist_test1",
                type : "text"
            })
            fitmentReservationSublist.addField({
                label : "field test 2",
                id : "custpage_fld_test2",
                // tab : "custpage_sublist_test1",
                // container : "custpage_sublist_test1",
                type : "text"
            })
        }

        var equipmentList = [];
        function fitmentCheckFormSubmitted(scriptContext)
        {
            equipmentList = ANC_lib.getEquipmentList();

            log.debug("equipmentList", equipmentList);
            try
            {
                log.debug("POST, Submitted", scriptContext);
                var tranInternalid = scriptContext.request.parameters.custpage_traninternalid;
                var tranLinenum = scriptContext.request.parameters.custpage_tranlinenum;

                var shipmentObj_recIds = [];
                var soStats = {};

                var tranObj = record.load({
                    type : "salesorder",
                    id : tranInternalid,
                    isDynamic : true
                });

                for(var key in scriptContext.request)
                {
                    log.debug(`scriptContext.request[key]___${key}`, scriptContext.request[key])
                }
                for(var key in scriptContext.request.parameters)
                {
                    log.debug(`scriptContext.request.parameters[key]___${key}`, scriptContext.request.parameters[key])
                }

                //you can store the actual number of sublist in a BODY field, you can also just check if it exists
                //since it is ordered, when it doesnt exist it means script should stop
                for(var sublistCtr = 0 ; sublistCtr < 999 ; sublistCtr++)
                {
                    log.debug(`resolving ${BASE_SUBLIST_ID}${sublistCtr}data`, scriptContext.request.parameters[`${BASE_SUBLIST_ID}${sublistCtr}data`]);
                    // if(scriptContext.request.parameters[`${BASE_SUBLIST_ID}${a}fields`]){

                    var lineCount = scriptContext.request.getLineCount({
                        group : `${BASE_SUBLIST_ID}${sublistCtr}data`
                    });

                    if(lineCount > 0){
                    // if(scriptContext.request.parameters[`${BASE_SUBLIST_ID}${sublistCtr}data`]){

                        log.debug(`ITERATING THE FITMENT CHECK SUBLISTS index=${sublistCtr}`, scriptContext.request.parameters[`${BASE_SUBLIST_ID}${sublistCtr}data`]);

                        uiSublistId = `${BASE_SUBLIST_ID}${sublistCtr}data`
                        log.debug("`${BASE_SUBLIST_ID}${sublistCtr}data`", `${BASE_SUBLIST_ID}${sublistCtr}data`)

                        var lineCount = scriptContext.request.getLineCount({
                            group : uiSublistId
                        });
                        log.debug("lineCount", lineCount);

                        var doCreateShipment = false;
                        var totalLoadWeight = 0;
                        var shipmentObj = record.create({
                            type : "customsale_anc_shipment",
                            isDynamic : true
                        });
                        shipmentObj.setValue({
                            fieldId : "entity",
                            value : scriptContext.request.parameters["custpage_trancustomer"] || 106127 //TODO hardcoded
                        })
                        shipmentObj.setValue({
                            fieldId : "location",
                            value : scriptContext.request.parameters["custpage_tranlineorigin"] || 9 //TODO hardcoded
                        })


                        shipmentObj.setValue({
                            sublistId : "item",
                            fieldId : "custpage_anc_relatedtransaction",
                            // line : targetIndex,
                            value : scriptContext.request.parameters.custpage_traninternalid
                        })
                        //related transaction (salesorder can be guaranteed common because item fitment is done per SO)
                        //on the contrary, because fitment check can have many groups, this is not guaranteed.

                        // shipmentObj.setValue({
                        //     sublistId : "item",
                        //     fieldId : "custbody_anc_carrier",
                        //     // line : targetIndex,
                        //     value : scriptContext.request.parameters.custpage_traninternalid
                        // })
                        // shipmentObj.setValue({
                        //     sublistId : "item",
                        //     fieldId : "custbody_anc_vehicleno",
                        //     // line : targetIndex,
                        //     value : scriptContext.request.parameters.custpage_traninternalid
                        // })
                        // shipmentObj.setValue({
                        //     sublistId : "item",
                        //     fieldId : "custbody_anc_trackingno",
                        //     // line : targetIndex,
                        //     value : scriptContext.request.parameters.custpage_traninternalid
                        // })

                        // custpage_col_ifr_inputqty
                        // custpage_col_ifr_cb
                        // custpage_ifr_weightplanned
                        // custpage_ifr_percentage
                        // custpage_ifr_loadnum
                        // custpage_ifr_loadid
                        var keptInfoForShipmentCreation = {
                            targetConsignee : {val : ""},
                            targetOriginLoc : {val : ""},
                            targetDeliveryDate : {val : ""},
                            targetShipDate : {val : ""},
                            equipment : {val : ""},
                        };
                        var shipmentLineValues = [];
                        for(var a = 0 ; a < lineCount ; a++)
                        {
                            var lineValues = {};
                            lineValues["custpage_col_ifr_cb"] = scriptContext.request.getSublistValue({
                                group: uiSublistId,
                                name : "custpage_col_ifr_cb",
                                line : a
                            })
                            if(lineValues["custpage_col_ifr_cb"] && lineValues["custpage_col_ifr_cb"] != "F")
                            {
                                lineValues["custpage_col_ifr_inputqty"] = scriptContext.request.getSublistValue({
                                    group: uiSublistId,
                                    name : "custpage_col_ifr_inputqty",
                                    line : a
                                })
                                lineValues["custpage_ifr_weightplanned"] = scriptContext.request.getSublistValue({
                                    group: uiSublistId,
                                    name : "custpage_ifr_weightplanned",
                                    line : a
                                })
                                lineValues["custpage_ifr_percentage"] = scriptContext.request.getSublistValue({
                                    group: uiSublistId,
                                    name : "custpage_ifr_percentage",
                                    line : a
                                })
                                lineValues["custpage_ifr_loadnum"] = scriptContext.request.getSublistValue({
                                    group: uiSublistId,
                                    name : "custpage_ifr_loadnum",
                                    line : a
                                })
                                lineValues["custpage_ifr_loadid"] = scriptContext.request.getSublistValue({
                                    group: uiSublistId,
                                    name : "custpage_ifr_loadid",
                                    line : a
                                })

                                log.debug("lineValues", lineValues)

                                doCreateShipment = true;

                                shipmentLineValues.push(lineValues)
                            }

                            log.debug("shipmentLineValues", shipmentLineValues);


                            for(var a = 0 ; a < lineCount ; a++)
                            {
                                if(a == 0)
                                {
                                    keptInfoForShipmentCreation["targetConsignee"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_ifr_consignee",
                                        line : a
                                    })
                                    keptInfoForShipmentCreation["targetOriginLoc"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_ifr_location",
                                        line : a
                                    })
                                    keptInfoForShipmentCreation["targetDeliveryDate"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_col_ifr_line_deliverydate",
                                        line : a
                                    });
                                    keptInfoForShipmentCreation["targetShipDate"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_col_ifr_line_shipdate",
                                        line : a
                                    });

                                    keptInfoForShipmentCreation["equipment"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_col_ifr_equipment",
                                        line : a
                                    });
                                }
                                var lineValues = {};
                                lineValues["custpage_col_ifr_cb"] = scriptContext.request.getSublistValue({
                                    group: uiSublistId,
                                    name : "custpage_col_ifr_cb",
                                    line : a
                                })
                                if(lineValues["custpage_col_ifr_cb"] && lineValues["custpage_col_ifr_cb"] != "F")
                                {
                                    lineValues["custpage_col_ifr_inputqty"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_col_ifr_inputqty",
                                        line : a
                                    })
                                    lineValues["custpage_ifr_weightplanned"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_ifr_weightplanned",
                                        line : a
                                    })
                                    lineValues["custpage_ifr_percentage"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_ifr_percentage",
                                        line : a
                                    })
                                    lineValues["custpage_ifr_loadnum"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_ifr_loadnum",
                                        line : a
                                    })
                                    lineValues["custpage_ifr_loadid"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_ifr_loadid",
                                        line : a
                                    })
                                    lineValues["item"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_ifr_item",
                                        line : a
                                    })
                                    lineValues["equipment"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_col_ifr_equipment",
                                        line : a
                                    })
                                    lineValues["item"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_ifr_item",
                                        line : a
                                    })
                                    lineValues["custcol_anc_actualitemtobeshipped"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_ifr_item",
                                        line : a
                                    })
                                    lineValues["quantity"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_col_ifr_orderqty",
                                        line : a
                                    })
                                    lineValues["custcol_anc_relatedlineuniquekey"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_ifr_lineuniquekey",
                                        line : a
                                    })
                                    lineValues["custcol_consignee"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_ifr_consignee",
                                        line : a
                                    })
                                    lineValues["custcol_anc_shipment_linetotalweight"] = scriptContext.request.getSublistValue({
                                        group: uiSublistId,
                                        name : "custpage_ifr_linetotalweight",
                                        line : a
                                    })

                                    log.debug("lineValues", lineValues)
                                    // nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId()).getLineItemValue("item", "line", 3)
                                    // {"custpage_col_ifr_cb":"T","custpage_col_ifr_inputqty":"1","custpage_ifr_weightplanned":"weight planned","custpage_ifr_percentage":"34.567","custpage_ifr_loadnum":"4","custpage_ifr_loadid":"17424"}
                                    // var targetIndex = tranObj.findSublistLineWithValue({
                                    //     sublistId : "item",
                                    //     fieldId : "line",
                                    //     value : tranLinenum
                                    // })
                                    // log.debug("POST tranLinenum", tranLinenum)
                                    // shipmentObj.selectLine({
                                    //     sublistId : "item",
                                    //     line : targetIndex
                                    // })
                                    // log.debug("POST targetIndex", targetIndex)

                                    shipmentObj.setCurrentSublistValue({
                                        sublistId : "item",
                                        fieldId : "item",
                                        // line : targetIndex,
                                        value : TEMPORARY_SHIPMENT_ITEM
                                    })
                                    shipmentObj.setCurrentSublistValue({
                                        sublistId : "item",
                                        fieldId : "custcol_anc_actualitemtobeshipped",
                                        // line : targetIndex,
                                        value : lineValues["custcol_anc_actualitemtobeshipped"] || lineValues["item"]
                                    })
                                    //TODO track the total weight
                                    shipmentObj.setCurrentSublistValue({
                                        sublistId : "item",
                                        fieldId : "custcol_anc_shipment_linetotalweight",
                                        // line : targetIndex,
                                        value : lineValues["custcol_anc_shipment_linetotalweight"] || 0
                                    })

                                    log.debug("totalLoadWeight before +=", totalLoadWeight)

                                    log.debug("totalLineWeight before +=", Number(lineValues["custcol_anc_shipment_linetotalweight"]))
                                    totalLoadWeight += Number(lineValues["custcol_anc_shipment_linetotalweight"]);

                                    log.debug("totalLoadWeight after +=", totalLoadWeight)

                                    shipmentObj.setCurrentSublistValue({
                                        sublistId : "item",
                                        fieldId : "custcol_consignee",
                                        // line : targetIndex,
                                        value : lineValues["custcol_consignee"]
                                    })
                                    shipmentObj.setCurrentSublistValue({
                                        sublistId : "item",
                                        fieldId : "quantity",
                                        // line : targetIndex,
                                        value : lineValues["quantity"]
                                    })
                                    shipmentObj.setCurrentSublistValue({
                                        sublistId : "item",
                                        fieldId : "rate",
                                        // line : targetIndex,
                                        value : 0
                                    })
                                    shipmentObj.setCurrentSublistValue({
                                        sublistId : "item",
                                        fieldId : "rate",
                                        // line : targetIndex,
                                        value : 0
                                    })
                                    shipmentObj.setCurrentSublistValue({
                                        sublistId : "item",
                                        fieldId : "custcol_anc_relatedtransaction",
                                        // line : targetIndex,
                                        value : scriptContext.request.parameters.custpage_traninternalid
                                    })
                                    shipmentObj.setCurrentSublistValue({
                                        sublistId : "item",
                                        fieldId : "custcol_anc_relatedlineuniquekey",
                                        // line : targetIndex,
                                        value : lineValues["custcol_anc_relatedlineuniquekey"]
                                    })

                                    shipmentObj.setCurrentSublistValue({
                                        sublistId : "item",
                                        fieldId : "custcol_anc_equipment",
                                        // line : targetIndex,
                                        value : lineValues["equipment"]
                                    })


                                    soStats[lineValues["custcol_anc_relatedlineuniquekey"]] = {};


                                    // shipmentObj.setCurrentSublistValue({
                                    //     sublistId : "item",
                                    //     fieldId : "custcol_anc_relatedtransaction",
                                    //     // line : targetIndex,
                                    //     value : scriptContext.request.parameters.custpage_traninternalid
                                    // })


                                    // shipmentObj.setCurrentSublistValue({
                                    //     sublistId : "item",
                                    //     fieldId : "custcol_anc_lxpert_loadweightplanned",
                                    //     line : targetIndex,
                                    //     value : lineValues["custpage_ifr_weightplanned"]
                                    // })
                                    // shipmentObj.setCurrentSublistValue({
                                    //     sublistId : "item",
                                    //     fieldId : "custcol_anc_lxpert_loadscount",
                                    //     line : targetIndex,
                                    //     value : lineValues["custpage_ifr_loadnum"]
                                    // })
                                    // shipmentObj.setCurrentSublistValue({
                                    //     sublistId : "item",
                                    //     fieldId : "custcol_anc_lxpert_lastloadutilrate",
                                    //     line : targetIndex,
                                    //     value : lineValues["custpage_ifr_percentage"]
                                    // })
                                    // shipmentObj.setCurrentSublistValue({
                                    //     sublistId : "item",
                                    //     fieldId : "custcol_anc_lxpert_loadreservedqty",
                                    //     line : targetIndex,
                                    //     value : lineValues["custpage_col_ifr_inputqty"]
                                    // })
                                    log.debug("before commit")
                                    shipmentObj.commitLine({
                                        sublistId : "item",
                                    })
                                    log.debug("after commit")

                                    doCreateShipment = true;
                                }

                            }
                        }

                        log.debug("totalLoadWeight", totalLoadWeight);
                        // totalLoadWeight = 4000;
                        transportationMaxWeight = 50000;
                        var equipmentList_filtered = equipmentList.filter(function(elem){
                            if(elem.eq_internalid == keptInfoForShipmentCreation["equipment"])
                            {
                                return true;
                            }
                            else
                            {
                                return false;
                            }
                        })

                        if(equipmentList_filtered.length > 0)
                        {
                            transportationMaxWeight = equipmentList_filtered[0].eq_weightcap || 0
                        }

                        shipmentUtilRate = 0;
                        if(transportationMaxWeight)
                        {
                            shipmentUtilRate = (100 * (totalLoadWeight/transportationMaxWeight));
                        }


                        log.debug("shipmentUtilRate", shipmentUtilRate);


                        shipmentObj.setValue({
                            sublistId : "item",
                            fieldId : "custbody_anc_loadingefficiency",
                            // line : targetIndex,
                            value : shipmentUtilRate
                        })

                        if(doCreateShipment)
                        {
                            if(keptInfoForShipmentCreation["targetConsignee"])
                            {
                                shipmentObj.setValue({
                                    fieldId : SHIPMENT_CONSIGNEE_FIELD_ID,
                                    value : keptInfoForShipmentCreation["targetConsignee"]
                                })

                                shipmentObj.setValue({
                                    fieldId : "location",
                                    value : keptInfoForShipmentCreation["targetOriginLoc"]
                                })

                                log.debug(`keptInfoForShipmentCreation["targetDeliveryDate"]`, keptInfoForShipmentCreation["targetDeliveryDate"])
                                // shipmentObj.setValue({
                                shipmentObj.setText({
                                    fieldId : "custbody_anc_deliverydate",
                                    text : keptInfoForShipmentCreation["targetDeliveryDate"]
                                    // value : keptInfoForShipmentCreation["targetDeliveryDate"]
                                })
                                shipmentObj.setText({
                                    fieldId : "custbody_anc_shipdate",
                                    text : keptInfoForShipmentCreation["targetShipDate"]
                                    // value : keptInfoForShipmentCreation["targetDeliveryDate"]
                                })
                                shipmentObj.setValue({
                                    fieldId : "custbody_anc_equipment",
                                    value : keptInfoForShipmentCreation["equipment"]
                                    // value : keptInfoForShipmentCreation["equipment"]
                                })

                            }

                            var shipmentObj_recId = shipmentObj.save({
                                ignoreMandatoryFields : true
                            });
                            log.debug("shipmentObj_recId", shipmentObj_recId);

                            shipmentObj_recIds.push(shipmentObj_recId);

                            soStats[lineValues["custcol_anc_relatedlineuniquekey"]] = {};
                        }






                    }
                    else
                    {

                        var submittedRecId = tranObj.save({
                            ignoreMandatoryFeilds : true,
                            enableSourcing : true
                        });
                        log.debug("submittedRecId", submittedRecId);

                        break;
                    }
                }

                log.debug("shipmentObj_recIds", shipmentObj_recIds);

                var fitmentSubmitResultSearch = search.create({
                    type : "transaction",
                    filters : [
                        ["internalid", "anyof", shipmentObj_recIds],
                        "AND",
                        ["mainline", "is", "F"],
                    ],
                    columns : SUBMITTED_FITMENT_RESULT_COLUMNS
                });
                var salesOrdersToUpdate = {};

                if(shipmentObj_recIds)
                {
                    fitmentSubmitResultSearch.run().each(function(elem){
                        var shipmentInternalId = elem.id;
                        var targetSoInternalId = elem.getValue({name:"custcol_anc_relatedtransaction"});
                        var targetSoLineUniqueKey = elem.getValue({name:"custcol_anc_relatedlineuniquekey"});
                        var shipmentLineUniqueKey = elem.getValue({name:"lineuniquekey"});
                        salesOrdersToUpdate[targetSoInternalId] = salesOrdersToUpdate[targetSoInternalId] ? salesOrdersToUpdate[targetSoInternalId] : {};
                        salesOrdersToUpdate[targetSoInternalId][targetSoLineUniqueKey] = salesOrdersToUpdate[targetSoInternalId][targetSoLineUniqueKey] ? salesOrdersToUpdate[targetSoInternalId][targetSoLineUniqueKey] : {list:[]};
                        salesOrdersToUpdate[targetSoInternalId][targetSoLineUniqueKey].list.push({shipmentInternalId, shipmentLineUniqueKey})

                        return true;
                    })
                }

                log.debug("salesOrdersToUpdate", salesOrdersToUpdate);

                var doSaveSoForLineTagging = false;
                for(var soId in salesOrdersToUpdate)
                {
                    var soRecObj = record.load({
                        type : "salesorder",
                        id : soId
                    })
                    log.debug(`UPDATE SO ${soId}`)
                    for(var soLineUniqueKey in salesOrdersToUpdate[soId]){
                        var listOfShipmentAndShipmentLines = salesOrdersToUpdate[soId][soLineUniqueKey].list || [];

                        log.debug("listOfShipmentAndShipmentLines", {soLineUniqueKey, listOfShipmentAndShipmentLines});
                        //TODO how are you going to indentify which Sales Order line to update based on the LineUniqueKey?
                        //or is it? i think it is!
                        //the line unique key can be read from searches, but not from the record object
                        // var soLineUniqueKey_lineIndex = record
                        // custcol_anc_relatedshipments

                        var targetLineIndex = soRecObj.findSublistLineWithValue({
                            sublistId : "item",
                            fieldId : "lineuniquekey",
                            value : "" + soLineUniqueKey
                        });

                        if(targetLineIndex != -1)
                        {
                            soRecObj.setSublistValue({
                                sublistId : "item",
                                fieldId : "custcol_anc_relatedshipments",
                                line : targetLineIndex,
                                value : JSON.stringify(listOfShipmentAndShipmentLines)
                            })

                            log.debug("LINKING SO LINE : " + targetLineIndex, {listOfShipmentAndShipmentLines, soLineUniqueKey, targetLineIndex})

                            doSaveSoForLineTagging = true;
                        }


                        /*
                        TODO what will you do for partial loadings? do you need partial loadings?
                        i mean what if the SO is already associated with loads, then re-fitment occurs
                        how does that look like?
                        */
                    }

                    if(doSaveSoForLineTagging)
                    {
                        var submittedSoRecid_withLinkedColumns = soRecObj.save({
                            ignoreMandatoryFields : true,
                            enableSourcing : true
                        })

                        log.debug("submittedSoRecid_withLinkedColumns", submittedSoRecid_withLinkedColumns);
                    }

                }



                // redirect.toSearchResult({
                //     search: fitmentSubmitResultSearch
                // })

            }
            catch(e)
            {
                log.error("ERROR in function fitmentCheckFormSubmitted", e);
            }
        }


        var shipmentLineIdTracker = {};
        function getInputDetails(scriptContext)
        {
            try
            {

                var srGroupedByDeliveryDate = ANC_lib.groupOrderLinesForShipmentGeneration([scriptContext.request.parameters["traninternalid"]])




                // globalrefs.tranBodyVals.location
                // globalrefs.tranItemVals.deliverydate
                // globalrefs.tranItemVals.destination



                var sublistSettings = {
                    sublistFields : [
                        {
                            label : "SELECT",
                            type : "checkbox",
                            id : "custpage_col_ifr_cb",
                            displayType : uiSw.FieldDisplayType.ENTRY,
                            defaultValue : "T"
                        },
                        {
                            label : "Line Ref",
                            type : "text",
                            id : "custpage_ifr_lineref",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "Line Unique Key",
                            type : "text",
                            id : "custpage_ifr_lineuniquekey",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "Is Crossdock?",
                            type : "checkbox",
                            id : "custpage_ifr_iscrossdock",
                            sourceSearchKey:"custrecord_anc_crossdockeligible",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },

                        {
                            label : "Leg",
                            type : "text",
                            id : "custpage_ifr_leg",
                            sourceSearchKey:"custpage_ifr_leg",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },

                        {
                            label : "Grade / Item",
                            type : "select",
                            id : "custpage_ifr_item",
                            source : "item",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "Delivery Date(MC requested to hide)", //TODO
                            type : "date",
                            id : "custpage_col_ifr_line_deliverydate",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "Ship Date",
                            type : "date",
                            id : "custpage_col_ifr_line_shipdate",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "Order Qty",
                            type : "float",
                            id : "custpage_col_ifr_orderqty",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "Reserved Qty",
                            type : "integer",
                            id : "custpage_col_ifr_reservedqty",
                            displayType : uiSw.FieldDisplayType.HIDDEN
                        },
                        {
                            label : "Fitment Reservation Qty",
                            type : "float",
                            id : "custpage_col_ifr_inputqty",
                            displayType : uiSw.FieldDisplayType.HIDDEN
                        },
                        {
                            label : "Order Weight",
                            type : "float",
                            id : "custpage_col_ifr_orderweight",
                            displayType : uiSw.FieldDisplayType.HIDDEN
                        },
                        {
                            label : "Reserved Weight",
                            type : "float",
                            id : "custpage_col_ifr_reservedweight",
                            displayType : uiSw.FieldDisplayType.HIDDEN
                        },
                        {
                            label : "Fitment Reservation Weight",
                            type : "float",
                            id : "custpage_col_ifr_inputweight",
                            displayType : uiSw.FieldDisplayType.HIDDEN
                        },
                        {
                            label : "Tied to Line",
                            type : "integer",
                            id : "custpage_ifr_tietoline",
                            displayType : uiSw.FieldDisplayType.HIDDEN
                        },
                        {
                            label : "{SO#}_{LINEREF}",
                            type : "text",
                            id : "custpage_ifr_solineref",
                            displayType : uiSw.FieldDisplayType.HIDDEN
                        },
                        {
                            label : "SO#",
                            type : "select",
                            id : "custpage_ifr_so",
                            source : "salesorder",
                            displayType : uiSw.FieldDisplayType.HIDDEN
                        },
                        {
                            label : "Equipment",
                            type : "select",
                            id : "custpage_col_ifr_equipment",
                            source : "customrecord_anc_equipment",
                            // sourceApiRespKey:"equipment",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        //FROM FITMENT CHECK API
                        {
                            label : "FTL Count",
                            type : "integer",
                            id : "custpage_ifr_ftlcount",
                            // sourceApiRespKey:"ftlcount",
                            sourceApiRespKey:"truckCount",
                            sourceSearchKey:"custpage_ifr_consignee",
                            targetShipmentColumn:"custpage_ifr_consignee",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "Shipment Quantity(NB)",
                            type : "integer",
                            id : "custpage_ifr_nb",
                            targetShipmentColumn:"quantity",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "Shipment Total Line Weight",
                            type : "float",
                            id : "custpage_ifr_linetotalweight",
                            // sourceApiRespKey:"totalWeight",
                            // targetShipmentColumn:"custbody_anc_loadingefficiency",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "FTL Ave Tonnage",
                            type : "float",
                            id : "custpage_ifr_ftlavetonnage",
                            sourceApiRespKey:"ftlavetonnage",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "FTL Ave Cost Per Ton",
                            type : "float",
                            id : "custpage_ifr_ftlavecostperton",
                            sourceApiRespKey:"ftlavecostperton",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "FTL Ave % Utilization",
                            type : "float",
                            id : "custpage_ifr_ftlavepercentutil",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "LTL Tonnage",
                            type : "float",
                            id : "custpage_ifr_ltltonnage",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "LTL % Utilization",
                            type : "float",
                            id : "custpage_ifr_ltlpercentutil",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "LTL Rolls",
                            type : "integer",
                            id : "custpage_ifr_ltlrolls",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "Origin Location",
                            type : "select",
                            id : "custpage_ifr_location",
                            source : "location",
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                        {
                            label : "Consignee",
                            type : "select",
                            id : "custpage_ifr_consignee",
                            source : CONSIGNEE_REC_TYPE,
                            displayType : uiSw.FieldDisplayType.INLINE
                        },
                    ]
                }


                var subtabs = {

                };
                var mapping = {}

                var sublistCounter = 0;
                // var a = 0;
                var gen_sublistCtr = 0;
                for(var date in srGroupedByDeliveryDate)
                {
                    var groupList_bylist = srGroupedByDeliveryDate[date].list
                    var groupList_byleg0 = srGroupedByDeliveryDate[date].leg0
                    var groupList_byleg1 = srGroupedByDeliveryDate[date].leg1
                    var groupList_byleg2 = srGroupedByDeliveryDate[date].leg2
                    log.debug("srGroupedByDeliveryDate date", date)
                    log.debug("groupList_bylist", groupList_bylist);
                    log.debug("groupList_byleg0", groupList_byleg0);
                    log.debug("groupList_byleg1", groupList_byleg1);

                    var groupByLineUniqueKey = ANC_lib.groupBy(groupList_bylist, "line_uniquekey");
                    log.debug("getInputDetails groupByLineUniqueKey " + date, groupByLineUniqueKey);

                    log.debug("srGroupedBy " + date, groupList_bylist);
                    var multiGradeIndex = 0;


                    // var fitmentCheckSublistLabel = "Fitment Check:" + toMDY_text(date);
                    var fitmentCheckSublistLabel = "Fitment Check " + (date);
                    var fitmentCheckSubtabLabel = "Fitment Check " + groupList_bylist[0].origkeys

                    var subtabObj = "";
                    var subtabId = `${(groupList_bylist[0].line_shipdate).replace(/\//g, "_")}_${groupList_bylist[0].line_location}_${groupList_bylist[0].orig_custrecord_anc_lane_destinationcity.replace(/ /g, "_")}__${groupList_bylist[0].line_equipmenttext}`
                    // var subtabId = date;
                    subtabId = subtabId.toLowerCase();
                    log.debug("subtabId", subtabId)
                    if(!subtabs[`${groupList_bylist[0].origkeys}`])
                    {
                        log.debug("`${BASE_SUBTAB_ID}_${subtabId}`", `${BASE_SUBTAB_ID}_${subtabId}`);
                        subtabObj = form.addTab({
                            // subtabObj = form.addSubtab({
                            label : fitmentCheckSubtabLabel,
                            id : `${BASE_SUBTAB_ID}_${subtabId}`,
                        });
                        subtabObj.id = `${BASE_SUBTAB_ID}_${subtabId}`;
                        mapping[groupList_bylist[0].origkeys] = `${BASE_SUBTAB_ID}_${subtabId}`
                    }
                    else
                    {
                        subtabObj = subtabs[`${groupList_bylist[0].origkeys}`]
                        subtabObj.id = `${BASE_SUBTAB_ID}_${subtabId}`;
                        mapping[groupList_bylist[0].origkeys] = `${BASE_SUBTAB_ID}_${subtabId}`
                    }
                    subtabs[`${groupList_bylist[0].origkeys}`] = subtabObj;
                    mapping[groupList_bylist[0].origkeys] = `${BASE_SUBTAB_ID}_${subtabId}`



                    var finalSubtabId = `${BASE_SUBTAB_ID}_${subtabId}_leg${0}`
                    subtabObj = form.addSubtab({
                        label : finalSubtabId,
                        id : finalSubtabId,
                        // tab : `${BASE_SUBTAB_ID}_${subtabId}`,
                        tab : `${BASE_SUBTAB_ID}_${subtabId}`
                    });
                    subtabObj.id = finalSubtabId;
                    // finalSubtabId = `${BASE_SUBTAB_ID}_${subtabId}`

                    var finalSubtabId_leg1 = `${BASE_SUBTAB_ID}_${subtabId}_leg${1}`
                    subtabObj = form.addSubtab({
                        label : finalSubtabId_leg1,
                        id : finalSubtabId_leg1,
                        // tab : `${BASE_SUBTAB_ID}_${subtabId}`,
                        tab : `${BASE_SUBTAB_ID}_${subtabId}`
                    });
                    subtabObj.id = finalSubtabId_leg1;
                    // finalSubtabId = `${BASE_SUBTAB_ID}_${subtabId}`

                    // var finalSubtabId_leg2 = `${BASE_SUBTAB_ID}_${subtabId}_leg${2}`
                    // subtabObj = form.addSubtab({
                    //     label : finalSubtabId_leg2,
                    //     id : finalSubtabId_leg2,
                    //     // tab : `${BASE_SUBTAB_ID}_${subtabId}`,
                    //     tab : `${BASE_SUBTAB_ID}_${subtabId}`
                    // });
                    // subtabObj.id = finalSubtabId_leg2;
                    // // finalSubtabId = `${BASE_SUBTAB_ID}_${subtabId}`


                    //leg0
                    var fitmentResponse = groupList_byleg0 && groupList_byleg0.length > 0 ? ANC_lib.getFitmentResponse(groupList_byleg0, shipmentLineIdTracker) : {list:[]};

                    log.debug("fitmentResponse", fitmentResponse)

                    log.debug("shipmentLineIdTracker leg0", shipmentLineIdTracker);

                    // no of rolls * weight / equipment weight = utilization
                    //total the weight of each equipment
                    var itemStats = {};

                    var fitmentResponse_list = fitmentResponse.list;
                    for(var a = 0 ; a < fitmentResponse_list.length ; a++)
                    {
                        var fitmentResponse_body = fitmentResponse_list[a].body;
                        log.debug("typeof fitmentResponse_body", typeof fitmentResponse_body)
                        fitmentResponse_body = fitmentResponse_body ? JSON.parse(fitmentResponse_body) : [];
                        log.debug("fitmentResponse_body", fitmentResponse_body)
                        var fitmentResponse_body_shipments = fitmentResponse_body.shipments || [];





                        // for(var shipCtr = 0 ; shipCtr < fitmentResponse_body_shipments.length ; shipCtr++)
                        // {
                        //     for(var shipItemsCtr = 0 ; shipItemsCtr < fitmentResponse_body_shipments[shipCtr].shipmentItems.length ; shipItemsCtr++)
                        //     {
                        //         var responseItemId = fitmentResponse_body_shipments[shipCtr].shipmentItems[shipItemsCtr].itemId;
                        //         if(itemStats[responseItemId])
                        //         {
                        //             itemStats[responseItemId].truckCount++;
                        //             itemStats[responseItemId].shipmentNumbers.push(fitmentResponse_body_shipments[shipCtr].shipmentNumber)
                        //         }
                        //         else
                        //         {
                        //             itemStats[responseItemId] = {};
                        //             itemStats[responseItemId].shipmentNumbers = [];
                        //             itemStats[responseItemId].truckCount = 1;
                        //         }
                        //     }
                        // }
                        //
                        //
                        // log.debug("itemStats", itemStats)



                        for(var b = 0 ; b < fitmentResponse_body_shipments.length ; b++)
                        {
                            var uiSublistId = BASE_SUBLIST_ID + "_" + a + "_" + b + "_" + new Date().getTime();
                            var uiSublistId = `${BASE_SUBLIST_ID}${gen_sublistCtr}data`
                            gen_sublistCtr++;
                            // var uiSublistId = BASE_SUBLIST_ID + "_" + a + "_" + b;

                            var shipmentRec = fitmentResponse_body_shipments[b];

                            targetSubtabId = "";
                            log.debug("shipmentRec", shipmentRec);
                            targetSubtabId = finalSubtabId

                            if(shipmentRec && shipmentRec.shipmentItems && shipmentRec.shipmentItems.length > 0)
                            {
                                log.debug("fitmentCheckSublistLabel + \"_\" + a + \"_\" + b", fitmentCheckSublistLabel + "_" + a + "_" + b);
                                var fitmentReservationSublist = form.addSublist({
                                    label : fitmentCheckSublistLabel + "_" + a + "_" + b + "_SUBLIST",
                                    type : "LIST",
                                    id : uiSublistId,
                                    // tab : subtabs[`${groupList_bylist[0].origkeys}`].id
                                    // tab : mapping[`${groupList_bylist[0].origkeys}`]
                                    // tab : finalSubtabId,
                                    tab : targetSubtabId
                                });
                                globalrefs["fitmentReservationSublist"] = fitmentReservationSublist;

                                log.debug("subtabObj", subtabObj);
                                log.debug("subtabs", subtabs);
                                log.debug("uiSublistId", uiSublistId);

                                fitmentReservationSublist.addButton({
                                    id : `custpage_btn_${uiSublistId}_button`,
                                    label : "Select All",
                                    functionName : `alert(123)`
                                })

                                for(var slfldCtr = 0 ; slfldCtr < sublistSettings.sublistFields.length ; slfldCtr++)
                                {

                                    var sublistFieldObj = fitmentReservationSublist.addField(sublistSettings.sublistFields[slfldCtr])
                                    if(sublistSettings.sublistFields[slfldCtr].displayType)
                                    {
                                        sublistFieldObj.updateDisplayType({
                                            displayType : sublistSettings.sublistFields[slfldCtr].displayType
                                        });
                                    }
                                    if(sublistSettings.sublistFields[slfldCtr].defaultValue)
                                    {
                                        sublistFieldObj.defaultValue = sublistSettings.sublistFields[slfldCtr].defaultValue
                                    }
                                }



                                var sublistTotalLineWeight = 0;
                                for(var c = 0 ; c < shipmentRec.shipmentItems.length ; c++)
                                {
                                    var shipmentItems = shipmentRec.shipmentItems[c]
                                    log.debug("shipmentItems", shipmentItems);
                                    log.debug("groupByLineUniqueKey", groupByLineUniqueKey);
                                    var lineDetails = groupByLineUniqueKey[""+shipmentItems.itemId];
                                    log.debug("lineDetails", lineDetails);
                                    var resObjByColumnKey = lineDetails[0];
                                    log.debug("resObjByColumnKey", resObjByColumnKey);


                                    sublistTotalLineWeight += (shipmentItems.totalWeight || 0)

                                    fitmentReservationSublist.setSublistValue({
                                        id : "custpage_ifr_nb",
                                        line : c,
                                        value : shipmentItems.nb || 12
                                    })
                                    fitmentReservationSublist.setSublistValue({
                                        id : "custpage_ifr_linetotalweight",
                                        line : c,
                                        value : shipmentItems.nb * shipmentLineIdTracker[shipmentItems.itemId].weight
                                    })

                                    fitmentReservationSublist.setSublistValue({
                                        id : "custpage_ifr_lineref",
                                        line : c,
                                        value : shipmentItems.itemId
                                    })

                                    fitmentReservationSublist.setSublistValue({
                                        id : "custpage_ifr_so",
                                        line : c,
                                        value : resObjByColumnKey.internalid
                                    })

                                    fitmentReservationSublist.setSublistValue({
                                        id : "custpage_col_ifr_line_deliverydate",
                                        line : c,
                                        value : /*"03/03/2025"*/resObjByColumnKey.line_deliverydate
                                    })

                                    fitmentReservationSublist.setSublistValue({
                                        id : "custpage_col_ifr_line_shipdate",
                                        line : c,
                                        value : /*"03/03/2025"*/resObjByColumnKey.line_shipdate
                                    })

                                    //FILL BY ORDER QTY
                                    if(resObjByColumnKey.line_quantity)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_col_ifr_orderqty",
                                            line : c,
                                            value : resObjByColumnKey.line_quantity
                                        })
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_consignee",
                                            line : c,
                                            value : resObjByColumnKey.line_consignee
                                        })
                                    }


                                    if(resObjByColumnKey.line_equipment)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_col_ifr_equipment",
                                            line : c,
                                            value : (resObjByColumnKey.line_equipment)
                                        })
                                    }
                                    if(resObjByColumnKey.line_quantity)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_col_ifr_inputqty",
                                            line : c,
                                            value : resObjByColumnKey.line_quantity - (resObjByColumnKey.line_reservedqty || 0)
                                        })
                                    }
                                    if(resObjByColumnKey.line_consginee)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_col_ifr_consginee",
                                            line : c,
                                            value : (resObjByColumnKey.line_consginee)
                                        })
                                    }




                                    //FILL BY ORDER WEIGHT
                                    if(resObjByColumnKey.line_quantity)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_col_ifr_orderweight",
                                            line : c,
                                            value : resObjByColumnKey.line_quantity
                                        })
                                    }
                                    if(resObjByColumnKey.line_quantity)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_col_ifr_reservedweight",
                                            line : c,
                                            value : (resObjByColumnKey.line_reservedweight || 0)
                                        })
                                    }
                                    if(resObjByColumnKey.line_quantity)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_col_ifr_inputweight",
                                            line : c,
                                            value : resObjByColumnKey.line_quantity - (resObjByColumnKey.line_reservedweight || 0)
                                        })
                                    }




                                    if(resObjByColumnKey.line_id)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_lineref",
                                            line : c,
                                            value : resObjByColumnKey.line_id
                                        })
                                    }
                                    if(resObjByColumnKey.line_uniquekey)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_lineuniquekey",
                                            line : c,
                                            value : resObjByColumnKey.line_uniquekey
                                        })
                                    }
                                    if(resObjByColumnKey.custrecord_anc_crossdockeligible && resObjByColumnKey.custrecord_anc_crossdockeligible != "F")
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_iscrossdock",
                                            line : c,
                                            value : "T"
                                        })
                                    }
                                    if(resObjByColumnKey.custpage_ifr_leg)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_leg",
                                            line : c,
                                            value : (resObjByColumnKey.custpage_ifr_leg)
                                        })
                                    }
                                    if(resObjByColumnKey.internalid && resObjByColumnKey.line_id)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_solineref",
                                            line : c,
                                            value : resObjByColumnKey.internalid + "_" + resObjByColumnKey.line_id
                                        })
                                    }
                                    if(resObjByColumnKey.line_item)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_item",
                                            line : c,
                                            value : resObjByColumnKey.line_item
                                        })
                                    }
                                    if(resObjByColumnKey.line_location)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_location",
                                            line : c,
                                            value : resObjByColumnKey.line_location
                                        })
                                    }

                                }
                            }
                        }
                    }

                    //leg1
                    var fitmentResponse = groupList_byleg1 && groupList_byleg1.length > 0 ? ANC_lib.getFitmentResponse(groupList_byleg1, shipmentLineIdTracker) : {list:[]};

                    log.debug("fitmentResponse", fitmentResponse)

                    log.debug("shipmentLineIdTracker leg1", shipmentLineIdTracker);

                    // no of rolls * weight / equipment weight = utilization
                    //total the weight of each equipment
                    var itemStats = {};

                    var fitmentResponse_list = fitmentResponse.list;
                    for(var a = 0 ; a < fitmentResponse_list.length ; a++)
                    {
                        var fitmentResponse_body = fitmentResponse_list[a].body;
                        log.debug("leg1 typeof fitmentResponse_body", typeof fitmentResponse_body)
                        fitmentResponse_body = fitmentResponse_body ? JSON.parse(fitmentResponse_body) : [];
                        log.debug("leg1 fitmentResponse_body", fitmentResponse_body)
                        var fitmentResponse_body_shipments = fitmentResponse_body.shipments || [];





                        // for(var shipCtr = 0 ; shipCtr < fitmentResponse_body_shipments.length ; shipCtr++)
                        // {
                        //     for(var shipItemsCtr = 0 ; shipItemsCtr < fitmentResponse_body_shipments[shipCtr].shipmentItems.length ; shipItemsCtr++)
                        //     {
                        //         var responseItemId = fitmentResponse_body_shipments[shipCtr].shipmentItems[shipItemsCtr].itemId;
                        //         if(itemStats[responseItemId])
                        //         {
                        //             itemStats[responseItemId].truckCount++;
                        //             itemStats[responseItemId].shipmentNumbers.push(fitmentResponse_body_shipments[shipCtr].shipmentNumber)
                        //         }
                        //         else
                        //         {
                        //             itemStats[responseItemId] = {};
                        //             itemStats[responseItemId].shipmentNumbers = [];
                        //             itemStats[responseItemId].truckCount = 1;
                        //         }
                        //     }
                        // }
                        //
                        //
                        // log.debug("itemStats", itemStats)



                        for(var b = 0 ; b < fitmentResponse_body_shipments.length ; b++)
                        {
                            var uiSublistId = BASE_SUBLIST_ID + "_" + a + "_" + b + "_" + new Date().getTime();
                            var uiSublistId = `${BASE_SUBLIST_ID}${gen_sublistCtr}data`
                            gen_sublistCtr++;
                            // var uiSublistId = BASE_SUBLIST_ID + "_" + a + "_" + b;

                            var shipmentRec = fitmentResponse_body_shipments[b];

                            targetSubtabId = "";
                            log.debug("leg1 shipmentRec" + b, shipmentRec);
                            targetSubtabId = finalSubtabId_leg1

                            if(shipmentRec && shipmentRec.shipmentItems && shipmentRec.shipmentItems.length > 0)
                            {
                                log.debug("leg1 fitmentCheckSublistLabel + \"_\" + a + \"_\" + b", fitmentCheckSublistLabel + "_" + a + "_" + b);
                                var fitmentReservationSublist = form.addSublist({
                                    label : fitmentCheckSublistLabel + "_" + a + "_" + b + "_SUBLIST",
                                    type : "LIST",
                                    id : uiSublistId,
                                    // tab : subtabs[`${groupList_bylist[0].origkeys}`].id
                                    // tab : mapping[`${groupList_bylist[0].origkeys}`]
                                    // tab : finalSubtabId,
                                    tab : targetSubtabId
                                });
                                globalrefs["leg1 fitmentReservationSublist"] = fitmentReservationSublist;

                                log.debug("leg1 subtabObj", subtabObj);
                                log.debug("leg1 subtabs", subtabs);
                                log.debug("uiSublistId", uiSublistId);

                                fitmentReservationSublist.addButton({
                                    id : `custpage_btn_${uiSublistId}_button`,
                                    label : "Select All",
                                    functionName : `alert(123)`
                                })

                                for(var slfldCtr = 0 ; slfldCtr < sublistSettings.sublistFields.length ; slfldCtr++)
                                {

                                    var sublistFieldObj = fitmentReservationSublist.addField(sublistSettings.sublistFields[slfldCtr])
                                    if(sublistSettings.sublistFields[slfldCtr].displayType)
                                    {
                                        sublistFieldObj.updateDisplayType({
                                            displayType : sublistSettings.sublistFields[slfldCtr].displayType
                                        });
                                    }
                                    if(sublistSettings.sublistFields[slfldCtr].defaultValue)
                                    {
                                        sublistFieldObj.defaultValue = sublistSettings.sublistFields[slfldCtr].defaultValue
                                    }
                                }



                                sublistTotalLineWeight = sublistTotalLineWeight ? sublistTotalLineWeight : 0;
                                for(var c = 0 ; c < shipmentRec.shipmentItems.length ; c++)
                                {
                                    var shipmentItems = shipmentRec.shipmentItems[c]
                                    log.debug("leg1 shipmentItems", shipmentItems);
                                    log.debug("leg1 groupByLineUniqueKey", groupByLineUniqueKey);
                                    var lineDetails = groupByLineUniqueKey[""+shipmentItems.itemId];
                                    var nb = groupByLineUniqueKey[""+shipmentItems.nb];
                                    log.debug("leg1 lineDetails", lineDetails);
                                    var resObjByColumnKey = lineDetails[0];
                                    log.debug("leg1 resObjByColumnKey", resObjByColumnKey);

                                    sublistTotalLineWeight += (shipmentItems.totalWeight || 0)

                                    fitmentReservationSublist.setSublistValue({
                                        id : "custpage_ifr_nb",
                                        line : c,
                                        value : shipmentItems.nb || 12
                                    })
                                    fitmentReservationSublist.setSublistValue({
                                        id : "custpage_ifr_linetotalweight",
                                        line : c,
                                        value : shipmentItems.nb * shipmentLineIdTracker[""+shipmentItems.itemId].weight
                                    })

                                    fitmentReservationSublist.setSublistValue({
                                        id : "custpage_ifr_lineref",
                                        line : c,
                                        value : shipmentItems.itemId
                                    })

                                    fitmentReservationSublist.setSublistValue({
                                        id : "custpage_ifr_so",
                                        line : c,
                                        value : resObjByColumnKey.internalid
                                    })

                                    fitmentReservationSublist.setSublistValue({
                                        id : "custpage_col_ifr_line_deliverydate",
                                        line : c,
                                        value : /*"03/03/2025"*/resObjByColumnKey.line_deliverydate
                                    })

                                    fitmentReservationSublist.setSublistValue({
                                        id : "custpage_col_ifr_line_shipdate",
                                        line : c,
                                        value : /*"03/03/2025"*/resObjByColumnKey.line_shipdate
                                    })

                                    //FILL BY ORDER QTY
                                    if(resObjByColumnKey.line_quantity)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_col_ifr_orderqty",
                                            line : c,
                                            value : resObjByColumnKey.line_quantity
                                        })
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_consignee",
                                            line : c,
                                            value : resObjByColumnKey.line_consignee
                                        })
                                    }


                                    if(resObjByColumnKey.line_equipment)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_col_ifr_equipment",
                                            line : c,
                                            value : (resObjByColumnKey.line_equipment)
                                        })
                                    }
                                    if(resObjByColumnKey.line_quantity)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_col_ifr_inputqty",
                                            line : c,
                                            value : resObjByColumnKey.line_quantity - (resObjByColumnKey.line_reservedqty || 0)
                                        })
                                    }
                                    if(resObjByColumnKey.line_consginee)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_col_ifr_consginee",
                                            line : c,
                                            value : (resObjByColumnKey.line_consginee)
                                        })
                                    }




                                    //FILL BY ORDER WEIGHT
                                    if(resObjByColumnKey.line_quantity)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_col_ifr_orderweight",
                                            line : c,
                                            value : resObjByColumnKey.line_quantity
                                        })
                                    }
                                    if(resObjByColumnKey.line_quantity)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_col_ifr_reservedweight",
                                            line : c,
                                            value : (resObjByColumnKey.line_reservedweight || 0)
                                        })
                                    }
                                    if(resObjByColumnKey.line_quantity)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_col_ifr_inputweight",
                                            line : c,
                                            value : resObjByColumnKey.line_quantity - (resObjByColumnKey.line_reservedweight || 0)
                                        })
                                    }




                                    if(resObjByColumnKey.line_id)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_lineref",
                                            line : c,
                                            value : resObjByColumnKey.line_id
                                        })
                                    }
                                    if(resObjByColumnKey.line_uniquekey)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_lineuniquekey",
                                            line : c,
                                            value : resObjByColumnKey.line_uniquekey
                                        })
                                    }
                                    if(resObjByColumnKey.custrecord_anc_crossdockeligible && resObjByColumnKey.custrecord_anc_crossdockeligible != "F")
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_iscrossdock",
                                            line : c,
                                            value : "T"
                                        })
                                    }
                                    if(resObjByColumnKey.custpage_ifr_leg)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_leg",
                                            line : c,
                                            value : (resObjByColumnKey.custpage_ifr_leg)
                                        })
                                    }
                                    if(resObjByColumnKey.internalid && resObjByColumnKey.line_id)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_solineref",
                                            line : c,
                                            value : resObjByColumnKey.internalid + "_" + resObjByColumnKey.line_id
                                        })
                                    }
                                    if(resObjByColumnKey.line_item)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_item",
                                            line : c,
                                            value : resObjByColumnKey.line_item
                                        })
                                    }
                                    if(resObjByColumnKey.line_location)
                                    {
                                        fitmentReservationSublist.setSublistValue({
                                            id : "custpage_ifr_location",
                                            line : c,
                                            value : resObjByColumnKey.line_location
                                        })
                                    }

                                }
                            }

                        }
                    }


                    // a++;
                }

            }
            catch(e)
            {
                log.error("ERROR in function getInputDetails", e)
            }
        }




        function fillSublist(scriptContext)
        {
            var inputDetails = getInputDetails(scriptContext)


            // fitmentReservationSublist
        }

        // function getFitmentResponse(scriptContext)
        // {
        //     var fitmentResponse = {
        //         list : []
        //     };
        //     try
        //     {
        //         var fitmentObj = {
        //             loadid: "1",
        //             loadnumber: "1",
        //             weightplanned: "weight planned",
        //             percentage: "10",
        //         };
        //         fitmentResponse.list.push(fitmentObj)
        //
        //         var fitmentObj = {
        //             loadid: "17424",
        //             loadnumber: "4",
        //             weightplanned: "weight planned",
        //             percentage: "34.567",
        //         };
        //         fitmentResponse.list.push(fitmentObj)
        //     }
        //     catch(e)
        //     {
        //         log.error("ERROR in function getFitmentResponse", e);
        //     }
        //     return fitmentResponse;
        // }



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
        const toMDY_text = (dateVal) => {
            var retVal = dateVal;
            try
            {
                if(dateVal)
                {
                    retVal = new Date(retVal);

                    retVal = retVal.getMonth() + 1 + "/" + retVal.getDate() + "/" + retVal.getFullYear();
                }

            }
            catch(e)
            {
                log.error("ERROR in function toMDY", e)
            }
            log.debug("retVal", retVal)
            return retVal;
        }


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



/*
sample payload
{"JurisdictionName":"Canada","vehicleName":"TRTAMHTR53","transportationMode":"TRUCK","orderItems":[{"ItemId":"69348155","Diameter":100,"Width":100,"Weight":"673.1","Nb":"40","Type":1,"RPP":1}]}
 */

/*
sample response
{
  "isSuccess": true,
  "errorMessage": "",
  "shipments": [
    {
      "shipmentNumber": 1,
      "shipmentItems": [
        {
          "itemId": "69348155",
          "nb": 24
        }
      ],
      "base64Image": "",
      "loadingPattern": null
    },
    {
      "shipmentNumber": 2,
      "shipmentItems": [
        {
          "itemId": "69348154",
          "nb": 8
        },
        {
          "itemId": "69348155",
          "nb": 16
        }
      ],
      "base64Image": "",
      "loadingPattern": null
    },
    {
      "shipmentNumber": 3,
      "shipmentItems": [
        {
          "itemId": "69348154",
          "nb": 24
        }
      ],
      "base64Image": "",
      "loadingPattern": null
    },
    {
      "shipmentNumber": 4,
      "shipmentItems": [
        {
          "itemId": "69348154",
          "nb": 8
        }
      ],
      "base64Image": "",
      "loadingPattern": null
    }
  ]
}
 */
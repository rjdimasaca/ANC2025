/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/https', 'N/record', 'N/redirect', 'N/runtime', 'N/search', 'N/url', 'N/ui/serverWidget'],
    /**
     * @param{runtime} runtime
     * @param{search} search
     * @param{url} url
     */
    (https, record, redirect, runtime, search, url, uiSw) => {

        var globalrefs = {};
        var orderLineLimit = 0;
        var fitmentLineLimit = 1;
        var allowMultiGrade = true;
        var DEBUGMODE = false;
        var accountId = "";
        var form = "";
        var CONSIGNEE_REC_TYPE = "customrecord_alberta_ns_consignee_record"

        var SUBMITTED_FITMENT_RESULT_COLUMNS = [
            "tranid",
            "custcol_anc_relatedtransaction",
            "custcol_anc_relatedlineuniquekey",
            "item",
            "custcol_anc_actualitemtobeshipped",
            /*"custbody_anc_subcustomerconsignee",*/
            "custbody_anc_carrier",
            "custbody_anc_vehicleno",
            "custbody_anc_trackingno"
        ];

        var TEMPORARY_SHIPMENT_ITEM = 188748;

        var BASE_SUBLIST_ID = "custpage_sublist_fitmentcheck";

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

        function fitmentCheckFormSubmitted(scriptContext)
        {
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
                    if(scriptContext.request.parameters[`${BASE_SUBLIST_ID}${sublistCtr}data`]){

                        log.debug(`ITERATING THE FITMENT CHECK SUBLISTS index=${sublistCtr}`, scriptContext.request.parameters[`${BASE_SUBLIST_ID}${sublistCtr}data`]);

                        uiSublistId = `${BASE_SUBLIST_ID}${sublistCtr}`

                        var lineCount = scriptContext.request.getLineCount({
                            group : uiSublistId
                        });
                        log.debug("lineCount", lineCount);

                        var doCreateShipment = false;
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
                                // nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId()).getLineItemValue("item", "line", 3)
                                // {"custpage_col_ifr_cb":"T","custpage_col_ifr_inputqty":"1","custpage_ifr_weightplanned":"weight planned","custpage_ifr_percentage":"34.567","custpage_ifr_loadnum":"4","custpage_ifr_loadid":"17424"}
                                // var targetIndex = tranObj.findSublistLineWithValue({
                                //     sublistId : "item",
                                //     fieldId : "line",
                                //     value : tranLinenum
                                // })
                                // log.debug("POST tranLinenum", tranLinenum)
                                // tranObj.selectLine({
                                //     sublistId : "item",
                                //     line : targetIndex
                                // })
                                // log.debug("POST targetIndex", targetIndex)
                                // tranObj.setCurrentSublistValue({
                                //     sublistId : "item",
                                //     fieldId : "custcol_anc_lxpert_loadweightplanned",
                                //     line : targetIndex,
                                //     value : lineValues["custpage_ifr_weightplanned"]
                                // })
                                // tranObj.setCurrentSublistValue({
                                //     sublistId : "item",
                                //     fieldId : "custcol_anc_lxpert_loadscount",
                                //     line : targetIndex,
                                //     value : lineValues["custpage_ifr_loadnum"]
                                // })
                                // tranObj.setCurrentSublistValue({
                                //     sublistId : "item",
                                //     fieldId : "custcol_anc_lxpert_lastloadutilrate",
                                //     line : targetIndex,
                                //     value : lineValues["custpage_ifr_percentage"]
                                // })
                                // tranObj.setCurrentSublistValue({
                                //     sublistId : "item",
                                //     fieldId : "custcol_anc_lxpert_loadreservedqty",
                                //     line : targetIndex,
                                //     value : lineValues["custpage_col_ifr_inputqty"]
                                // })
                                // log.debug("before commit")
                                // tranObj.commitLine({
                                //     sublistId : "item",
                                // })
                                // log.debug("after commit")

                                doCreateShipment = true;

                                shipmentLineValues.push(lineValues)
                            }

                            log.debug("shipmentLineValues", shipmentLineValues);

                            var keptInfoForShipmentCreation = {
                                targetConsignee : {val : ""},
                                targetOriginLoc : {val : ""},
                                targetDeliveryDate : {val : ""},
                            };
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
                                }

                                var shipmentObj_recId = shipmentObj.save({
                                    ignoreMandatoryFields : true
                                });
                                log.debug("shipmentObj_recId", shipmentObj_recId);

                                shipmentObj_recIds.push(shipmentObj_recId);

                                soStats[lineValues["custcol_anc_relatedlineuniquekey"]] = {};
                            }


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

                redirect.toSearchResult({
                    search: fitmentSubmitResultSearch
                })

            }
            catch(e)
            {
                log.error("ERROR in function fitmentCheckFormSubmitted", e);
            }
        }

        function getInputDetails(scriptContext)
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


                // globalrefs.tranBodyVals.location
                // globalrefs.tranItemVals.deliverydate
                // globalrefs.tranItemVals.destination
                if(scriptContext.request.parameters["traninternalid"])
                {
                    filters.push("AND")
                    filters.push(["internalid","anyof",scriptContext.request.parameters["traninternalid"]])
                }
                // if(globalrefs.tranBodyVals.location)
                // {
                //     filters.push("AND")
                //     filters.push(["location","anyof",globalrefs.tranBodyVals.location])
                // }
                // if(globalrefs.tranItemVals.deliverydate)
                // {
                //     filters.push("AND")
                //     filters.push(["trandate","on",globalrefs.tranItemVals.deliverydate])
                // }
                // if(globalrefs.tranItemVals.destinationid)
                // {
                //     filters.push("AND")
                //     filters.push(["line.cseg_anc_dstnation","anyof",globalrefs.tranItemVals.destinationid])
                // }

                log.debug("filters", filters)

                var salesorderSearchObj = search.create({
                    type: "salesorder",
                    filters: filters,
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "internalid"}),
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
                            search.createColumn({name: "custcol_010linememoinstruction", label: "line_memo"}),
                            //TODO you dont need it as result, only as filter, you need to join to line
                            // search.createColumn({name: "line.cseg_anc_dstnation", label: "line_memo"}),
                            search.createColumn({name: "custcol_anc_lxpert_loadreservedqty", label: "line_reservedqty"}),
                            search.createColumn({name: "custcol_anc_lxpert_loadreservedwt", label: "line_reservedweight"}),
                            search.createColumn({name: "custcol_anc_deliverydate", label: "line_deliverydate"}),
                            search.createColumn({name: "custcol_anc_shipdate", label: "line_shipdate"}),
                            search.createColumn({name: "custcol_consignee", label: "line_consignee"}),
                            // search.createColumn({name: "custcol_anc_equipment", label: "line_equipment"}), // equipment is not meant to be here
                            search.createColumn({name: "custcol_anc_equipment", label: "line_equipment"}),
                            search.createColumn({name: "custcol_anc_rollsperpack", label: "line_rollsperpack"}),
                            search.createColumn({name: "custcol_anc_transitoptmethod", label: "line_transitoptmethod"}),
                            search.createColumn({name: "custitembasis_weight", join:"item", label: "line_item_basis_weight"}),
                            search.createColumn({
                                name: "custitem_anc_rolldiameter",
                                join: "item",
                                label: "line_item_rolldiameter"
                            }),
                            search.createColumn({
                                name: "custitem_anc_rollwidth",
                                join: "item",
                                label: "line_item_rollwidth"
                            }),
                            search.createColumn({name: "custrecord_anc_lane_cde", join:"custcol_anc_shippinglane", label: "custrecord_anc_lane_cde"}),
                            search.createColumn({name: "custrecord_anc_lane_lce", join:"custcol_anc_shippinglane", label: "custrecord_anc_lane_lce"}),
                            search.createColumn({name: "custrecord_anc_lane_ftte", join:"custcol_anc_shippinglane", label: "custrecord_anc_lane_ftte"}),
                            search.createColumn({name: "custrecord_anc_lane_originwarehousecity", join:"custcol_anc_shippinglane", label: "custrecord_anc_lane_originwarehousecity"}),
                            search.createColumn({name: "custrecord_anc_lane_destinationcity", join:"custcol_anc_shippinglane", label: "custrecord_anc_lane_destinationcity"}),
                            search.createColumn({name: "custrecord_anc_lane_crossdockcity", join:"custcol_anc_shippinglane", label: "custrecord_anc_lane_crossdockcity"}),
                        ]
                });
                var searchResultCount = salesorderSearchObj.runPaged().count;
                log.debug("salesorderSearchObj result count",searchResultCount);
                // salesorderSearchObj.run().each(function(result){
                //     // .run().each has a limit of 4,000 results
                //     return true;
                // });

                var sr = getResults(salesorderSearchObj.run());

                var firstLocationId = "";
                var firstLocationText = "";
                var srToObjects = sr.map(function(res){
                    // var res = sr[a];

                    var columns = res.columns;

                    var resObjByColumnKey = {}
                    columns.forEach(function(column) {
                        var label = column.label || column.name; // Fallback to name if label is unavailable
                        var value = res.getValue(column);

                        // if(label == "line_deliverydate")
                        // {
                        //     resObjByColumnKey.line_deliverydatetext = res.getText(column);
                        // }

                        resObjByColumnKey[label] = value;


                        if(label == "line_location")
                        {
                            if(!firstLocationId)
                            {
                                firstLocationId = res.getValue(column);
                            }
                            if(!firstLocationText)
                            {
                                firstLocationText = res.getText(column);
                            }

                            resObjByColumnKey.line_location = firstLocationId;
                            resObjByColumnKey.line_locationtext = firstLocationText;
                        }
                        if(label == "line_consignee")
                        {
                            resObjByColumnKey.line_consigneetext = res.getText(column);
                        }
                        if(label == "line_equipment")
                        {
                            resObjByColumnKey.line_equipmenttext = res.getText(column);
                        }
                        if(label == "line_item_rollwidth")
                        {
                            resObjByColumnKey.line_item_rollwidthtext = res.getText(column);
                        }
                        if(label == "line_item_rolldiameter")
                        {
                            resObjByColumnKey.line_item_rolldiametertext = res.getText(column);
                        }
                    });

                    resObjByColumnKey.id = res.id



                    return resObjByColumnKey;
                })
                log.debug("srToObjects", srToObjects)

                // var srGroupedByDeliveryDate = groupBy(srToObjects, "line_shipdate")
                // var srGroupedByDeliveryDate = groupByKeys(srToObjects, ["line_shipdate", "line_locationtext", "line_consigneetext", /*"line_equipmenttext"*/])
                var srGroupedByDeliveryDate = groupByKeys(srToObjects, ["line_shipdate", "line_locationtext", "custrecord_anc_lane_destinationcity", /*"line_equipmenttext"*/])
                log.debug("srGroupedByDeliveryDate", srGroupedByDeliveryDate)


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


                var a = 0;
                for(var date in srGroupedByDeliveryDate)
                {

                    log.debug("srGroupedByDeliveryDate[date]", srGroupedByDeliveryDate[date]);
                    var multiGradeIndex = 0;

                    var uiSublistId = BASE_SUBLIST_ID + a;
                    // var fitmentCheckSublistLabel = "Fitment Check:" + toMDY_text(date);
                    var fitmentCheckSublistLabel = "Fitment Check " + (date);


                    var fitmentReservationSublist = form.addSublist({
                        label : fitmentCheckSublistLabel,
                        type : "LIST",
                        id : uiSublistId,
                    });
                    globalrefs["fitmentReservationSublist"] = fitmentReservationSublist;

                    fitmentReservationSublist.addButton({
                        id : `custpage_btn_${uiSublistId}_button`,
                        label : "Select All",
                        functionName : `alert(123)`
                    })



                    var fitmentResponse = getFitmentResponse(srGroupedByDeliveryDate[date]);

                    log.debug("fitmentResponse", fitmentResponse)

// no of rolls * weight / equipment weight = utilization
                    //total the weight of each equipment
                    var itemStats = {};
                    var fitmentResponse_body = fitmentResponse.body;
                    log.debug("typeof fitmentResponse_body", typeof fitmentResponse_body)
                    fitmentResponse_body = JSON.parse(fitmentResponse_body)
                    log.debug("fitmentResponse_body", fitmentResponse_body)
                    var fitmentResponse_body_shipments = fitmentResponse_body.shipments || [];

                    for(var shipCtr = 0 ; shipCtr < fitmentResponse_body_shipments.length ; shipCtr++)
                    {
                        for(var shipItemsCtr = 0 ; shipItemsCtr < fitmentResponse_body_shipments[shipCtr].shipmentItems.length ; shipItemsCtr++)
                        {
                            var responseItemId = fitmentResponse_body_shipments[shipCtr].shipmentItems[shipItemsCtr].itemId;
                            if(itemStats[responseItemId])
                            {
                                itemStats[responseItemId].truckCount++;
                                itemStats[responseItemId].shipmentNumbers.push(fitmentResponse_body_shipments[shipCtr].shipmentNumber)
                            }
                            else
                            {
                                itemStats[responseItemId] = {};
                                itemStats[responseItemId].shipmentNumbers = [];
                                itemStats[responseItemId].truckCount = 1;
                            }
                        }
                    }


                    log.debug("itemStats", itemStats)


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


                    //END new specs based on ERD provided 03/12/2025

                    var deliveryDateGroup = srGroupedByDeliveryDate[date];
                    for(var c = 0 ; c < deliveryDateGroup.length ; c++)
                    {
                        var resObjByColumnKey = deliveryDateGroup[c]

                        var firstSoRefLineIndex = (multiGradeIndex || 0);
                        for(var b = 0; b < fitmentLineLimit; b++)
                        {
                            if(b == 0)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_ifr_tietoline",
                                    line : multiGradeIndex || b,
                                    value : (multiGradeIndex || b)+1
                                })
                            }
                            else if(b > 0)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_ifr_tietoline",
                                    line : multiGradeIndex || b,
                                    value : firstSoRefLineIndex
                                })
                            }
                            if(resObjByColumnKey.internalid)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_ifr_so",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.internalid
                                })
                            }

                            // log.debug("resObjByColumnKey.line_deliverydate", resObjByColumnKey.line_deliverydate);
                            log.debug("resObjByColumnKey.line_shipdate", resObjByColumnKey.line_shipdate);
                            if(resObjByColumnKey.line_deliverydate)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_col_ifr_line_deliverydate",
                                    line : multiGradeIndex || b,
                                    value : /*"03/03/2025"*/resObjByColumnKey.line_deliverydate
                                })
                            }
                            if(resObjByColumnKey.line_shipdate)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_col_ifr_line_shipdate",
                                    line : multiGradeIndex || b,
                                    value : /*"03/03/2025"*/resObjByColumnKey.line_shipdate
                                })
                            }

                            //FILL BY ORDER QTY
                            if(resObjByColumnKey.line_quantity)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_col_ifr_orderqty",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.line_quantity
                                })
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_ifr_consignee",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.line_consignee
                                })
                            }
                            if(resObjByColumnKey.line_quantity)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_col_ifr_reservedqty",
                                    line : multiGradeIndex || b,
                                    value : (resObjByColumnKey.line_reservedqty || 0)
                                })
                            }
                            if(resObjByColumnKey.line_equipment)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_col_ifr_equipment",
                                    line : multiGradeIndex || b,
                                    value : (resObjByColumnKey.line_equipment)
                                })
                            }
                            if(resObjByColumnKey.line_quantity)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_col_ifr_inputqty",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.line_quantity - (resObjByColumnKey.line_reservedqty || 0)
                                })
                            }
                            if(resObjByColumnKey.line_consginee)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_col_ifr_consginee",
                                    line : multiGradeIndex || b,
                                    value : (resObjByColumnKey.line_consginee)
                                })
                            }

                            //FILL BY ORDER WEIGHT
                            if(resObjByColumnKey.line_quantity)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_col_ifr_orderweight",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.line_quantity
                                })
                            }
                            if(resObjByColumnKey.line_quantity)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_col_ifr_reservedweight",
                                    line : multiGradeIndex || b,
                                    value : (resObjByColumnKey.line_reservedweight || 0)
                                })
                            }
                            if(resObjByColumnKey.line_quantity)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_col_ifr_inputweight",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.line_quantity - (resObjByColumnKey.line_reservedweight || 0)
                                })
                            }




                            if(resObjByColumnKey.line_id)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_ifr_lineref",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.line_id
                                })
                            }
                            if(resObjByColumnKey.line_uniquekey)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_ifr_lineuniquekey",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.line_uniquekey
                                })
                            }
                            if(resObjByColumnKey.internalid && resObjByColumnKey.line_id)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_ifr_solineref",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.internalid + "_" + resObjByColumnKey.line_id
                                })
                            }
                            if(resObjByColumnKey.line_item)
                            {
                                fitmentReservationSublist.setSublistValue({
                                    id : "custpage_ifr_item",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.line_item
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

                            // fitmentReservationSublist.setSublistValue({
                            //     id : sublistSettings.sublistFields[slfldCtr1].id,
                            //     line : multiGradeIndex || b,
                            //     value : fitmentResponse.list[b][sublistSettings.sublistFields[slfldCtr1].sourceApiRespKey]
                            // })

                            log.debug("sublistSettings.sublistFields.length", sublistSettings.sublistFields.length);


                            log.debug("resObjByColumnKey.line_uniquekey", resObjByColumnKey.line_uniquekey)
                            if(itemStats[resObjByColumnKey.line_uniquekey])
                            {
                                for(var slfldCtr1 = 0 ; slfldCtr1 < sublistSettings.sublistFields.length ; slfldCtr1++)
                                {
                                    // log.debug("fsublistSettings.sublistFields[slfldCtr1].sourceApiRespKey 0 ", sublistSettings.sublistFields[slfldCtr1].sourceApiRespKey)

                                    if(sublistSettings.sublistFields[slfldCtr1].sourceApiRespKey)
                                    {
                                        if(itemStats[resObjByColumnKey.line_uniquekey][sublistSettings.sublistFields[slfldCtr1].sourceApiRespKey])
                                        {
                                            log.debug("fitmentResponse:itemStats[resObjByColumnKey.line_uniquekey][sublistSettings.sublistFields[slfldCtr1].sourceApiRespKey] 1 ", itemStats[resObjByColumnKey.line_uniquekey][sublistSettings.sublistFields[slfldCtr1].sourceApiRespKey])

                                            fitmentReservationSublist.setSublistValue({
                                                id : sublistSettings.sublistFields[slfldCtr1].id,
                                                line : multiGradeIndex || b,
                                                value : itemStats[resObjByColumnKey.line_uniquekey][sublistSettings.sublistFields[slfldCtr1].sourceApiRespKey]
                                            })
                                        }

                                    }

                                }
                            }




                            // if(fitmentResponse.list[b] && fitmentResponse.list[b].loadid)
                            // {
                            //     fitmentReservationSublist.setSublistValue({
                            //         id : "custpage_ifr_loadid",
                            //         line : multiGradeIndex || b,
                            //         value : fitmentResponse.list[b].loadid
                            //     })
                            // }
                            // if(fitmentResponse.list[b] && fitmentResponse.list[b].loadnumber)
                            // {
                            //     fitmentReservationSublist.setSublistValue({
                            //         id : "custpage_ifr_loadnum",
                            //         line : multiGradeIndex || b,
                            //         value : fitmentResponse.list[b].loadnumber
                            //     })
                            // }
                            // if(fitmentResponse.list[b] && fitmentResponse.list[b].weightplanned)
                            // {
                            //     fitmentReservationSublist.setSublistValue({
                            //         id : "custpage_ifr_weightplanned",
                            //         line : multiGradeIndex || b,
                            //         value : fitmentResponse.list[b].weightplanned
                            //     })
                            // }
                            // if(fitmentResponse.list[b] && fitmentResponse.list[b].percentage)
                            // {
                            //     fitmentReservationSublist.setSublistValue({
                            //         id : "custpage_ifr_percentage",
                            //         line : multiGradeIndex || b,
                            //         value : fitmentResponse.list[b].percentage
                            //     })
                            // }
                            if(allowMultiGrade)
                            {
                                multiGradeIndex++;
                            }
                        }
                    }

                    a++;
                }

            }
            catch(e)
            {
                log.error("ERROR in function getInputDetails", e)
            }
        }

        function groupBy(objectArray, property) {
            return objectArray.reduce(function (acc, obj) {
                var key = obj[property];
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(obj);
                return acc;
            }, {});
        }

        function groupByKeys(objectArray, property) {
            return objectArray.reduce(function (acc, obj) {

                var key = "";
                for(var a = 0 ; a < property.length; a++)
                {
                    key +=  " | " + (obj[property[a]] || "");
                }
                // key += "|"

                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(obj);
                return acc;
            }, {});
        }

        // var groupBy = function(xs, key) {
        //     return xs.reduce(function(rv, x) {
        //         (rv[x[key]] ??= []).push(x);
        //         return rv;
        //     }, {});
        // };


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

        function getFitmentResponse(rawRequestData)
        {
            log.debug("getFitmentResponse rawRequestData", rawRequestData)
            var fitmentResponse = {
                list : []
            };
            var fitmentRequestData = {};
            // fitmentRequestData.country = "Canada"; //TODO
            fitmentRequestData.JurisdictionName = "Canada"; //TODO
            fitmentRequestData.vehicleName = rawRequestData[0].line_equipmenttext || "TRTAMDV53"; //TODO REMOVE THIS FALLBACK DEFAULT
            fitmentRequestData.transportationMode = "TRUCK"; //TODO
            fitmentRequestData.orderItems = [];
            try
            {
                // fitmentRequestData.orderItems.push(
                //     {
                //         ItemId : "188522",
                //         Diameter : 127, //TODO
                //         Width : 85.09,
                //         Weight : 645.2,
                //         Nb : 70,
                //         Type : 1,
                //         RPP : 1,
                //     }
                // )
                // fitmentRequestData.orderItems.push(
                //     {
                //         ItemId : "188537",
                //         Diameter : 127, //TODO
                //         Width : 88.90,
                //         Weight : 673.1,
                //         Nb : 28,
                //         Type : 1,
                //         RPP : 1,
                //     }
                // )
                //TODO
                for(var a = 0 ; a < rawRequestData.length ; a++)
                {
                    fitmentRequestData.orderItems.push(
                        {
                            ItemId : rawRequestData[a].line_uniquekey,
                            Diameter : Number(rawRequestData[a].line_item_rolldiametertext) || 127, //TODO
                            Width : Number(rawRequestData[a].line_item_rollwidthtext) || 88.90,
                            Weight : rawRequestData[a].line_item_basis_weight || 673.1,
                            Nb : rawRequestData[a].line_quantity,
                            Type : /*rawRequestData[a].line_transitoptmethod || */1, //ALWAYS TRUCK OR IT WILL ERROR OUT
                            RPP : rawRequestData[a].line_item_rollsperpack || 1,
                        }
                    )

                    // fitmentRequestData.orderItems.push(
                    //     {
                    //         ItemId : rawRequestData[a].line_uniquekey,
                    //         Diameter : 127, //TODO
                    //         Width : 88.90,
                    //         Weight : 673.1,
                    //         Nb : 28,
                    //         Type : 1,
                    //         RPP : 1,
                    //     }
                    // )
                }

                log.debug("fitmentRequestData", fitmentRequestData)

                fitmentRequestData = JSON.stringify(fitmentRequestData)

                var connection_timeStamp_start = new Date().getTime();

                var rawResp = https.post({
                    url: "https://loadfitting.anchub.ca/loadfitting/generateshipments",
                    body : fitmentRequestData,
                    headers : {
                        "Authorization" : "Bearer 67afba48c5e94f0689dc4f9cb18afed2",
                        "Content-Type" : "application/json",
                        "accept": "*/*"
                    }
                });

                var connection_timeStamp_end = new Date().getTime();

                log.debug("connection time stats", {connection_timeStamp_start, connection_timeStamp_end, duration: connection_timeStamp_start - connection_timeStamp_end})

                log.debug("rawResp.body", rawResp.body)


                return rawResp;

                // var fitmentObj = {
                //     equipment: "1",
                //     ftlcount: "1",
                //     ftlavetonnage: "1",
                //     ftlavecostperton: "1",
                //     ftlavepercentutil: "1",
                //     ltltonnage: "1",
                //     ltlpercentutil: "1",
                //     ltlrolls: "1",
                //     loadid: "1",
                //     loadnumber: "1",
                //     weightplanned: "weight planned",
                //     percentage: "10",
                // };
                // fitmentResponse.list.push(fitmentObj)
                //
                // var fitmentObj = {
                //     equipment: "1",
                //     ftlcount: "2",
                //     ftlavetonnage: "2",
                //     ftlavecostperton: "2",
                //     ftlavepercentutil: "2",
                //     ltltonnage: "2",
                //     ltlpercentutil: "2",
                //     ltlrolls: "2",
                //     loadid: "2",
                //     loadnumber: "2",
                //     weightplanned: "weight planned",
                //     percentage: "10",
                // };
                // fitmentResponse.list.push(fitmentObj)
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




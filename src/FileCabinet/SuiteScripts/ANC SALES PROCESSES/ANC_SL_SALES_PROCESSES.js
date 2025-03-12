/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search', 'N/url', 'N/ui/serverWidget'],
    /**
     * @param{runtime} runtime
     * @param{search} search
     * @param{url} url
     */
    (record, runtime, search, url, uiSw) => {

        var globalrefs = {
            tranBodyVals:{

            },
            tranItemVals:{

            }
        };

        var orderLineLimit = 0;
        var fitmentLineLimit = 1;
        var allowMultiGrade = true;
        var DEBUGMODE = false;
        var accountId = "";

        var uiSublistId = "custpage_itemfitmentandreservation";

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



                    var tranRecObj = record.load({
                        type : "salesorder",
                        id : scriptContext.request.parameters["traninternalid"]
                    });
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

                        globalrefs.tranItemVals.line_item_parent = tranRecObj.getSublistValue({
                            sublistId : "item",
                            fieldId : "custcol_anc_grade",
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



                    var processids = {
                        "fitmentcheck" : {
                            title : "Fitment Check",
                        },
                        "inventorycheck" : {
                            title : "Inventory Check",
                            buttons : [
                                // {
                                //     name : "Show All Runs",
                                //     label : "Show All Runs",
                                //     id : "custpage_btn_showallruns",
                                //     functionName : "alert('Show All Runs')"
                                // }
                            ],
                            fieldGroups : [
                                {
                                    id: "custpage_flgroup_source",
                                    label: "Basis"
                                }
                            ],
                            fields : [
                                {
                                    label: "REF#",
                                    type: "select",
                                    id: "custpage_traninternalid",
                                    source: "salesorder",
                                    container: "custpage_flgroup_source",
                                    defaultValue : scriptContext.request.parameters["traninternalid"],
                                    displayType : "inline"
                                },
                                {
                                    label : "Customer",
                                    type : "select",
                                    id : "custpage_trancustomer",
                                    source : "customer",
                                    container: "custpage_flgroup_source",
                                    defaultValue : globalrefs.tranBodyVals.entity,
                                    condition : globalrefs.tranBodyVals.entity,
                                    displayType : "inline"
                                },
                                {
                                    label : "Date",
                                    type : "date",
                                    id : "custpage_trandate",
                                    container: "custpage_flgroup_source",
                                    defaultValue : globalrefs.tranBodyVals.trandate,
                                    displayType : "inline"
                                },
                                {
                                    label : "LINE SEQUENCE",
                                    type : "integer",
                                    id : "custpage_tranlineseq",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline"
                                },
                                {
                                    label : "LINE#",
                                    type : "integer",
                                    id : "custpage_tranlinenum",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs["tranlinenumField"] || scriptContext.request.parameters["tranlinenum"]
                                },
                                {
                                    label : "LINE ITEM",
                                    type : "select",
                                    id : "custpage_tranlineitem",
                                    source : "item",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranItemVals.itemid
                                },
                                {
                                    label : "LINE GRADE",
                                    type : "select",
                                    id : "custpage_tranlinegrade",
                                    source : "item",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranItemVals.line_item_parent
                                },
                                {
                                    label : "LOCATION",
                                    type : "select",
                                    id : "custpage_tranlineloc",
                                    source : "location",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranBodyVals.location
                                },
                                {
                                    label : "Equipment",
                                    type : "text",
                                    id : "custpage_equipment",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranBodyVals.equipment
                                },
                                {
                                    label : "LINE ITEM GRADE ORDER QUANTITY",
                                    type : "float",
                                    id : "custpage_tranlineqty",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranItemVals.quantity
                                },
                                {
                                    label : "Delivery Date",
                                    type : "date",
                                    id : "custpage_tranlinedeldate",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranItemVals.deliverydate
                                },
                                {
                                    label : "ORIGIN",
                                    type : "select",
                                    id : "custpage_tranlineorigin",
                                    source : "location",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranItemVals.location || globalrefs.tranBodyVals.location
                                },
                                {
                                    label : "DESTINATION",
                                    type : "text",
                                    id : "custpage_tranlinedest",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranItemVals.destination
                                }
                            ],
                            sublists : [
                                {
                                    id : "custpage_inventorycheck",
                                    sublistFields : [
                                        {
                                            label : "SELECT",
                                            type : "checkbox",
                                            id : "custpage_col_ifr_cb",
                                            displayType : uiSw.FieldDisplayType.ENTRY,
                                            defaultValue : "T",
                                        },
                                        {
                                            label : "Grade",
                                            type : "select",
                                            id : "custpage_ifr_itemgrade",
                                            source : "item",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Grade / Item",
                                            type : "select",
                                            id : "custpage_ifr_item",
                                            source : "item",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Origin",
                                            type : "select",
                                            id : "custpage_ifr_location",
                                            source : "location",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Line Delivery Date",
                                            type : "date",
                                            id : "custpage_col_ifr_line_deliverydate",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                            defaultValue : "T",
                                        },
                                        {
                                            label : "Available Qty",
                                            type : "integer",
                                            id : "custpage_col_ifr_availableqty",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Order Qty",
                                            type : "integer",
                                            id : "custpage_col_ifr_orderqty",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Reserved Qty",
                                            type : "integer",
                                            id : "custpage_col_ifr_reservedqty",
                                            displayType : uiSw.FieldDisplayType.HIDDEN,
                                        },
                                        {
                                            label : "Reservation Qty",
                                            type : "integer",
                                            id : "custpage_col_ifr_inputqty",
                                            displayType : uiSw.FieldDisplayType.HIDDEN,
                                        },
                                        {
                                            label : "Order Weight",
                                            type : "float",
                                            id : "custpage_col_ifr_orderweight",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Reserved Weight",
                                            type : "float",
                                            id : "custpage_col_ifr_reservedweight",
                                            displayType : uiSw.FieldDisplayType.HIDDEN,
                                        },
                                        {
                                            label : "Reservation Weight",
                                            type : "float",
                                            id : "custpage_col_ifr_inputweight",
                                            displayType : uiSw.FieldDisplayType.HIDDEN,
                                        },
                                        {
                                            label : "Tied to Line",
                                            type : "integer",
                                            id : "custpage_ifr_tietoline",
                                            displayType : uiSw.FieldDisplayType.HIDDEN,
                                        },
                                        {
                                            label : "{SO#}_{LINEREF}",
                                            type : "text",
                                            id : "custpage_ifr_solineref",
                                            displayType : uiSw.FieldDisplayType.HIDDEN,
                                        },
                                        {
                                            label : "SO#",
                                            type : "select",
                                            id : "custpage_ifr_so",
                                            source : "salesorder",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Line Ref",
                                            type : "text",
                                            id : "custpage_ifr_lineref",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Equipment",
                                            type : "text",
                                            id : "custpage_col_ifr_equipment",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Load Id",
                                            type : "text",
                                            id : "custpage_ifr_loadid",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Load#",
                                            type : "text",
                                            id : "custpage_ifr_loadnum",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Weight Planned",
                                            type : "text",
                                            id : "custpage_ifr_weightplanned",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Percentage",
                                            type : "percent",
                                            id : "custpage_ifr_percentage",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        }
                                    ]
                                }
                            ]
                        },
                        "grreservation" : {
                            title : "Grade Run Reservation",
                            buttons : [
                                {
                                    name : "Show All Runs",
                                    label : "Show All Runs",
                                    id : "custpage_btn_showallruns",
                                    functionName : "alert('Show All Runs')"
                                }
                            ],
                            fieldGroups : [
                                {
                                    id: "custpage_flgroup_source",
                                    label: "Basis"
                                }
                            ],
                            fields : [
                                {
                                    label: "REF#",
                                    type: "select",
                                    id: "custpage_traninternalid",
                                    source: "salesorder",
                                    container: "custpage_flgroup_source",
                                    defaultValue : scriptContext.request.parameters["traninternalid"],
                                    displayType : "inline"
                                },
                                {
                                    label : "Customer",
                                    type : "select",
                                    id : "custpage_trancustomer",
                                    source : "customer",
                                    container: "custpage_flgroup_source",
                                    defaultValue : globalrefs.tranBodyVals.entity,
                                    condition : globalrefs.tranBodyVals.entity,
                                    displayType : "inline"
                                },
                                {
                                    label : "Date",
                                    type : "date",
                                    id : "custpage_trandate",
                                    container: "custpage_flgroup_source",
                                    defaultValue : globalrefs.tranBodyVals.trandate,
                                    displayType : "inline"
                                },
                                {
                                    label : "LINE SEQUENCE",
                                    type : "integer",
                                    id : "custpage_tranlineseq",
                                    container: "custpage_flgroup_source",
                                    defaultValue : scriptContext.request.parameters["tranlinesequence"],
                                    displayType : "inline"
                                },
                                {
                                    label : "LINE#",
                                    type : "integer",
                                    id : "custpage_tranlinenum",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs["tranlinenumField"] || scriptContext.request.parameters["tranlinenum"]
                                },
                                {
                                    label : "LINE ITEM",
                                    type : "select",
                                    id : "custpage_tranlineitem",
                                    source : "item",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranItemVals.itemid
                                },
                                {
                                    label : "LINE GRADE",
                                    type : "select",
                                    id : "custpage_tranlinegrade",
                                    source : "item",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranItemVals.line_item_parent
                                },
                                {
                                    label : "LOCATION",
                                    type : "select",
                                    id : "custpage_tranlineloc",
                                    source : "location",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranBodyVals.location
                                },
                                {
                                    label : "Equipment",
                                    type : "text",
                                    id : "custpage_equipment",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranBodyVals.equipment
                                },
                                {
                                    label : "LINE ITEM GRADE ORDER QUANTITY",
                                    type : "float",
                                    id : "custpage_tranlineqty",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranItemVals.quantity
                                },
                                {
                                    label : "Ship Date(?)",
                                    type : "date",
                                    id : "custpage_tranlinedeldate",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranItemVals.deliverydate
                                },
                                {
                                    label : "ORIGIN",
                                    type : "select",
                                    id : "custpage_tranlineorigin",
                                    source : "location",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranItemVals.location || globalrefs.tranBodyVals.location
                                },
                                {
                                    label : "DESTINATION",
                                    type : "text",
                                    id : "custpage_tranlinedest",
                                    container: "custpage_flgroup_source",
                                    displayType : "inline",
                                    defaultValue : globalrefs.tranItemVals.destination
                                }
                            ],
                            sublists : [
                                {
                                    id : "custpage_graderunreservation",
                                    sublistFields : [
                                        {
                                            label : "SELECT",
                                            type : "checkbox",
                                            id : "custpage_col_ifr_cb",
                                            displayType : uiSw.FieldDisplayType.ENTRY,
                                            defaultValue : "T",
                                        },
                                        {
                                            label : "Grade",
                                            type : "select",
                                            id : "custpage_ifr_itemgrade",
                                            source : "item",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Grade / Item",
                                            type : "select",
                                            id : "custpage_ifr_item",
                                            source : "item",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },

                                        {
                                            label : "Grade Run Start",
                                            type : "date",
                                            id : "custpage_ifr_graderunstart",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Grade Run End",
                                            type : "date",
                                            id : "custpage_ifr_graderunend",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Available Capacity",
                                            type : "integer",
                                            id : "custpage_ifr_availablecapacity",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Line Delivery Date",
                                            type : "date",
                                            id : "custpage_col_ifr_line_deliverydate",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                            defaultValue : "T",
                                        },
                                        {
                                            label : "Order Qty",
                                            type : "integer",
                                            id : "custpage_col_ifr_orderqty",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Reserved Qty",
                                            type : "integer",
                                            id : "custpage_col_ifr_reservedqty",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Reservation Qty",
                                            type : "integer",
                                            id : "custpage_col_ifr_inputqty",
                                            displayType : uiSw.FieldDisplayType.ENTRY,
                                        },
                                        {
                                            label : "Order Weight",
                                            type : "float",
                                            id : "custpage_col_ifr_orderweight",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Reserved Weight",
                                            type : "float",
                                            id : "custpage_col_ifr_reservedweight",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Reservation Weight",
                                            type : "float",
                                            id : "custpage_col_ifr_inputweight",
                                            displayType : uiSw.FieldDisplayType.ENTRY,
                                        },
                                        {
                                            label : "Tied to Line",
                                            type : "integer",
                                            id : "custpage_ifr_tietoline",
                                            displayType : uiSw.FieldDisplayType.HIDDEN,
                                        },
                                        {
                                            label : "{SO#}_{LINEREF}",
                                            type : "text",
                                            id : "custpage_ifr_solineref",
                                            displayType : uiSw.FieldDisplayType.HIDDEN,
                                        },
                                        {
                                            label : "SO#",
                                            type : "select",
                                            id : "custpage_ifr_so",
                                            source : "salesorder",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Line Ref",
                                            type : "text",
                                            id : "custpage_ifr_lineref",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Equipment",
                                            type : "text",
                                            id : "custpage_col_ifr_equipment",
                                            displayType : uiSw.FieldDisplayType.INLINE,
                                        },
                                        {
                                            label : "Origin",
                                            type : "select",
                                            id : "custpage_ifr_location",
                                            source : "location",
                                            displayType : uiSw.FieldDisplayType.HIDDEN,
                                        },
                                    ]
                                }
                            ]
                        }
                    }









                    var form = uiSw.createForm({
                        title: processids[scriptContext.request.parameters.processid].title,
                        hideNavBar: true
                    })

                    form.clientScriptModulePath = './ANC_CS_SALES_PROCESSES.js'

                    var buttons = processids[scriptContext.request.parameters.processid].buttons;
                    for(var a = 0 ; a < buttons.length ; a++)
                    {
                        var button = buttons[a]
                        form.addButton(button)
                    }



                    var fieldGroups = processids[scriptContext.request.parameters.processid].fieldGroups;
                    for(var a = 0 ; a < fieldGroups.length ; a++)
                    {
                        var fieldGroupObj = fieldGroups[a]
                        form.addFieldGroup(fieldGroupObj)
                    }
                    var fields = processids[scriptContext.request.parameters.processid].fields;
                    for(var a = 0 ; a < fields.length ; a++)
                    {
                        var field = fields[a];
                        var nsFieldObj = form.addField(field)

                        log.debug("field", field);

                        if(field.defaultValue)
                        {
                            nsFieldObj.defaultValue = field.defaultValue
                        }

                        if(field.displayType)
                        {
                            nsFieldObj.updateDisplayType({
                                displayType: field.displayType
                            });
                        }
                        globalrefs[field.id] = nsFieldObj;

                    }

                    log.debug("globalrefs", globalrefs)

                    var sublists = processids[scriptContext.request.parameters.processid].sublists;

                    for(var a = 0 ; a < sublists.length ; a++)
                    {
                        var sublist = sublists[a];
                        uiSublistId = sublist.id
                        var nsSublist = form.addSublist({
                            label : `${processids[scriptContext.request.parameters.processid].title} Results`,
                            type : "LIST",
                            id : uiSublistId,
                        });
                        globalrefs[uiSublistId] = nsSublist;

                        for(var b = 0 ; b < sublist.sublistFields.length ; b++)
                        {
                            var sublistField = sublist.sublistFields[b];
                            var nsSublistField = nsSublist.addField(sublistField);

                            if(sublistField.displayType)
                            {
                                nsSublistField.updateDisplayType({
                                    displayType : sublistField.displayType
                                });
                            }
                            if(sublistField.defaultValue)
                            {
                                nsSublistField.defaultValue = sublistField.defaultValue
                            }

                            globalrefs[nsSublistField.id] = nsSublistField;
                        }
                    }


                    fillSublist(scriptContext, nsSublist)

                    form.addSubmitButton({
                        label : `Save ${processids[scriptContext.request.parameters.processid].title} Results`
                    })

                    scriptContext.response.writePage(form);
                }
                else
                {
                    log.debug("POST, Submitted", scriptContext);
                    var tranInternalid = scriptContext.request.parameters.custpage_traninternalid;
                    var tranLinenum = scriptContext.request.parameters.custpage_tranlinenum;

                    var lineCount = scriptContext.request.getLineCount({
                        group : uiSublistId
                    });
                    log.debug("lineCount", lineCount);

                    var tranObj = record.load({
                        type : "salesorder",
                        id : tranInternalid,
                        isDynamic : true
                    });

                    // custpage_col_ifr_inputqty
                    // custpage_col_ifr_cb
                    // custpage_ifr_weightplanned
                    // custpage_ifr_percentage
                    // custpage_ifr_loadnum
                    // custpage_ifr_loadid
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
                            var targetIndex = tranObj.findSublistLineWithValue({
                                sublistId : "item",
                                fieldId : "line",
                                value : tranLinenum
                            })
                            log.debug("POST tranLinenum", tranLinenum)
                            tranObj.selectLine({
                                sublistId : "item",
                                line : targetIndex
                            })
                            log.debug("POST targetIndex", targetIndex)
                            tranObj.setCurrentSublistValue({
                                sublistId : "item",
                                fieldId : "custcol_anc_lxpert_loadweightplanned",
                                line : targetIndex,
                                value : lineValues["custpage_ifr_weightplanned"]
                            })
                            tranObj.setCurrentSublistValue({
                                sublistId : "item",
                                fieldId : "custcol_anc_lxpert_loadscount",
                                line : targetIndex,
                                value : lineValues["custpage_ifr_loadnum"]
                            })
                            tranObj.setCurrentSublistValue({
                                sublistId : "item",
                                fieldId : "custcol_anc_lxpert_lastloadutilrate",
                                line : targetIndex,
                                value : lineValues["custpage_ifr_percentage"]
                            })
                            tranObj.setCurrentSublistValue({
                                sublistId : "item",
                                fieldId : "custcol_anc_lxpert_loadreservedqty",
                                line : targetIndex,
                                value : lineValues["custpage_col_ifr_inputqty"]
                            })
                            log.debug("before commit")
                            tranObj.commitLine({
                                sublistId : "item",
                            })
                            log.debug("after commit")
                        }
                    }
                    var submittedRecId = tranObj.save({
                        ignoreMandatoryFeilds : true,
                        enableSourcing : true
                    });
                    log.debug("submittedRecId", submittedRecId);

                }
            }
            catch(e)
            {
                log.error("ERROR in function onRequest", e);
            }
        }

        function getInputDetails(scriptContext, targetSublist)
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


                if(scriptContext.request.parameters["processid"] == "grreservation" && scriptContext.request.parameters["tranlinenum"])
                {

                    filters.push("AND")
                    filters.push(["line","equalto",scriptContext.request.parameters["tranlinenum"]])
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
                    settings:[{"name":"consolidationtype","value":"ACCTTYPE"}],
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
                            search.createColumn({name: "custcol_010linememoinstruction", label: "line_memo"}),
                            //TODO you dont need it as result, only as filter, you need to join to line
                            // search.createColumn({name: "line.cseg_anc_dstnation", label: "line_memo"}),
                            search.createColumn({name: "custcol_anc_lxpert_loadreservedqty", label: "line_reservedqty"}),
                            search.createColumn({name: "custcol_anc_lxpert_loadreservedwt", label: "line_reservedweight"}),
                            search.createColumn({name: "custcol_anc_deliverydate", label: "line_deliverydate"}),
                        ]
                });
                var searchResultCount = salesorderSearchObj.runPaged().count;
                log.debug("salesorderSearchObj result count",searchResultCount);
                // salesorderSearchObj.run().each(function(result){
                //     // .run().each has a limit of 4,000 results
                //     return true;
                // });

                var sr = getResults(salesorderSearchObj.run());

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
                    });

                    resObjByColumnKey.id = res.id

                    return resObjByColumnKey;
                })
                log.debug("srToObjects", srToObjects)

                var srGroupedByDeliveryDate = groupBy(srToObjects, "line_deliverydate")
                log.debug("srGroupedByDeliveryDate", srGroupedByDeliveryDate)


                var a = 0;
                var multiGradeIndex = 0;
                for(var date in srGroupedByDeliveryDate)
                {
                    var deliveryDateGroup = srGroupedByDeliveryDate[date];
                    for(var c = 0 ; c < deliveryDateGroup.length ; c++)
                    {
                        var resObjByColumnKey = deliveryDateGroup[c]
                        var fitmentResponse = get_responseObjs(scriptContext);

                        var firstSoRefLineIndex = (multiGradeIndex || 0);
                        for(var b = 0; b < fitmentResponse.list.length; b++)
                        // for(var b = 0; b < fitmentLineLimit; b++)
                        {
                            if(b == 0)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_ifr_tietoline",
                                    line : multiGradeIndex || b,
                                    value : (multiGradeIndex || b)+1
                                })
                            }
                            else if(b > 0)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_ifr_tietoline",
                                    line : multiGradeIndex || b,
                                    value : firstSoRefLineIndex
                                })
                            }
                            if(resObjByColumnKey.internalid)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_ifr_so",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.internalid
                                })
                            }

                            log.debug("resObjByColumnKey.line_deliverydate", resObjByColumnKey.line_deliverydate);
                            if(resObjByColumnKey.line_deliverydate)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_col_ifr_line_deliverydate",
                                    line : multiGradeIndex || b,
                                    value : /*"03/03/2025"*/resObjByColumnKey.line_deliverydate
                                })
                            }

                            //FILL BY ORDER QTY
                            if(resObjByColumnKey.line_quantity)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_col_ifr_orderqty",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.line_quantity
                                })
                            }
                            if(resObjByColumnKey.line_quantity)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_col_ifr_reservedqty",
                                    line : multiGradeIndex || b,
                                    value : (resObjByColumnKey.line_reservedqty || 0)
                                })
                            }
                            if(resObjByColumnKey.line_quantity)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_col_ifr_inputqty",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.line_quantity - (resObjByColumnKey.line_reservedqty || 0)
                                })
                            }

                            //FILL BY ORDER WEIGHT
                            if(resObjByColumnKey.line_quantity)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_col_ifr_orderweight",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.line_quantity
                                })
                            }
                            if(resObjByColumnKey.line_quantity)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_col_ifr_reservedweight",
                                    line : multiGradeIndex || b,
                                    value : (resObjByColumnKey.line_reservedweight || 0)
                                })
                            }
                            if(resObjByColumnKey.line_quantity)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_col_ifr_inputweight",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.line_quantity - (resObjByColumnKey.line_reservedweight || 0)
                                })
                            }




                            if(resObjByColumnKey.line_id)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_ifr_lineref",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.line_id
                                })
                            }
                            if(resObjByColumnKey.internalid && resObjByColumnKey.line_id)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_ifr_solineref",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.internalid + "_" + resObjByColumnKey.line_id
                                })
                            }
                            if(resObjByColumnKey.line_item)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_ifr_item",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.line_item
                                })
                            }
                            if(resObjByColumnKey.line_item_parent)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_ifr_itemgrade",
                                    line : multiGradeIndex || b,
                                    value : resObjByColumnKey.line_item_parent
                                })
                            }
                            if(resObjByColumnKey.line_location)
                            {
                                targetSublist.setSublistValue({
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
                                targetSublist.setSublistValue({
                                    id : "custpage_ifr_loadid",
                                    line : multiGradeIndex || b,
                                    value : fitmentResponse.list[b].loadid
                                })
                            }
                            if(fitmentResponse.list[b] && fitmentResponse.list[b].loadnumber)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_ifr_loadnum",
                                    line : multiGradeIndex || b,
                                    value : fitmentResponse.list[b].loadnumber
                                })
                            }
                            if(fitmentResponse.list[b] && fitmentResponse.list[b].weightplanned)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_ifr_weightplanned",
                                    line : multiGradeIndex || b,
                                    value : fitmentResponse.list[b].weightplanned
                                })
                            }
                            if(fitmentResponse.list[b] && fitmentResponse.list[b].percentage)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_ifr_percentage",
                                    line : multiGradeIndex || b,
                                    value : fitmentResponse.list[b].percentage
                                })
                            }
                            //GRADERESPONSE
                            if(fitmentResponse.list[b] && fitmentResponse.list[b].graderunstartdate)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_ifr_graderunstart",
                                    line : multiGradeIndex || b,
                                    value : fitmentResponse.list[b].graderunstartdate
                                })
                            }
                            if(fitmentResponse.list[b] && fitmentResponse.list[b].graderunenddate)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_ifr_graderunend",
                                    line : multiGradeIndex || b,
                                    value : fitmentResponse.list[b].graderunenddate
                                })
                            }
                            if(fitmentResponse.list[b] && fitmentResponse.list[b].graderunavailablecapacity)
                            {
                                targetSublist.setSublistValue({
                                    id : "custpage_ifr_availablecapacity",
                                    line : multiGradeIndex || b,
                                    value : fitmentResponse.list[b].graderunavailablecapacity
                                })
                            }
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

        // var groupBy = function(xs, key) {
        //     return xs.reduce(function(rv, x) {
        //         (rv[x[key]] ??= []).push(x);
        //         return rv;
        //     }, {});
        // };


        function fillSublist(scriptContext, targetSublist)
        {
            var inputDetails = getInputDetails(scriptContext, targetSublist)


            // fitmentReservationSublist
        }

        function get_responseObjs(scriptContext)
        {
            var responseObjs = {
                list : []
            };
            try
            {
                var respObj = {
                    loadid: "1",
                    loadnumber: "1",
                    weightplanned: "weight planned",
                    percentage: "10",
                    graderunstartdate: "6/20/2025",
                    graderunenddate: "6/27/2025",
                    graderunavailablecapacity : "20"
                };
                responseObjs.list.push(respObj)

                var respObj = {
                    loadid: "17424",
                    loadnumber: "4",
                    weightplanned: "weight planned",
                    percentage: "34.567",
                    graderunstartdate: "5/20/2025",
                    graderunenddate: "5/27/2025",
                    graderunavailablecapacity : "20"
                };
                responseObjs.list.push(respObj)

                var respObj = {
                    loadid: "17424",
                    loadnumber: "4",
                    weightplanned: "weight planned",
                    percentage: "876.54",
                    graderunstartdate: "7/20/2025",
                    graderunenddate: "7/27/2025",
                    graderunavailablecapacity : "40"
                };
                responseObjs.list.push(respObj)
            }
            catch(e)
            {
                log.error("ERROR in function get_responseObjs", e);
            }
            return responseObjs;
        }

        //TODO remove deprecated by get_responseObjs
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




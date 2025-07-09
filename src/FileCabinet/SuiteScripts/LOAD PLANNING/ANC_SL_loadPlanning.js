/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['/SuiteScripts/ANC_lib.js', 'N/file', 'N/https', 'N/query', 'N/record', 'N/runtime', 'N/search', 'N/task', 'N/ui/serverWidget'],
    /**
     * @param{file} file
     * @param{https} https
     * @param{query} query
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{task} task
     * @param{serverWidget} serverWidget
     */
    (ANC_lib, file, https, query, record, runtime, search, task, serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) =>
        {
            try {
                if(scriptContext.request.method == "GET")
                {
                    loadPlanningUi(scriptContext);
                }
                else if(scriptContext.request.method == "POST")
                {
                    processShipmentInput(scriptContext);

                }

            }
            catch(e)
            {
                log.error("ERROR in function onRequest", e.message)
            }
        }

        function processShipmentInput(scriptContext)
        {
            var shipmentInput = getShipmentInputs(scriptContext);

            var taskId = task.create({
                taskType : task.TaskType.MAP_REDUCE,
                scriptId : "customscript_anc_mr_fitment",
                deploymentId : "customdeploy_anc_mr_fitment",
                params : {
                    custscript_anc_mr_fitment_ids :shipmentInput
                }

            })

            log.debug("taskId", taskId);
            var jobId = taskId.submit();
            log.debug("jobId", jobId);

            var shipmentsAndOrders = ANC_lib.getShipmentsAndOrders(shipmentInput);


            var srGroupedByDeliveryDate = ANC_lib.groupOrderLinesForShipmentGeneration(null,shipmentsAndOrders.lineuniquekeys)

            //respObj.sqlResults_shipmentLines

            // var shipmentsAndOrderlines = getShipmentsAndOrderlines(shipmentsAndOrders);
        }

        function getShipmentInputs(scriptContext)
        {
            var respObj = {};
            try
            {
                log.debug("scriptContext.request", scriptContext.request)
                log.debug("scriptContext.request.parameters", scriptContext.request.parameters);

                var sublist1Count = scriptContext.request.getLineCount({
                    group : "custpage_subtab_lp_sublist1"
                });

                log.debug("sublist1Count", sublist1Count)
                var shipmentIds = [];
                for(var a = 0 ; a < sublist1Count ; a++)
                {
                    var sublist1_cbVal = scriptContext.request.getSublistValue({
                        group : "custpage_subtab_lp_sublist1",
                        name : "custpage_fld_lp_select",
                        line : a
                    })
                    log.debug("sublist1_cbVal", sublist1_cbVal);

                    var sublist1_shipmentVal = scriptContext.request.getSublistValue({
                        group : "custpage_subtab_lp_sublist1",
                        name : "custpage_fld_lp_shipment1",
                        line : a
                    })
                    log.debug("sublist1_cbVal", sublist1_cbVal);

                    if(sublist1_cbVal && sublist1_cbVal != "F")
                    {
                        shipmentIds.push(sublist1_shipmentVal)
                    }
                }

                log.debug("shipmentIds", shipmentIds)
                //
                // var sublist2Count = scriptContext.request.getLineCount({
                //     id : "custpage_subtab_lp_sublist2label"
                // });
                //
                // log.debug("sublist2Count", sublist2Count)
                // for(var a = 0 ; a < sublist2Count ; a++)
                // {
                //     var sublist2_cbVal = scriptContext.request.getSublistValue({
                //         id : "custpage_subtab_lp_sublist2label",
                //         fieldId : "custpage_fld_lp_select",
                //         line : a
                //     })
                //     log.debug("sublist2_cbVal", sublist2_cbVal);
                //
                // }

                respObj.shipmentIds = shipmentIds;
            }
            catch(e)
            {
                log.error("ERROR in function getShipmentInputs")
            }
            return respObj;
        }



        function getShipmentsAndOrderlines(scriptContext)
        {
            var respObj = {};
            try
            {

            }
            catch(e)
            {
                log.error("ERROR in function getShipmentsAndOrderlines")
            }
            return respObj;
        }

        function loadPlanningUi(scriptContext)
        {
            try
            {
                addElements(scriptContext);
                // fillSublist(scriptContext);
            }
            catch(e)
            {
                log.error("ERROR in function loadPlanningUi", e)
            }
        }

        var sublistObj1 = {};
        var sublistObj2 = {};
        function fillSublist(scriptContext)
        {
            try
            {
            }
            catch(e)
            {
                log.error("ERROR in function fillSublist", e)
            }
        }

        var shipmentCols = [
            search.createColumn({name : "internalid", join:null, label:"internalid"}),
            search.createColumn({name: "tranid", label: "Document Number"}),
            search.createColumn({name: "custcol_anc_relatedtransaction", label: "Related Transaction"}),
            search.createColumn({name: "custcol_anc_relatedlineuniquekey", label: "Related Line Unique Key"}),
            search.createColumn({name: "item", label: "Item"}),
            search.createColumn({name: "custcol_anc_actualitemtobeshipped", label: "Actual Item To Be Shipped"}),
            search.createColumn({name: "custbody_anc_carrier", label: "Carrier(vendor)"}),
            search.createColumn({name: "custbody_anc_vehicleno", label: "Vehicle Number"}),
            search.createColumn({name: "custbody_anc_trackingno", label: "Tracking No"}),
            search.createColumn({name: "line", label: "Line ID"}),
            search.createColumn({name: "linesequencenumber", label: "Line Sequence Number"}),
            search.createColumn({name: "lineuniquekey", label: "Line Unique Key"}),
            search.createColumn({name: "quantity", label: "Quantity"}),
            search.createColumn({name: "statusref", label: "Status"}),
            search.createColumn({name: "custbody_anc_sostatus", label: "Status (?)"}),
            search.createColumn({name: "custcol_anc_status", label: "Status"}),
            search.createColumn({name: "custbody_anc_loadingefficiency", label: "Loading Efficiency"}),
            search.createColumn({name: "custbody_anc_deliverydate", label: "Delivery Date"}),
            search.createColumn({
                name: "custrecord_alberta_ns_city",
                join: "CUSTBODY_CONSIGNEE",
                label: "City"
            }),
            search.createColumn({name: "custbody_anc_usecrossdock", label: "Use Crossdock?"}),
            search.createColumn({name: "custbody_anc_shipstatus", label: "Ship Status"})
        ]

        function addElements(scriptContext)
        {
            try
            {
                form = serverWidget.createForm({
                    title : "Load Planning",
                    hideNavBar : false
                });

                form.addSubmitButton({
                    id : `custpage_button_lp_submit`,
                    label : `Reprocess`,
                })

                form.addTab({
                    id : `custpage_subtab_lp_tab1`,
                    label : `Planning for Exception`,
                })

                //input
                sublistObj1 = form.addSublist({
                    type : "list",
                    id : "custpage_subtab_lp_sublist1",
                    tab : "custpage_subtab_lp_tab1",
                    label : `Planning Exception`
                })

                sublistObj1.addField({
                    type : "Checkbox",
                    id : "custpage_fld_lp_select",
                    label : `Select`,
                    // source : ""
                })
                sublistObj1.addField({
                    type : "Select",
                    id : "custpage_fld_lp_shipment1",
                    label : `Shipment No`,
                    source : "customsale_anc_shipment",
                    sourceSearchCol : "internalid"
                })
                sublistObj1.addField({
                    type : "text",
                    id : "custpage_fld_lp_destination1",
                    label : `Destination`,
                    // source : ""
                })
                sublistObj1.addField({
                    type : "date",
                    id : "custpage_fld_lp_deldate1",
                    label : `Delivery Date`,
                    // source : ""
                })
                sublistObj1.addField({
                    type : "percent",
                    id : "custpage_fld_lp_loadefficiency1",
                    label : `Loading Efficiency`,
                    // source : ""
                })
                sublistObj1.addField({
                    type : "Select",
                    id : "custpage_fld_lp_status1",
                    label : `Ship Status`,
                    source : "customlist_anc_shipstatus"
                })
                sublistObj1.addField({
                    type : "Checkbox",
                    id : "custpage_fld_lp_crossdockelig1",
                    label : `Cross Dock Eligible`,
                    // source : ""
                })




                form.addTab({
                    id : `custpage_subtab_lp_tab2`,
                    label : `Everything else`,
                })
                //review
                sublistObj2 = form.addSublist({
                    type : "list",
                    id : "custpage_subtab_lp_sublist2",
                    tab : "custpage_subtab_lp_tab2",
                    label : `Others`
                })
                sublistObj2.addField({
                    type : "Select",
                    id : "custpage_fld_lp_shipment2",
                    label : `Shipment No`,
                    source : "customsale_anc_shipment"
                })
                sublistObj2.addField({
                    type : "text",
                    id : "custpage_fld_lp_destination2",
                    label : `Destination`,
                    // source : ""
                })
                sublistObj2.addField({
                    type : "date",
                    id : "custpage_fld_lp_deldate2",
                    label : `Delivery Date`,
                    // source : ""
                })
                sublistObj2.addField({
                    type : "percent",
                    id : "custpage_fld_lp_loadefficiency2",
                    label : `Loading Efficiency`,
                    // source : ""
                })
                sublistObj2.addField({
                    type : "Select",
                    id : "custpage_fld_lp_status2",
                    label : `Ship Status`,
                    source : "customlist_anc_shipstatus"
                })
                sublistObj2.addField({
                    type : "Checkbox",
                    id : "custpage_fld_lp_crossdockelig2",
                    label : `Cross Dock Eligible`,
                    // source : ""
                })

                var sqlResults1 = [];

                var shipment_search_list1 = search.create({
                    type : "customsale_anc_shipment",
                    filters : [
                        ["mainline", "is", true],
                        "AND",
                        ["custbody_anc_shipstatus", "anyof", [7]],
                        // "AND",
                        // ["internalid", "anyof", 61264854],
                    ],
                    columns : shipmentCols
                })

                shipment_search_list1.run().each(function(result){
                    var resultObj = {};
                    var searchCols = shipment_search_list1.columns;
                    for(var a = 0 ; a < searchCols.length ; a++){
                        var searchCol = searchCols[a]
                        resultObj[searchCol.label] = {
                            val : result.getValue(searchCol),
                            txt : result.getText(searchCol)
                        }
                    }
                    sqlResults1.push(resultObj);

                    return true;
                })




                var sqlResults2 = [];

                var shipment_search_list1 = search.create({
                    type : "customsale_anc_shipment",
                    filters : [
                        ["mainline", "is", true],
                        "AND",
                        ["custbody_anc_shipstatus", "noneof", [7,6,"@NONE@"]],
                        // "AND",
                        // ["internalid", "anyof", 61264854],
                    ],
                    columns : shipmentCols
                })

                shipment_search_list1.run().each(function(result){
                    var resultObj = {};
                    var searchCols = shipment_search_list1.columns;
                    for(var a = 0 ; a < searchCols.length ; a++){
                        var searchCol = searchCols[a]
                        resultObj[searchCol.label] = {
                            val : result.getValue(searchCol),
                            txt : result.getText(searchCol)
                        }
                    }
                    sqlResults2.push(resultObj);

                    return true;
                })

























                // var shipmentSql1 = `SELECT
                //                         BUILTIN_RESULT.TYPE_DATE(TRANSACTION.trandate) AS trandate,
                //                         BUILTIN_RESULT.TYPE_STRING(TRANSACTION.id) AS internalid,
                //                         BUILTIN_RESULT.TYPE_STRING(TRANSACTION.memo) AS memo,
                //                         BUILTIN_RESULT.TYPE_INTEGER(TRANSACTION.entity) AS entity,
                //                         BUILTIN_RESULT.TYPE_STRING(TRANSACTION.tranid) AS tranid,
                //                         BUILTIN_RESULT.TYPE_STRING(TRANSACTION.trandisplayname) AS trandisplayname,
                //                         BUILTIN_RESULT.TYPE_STRING(TRANSACTION.TYPE) AS TYPE,
                //                         BUILTIN_RESULT.TYPE_CURRENCY(TRANSACTION.foreigntotal, BUILTIN.CURRENCY(TRANSACTION.foreigntotal)) AS foreigntotal
                //                     FROM
                //                         TRANSACTION,
                //                         transactionLine
                //                     WHERE
                //                         TRANSACTION.ID = transactionLine.TRANSACTION
                //                       AND TRANSACTION.custbody_anc_shipstatus = 2
                //                       AND ((TRANSACTION.custbody_anc_loadingefficiency =< 50 AND TRANSACTION.TYPE IN ('CuTrSale108') AND NVL(transactionLine.mainline, 'F') = 'T'))`
                //
                // const sqlResults1 = query.runSuiteQL({ query: shipmentSql1 }).asMappedResults();
                //
                //
                // var shipmentSql2 = `SELECT
                //                         BUILTIN_RESULT.TYPE_DATE(TRANSACTION.trandate) AS trandate,
                //                         BUILTIN_RESULT.TYPE_DATE(TRANSACTION.custbody_anc_shipstatus) AS custbody_anc_shipstatus,
                //                         BUILTIN_RESULT.TYPE_STRING(TRANSACTION.id) AS internalid,
                //                         BUILTIN_RESULT.TYPE_STRING(TRANSACTION.memo) AS memo,
                //                         BUILTIN_RESULT.TYPE_INTEGER(TRANSACTION.entity) AS entity,
                //                         BUILTIN_RESULT.TYPE_STRING(TRANSACTION.tranid) AS tranid,
                //                         BUILTIN_RESULT.TYPE_STRING(TRANSACTION.trandisplayname) AS trandisplayname,
                //                         BUILTIN_RESULT.TYPE_STRING(TRANSACTION.TYPE) AS TYPE,
                //                         BUILTIN_RESULT.TYPE_CURRENCY(TRANSACTION.foreigntotal, BUILTIN.CURRENCY(TRANSACTION.foreigntotal)) AS foreigntotal
                //                     FROM
                //                         TRANSACTION,
                //                         transactionLine
                //                     WHERE
                //                         TRANSACTION.ID = transactionLine.TRANSACTION
                //                       AND TRANSACTION.custbody_anc_shipstatus != 2
                //                       AND ((TRANSACTION.custbody_anc_loadingefficiency > 50 AND TRANSACTION.TYPE IN ('CuTrSale108') AND NVL(transactionLine.mainline, 'F') = 'T'))`
                //
                // const sqlResults2 = query.runSuiteQL({ query: shipmentSql2 }).asMappedResults();
                //
                //
                // log.debug("shipmentSql1", shipmentSql1);
                // log.debug("shipmentSql2", shipmentSql2);
                log.debug("sqlResults1", sqlResults1);
                log.debug("sqlResults2", sqlResults2);



                for(var a = 0 ; a < sqlResults1.length; a++)
                {
                    var sr = sqlResults1[a];
                    sublistObj1.setSublistValue({
                        id : "custpage_fld_lp_shipment1",
                        line : a,
                        value : sr.internalid.val
                    });

                    sr["City"].val ? sublistObj1.setSublistValue({
                        id : "custpage_fld_lp_destination1",
                        line : a,
                        value : sr["City"].val
                    }) : "";

                    log.debug(`sr["Delivery Date"]`, sr["Delivery Date"])
                    sr["Delivery Date"].val ? sublistObj1.setSublistValue({
                        id : "custpage_fld_lp_deldate1",
                        line : a,
                        value : sr["Delivery Date"].val
                    }) : "";

                    sr["Loading Efficiency"].val ? sublistObj1.setSublistValue({
                        id : "custpage_fld_lp_loadefficiency1",
                        line : a,
                        value : sr["Loading Efficiency"].val
                    }) : "";

                    sr["Ship Status"].val ? sublistObj1.setSublistValue({
                        id : "custpage_fld_lp_status1",
                        line : a,
                        value : sr["Ship Status"].val
                    }) : "";
                    sr["Use Crossdock?"].val && sr["Use Crossdock?"].val != "F" ? sublistObj1.setSublistValue({
                        id : "custpage_fld_lp_crossdockelig1",
                        line : a,
                        value : "T"
                    }) : "";
                }

                // for(var a = 0 ; a < sqlResults2.length; a++)
                // {
                //     sublistObj2.setSublistValue({
                //         id : "custpage_fld_lp_shipment2",
                //         line : a,
                //         value : sqlResults2[a].internalid.val
                //     })
                // }

                for(var a = 0 ; a < sqlResults2.length; a++)
                {
                    var sr = sqlResults2[a];
                    sublistObj2.setSublistValue({
                        id : "custpage_fld_lp_shipment2",
                        line : a,
                        value : sqlResults2[a].internalid.val
                    })

                    sr["City"].val ? sublistObj2.setSublistValue({
                        id : "custpage_fld_lp_destination2",
                        line : a,
                        value : sr["City"].val
                    }) : "";

                    log.debug(`sr["Delivery Date"]`, sr["Delivery Date"])
                    sr["Delivery Date"].val ? sublistObj2.setSublistValue({
                        id : "custpage_fld_lp_deldate2",
                        line : a,
                        value : sr["Delivery Date"].val
                    }) : "";

                    sr["Loading Efficiency"].val ? sublistObj2.setSublistValue({
                        id : "custpage_fld_lp_loadefficiency2",
                        line : a,
                        value : sr["Loading Efficiency"].val
                    }) : "";

                    sr["Ship Status"].val ? sublistObj2.setSublistValue({
                        id : "custpage_fld_lp_status2",
                        line : a,
                        value : sr["Ship Status"].val
                    }) : "";
                    sr["Use Crossdock?"].val && sr["Use Crossdock?"].val != "F" ? sublistObj2.setSublistValue({
                        id : "custpage_fld_lp_crossdockelig2",
                        line : a,
                        value : "T"
                    }) : "";
                }



























                scriptContext.response.writePage({
                    pageObj : form,
                    pageObject : form
                })
            }
            catch(e)
            {
                log.error("ERROR in function loadPlanningUi", e)
            }
        }

        return {onRequest}

    });

/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['/SuiteScripts/ANC_lib.js', 'N/query', 'N/record', 'N/search', 'N/runtime'],
    /**
 * @param{query} query
 * @param{record} record
 * @param{search} search
 */
    (ANC_lib, query, record, search, runtime) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        var FREIGHT_CONFIG = {
            production : {
                records : {
                    shipment : {
                        internalid : "CuTrSale106"
                    },
                },
                hardcoded : {
                    default_consignee : {
                        internalid : "319828"
                    }
                }
            },
            sandbox : {
                records : {
                    shipment : {
                        internalid : "CuTrSale108"
                    },
                },
                hardcoded : {
                    default_consignee : {
                        internalid : "305737"
                    }
                }
            }
        }

        var shipmentRecType_internalId = FREIGHT_CONFIG.sandbox.records.shipment.internalid
        var defaultConsignee_internalid = FREIGHT_CONFIG.sandbox.hardcoded.default_consignee.internalid
        const getInputData = (inputContext) =>
        {
            if(runtime.envType == runtime.EnvType.SANDBOX)
            {
                shipmentRecType_internalId = FREIGHT_CONFIG.sandbox.records.shipment.internalid
                defaultConsignee_internalid = FREIGHT_CONFIG.sandbox.hardcoded.default_consignee.internalid
            }
            else {
                shipmentRecType_internalId = FREIGHT_CONFIG.production.records.shipment.internalid
                defaultConsignee_internalid = FREIGHT_CONFIG.production.hardcoded.default_consignee.internalid
            }
            var transactionSearchObj = search.create({
                type: "transaction",
                filters:
                    [
                        ["type","anyof",shipmentRecType_internalId],
                        "AND",
                        ["mainline","is","T"],
                        "AND",
                        ["custbody_consignee","anyof",defaultConsignee_internalid]
                    ],
                columns:
                    [
                        // search.createColumn({name: "entity", label: "Name"}),
                        search.createColumn({name: "custbody_consignee", label: "Consignee"}),
                        search.createColumn({name: "custbody_anc_equipment", label: "Equipment"}),
                        search.createColumn({name: "custbody4", label: "BOL"}),
                        search.createColumn({
                            name: "custrecord_anc_transportmode",
                            join: "CUSTBODY_ANC_EQUIPMENT",
                            label: "Transport Mode"
                        }),
                        search.createColumn({name: "custbody_anc_shipment_leg", label: "Leg"}),
                        // search.createColumn({name: "shipstate", label: "Ship State"}),
                        search.createColumn({
                            name: "custrecord_alberta_ns_ship_addrprovince",
                            join: "CUSTBODY_CONSIGNEE",
                            label: "Consignee Address Province"
                        }),
                        search.createColumn({
                            name: "custrecord_alberta_ns_country",
                            join: "CUSTBODY_CONSIGNEE",
                            label: "Country"
                        })
                    ]
            });
            var searchResultCount = transactionSearchObj.runPaged().count;
            log.debug("transactionSearchObj result count",searchResultCount);
            var resObjList = [];
            transactionSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 results
                var resObj = {};
                for(var a = 0 ; a < transactionSearchObj.columns.length ; a++)
                {
                    var colObj = transactionSearchObj.columns[a];

                    if(colObj && colObj.label)
                    {
                        resObj[colObj.label] = {
                            val:result.getValue(colObj),
                            txt:result.getText(colObj)
                        }
                    }

                }
                resObjList.push(resObj);
                return true;
            });
            log.debug("resObjList", resObjList);

            transactionSearchObj.title = "MR FIX FREIGHT:GET DeFAULT SHIPMENTS" + new Date().getTime();
            transactionSearchObj.isPublic = true;
            // var ssId = transactionSearchObj.save();
            // log.debug("ssId", ssId);

            resObjList = [resObjList[0]]
            return resObjList;


            // var sql =
            //     `Select
            //              sf.id as sf_id,
            //              sf.custrecord_anc_pf_grade as sf_grade,
            //              sf.custrecord_anc_pf_allocation as sf_allocation,
            //              sf.custrecord_anc_pf_year as sf_year,
            //              sf.custrecord_anc_pf_month as sf_month,
            //              sf.custrecord_anc_pf_consignee as sf_consignee,
            //              sf.custrecord_anc_pf_customer as sf_customer,
            //              y.name as y_name,
            //              m.name as m_name,
            //
            //             FROM
            //             customrecord_anc_pf_ as sf
            //             JOIN
            //             customrecord_anc_pf_years as y ON y.id = sf.custrecord_anc_pf_year
            //             JOIN
            //             customrecord_anc_pf_months as m ON m.id = sf.custrecord_anc_pf_month
            //
            //             WHERE
            //             ${sqlFilters_text}
            //      `
            //
            // log.debug("sql", sql)
            //
            // const sqlResults = query.runSuiteQL({ query: sql }).asMappedResults();
            //
            // log.debug("sqlResults", sqlResults);
        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) =>
        {
            try
            {
                log.debug("mapContext", mapContext)
                log.debug("mapContext.key", mapContext.key)
                log.debug("mapContext.value", mapContext.value)

                var mapVal = JSON.parse(mapContext.value)
                log.debug("mapVal.BOL.val", mapVal.BOL.val);

                var loadId = mapVal.BOL.val;



                var otherDetails = {};
                var customerId = "";
                var consigneeId = "";
                var bookingNo = "";
                var custbody_wm_jointshipmentno = "";
                //INV
                if(loadId)
                {
                    var customrecord_anc_integration_config_logsSearchObj = search.create({
                        type: "customrecord_anc_integration_config_logs",
                        filters:
                            [
                                ["formulatext: REGEXP_SUBSTR( {custrecord_anc_icl_request}, '\"LoadNo\":\"([^\"]+)\"', 1, 1, 'n', 1 )","is",loadId]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "formulatext",
                                    formula: "REGEXP_SUBSTR( {custrecord_anc_icl_request}, '\"LoadNo\":\"([^\"]+)\"', 1, 1, 'n', 1 )",
                                    label: "SHIPMENT SYNC LOADNO"
                                }),
                                search.createColumn({name: "internalid", label: "Internal ID", sort:"DESC"}),
                                search.createColumn({name: "scriptid", label: "Script ID"}),
                                search.createColumn({name: "custrecord_anc_icl_integconfig", label: "Integration Configuration"}),
                                search.createColumn({name: "custrecord_anc_icl_tags", label: "Tags"}),
                                search.createColumn({name: "custrecord_anc_icl_script", label: "Script"}),
                                search.createColumn({name: "custrecord_anc_icl_deployment", label: "Script Deployment"}),
                                search.createColumn({name: "custrecord_anc_icl_request", label: "Request"}),
                                search.createColumn({name: "custrecord_anc_icl_response", label: "Response"})
                            ]
                    });
                    var searchResultCount = customrecord_anc_integration_config_logsSearchObj.runPaged().count;

                    customrecord_anc_integration_config_logsSearchObj.title = "MR TO FIX DEFAULT SHIPMENTS _ SHIPMENT REMAKE" + new Date().getTime();
                    customrecord_anc_integration_config_logsSearchObj.isPublic = true;
                    // var ssId = customrecord_anc_integration_config_logsSearchObj.save();
                    // log.debug("ssId", ssId);
                    log.debug("customrecord_anc_integration_config_logsSearchObj result count",searchResultCount);
                    customrecord_anc_integration_config_logsSearchObj.run().each(function(result){
                        // .run().each has a limit of 4,000 results

                        var requestBodyStr = result.getValue({name: "custrecord_anc_icl_request", label: "Request"})
                        log.debug("requestBodyStr", requestBodyStr);

                        var endIndex = requestBodyStr.indexOf(',"LoadOrderList"');
                        requestBodyStr = requestBodyStr.substring(0, endIndex) + '}}}';

                        log.debug("requestBodyStr after substr", requestBodyStr);


                        var requestBody = JSON.parse(requestBodyStr);
                        customerId = requestBody.Load.Body.CustomerId;
                        consigneeId = requestBody.Load.Body.ConsigneeId;
                        otherDetails = {customerId, consigneeId};
                        bookingNo = requestBody.Load.Body.BookingNo;
                        custbody_wm_jointshipmentno = requestBody.Load.Body.JointShipmentNo;

                        log.debug("{loadId, bookingNo, custbody_wm_jointshipmentno, otherDetails}", {loadId, bookingNo, custbody_wm_jointshipmentno, otherDetails})

                        if(loadId && otherDetails)
                        {
                            var createdShipmentRecId = ANC_lib.prepLoad(loadId, otherDetails, true);
                            log.debug("submittedShipmentRecId via MR FIX", createdShipmentRecId);
                        }
                        else
                        {
                            throw {success:false, message:"cannot resolve details provided" + JSON.stringify({loadId, bookingNo, custbody_wm_jointshipmentno, otherDetails})}
                        }

                        return false;
                    });
                }


                log.debug("payload consigneeId", consigneeId)
                //shipments are fixed at this point
                customerId = ANC_lib.searchCustomer_id(otherDetails);
                consigneeId = ANC_lib.searchConsignee_id(otherDetails);
                log.debug("ns search consigneeId", consigneeId)

                var targets = search.lookupFields({
                    type : "customrecord_alberta_ns_consignee_record",
                    id : consigneeId,
                    columns : ["custrecord_alberta_ns_country", "custrecord_alberta_ns_ship_addrprovince"]
                })
                log.debug("consigneeRecLookup targets", targets);




                targets.targetTaxcodeId =  ANC_lib.FREIGHTINVOICE.TAXCODES.TAXCODE_NONTAXABLE82
                log.debug("targets", targets)

                if(targets.custrecord_alberta_ns_country && targets.custrecord_alberta_ns_country.toUpperCase() != "CANADA" && targets.custrecord_alberta_ns_country.toUpperCase() != "CAN")
                {
                    log.debug("what's the taxcode1", targets)
                    targets.targetTaxcodeId = ANC_lib.FREIGHTINVOICE.TAXCODES.TAXCODE_NONTAXABLE82;
                }
                else
                {
                    if(targets.custrecord_alberta_ns_ship_addrprovince)
                    {
                        log.debug("what's the taxcode3", targets)
                        log.debug("what's the taxcode3.4 ANC_lib.CA_TAXCODE_MAPPING_BY_STATE_CODE", ANC_lib.CA_TAXCODE_MAPPING_BY_STATE_CODE)
                        log.debug("what's the taxcode3.5 ANC_lib.CA_TAXCODE_MAPPING_BY_STATE_CODE[x]", ANC_lib.CA_TAXCODE_MAPPING_BY_STATE_CODE[targets.custrecord_alberta_ns_ship_addrprovince])

                        if(ANC_lib.CA_TAXCODE_MAPPING_BY_STATE_CODE[targets.custrecord_alberta_ns_ship_addrprovince])
                        {
                            log.debug("what's the taxcode4", targets)
                            targets.targetTaxcodeId = ANC_lib.CA_TAXCODE_MAPPING_BY_STATE_CODE[targets.custrecord_alberta_ns_ship_addrprovince];
                        }
                        else
                        {

                            log.debug("what's the taxcode5", targets)
                            targets.targetTaxcodeId = ANC_lib.FREIGHTINVOICE.TAXCODES.TAXCODE_NONTAXABLE82
                        }
                    }
                    else
                    {

                        log.debug("what's the taxcode6", targets)
                        targets.targetTaxcodeId =  ANC_lib.FREIGHTINVOICE.TAXCODES.TAXCODE_NONTAXABLE82
                    }
                }


                log.debug("final target logs", targets);










                //TODO find the PO
                var poSearchObj = search.create({
                    type : "purchaseorder",
                    filters : [
                        ["custbody4", "is", loadId],
                    ]
                })
                poSearchObj.run().each(function(result){
                    var poRecObj = record.load({
                        "type" : "purchaseorder",
                        id : result.id
                    });
                    if(consigneeId)
                    {
                        poRecObj.setValue({
                            fieldId : "custbody_ns_consignee",
                            value : consigneeId
                        })


                        if(bookingNo)
                        {
                            poRecObj.setValue({
                                fieldId : "custbody_ns_consignee",
                                value : `Freight PO created from TM Booking ${bookingNo}`
                            })
                        }
                        if(custbody_wm_jointshipmentno)
                        {
                            poRecObj.setValue({
                                fieldId : "custbody_wm_jointshipmentno",
                                value : `Freight PO created from TM Booking ${custbody_wm_jointshipmentno}`
                            })
                        }

                        var lineCount = poRecObj.getLineCount({
                            sublistId : "item"
                        });
                        for(var a = 0 ; a < lineCount ; a++)
                        {
                            poRecObj.setSublistValue({
                                sublistId : "item",
                                fieldId : "taxcode",
                                line : a,
                                value : targets.targetTaxcodeId
                            })
                            poRecObj.setSublistValue({
                                sublistId : "item",
                                fieldId : "custcol_wm_customer",
                                line : a,
                                value : customerId
                            })
                            poRecObj.setSublistValue({
                                sublistId : "item",
                                fieldId : "custcol_consignee",
                                line : a,
                                value : consigneeId
                            })
                            log.debug("successfully set PO " + result.id + " line " + a, {targets})
                        }
                    }

                    var submittedPoRecObj_id = poRecObj.save({
                        ignoreMandatoryFields : true,
                        enableSourcing : true
                    })
                    log.debug("submittedPoRecObj_id", submittedPoRecObj_id)

                    return false;
                })

                //TODO find the bill
                var vbSearchObj = search.create({
                    type : "vendorbill",
                    filters : [
                        ["custbody4", "is", loadId]
                    ]
                })

                vbSearchObj.run().each(function(result){
                    var poRecObj = record.load({
                        "type" : "vendorbill",
                        id : result.id
                    });
                    if(consigneeId)
                    {
                        poRecObj.setValue({
                            fieldId : "custbody_ns_consignee",
                            value : consigneeId
                        })


                        if(bookingNo)
                        {
                            poRecObj.setValue({
                                fieldId : "custbody_ns_consignee",
                                value : `Freight PO created from TM Booking ${bookingNo}`
                            })
                        }
                        if(custbody_wm_jointshipmentno)
                        {
                            poRecObj.setValue({
                                fieldId : "custbody_wm_jointshipmentno",
                                value : `Freight PO created from TM Booking ${custbody_wm_jointshipmentno}`
                            })
                        }

                        var lineCount = poRecObj.getLineCount({
                            sublistId : "item"
                        });
                        for(var a = 0 ; a < lineCount ; a++)
                        {
                            poRecObj.setSublistValue({
                                sublistId : "item",
                                fieldId : "taxcode",
                                line : a,
                                value : targets.targetTaxcodeId
                            })
                            poRecObj.setSublistValue({
                                sublistId : "item",
                                fieldId : "custcol_wm_customer",
                                line : a,
                                value : customerId
                            })
                            poRecObj.setSublistValue({
                                sublistId : "item",
                                fieldId : "custcol_consignee",
                                line : a,
                                value : consigneeId
                            })
                            log.debug("successfully set INVOICE " + result.id + " line " + a, {targets})
                        }
                    }

                    var submittedVbRecObj_id = poRecObj.save({
                        ignoreMandatoryFields : true,
                        enableSourcing : true
                    })
                    log.debug("submittedVbRecObj_id", submittedVbRecObj_id)

                    return false;
                })
                //set consignee



                //FREIGHT
                // if(loadId)
                // {
                //     var customrecord_anc_integration_config_logsSearchObj = search.create({
                //         type: "customrecord_anc_integration_config_logs",
                //         filters:
                //             [
                //                 ["formulatext: REGEXP_SUBSTR({custrecord_anc_icl_request}, '\"loadID\":\"([^\"]+)\"', 1, 1, NULL, 1)" + "","is",loadId]
                //             ],
                //         columns:
                //             [
                //                 search.createColumn({
                //                     name: "formulatext",
                //                     formula: `REGEXP_SUBSTR({custrecord_anc_icl_request}, '"loadID":"([^"]+)"', 1, 1, NULL, 1)`,
                //                     label: "SHIPMENT SYNC LOADNO"
                //                 }),
                //                 search.createColumn({name: "internalid", label: "Internal ID", sort:"DESC"}),
                //                 search.createColumn({name: "scriptid", label: "Script ID"}),
                //                 search.createColumn({name: "custrecord_anc_icl_integconfig", label: "Integration Configuration"}),
                //                 search.createColumn({name: "custrecord_anc_icl_tags", label: "Tags"}),
                //                 search.createColumn({name: "custrecord_anc_icl_script", label: "Script"}),
                //                 search.createColumn({name: "custrecord_anc_icl_deployment", label: "Script Deployment"}),
                //                 search.createColumn({name: "custrecord_anc_icl_request", label: "Request"}),
                //                 search.createColumn({name: "custrecord_anc_icl_response", label: "Response"})
                //             ]
                //     });
                //     var searchResultCount = customrecord_anc_integration_config_logsSearchObj.runPaged().count;
                //
                //     customrecord_anc_integration_config_logsSearchObj.title = "MR TO FIX DEFAULT SHIPMENTS _ POINV REMAKE" + new Date().getTime();
                //     customrecord_anc_integration_config_logsSearchObj.isPublic = true;
                //     // var ssId = customrecord_anc_integration_config_logsSearchObj.save();
                //     // log.debug("ssId", ssId);
                //
                //     log.debug("customrecord_anc_integration_config_logsSearchObj result count",searchResultCount);
                //     customrecord_anc_integration_config_logsSearchObj.run().each(function(result){
                //         // .run().each has a limit of 4,000 results
                //
                //         var requestBodyStr = result.getValue({name: "custrecord_anc_icl_request", label: "Request"})
                //         log.debug("requestBodyStr", requestBodyStr)
                //         // var requestBody = JSON.parse(requestBodyStr);
                //         // var customerId = requestBody.Load.Body.CustomerId;
                //         // var consigneeId = requestBody.Load.Body.ConsigneeId;
                //         // var otherDetails = {customerId, consigneeId};
                //         //
                //         // log.debug("{loadId, otherDetails}", {loadId, otherDetails})
                //
                //         // if(loadId && otherDetails)
                //         // {
                //         //     var createdShipmentRecId = ANC_lib.prepLoad(loadId, otherDetails, true);
                //         //     log.debug("createdShipmentRecId", createdShipmentRecId);
                //         // }
                //         // else
                //         // {
                //         //     throw {success:false, message:"cannot resolve details provided" + JSON.stringify({loadId, otherDetails})}
                //         // }
                //
                //         return false;
                //     });
                // }

            }
            catch(e)
            {
                log.error("ERROR in function map", e)
            }
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {

        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {

        }

        return {getInputData, map, reduce, summarize}

    });

/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 *
 *
 * CLEAR LANE EQUIPMENT CARRIER LIST (LEQC)
 *
 * var arr = nlapiSearchRecord(nlapiGetRecordType());
 * for(var a = 0 ; a < arr.length ; a++)
 *     {
 * nlapiDeleteRecord(arr[a].getRecordType(), arr[a].getId())
 *     }
 *
 *
 *
 */
define(['N/https', 'N/query', 'N/record', 'N/runtime', 'N/search', 'N/url'],
    /**
 * @param{https} https
 * @param{query} query
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 * @param{url} url
 */
    (https, query, record, runtime, search, url) => {
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

        const getInputData = (inputContext) =>
        {

            var equipmentsSearch = search.create({
                type : "customrecord_anc_equipment",
                columns : [
                    search.createColumn({name: "name", label: "Name"})
                ]
            })


            return equipmentsSearch;

            // var equipmentsSearchSr = getResults(equipmentsSearch.run());
            //
            //
            // return equipmentsSearchSr;
            //
            // var equipmentNames = [];
            // var equipmentIds = [];
            // var equipmentObjs = equipmentsSearchSr.map(function(res){
            //     var idVal = res.id;
            //     var nameVal = res.getValue({name:"name"});
            //     equipmentIds.push(idVal);
            //     equipmentNames.push(nameVal);
            //     return {
            //         id: idVal,
            //         name: nameVal
            //     }
            // })
            // log.debug("equipmentObjs", equipmentObjs)
            // log.debug("equipmentIds", equipmentIds)
            // log.debug("equipmentNames", equipmentNames)
            //
            // return equipmentObjs;

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
            try{
                log.debug("mapContext", mapContext);
                log.debug("mapContext.value", mapContext.value);
                log.debug("mapContext.value.length", mapContext.value.length);

                var mapValue = JSON.parse(mapContext.value);
                log.debug("mapValue", mapValue);

                var equipmentName = mapValue.values.name;

                if(mapContext.key && equipmentName)
                {
                    log.debug("mapContext.key", mapContext.key);

                    var rateInquiryResponse = getRateInquiryResponse({
                        equipmentName : equipmentName,
                        routeName : `ANC TEST LANE1`
                    })

                    log.debug("rateInquiryResponse", rateInquiryResponse);


                    //create the lane here, now! because reduce will need this reference

                    log.debug("rateInquiryResponse.firstresult.rates[0].equipment.toUpperCase()", rateInquiryResponse.firstresult.rates[0].equipment.toUpperCase())
                    log.debug("rateInquiryResponse.firstresult.rates[0].route.toUpperCase()", rateInquiryResponse.firstresult.rates[0].route.toUpperCase())

                    var nsLeqSearch = search.create({
                        type : "customrecord_anc_laneequipment",
                        filters : [
                            ["formulatext: UPPER({custrecord_anc_laneequip_lane})","is",rateInquiryResponse.firstresult.rates[0].route.toUpperCase()],
                            "AND",
                            ["formulatext: UPPER({custrecord_anc_laneequip_equipment})","is",rateInquiryResponse.firstresult.rates[0].equipment.toUpperCase()]
                        ],
                        columns : []
                    })

                    var nsLeqSearchSr = getResults(nsLeqSearch.run());

                    log.debug("nsLeqSearchSr", nsLeqSearchSr)

                    var targetLeqRecId = "";
                    var targetLeqRecObj = "";
                    if(nsLeqSearchSr && nsLeqSearchSr.length > 0)
                    {
                        targetLeqRecId = nsLeqSearchSr[0].id;
                        targetLeqRecObj = record.load({
                            type : "customrecord_anc_laneequipment",
                            id : targetLeqRecId
                        })
                    }

                    var submittedLeqRecId = "";

                    if(!targetLeqRecId)
                    {
                        targetLeqRecObj = record.create({
                            type : "customrecord_anc_laneequipment",
                        })
                    }
                    else
                    {
                        //attemptSet custrecord_anc_laneequip_lane
                        targetLeqRecObj.setText({
                            fieldId : "custrecord_anc_laneequip_lane",
                            text : rateInquiryResponse.firstresult.rates[0].route.toUpperCase()
                        })
                        targetLeqRecObj.setText({
                            fieldId : "custrecord_anc_laneequip_equipment",
                            text : rateInquiryResponse.firstresult.rates[0].equipment.toUpperCase()
                        })

                        submittedLeqRecId = targetLeqRecObj.save({
                            ignoreMandatoryFields : true,
                            enableSourcing : true
                        })
                    }



                    log.debug("map submittedLeqRecId", submittedLeqRecId);

                    //end
                    rateInquiryResponse.firstresult.parentleqid = submittedLeqRecId || targetLeqRecId;

                    mapContext.write({
                        key : mapContext.key,
                        value : rateInquiryResponse.firstresult
                    })

                }
            }
            catch(e)
            {
                log.error("ERROR in function map", e)
            }
        }

        function getRateInquiryResponse(rawData)
        {
            var rateInquiryResponse = {};
            try
            {
                rateInquiryResponse.summary = {};
                rateInquiryResponse.list = [];

                log.debug("getRateInquiryResponse rawData before HTTP POST", rawData)

                var rawResp = "";
                try
                {
                    var rawResp = https.post({
                        url: "https://esb.albertanewsprint.com:50107/TMX",
                        body : {
                            equipment : rawData.equipmentId
                        }
                    });

                    log.debug("getRateInquiryResponse rawResp", rawResp)
                }
                catch(e)
                {
                    log.error("ERROR in function getRateInquiryResponse", e)
                }

                //TEMP
                rawResp = {
                    body : [
                        {
                            "loadID": "string",
                            "shipmentID": "string",
                            "rates": [
                                {
                                    "carrier": "1503",
                                    "lineHaulCharge": 0.1,
                                    "route": rawData.routeName,
                                    "railRateAuthority": "string",
                                    "distance": 0,
                                    "transitTime": 111,
                                    "equipment": rawData.equipmentName,
                                    "currency": "string",
                                    "accessorials": [
                                        {
                                            "accCharge": 0.1,
                                            "accQual": "string"
                                        }
                                    ],
                                    "fuelSurcharge": 0.1,
                                    "carrierGroupName": "string",
                                    "totalCost": 0.1
                                },
                                {
                                    "carrier": "4001",
                                    "lineHaulCharge": 0.1,
                                    "route": "ANC TEST LANE2",
                                    "railRateAuthority": "string",
                                    "distance": 0,
                                    "transitTime": 222,
                                    "equipment": "ANC TEST EQUIPMENT2",
                                    "currency": "string",
                                    "accessorials": [
                                        {
                                            "accCharge": 0.1,
                                            "accQual": "string"
                                        }
                                    ],
                                    "fuelSurcharge": 0.1,
                                    "carrierGroupName": "string",
                                    "totalCost": 0.1
                                },
                            ],
                            "id": "string",
                            "errors": [
                                {
                                    "errorDesc": "string",
                                    "errorCode": 0
                                }
                            ],
                            "effectiveDate": "2019-08-24",
                            "timestamp": "string"
                        }
                    ]
                };

                if(typeof rawResp.body == "object")
                {
                    rateInquiryResponse.list = rawResp.body;
                    rateInquiryResponse.firstresult = rawResp.body[0];
                }



            }
            catch(e)
            {
                log.error("ERROR in function getRateInquiryResponse", e);
            }
            return rateInquiryResponse;
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

            try
            {
                log.debug("reduce reduceContext", reduceContext)
                log.debug("reduce reduceContext.key", reduceContext.key)
                log.debug("reduce reduceContext.values", reduceContext.values)

                var values = JSON.parse(reduceContext.values);
                log.debug("values", values)

                var compiledEquipmentRates = [];

                var value = values.rates;
                log.debug("value", value);
                compiledEquipmentRates = compiledEquipmentRates.concat(value);
                log.debug("iter compiledEquipmentRates", compiledEquipmentRates);

                log.debug("compiledEquipmentRates", compiledEquipmentRates);
                log.debug("compiledEquipmentRates.length", compiledEquipmentRates.length);

                log.debug("reduce values.parentleqid", values.parentleqid);


                for(var a = 0 ; a < compiledEquipmentRates.length ; a++)
                {
                    var laneEquipmentCarrierObj = compiledEquipmentRates[a];

                    if(laneEquipmentCarrierObj.equipment && laneEquipmentCarrierObj.route)
                    {
                        //can be optimized
                        var nsLeqcSearch = search.create({
                            type : "customrecord_anc_laneequipmentcarrier",
                            filters : [
                                ["formulatext: UPPER({custrecord_anc_lec_laneequipment.custrecord_anc_laneequip_lane})","is",laneEquipmentCarrierObj.route.toUpperCase()],
                                "AND",
                                ["formulatext: UPPER({custrecord_anc_lec_laneequipment.custrecord_anc_laneequip_equipment})","is",laneEquipmentCarrierObj.equipment.toUpperCase()]
                            ],
                            columns : []
                        })

                        var nsLeqcSearchSr = getResults(nsLeqcSearch.run());

                        log.debug("nsLeqcSearchSr", nsLeqcSearchSr)

                        var targetLeqcRecId = "";
                        var targetLeqcRecObj = "";
                        if(nsLeqcSearchSr && nsLeqcSearchSr.length > 0)
                        {
                            var targetLeqcRecId = nsLeqcSearchSr[0].id;
                            targetLeqcRecObj = record.load({
                                type : "customrecord_anc_laneequipmentcarrier",
                                id : targetLeqcRecId
                            })
                        }

                        if(!targetLeqcRecId)
                        {
                            targetLeqcRecObj = record.create({
                                type : "customrecord_anc_laneequipmentcarrier",
                            })
                        }


                        targetLeqcRecObj.setText({
                            fieldId : "custrecord_anc_lec_equipment",
                            text : laneEquipmentCarrierObj.equipment.toUpperCase()
                        })
                        targetLeqcRecObj.setValue({
                            fieldId : "custrecord_anc_lec_laneequipment",
                            value : values.parentleqid
                        })
                        targetLeqcRecObj.setValue({
                            fieldId : "custrecord_anc_lec_transittime",
                            value : laneEquipmentCarrierObj.transitTime
                        })
                        //TODO hardcoded carrier
                        targetLeqcRecObj.setValue({
                            fieldId : "custrecord_anc_lec_carrier",
                            value : laneEquipmentCarrierObj.carrier
                        })

                        var submittedLeqcRecId = targetLeqcRecObj.save({
                            ignoreMandatoryFields : true,
                            enableSourcing : true
                        })

                        log.debug("submittedLeqcRecId", submittedLeqcRecId);

                    }
                }

            }
            catch(e)
            {
                log.error("ERROR in function reduce", e);
            }

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

        return {getInputData, map, reduce, summarize}

    });

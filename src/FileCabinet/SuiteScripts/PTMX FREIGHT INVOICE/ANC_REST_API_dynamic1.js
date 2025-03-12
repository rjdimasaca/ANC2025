/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/https', 'N/record', 'N/runtime', 'N/search', 'N/url'],
    /**
 * @param{https} https
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 * @param{url} url
 */
    (https, record, runtime, search, url) => {
        /**
         * Defines the function that is executed when a GET request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const get = (requestParams) =>
        {

        }

        var mapping = {
            "Fuel Surcharge" : 12231, //Newsprint Freight : Fuel Surcharge (Truck - Percent of Freight),
            "Unknown Accessorial Line" : 188338
        }

        var NF_item = 12493;

        /**
         * Defines the function that is executed when a PUT request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body are passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const put = (requestBody) => {

        }

        /**
         * Defines the function that is executed when a POST request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const post = (requestBody) =>
        {
            try
            {
                log.debug("requestBody", requestBody);
                var loadID = requestBody.loadID;
                log.debug("loadID", loadID)

                var lookupPo_result = lookupPo(loadID);
                log.debug("lookupPo_result", lookupPo_result);

                if(lookupPo_result.list && lookupPo_result.list.length > 0 && lookupPo_result.list[0])
                {
                    var poId = lookupPo_result.list[0];

                    var vbRecObj = record.transform({
                        fromType : "purchaseorder",
                        fromId : poId,
                        toType : "vendorbill",
                        isDynamic : true
                    });

                    var invoiceDateRaw = requestBody.invoiceDate
                    var invoiceDate = new Date(invoiceDateRaw);
                    var invoiceDateStr = (invoiceDate.getMonth() + 1) + "/" + (invoiceDate.getDate()) + "/" + (invoiceDate.getFullYear());

                    log.debug("invoiceDateRaw", invoiceDateRaw)
                    log.debug("invoiceDate", invoiceDate)
                    log.debug("invoiceDateStr", invoiceDateStr)

                    vbRecObj.setText({
                        fieldId : "trandate",
                        value :invoiceDateStr,
                        text :invoiceDateStr
                    })

                    vbRecObj.setValue({
                        fieldId : "approvalstatus",
                        value :"1",
                    })


                    clearSublist(vbRecObj, requestBody);
                    fillSublist(vbRecObj, requestBody, lookupPo_result);



                    var vbRecId = vbRecObj.save({
                        ignoreMandatoryFields : true,
                        enableSourcing : true
                    })

                    log.debug("vbRecId", vbRecId);
                }


                return JSON.stringify(requestBody);



            }
            catch(e)
            {
                log.error("ERROR in function post", e)
            }
        }

        function fillSublist(vbRecObj, requestBody)
        {

            var vbRecObj_stringified = JSON.stringify(vbRecObj);
            log.debug("vbRecObj_stringified", vbRecObj_stringified);
            var vbRecObj_stringified_lineFields = vbRecObj.lineFields;
            for(var key in vbRecObj)
            {
                log.audit("key" + key, vbRecObj[key]);
            }



            log.debug("vbRecObj_stringified_items", vbRecObj_stringified_lineFields);
            // var vbRecObj_stringified_items = JSON.stringify(vbRecObj.lineFields.item);

            try
            {
                var vbRecObj_itemSublist_count = vbRecObj.getLineCount({
                    sublistId : "item"
                })
                var targetLine = vbRecObj_itemSublist_count;
                var accessorials = requestBody.accessorials;
                log.debug("accessorials", accessorials)
                if(accessorials.length > 0)
                {
                    for(var a = 0 ; a < accessorials.length ; a++)
                    {


                        log.debug("looping accessorials", accessorials)
                        log.debug("looping targetLine", targetLine)
                        var accessorial = accessorials[a];
                        var accessorial_charge = accessorial.charge;
                        var accessorial_qualifier = accessorial.qualifier;
                        var targetItemInternalId = "";
                        if(accessorial_qualifier && mapping[accessorial_qualifier])
                        {
                            targetItemInternalId = mapping[accessorial_qualifier]
                        }

                        if(!targetItemInternalId)
                        {
                            accessorial_qualifier = 188338 //"Unknown Accessorial Line"
                        }


                        if(mapping[accessorial_qualifier] && accessorial_qualifier && accessorial_charge)
                        {
                            if(targetItemInternalId)
                            {
                                vbRecObj.setSublistValue({
                                    sublistId : "item",
                                    fieldId : "item",
                                    line : targetLine,
                                    value : targetItemInternalId
                                })
                            }
                            else
                            {
                                vbRecObj.setSublistValue({
                                    sublistId : "item",
                                    fieldId : "item",
                                    line : targetLine,
                                    value : mapping["Unknown Accessorial Line"]
                                })
                            }

                            vbRecObj.setSublistValue({
                                sublistId : "item",
                                fieldId : "rate",
                                line : targetLine,
                                value : accessorial_charge
                            })
                            vbRecObj.setSublistValue({
                                sublistId : "item",
                                fieldId : "quantity",
                                line : targetLine,
                                value : 1
                            })
                            vbRecObj.setSublistValue({
                                sublistId : "item",
                                fieldId : "amount",
                                line : targetLine,
                                value : accessorial_charge
                            })

                            targetLine++;
                            // log.debug("lowestIndex", lowestIndex);
                            //
                            // var targetIndex = lowestIndex;
                            // if(targetIndex != -1)
                            // {
                            //
                            // }
                            // else
                            // {
                            //     for(var b = vbRecObj_itemSublist_count ; b > lowestIndex.length ; b--)
                            //     {
                            //         if(lowestIndex > -1)
                            //         {
                            //
                            //         }
                            //     }
                            // }
                        }
                    }

                }

            }
            catch(e)
            {
                log.error("ERROR i nfunction fillSublist", e)
            }

            return vbRecObj;
        }

        function clearSublist(vbRecObj, requestBody)
        {

            var NF_rate = requestBody.rate;

            var vbRecObj_itemSublist_count = vbRecObj.getLineCount({
                sublistId : "item"
            })

            log.debug("clearSublist vbRecObj_itemSublist_count", vbRecObj_itemSublist_count)

            for(var a = vbRecObj_itemSublist_count ; a > 0 ; a--)
            {
                vbRecObj.selectLine({
                    sublistId : "item",
                    line : a
                })
                var itemId = vbRecObj.getCurrentSublistValue({
                    sublistId : "item",
                    fieldId : "item",
                    line : a
                })
                log.debug("clearSublist itemId", itemId)
                if(itemId == NF_item)
                {
                    vbRecObj.getCurrentSublistValue({
                        sublistId : "item",
                        fieldId : "rate",
                        line : a,
                        value : NF_rate
                    })
                }
                else if(itemId != NF_item)
                {
                    vbRecObj.getCurrentSublistValue({
                        sublistId : "item",
                        line : a
                    })
                }
            }


            return vbRecObj;
        }


        var sample = {
            "carrierParentId": "string",
            "distance": 0,
            "fuelSurchargeQualifier": "string",
            "controlCustomerNumber": "string",
            "rateType": "string",
            "loadID": "string",
            "rate": 0.1,
            "goodsServicesAmount": 0.1,
            "invoiceNumber": "string",
            "currency": "string",
            "carrierID": "string",
            "isFinalInvoice": true,
            "netAmount": 0.1,
            "harmonizedSalesAmount": 0.1,
            "nonassignedCarrierAccessorials": [
            {
                "carrier": "string",
                "charge": 0.1,
                "qualifier": "string",
                "acctCode": "string"
            }
        ],
            "invoiceDate": "2019-08-24T14:15:22Z",
            "acctCode": "string",
            "refs": [
            {
                "referenceNumber": "string",
                "referenceType": "string"
            }
        ],
            "methodOfPayment": "string",
            "lineHaul": 0.1,
            "minimumCharge": 0.1,
            "rateQualifier": "string",
            "accessorials": [
            {
                "charge": 0.1,
                "qualifier": "string"
            }
        ],
            "provincialSalesAmount": 0.1,
            "fuelSurcharge": 0.1,
            "apiType": "string"
        }

        function lookupPo(loadID)
        {
            var lookupPo_result = {list : []};
            try
            {
                var purchaseorderSearchObj = search.create({
                    type: "purchaseorder",
                    settings:[{"name":"consolidationtype","value":"ACCTTYPE"}],
                    filters:
                        [
                            ["type","anyof","PurchOrd"],
                            "AND",
                            ["status","anyof","PurchOrd:F","PurchOrd:E"],
                            "AND",
                            ["mainline","is","T"],
                            "AND",
                            [["externalidstring","is",loadID],"OR",["poastext","is",loadID]]
                        ],
                    columns:
                        [

                        ]
                });

                var sr = purchaseorderSearchObj.run();

                sr.each(function(res){
                    lookupPo_result.list.push(res.id);
                    //no just get the first result
                    return false;
                })
            }
            catch(e)
            {
                log.error("ERROR in function lookupPo", e)
            }

            return lookupPo_result
        }

        /**
         * Defines the function that is executed when a DELETE request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters are passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const doDelete = (requestParams) => {

        }

        return {get, put, post, delete: doDelete}

    });

/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
/*

create freight PO
{"CarrierParentId":null,"NetAmount":1300,"HarmonizedSalesAmount":0,"NonassignedCarrierAccessorials":null,"transactionDate":"2025-04-16T14:46:01.8697052-06:00","AcctCode":null,"ControlCustomerNumber":"6170","LoadID":"F0428XX1","Rate":1300,"RateQualifier":"FC","GoodsServicesAmount":0,"MethodOfPayment":"P","LineHaul":1300,"MinimumCharge":0,"InvoiceNumber":null,"Currency":"CAD","Accessorials":null,"CarrierID":"1127","ProvincialSalesAmount":0,"FuelSurcharge":0,"FuelSurchargeQualifier":"NC","ApiType":"INVOICE_UPDATE","IsFinalInvoice":false}

update freight PO
{"CarrierParentId":null,"NetAmount":1500,"HarmonizedSalesAmount":0,"NonassignedCarrierAccessorials":null,"transactionDate":"2025-04-16T14:46:01.8697052-06:00","AcctCode":null,"ControlCustomerNumber":"6170","LoadID":"F0428XX1","Rate":1500,"RateQualifier":"FC","GoodsServicesAmount":0,"MethodOfPayment":"P","LineHaul":1300,"MinimumCharge":0,"InvoiceNumber":null,"Currency":"CAD","Accessorials":null,"CarrierID":"1127","ProvincialSalesAmount":0,"FuelSurcharge":0,"FuelSurchargeQualifier":"NC","ApiType":"INVOICE_UPDATE","IsFinalInvoice":false}

BILL load
{"CarrierParentId":null,"NetAmount":1500,"HarmonizedSalesAmount":0,"NonassignedCarrierAccessorials":null,"transactionDate":"2025-04-16T14:46:01.8697052-06:00","AcctCode":null,"ControlCustomerNumber":"6170","LoadID":"F0428XX1","Rate":1500,"RateQualifier":"FC","GoodsServicesAmount":0,"MethodOfPayment":"P","LineHaul":1300,"MinimumCharge":0,"InvoiceNumber":null,"Currency":"CAD","Accessorials":null,"CarrierID":"1127","ProvincialSalesAmount":0,"FuelSurcharge":0,"FuelSurchargeQualifier":"NC","ApiType":"INVOICE_UPDATE","IsFinalInvoice":true}
*/

//delete integration logs
// var arr = nlapiSearchRecord(nlapiGetRecordType());
// for(var a = 0 ; a < arr.length ; a++)
// {
//     nlapiDeleteRecord(arr[a].getRecordType(), arr[a].getId())

define(['/SuiteScripts/ANC_lib.js', 'N/https', 'N/record', 'N/runtime', 'N/search', 'N/url'],
    /**
     * @param{https} https
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{url} url
     */
    (ANC_lib, https, record, runtime, search, url) => {
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


        var integrationLogId = null;
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
                var poRecId = ""
                var irRecId = "";
                var vbRecId = "";
                log.debug("requestBody", requestBody);
                var loadID = requestBody.loadID || requestBody.LoadID;
                var IsFinalInvoice = requestBody.IsFinalInvoice || requestBody.isFinalInvoice;
                log.debug("loadID", loadID)

                integrationLogId = ANC_lib.submitIntegrationLog(integrationLogId,{request:JSON.stringify(requestBody)});

                if(IsFinalInvoice)
                {
                    var lookupPo_result = lookupPo_final(loadID);
                    log.debug("lookupPo_result", lookupPo_result);

                    if(lookupPo_result.list && lookupPo_result.list.length > 0 && lookupPo_result.list[0] && !lookupPo_result.list[0].errorcode)
                    {
                        var poId = lookupPo_result.list[0];

                        try
                        {
                            var poId_approved = record.submitFields({
                                type : "purchaseorder",
                                id : poId,
                                values : {"supervisorapproval" : "T"}
                            })
                            log.debug("poId_approved", poId_approved)
                        }
                        catch(e)
                        {
                            log.error("ERROR in function post, approve PO", e.message)
                        }

                        var itemReceipt = "";
                        try
                        {
                            var irRecObj = record.transform({
                                fromType : "purchaseorder",
                                fromId : poId,
                                toType : "itemreceipt",
                            });

                            var transactionDateRaw = requestBody.invoiceDate || requestBody.InvoiceDate;
                            var transactionDate = new Date(transactionDateRaw);
                            var transactionDateStr = (transactionDate.getMonth() + 1) + "/" + (transactionDate.getDate()) + "/" + (transactionDate.getFullYear());

                            log.debug("transactionDateRaw", transactionDateRaw)
                            log.debug("transactionDate", transactionDate)
                            log.debug("transactionDateStr", transactionDateStr)

                            irRecObj.setText({
                                fieldId : "trandate",
                                value :transactionDateStr,
                                text :transactionDateStr
                            })


                            clearSublist(irRecObj, requestBody);
                            //we only need a checkbox, do it in clearSublist
                            //we dont need locations for noninvetory items/services
                            // fillSublist(irRecObj, requestBody, lookupPo_result);



                            irRecId = irRecObj.save({
                                ignoreMandatoryFields : true,
                                enableSourcing : true
                            })

                            log.debug("irRecId", irRecId);

                            // respMsgStr = JSON.stringify({success:true, message : "Successfully Submitted NetSuite Vendor Bill for load : " + loadID, NS_RECORD_INTERNALID:vbRecId, requestBody});
                        }
                        catch(e)
                        {
                            log.error("ERROR in function post, receive PO", e.message)
                        }

                        var vbRecObj = record.transform({
                            fromType : "purchaseorder",
                            fromId : poId,
                            toType : "vendorbill",
                        });

                        var transactionDateRaw = requestBody.invoiceDate || requestBody.InvoiceDate;
                        var transactionDate = new Date(transactionDateRaw);
                        var transactionDateStr = (transactionDate.getMonth() + 1) + "/" + (transactionDate.getDate()) + "/" + (transactionDate.getFullYear());

                        log.debug("transactionDateRaw", transactionDateRaw)
                        log.debug("transactionDate", transactionDate)
                        log.debug("transactionDateStr", transactionDateStr)

                        vbRecObj.setText({
                            fieldId : "trandate",
                            value :transactionDateStr,
                            text :transactionDateStr
                        })

                        vbRecObj.setValue({
                            fieldId : "approvalstatus",
                            value :"1",
                        })


                        clearSublist(vbRecObj, requestBody);
                        fillSublist(vbRecObj, requestBody, lookupPo_result);



                        vbRecId = vbRecObj.save({
                            ignoreMandatoryFields : true,
                            enableSourcing : true
                        })

                        log.debug("vbRecId", vbRecId);

                        respMsg = ({success:true, message : "Successfully Submitted NetSuite Vendor Bill for load : " + loadID, NS_RECORD_INTERNALID:vbRecId, requestBody});
                    }
                    else
                    {
                        var respMsg = {success:false, message : "Cannot resolve load : " + loadID, NS_RECORD_INTERNALID:vbRecId, requestBody}
                        if(lookupPo_result.list[0].errorcode)
                        {
                            // respMsg.errorcode = lookupPo_result.list[0].errorcode
                            respMsg.errorcode = lookupPo_result.errorcode
                        }
                        throw (respMsg);
                    }


                }
                else if(!IsFinalInvoice)
                {
                    var lookupPo_result = lookupPo(loadID);
                    log.debug("lookupPo_result", lookupPo_result);

                    if(lookupPo_result.list && lookupPo_result.list.length > 0 && lookupPo_result.list[0] && !lookupPo_result.list[0].errorcode)
                    {
                        log.debug("0")
                        var poId = lookupPo_result.list[0];

                        var poRecObj = record.load({
                            type : "purchaseorder",
                            id : poId,
                        });

                        var transactionDateRaw = requestBody.invoiceDate || requestBody.InvoiceDate
                        var transactionDate = new Date(transactionDateRaw);
                        var transactionDateStr = (transactionDate.getMonth() + 1) + "/" + (transactionDate.getDate()) + "/" + (transactionDate.getFullYear());

                        log.debug("transactionDateRaw", transactionDateRaw)
                        log.debug("transactionDate", transactionDate)
                        log.debug("transactionDateStr", transactionDateStr)

                        poRecObj.setText({
                            fieldId : "trandate",
                            value :transactionDateStr,
                            text :transactionDateStr
                        })

                        poRecObj.setValue({
                            fieldId : "approvalstatus",
                            value :"1",
                        })

                        clearSublist(poRecObj, requestBody);
                        fillSublist(poRecObj, requestBody, lookupPo_result, true);

                        poRecId = poRecObj.save({
                            ignoreMandatoryFields : true,
                            enableSourcing : true
                        })

                        log.debug("poRecId edit", poRecId);

                        var respMsg = {success:true, errorcode : lookupPo_result.errorcode, message : "Successfully Updated NetSuite PO for load : " + loadID, NS_RECORD_INTERNALID:poRecId, requestBody};
                        if(lookupPo_result.list[0].errorcode)
                        {
                            // respMsg.errorcode = lookupPo_result.list[0].errorcode
                            respMsg.errorcode = lookupPo_result.errorcode
                        }

                    }
                    else
                    {

                        log.debug("1")
                        if(lookupPo_result.list && lookupPo_result.list[0] && lookupPo_result.list[0].errorcode)
                        {
                            respMsgStr = JSON.stringify({success:false, errorcode:(lookupPo_result.list[0].errorcode), message : "Action Rejected for : " + loadID, NS_RECORD_INTERNALID:poRecId, requestBody});
                        }

                        log.debug("PO CREATE")
                        // var poId = lookupPo(_result.list[0];
                        var carrierId = requestBody.carrierID || requestBody.CarrierID;
                        var carrierInternalid = "";
                        var vendorSearchObj = search.create({
                            type : "vendor",
                            filters : [
                                ["externalid", "anyof", [carrierId, "CAR"+carrierId]]
                            ],
                        })

                        var sr = vendorSearchObj.run();

                        sr.each(function(res){
                            carrierInternalid = res.id;
                            //no just get the first result
                            return false;
                        })

                        if(!carrierInternalid)
                        {
                            respMsg ={success:false, message : "Cannot resolve Vendor/Carrier with externalid : " + carrierId, requestBody};
                            throw respMsg;
                        }

                        var poRecObj = record.create({
                            type : "purchaseorder",
                            defaultValues : {
                                entity : carrierInternalid
                            }
                        });

                        var transactionDateRaw = requestBody.invoiceDate || requestBody.InvoiceDate
                        var transactionDate = new Date(transactionDateRaw);
                        var transactionDateStr = (transactionDate.getMonth() + 1) + "/" + (transactionDate.getDate()) + "/" + (transactionDate.getFullYear());

                        log.debug("transactionDateRaw", transactionDateRaw)
                        log.debug("transactionDate", transactionDate)
                        log.debug("transactionDateStr", transactionDateStr)

                        poRecObj.setText({
                            fieldId : "trandate",
                            value :transactionDateStr,
                            text :transactionDateStr
                        })

                        poRecObj.setValue({
                            fieldId : "approvalstatus",
                            value :"1",
                        })
                        poRecObj.setValue({
                            fieldId : "externalid",
                            value :loadID,
                        })
                        // poRecObj.setValue({
                        //     fieldId : "custbody_work_order",
                        //     value :loadID,
                        // })
                        poRecObj.setValue({
                            fieldId : "custbody_purchase_order",
                            value :loadID,
                        })

                        var currEntity = poRecObj.getValue({
                            fieldId : "entity",
                        });
                        log.debug("currEntity", currEntity);

                        clearSublist(poRecObj, requestBody);
                        fillSublist(poRecObj, requestBody, lookupPo_result, true);

                        poRecId = poRecObj.save({
                            ignoreMandatoryFields : true,
                            enableSourcing : true
                        })

                        log.debug("poRecId edit", poRecId);

                        respMsg = {success:true, message : "Successfully Created NetSuite PO for load : " + loadID, NS_RECORD_INTERNALID:poRecId, requestBody};
                        if(lookupPo_result.list[0].errorcode)
                        {
                            // respMsg.errorcode = lookupPo_result.list[0].errorcode
                            respMsg.errorcode = lookupPo_result.errorcode
                        }
                    }
                }
            }
            catch(e)
            {
                log.error("ERROR in function post", e)
                respMsg={success:false, message: "ERROR caught: " + JSON.stringify(e), requestBody};
            }

            respMsgStr = JSON.stringify(respMsg);

            integrationLogId = ANC_lib.submitIntegrationLog(integrationLogId,{response:respMsgStr});
            log.debug(integrationLogId, integrationLogId)
            return respMsgStr
        }

        function fillSublist(nsRecObj, requestBody, lookupPo_result, initializeMainItem)
        {

            var nsRecObj_stringified = JSON.stringify(nsRecObj);
            log.debug("nsRecObj_stringified", nsRecObj_stringified);
            var nsRecObj_stringified_lineFields = nsRecObj.lineFields;
            // for(var key in nsRecObj)
            // {
            //     log.audit("key" + key, nsRecObj[key]);
            // }



            log.debug("nsRecObj_stringified_items", nsRecObj_stringified_lineFields);
            // var nsRecObj_stringified_items = JSON.stringify(nsRecObj.lineFields.item);

            try
            {

                if(initializeMainItem)
                {
                    nsRecObj.setSublistValue({
                        sublistId : "item",
                        fieldId : "item",
                        line : 0,
                        value : NF_item
                    })
                    nsRecObj.setSublistValue({
                        sublistId : "item",
                        fieldId : "rate",
                        line : 0,
                        value : requestBody.rate || requestBody.Rate
                    })
                    nsRecObj.setSublistValue({
                        sublistId : "item",
                        fieldId : "quantity",
                        line : 0,
                        value : 1
                    })
                    nsRecObj.setSublistValue({
                        sublistId : "item",
                        fieldId : "amount",
                        line : 0,
                        value : requestBody.rate || requestBody.Rate
                    })

                    nsRecObj.setSublistValue({
                        sublistId : "item",
                        fieldId : "taxcode",
                        line : 0,
                        value : 82
                    })
                }





                var nsRecObj_itemSublist_count = nsRecObj.getLineCount({
                    sublistId : "item"
                })
                var targetLine = nsRecObj_itemSublist_count;
                var accessorials = requestBody.accessorials || requestBody.Accessorials || [];
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
                            targetItemInternalId = 188338 //"Unknown Accessorial Line"
                        }

                        log.debug("targetItemInternalId", targetItemInternalId)

                        if(mapping[accessorial_qualifier] && accessorial_qualifier && accessorial_charge)
                        {
                            if(targetItemInternalId)
                            {
                                nsRecObj.setSublistValue({
                                    sublistId : "item",
                                    fieldId : "item",
                                    line : targetLine,
                                    value : targetItemInternalId
                                })
                            }
                            else
                            {
                                nsRecObj.setSublistValue({
                                    sublistId : "item",
                                    fieldId : "item",
                                    line : targetLine,
                                    value : mapping["Unknown Accessorial Line"]
                                })
                            }

                            nsRecObj.setSublistValue({
                                sublistId : "item",
                                fieldId : "rate",
                                line : targetLine,
                                value : accessorial_charge
                            })
                            nsRecObj.setSublistValue({
                                sublistId : "item",
                                fieldId : "quantity",
                                line : targetLine,
                                value : 1
                            })
                            nsRecObj.setSublistValue({
                                sublistId : "item",
                                fieldId : "amount",
                                line : targetLine,
                                value : accessorial_charge
                            })

                            nsRecObj.setSublistValue({
                                sublistId : "item",
                                fieldId : "taxcode",
                                line : targetLine,
                                value : 82
                            })
                        }


                        targetLine++;
                    }

                }

            }
            catch(e)
            {
                log.error("ERROR i nfunction fillSublist", e)
            }

            return nsRecObj;
        }

        function clearSublist(nsRecObj, requestBody)
        {

            if(nsRecObj.type == "itemreceipt")
            {

                var nsRecObj_itemSublist_count = nsRecObj.getLineCount({
                    sublistId : "item"
                })

                for(var a = nsRecObj_itemSublist_count ; a > 0 ; a--)
                {
                    var itemId = nsRecObj.getSublistValue({
                        sublistId : "item",
                        fieldId : "item",
                        line : a-1
                    })
                    log.debug("clearSublist itemId", itemId)
                    //TODO dont have to uncheck it if it passed.
                    if(itemId == NF_item)
                    {
                        nsRecObj.setSublistValue({
                            sublistId : "item",
                            fieldId : "itemreceive",
                            line : a-1,
                            value : true
                        })
                    }
                    else if(itemId != NF_item)
                    {
                        nsRecObj.setSublistValue({
                            sublistId : "item",
                            fieldId : "itemreceive",
                            line : a-1,
                            value : false
                        })
                    }
                }
            }
            else
            {
                var NF_rate = requestBody.rate || requestBody.Rate;

                var nsRecObj_itemSublist_count = nsRecObj.getLineCount({
                    sublistId : "item"
                })

                log.debug("clearSublist nsRecObj_itemSublist_count", nsRecObj_itemSublist_count)

                for(var a = nsRecObj_itemSublist_count ; a > 0 ; a--)
                {
                    log.debug("clearSublist, a", a);
                    var itemId = nsRecObj.getSublistValue({
                        sublistId : "item",
                        fieldId : "item",
                        line : a-1
                    })
                    log.debug("clearSublist itemId", itemId)
                    if(itemId == NF_item)
                    {
                        nsRecObj.setSublistValue({
                            sublistId : "item",
                            fieldId : "rate",
                            line : a-1,
                            value : NF_rate
                        })
                    }
                    else if(itemId != NF_item)
                    {
                        nsRecObj.removeLine({
                            sublistId : "item",
                            line : a-1
                        })
                    }
                }

            }


            return nsRecObj;
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
            "transactionDate": "2019-08-24T14:15:22Z",
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

        function lookupPo_final(loadID)
        {
            var lookupPo_result = {list : []};
            try
            {
                var purchaseorderSearchObj = search.create({
                    type: "purchaseorder",
                    // settings:[{"name":"consolidationtype","value":"ACCTTYPE"}],
                    filters:
                        [
                            ["type","anyof","PurchOrd"],
                            "AND",
                            // ["status","anyof","PurchOrd:F","PurchOrd:E"],
                            // ["status","anyof","PurchOrd:A","PurchOrd:B","PurchOrd:F","PurchOrd:D","PurchOrd:E"],
                            // "AND",
                            ["mainline","is","T"],
                            "AND",
                            [["externalidstring","is",loadID],
                                // "OR",["poastext","is",loadID]
                            ]
                        ],
                    columns:
                        [
                            search.createColumn({name:"status"})
                        ]
                });

                var sr = purchaseorderSearchObj.run();

                sr.each(function(res){
                    lookupPo_result.list.push(res.id);
                    if(res.getValue({name:"status"}))
                    {
                        lookupPo_result.errorcode = "Warning, the PO have related records that may be affected."
                    }
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
                            // ["status","anyof","PurchOrd:F","PurchOrd:B","PurchOrd:A"],
                            // "AND",
                            ["mainline","is","T"],
                            "AND",
                            [["externalidstring","is",loadID],
                                // "OR",["poastext","is",loadID]
                            ]
                        ],
                    columns:
                        [
                            search.createColumn({name:"status"})
                        ]
                });

                var sr = purchaseorderSearchObj.run();

                sr.each(function(res){
                    log.debug("res", res)
                    lookupPo_result.list.push(res.id);
                    if(res.getValue({name:"status"}) == "fullyBilled")
                    {
                        lookupPo_result.errorcode = "Warning, the PO have related records that may be affected."
                    }
                    //no just get the first result
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

/**
 * @NApiVersion 2.1
 */

//delete integration logs
// var arr = nlapiSearchRecord(nlapiGetRecordType());
// for(var a = 0 ; a < arr.length ; a++)
// {
//     nlapiDeleteRecord(arr[a].getRecordType(), arr[a].getId())
define(['N/query', 'N/record', 'N/runtime', 'N/search'],
    
    (query, record, runtime, search) => {

        const foo = () => {

        }

        const bar = () => {

        }

        const references = {
                SO_COLUMNS : {
                        GRADE : "custcol_anc_grade",
                        CONSIGNEE : "custcol_consignee",
                        DELIVERYDATE : "custcol_anc_deliverydate",
                        SHIPDATE : "custcol_anc_shipdate",
                        PRODUCTIONDATE : "custcol_anc_productiondate",
                        SALESFORECAST : "custcol_anc_customeralloc_caid",
                },
                SALESFORECAST : {
                        FIELDS : {
                                CUSTOMER : "custrecord_anc_pf_customer",
                                GRADE : "custrecord_anc_pf_grade",
                                CONSIGNEE : "custrecord_anc_pf_consignee",
                                MONTH : "custrecord_anc_pf_month",
                                YEAR : "custrecord_anc_pf_year",
                                COMPOSITEKEY : "custrecord_anc_pf_compositekey",
                                ALLOCATION : "custrecord_anc_pf_allocation",
                                NAME : "name",
                        },
                },
                RECTYPES : {
                        lane : {
                                id:"customrecord_anc_shippinglanes",
                                fields : {
                                        destinationcity : "custrecord_anc_lane_destinationcity",
                                        originwarehouse : "custrecord_anc_lane_originwarehouse",
                                }
                        },
                        consignee : {
                                id:"customrecord_alberta_ns_consignee_record",
                                fields : {
                                        city : "custrecord_alberta_ns_city",
                                }
                        },
                }
        }

        function getRelatedForecasts(tranInternalid, lineValList)
        {
                var compositeKeyResults = {};
                try
                {
                        var forecastFilters = getForecastFilters(tranInternalid, lineValList);
                        var sqlFilters_text = forecastFilters.join(" OR ")

                        log.debug("getRelatedForecasts sqlFilters_text", sqlFilters_text)

                        var sql =
                            `Select
                         sf.id as sf_id,
                         sf.custrecord_anc_pf_grade as sf_grade,
                         sf.custrecord_anc_pf_allocation as sf_allocation,
                         sf.custrecord_anc_pf_year as sf_year,
                         sf.custrecord_anc_pf_month as sf_month,
                         sf.custrecord_anc_pf_consignee as sf_consignee,
                         sf.custrecord_anc_pf_customer as sf_customer,
                         y.name as y_name,
                         m.name as m_name,

                        FROM
                        customrecord_anc_pf_ as sf
                        JOIN
                        customrecord_anc_pf_years as y ON y.id = sf.custrecord_anc_pf_year
                        JOIN
                        customrecord_anc_pf_months as m ON m.id = sf.custrecord_anc_pf_month

                        WHERE
                        ${sqlFilters_text}
                 `

                        log.debug("sql", sql)

                        const sqlResults = query.runSuiteQL({ query: sql }).asMappedResults();

                        log.debug("sqlResults", sqlResults);

                        var keyOrder = ["sf_customer", "sf_consignee", "sf_grade", "sf_month", "sf_year"]
                        compositeKeyResults = buildCompositeKeys(keyOrder, sqlResults)
                }
                catch(e)
                {
                        log.error("ERROR in fucntion getForecasts", e)
                }

                return compositeKeyResults;
        }

        const buildCompositeKeys = (keyOrder, forecastObj) =>
        {
                var buildCompositeKeys = {forecastObj : forecastObj, groupedByCompositekey : {}};
                if(!keyOrder)
                {
                        keyOrder = ["customer", "consignee", "grade", "month", "year"]
                }

                if(Array.isArray(forecastObj))
                {
                        for(var a = 0 ; a < forecastObj.length ; a++)
                        {
                                var compositekey = "";
                                var listOfCompositeElems = [];
                                for(var b = 0 ; b < keyOrder.length ; b++)
                                {
                                        listOfCompositeElems.push(forecastObj[a][keyOrder[b]]);
                                }
                                compositekey = listOfCompositeElems.join("_");

                                forecastObj[a].compositekey = compositekey;

                                buildCompositeKeys.groupedByCompositekey[compositekey] = forecastObj[a];
                        }
                }
                else
                {
                        var compositekey = "";
                        var listOfCompositeElems = [];
                        for(var b = 0 ; b < keyOrder.length ; b++)
                        {
                                listOfCompositeElems.push(forecastObj[keyOrder[b]]);
                        }
                        compositekey = listOfCompositeElems.join("_");
                        forecastObj.compositekey = compositekey;
                        // buildCompositeKeys.groupedByCompositekey[compositekey] = forecastObj;
                }

                log.debug("buildCompositeKeys forecastObj", forecastObj);
                log.debug("buildCompositeKeys buildCompositeKeys", buildCompositeKeys);
                return buildCompositeKeys
        }

        const getForecastFilters = (tranInternalId, lineValList) =>
        {
                var forecastFilters = [];
                try
                {
                        log.debug("getForecastFilters lineValList.length", lineValList.length)
                        for(var a = 0 ; a < lineValList.length ; a++)
                        {
                                var lineVals = lineValList[a];
                                log.debug("getForecastFilters lineVals", lineVals)
                                if(lineVals.customer && lineVals.grade && lineVals.consignee && lineVals.month && lineVals.year)
                                {
                                        var sqlForecastFilter = `
                                        (
                                        ${lineVals.customer} = sf.${references.SALESFORECAST.FIELDS.CUSTOMER}
                                        AND
                                        ${lineVals.consignee} = sf.${references.SALESFORECAST.FIELDS.CONSIGNEE}
                                        AND
                                        ${lineVals.grade} = sf.${references.SALESFORECAST.FIELDS.GRADE}
                                        AND
                                        ${lineVals.month} = sf.${references.SALESFORECAST.FIELDS.MONTH}
                                        AND
                                                (
                                                ${lineVals.year} = sf.${references.SALESFORECAST.FIELDS.YEAR}
                                                OR
                                                ${lineVals.year} = y.name
                                                )
                                        )
                                        `
                                        forecastFilters.push(sqlForecastFilter)
                                }
                        }

                        log.debug("getForecastFilters forecastFilters", forecastFilters);
                }
                catch(e)
                {
                        log.error("ERROR in function getForecastFilters")
                }

                return forecastFilters;
        }

            var yearMapping = {
                    "2020" : 1,
                    "2021" : 2,
                    "2022" : 3,
                    "2023" : 4,
                    "2024" : 5,
                    "2025" : 6,
                    "2026" : 7,
                    "2027" : 8,
                    "2028" : 9,
                    "2029" : 10,
                    "2030" : 11,
                    "2031" : 12,
                    "2032" : 13,
                    "2033" : 14,
                    "2034" : 15,
                    "2035" : 16,
                    "2036" : 17,
                    "2037" : 18,
                    "2038" : 19,
                    "2039" : 20,
                    "2040" : 21,
                    "2041" : 22,
                    "2042" : 23,
                    "2043" : 24,
                    "2044" : 25,
                    "2045" : 26,
                    "2046" : 27,
                    "2047" : 28,
                    "2048" : 29,
                    "2049" : 30,
                    "2050" : 31,
            }

            function submitIntegrationLog(integrationLogId, integrationLogObj, ignoreTags)
            {
                    var functionResult = {};
                    try
                    {
                            var recObj = null;
                            if(integrationLogId)
                            {
                                    recObj = record.load({
                                            type : "customrecord_anc_integration_config_logs",
                                            // type : "customrecord_anc_integrationlogs",
                                            id : integrationLogId
                                    });
                            }
                            else
                            {
                                    recObj = record.create({
                                            type : "customrecord_anc_integration_config_logs",
                                            // type : "customrecord_anc_integrationlogs"
                                    });
                            }


                            log.debug("integrationLogObj", integrationLogObj)



                            if(integrationLogObj.request)
                            {
                                    recObj.setValue({
                                            fieldId : "custrecord_anc_icl_request",
                                            value : integrationLogObj.request
                                    })
                            }

                            if(integrationLogObj.response)
                            {
                                    recObj.setValue({
                                            fieldId : "custrecord_anc_icl_response",
                                            value : integrationLogObj.response
                                    })
                            }


                            if(runtime.getCurrentScript().id)
                            {

                                    var searchObj = search.create({
                                            type : "script",
                                            filters : ["scriptid","is",runtime.getCurrentScript().id]
                                    });

                                    var scriptNumericInternalId = "";
                                    searchObj.run().each(function(res){
                                            scriptNumericInternalId = res.id;
                                            return false;
                                    })

                                    recObj.setValue({
                                            fieldId : "custrecord_anc_icl_script",
                                            value :scriptNumericInternalId
                                    })
                            }


                            // var submittedRecId = recObj.save({
                            //         ignoreMandatoryFields : true,
                            //         allowSourcing : true
                            // });

                            if(runtime.getCurrentScript().deploymentId)
                            {
                                    var searchObj = search.create({
                                            type : "scriptdeployment",
                                            filters : ["scriptid","is",runtime.getCurrentScript().deploymentId]
                                    });

                                    var deploymentNumericInternalId = "";
                                    searchObj.run().each(function(res){
                                            deploymentNumericInternalId = res.id;
                                            return false;
                                    })

                                    recObj.setValue({
                                            fieldId : "custrecord_anc_icl_deployment",
                                            value :deploymentNumericInternalId
                                    })
                            }

                            //TAGS
                            if(runtime.getCurrentScript().deploymentId)
                            {
                                    var searchObj = search.create({
                                            type : "scriptdeployment",
                                            filters : ["scriptid","is",runtime.getCurrentScript().deploymentId]
                                    });

                                    var deploymentNumericInternalId = "";
                                    searchObj.run().each(function(res){
                                            deploymentNumericInternalId = res.id;
                                            return false;
                                    })

                                    recObj.setValue({
                                            fieldId : "custrecord_anc_icl_deployment",
                                            value :deploymentNumericInternalId
                                    })
                            }


                            try
                            {
                                    if(ignoreTags)
                                    {

                                    }
                                    else
                                    {
                                            if(integrationLogObj.request)
                                            {
                                                    var searchFilter = [];
                                                    var tagArray = [];

                                                    log.debug("integrationLogObj.request", integrationLogObj.request);

                                                    var requestObj = (typeof integrationLogObj.request == "object") ? integrationLogObj.request : JSON.parse(integrationLogObj.request);

                                                    if(requestObj.integrationLogTags)
                                                    {
                                                            if(typeof requestObj.integrationLogTags == "object")
                                                            {
                                                                    if(Array.isArray(requestObj.integrationLogTags))
                                                                    {
                                                                            tagArray = requestObj.integrationLogTags
                                                                    }
                                                            }
                                                            else if(typeof requestObj.integrationLogTags == "string")
                                                            {
                                                                    tagArray = requestObj.integrationLogTags.split(",")
                                                            }

                                                            var tagArrayQuoted = tagArray.map(function(tag){
                                                                    return `'${tag}'`
                                                            })
                                                            var tagArrayStr = tagArrayQuoted.join(",");
                                                            var searchFilter = [`formulanumeric: CASE WHEN {name} IN (${tagArrayStr}) THEN 1 ELSE 0 END`,"equalto","1"]

                                                            var searchTags_results = searchTags(searchFilter);

                                                            var tagFieldValues = [];
                                                            for(var a = 0 ; a < tagArray.length ; a++)
                                                            {
                                                                    if(searchTags_results.byName[tagArray[a]])
                                                                    {
                                                                            tagFieldValues.push(searchTags_results.byName[tagArray[a]].id);
                                                                    }
                                                                    else
                                                                    {
                                                                            var tagRecObj = record.create({
                                                                                    type : "customrecord_anc_tags"
                                                                            });
                                                                            tagRecObj.setValue({
                                                                                    fieldId : "name",
                                                                                    value : tagArray[a]
                                                                            });
                                                                            var newTagRecId = tagRecObj.save()
                                                                            tagFieldValues.push(newTagRecId);
                                                                    }

                                                            }
                                                            log.debug("tagFieldValues", tagFieldValues)
                                                            recObj.setValue({
                                                                    fieldId : "custrecord_anc_icl_tags",
                                                                    value :tagFieldValues
                                                            })

                                                    }
                                            }
                                    }
                            }
                            catch(e)
                            {
                                    log.error("ERROR (acceptable) in function submitIntegrationLogs", e)
                            }


                            var submittedRecId = recObj.save({
                                    ignoreMandatoryFields : true,
                                    allowSourcing : true
                            });

                            // var submittedRecId1 = record.submitFields({
                            //         type : recObj.type,
                            //         id : submittedRecId,
                            //         values : {
                            //                 custrecord_anc_icl_deployment : deploymentNumericInternalId
                            //         }
                            // })
                            //
                            // log.debug("submitIntegrationLog submittedRecId1", submittedRecId1)


                            log.debug("submitIntegrationLog submittedRecId", submittedRecId)
                    }
                    catch(e)
                    {
                            log.error("ERROR in function submitIntegrationLog", e)
                    }
                    return submittedRecId;
                    // return functionResult;
            }

            function searchTags(filters, cols)
            {
                    cols = cols ? cols : [];
                    var searchTags_results = {byId:{}, byName:{},list:[]};
                    var nameCol = search.createColumn({name: "name", label: "Name"});
                    cols = cols.concat([nameCol])
                    var customrecord_anc_tagsSearchObj = search.create({
                            type: "customrecord_anc_tags",
                            filters:
                                [
                                        filters
                                ],
                            columns:
                                cols
                    });
                    var searchResultCount = customrecord_anc_tagsSearchObj.runPaged().count;
                    log.debug("customrecord_anc_tagsSearchObj result count",searchResultCount);
                    customrecord_anc_tagsSearchObj.run().each(function(result){
                            // .run().each has a limit of 4,000 results

                            var resObj = {};
                            resObj.id = result.id;
                            for(var a = 0 ; a < cols.length ; a++)
                            {
                                    resObj[cols[a].label] = result.getValue(nameCol)
                            }
                            searchTags_results.byName[result.getValue(nameCol)] = resObj
                            searchTags_results.byId[result.id] = resObj
                            return true;
                    });

                    log.debug("searchTags_results", searchTags_results);

                    searchTags_results

                    return searchTags_results
            }

            var MINIMIZE_UI = {
                elemList : [
                        {
                                name : "warehouse_and_logistics",
                                list : [],
                                title : "Logistics",
                                icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG",
                                properties : [

                                ],
                                tdElemHtml : [
                                        `<td align="center"><p>Logistics<br/><img width="75px" height="75px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,

                                        ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
                                ],
                                targetScriptId : "customscript_anc_sl_minimize_ui",
                                targetDeploymentId : "customdeploy_anc_sl_minimize_ui",
                                headerTitle : "Logistics",
                                rowTitle : "Logistics",
                                iconWidth : "50px",
                                iconHeight : "50px",
                                position : 9,
                                addtlParams : "&minimizeui=warehouse_and_logistics"
                        },
                        {
                                name : "orderquantity_and_inventorystatus",
                                list : [],
                                title : "Inventory",
                                icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203538&c=1116623_SB2&h=GBFNo186_VXtycKD8lQ8h1BqLzd9c6FG3wq_rEZNvsLpQU9N",
                                properties : [

                                ],
                                tdElemHtml : [
                                        `<td align="center"><p>Qty&Status<br/><img width="75px" height="75px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,

                                        ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
                                ],
                                targetScriptId : "customscript_anc_sl_minimize_ui",
                                targetDeploymentId : "customdeploy_anc_sl_minimize_ui",
                                headerTitle : "Inventory",
                                rowTitle : "Qty<br/>Status",
                                iconWidth : "50px",
                                iconHeight : "50px",
                                position : 9,
                                addtlParams : "&minimizeui=orderquantity_and_inventorystatus"
                        },
                        {
                                name : "product_and_packaging",
                                list : [],
                                title : "Packaging",
                                icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203539&c=1116623_SB2&h=Al2AWzDaC39Xoch4LmAX2-WdvZ-DGfERnRBArgrJctLb72QV",
                                properties : [

                                ],
                                tdElemHtml : [
                                        `<td align="center"><p>Product<br/>&<br/>Packaging<img width="75px" height="75px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,

                                        ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
                                ],
                                targetScriptId : "customscript_anc_sl_minimize_ui",
                                targetDeploymentId : "customdeploy_anc_sl_minimize_ui",
                                headerTitle : "Packaging",
                                rowTitle : "Packaging",
                                iconWidth : "50px",
                                iconHeight : "50px",
                                position : 9,
                                addtlParams : "&minimizeui=product_and_packaging"
                        },
                        {
                                name : "customer_and_shipping_information",
                                list : [],
                                title : "Customer & Shipping Information",
                                icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203540&c=1116623_SB2&h=qADtKTHIw11x-nfVLN4KLPPcRqNKm5HmGa960KpNFbYInydL",
                                properties : [

                                ],
                                tdElemHtml : [
                                        `<td align="center"><p>Product<br/>&<br/>Packaging<img width="75px" height="75px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,

                                        ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
                                ],
                                targetScriptId : "customscript_anc_sl_minimize_ui",
                                targetDeploymentId : "customdeploy_anc_sl_minimize_ui",
                                headerTitle : "Shipping",
                                rowTitle : "Shipping",
                                iconWidth : "50px",
                                iconHeight : "50px",
                                position : 9,
                                addtlParams : "&minimizeui=customer_and_shipping"
                        },
                        // {
                        //     name : "graderun_reservation",
                        //     list : [],
                        //     title : "Grade Run Reservation",
                        //     icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203558&c=1116623_SB2&h=pD37UzYzvN7o6bv03_Q0xtV7QvmUzmLnabI8wV-cDD8Qj-Hx",
                        //     // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203556&c=1116623_SB2&h=9LRWts-XaNsvfWEGThTpxop3PPh_vw9a5NL8XkmR0s-IMKXQ",
                        //     // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203552&c=1116623_SB2&h=MN-utZwPfu8HdYVArnZgof3D9B7h0I8-zrYC9jESuG41PgRG",
                        //     // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203548&c=1116623_SB2&h=bmBfsZKAzX1cWJW3k6JWscc898dfKvCqn4-HlAnnSmEdv9b-",
                        //     // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203546&c=1116623_SB2&h=b78Hwg-A3GdVaZkoRGhCGPfUdZ-46PpS4e87hlLXZCd31zlg",
                        //     // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203547&c=1116623_SB2&h=T3_gjlsgsuFfQOjmnJ88n0duN5T6UHxs17J4UTxsfshVHFn0",
                        //     properties : [
                        //
                        //     ],
                        //     tdElemHtml : [
                        //         `<td align="center"><p><img width="100px" height="100px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,
                        //
                        //         ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
                        //     ],
                        //     targetScriptId : "customscript_anc_sl_salesprocesses",
                        //     targetDeploymentId : "customdeploy_anc_sl_salesprocesses",
                        //     headerTitle : "Grade Run<br/>Reservation",
                        //     rowTitle : "",
                        //     iconWidth : "50px",
                        //     iconHeight : "50px",
                        //     position : 0,
                        //     addtlParams : "&processid=grreservation"
                        // },
                        {
                                name : "scheduling_and_keydates",
                                list : [],
                                title : "Key Dates",
                                icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203556&c=1116623_SB2&h=9LRWts-XaNsvfWEGThTpxop3PPh_vw9a5NL8XkmR0s-IMKXQ",
                                // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203552&c=1116623_SB2&h=MN-utZwPfu8HdYVArnZgof3D9B7h0I8-zrYC9jESuG41PgRG",
                                // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203548&c=1116623_SB2&h=bmBfsZKAzX1cWJW3k6JWscc898dfKvCqn4-HlAnnSmEdv9b-",
                                // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203546&c=1116623_SB2&h=b78Hwg-A3GdVaZkoRGhCGPfUdZ-46PpS4e87hlLXZCd31zlg",
                                // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203547&c=1116623_SB2&h=T3_gjlsgsuFfQOjmnJ88n0duN5T6UHxs17J4UTxsfshVHFn0",
                                properties : [

                                ],
                                tdElemHtml : [
                                        `<td align="center"><p><img width="100px" height="100px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,

                                        ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
                                ],
                                targetScriptId : "customscript_anc_sl_minimize_ui",
                                targetDeploymentId : "customdeploy_anc_sl_minimize_ui",
                                headerTitle : "Key Dates",
                                rowTitle : "",
                                iconWidth : "50px",
                                iconHeight : "50px",
                                position : 9,
                                addtlParams : "&minimizeui=scheduling_and_keydates"
                        },
                        // {
                        //     name : "fitment_check",
                        //     list : [],
                        //     title : "Fitment Check",
                        //     icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203554&c=1116623_SB2&h=kTJFfuyMLg3xSqJ3X2VCVHc9OqW4GxxNPE8KEga83kzlgzYJ",
                        //     properties : [
                        //
                        //     ],
                        //     tdElemHtml : [
                        //         `<td align="center"><p>Product<br/>&<br/>Packaging<img width="75px" height="75px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,
                        //
                        //         ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
                        //     ],
                        //     // tdElementStart:`<td class="minimize_ui_elem_td0TEST" align="center"><p>TEST1<br/><img width="25px" height="25px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203519&c=1116623_SB2&h=LtlOhAYTLDyMXRBethELwZMrys0xDpb03GNVp9glCEtxUR3q" style="cursor: pointer;" onclick="nlExtOpenWindow(window.lineUrl_`,
                        //     // tdElementEnd:`', 'childdrecord', 700, 700, this, true,'');</p></td>`,
                        //     // tdElementStart:'<td class="minimize_ui_elem_td0fitment_check" align="center"><p>Fitment<br/>Check<br/><img width="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203540&c=1116623_SB2&h=qADtKTHIw11x-nfVLN4KLPPcRqNKm5HmGa960KpNFbYInydL" height="25px" src="25px" style="cursor: pointer;" onclick="window.open(window.lineUrl_',
                        //     // tdElementEnd:', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>',
                        //
                        //
                        //     targetScriptId : "customscript_anc_sl_fitmentchecking",
                        //     targetDeploymentId : "customdeploy_anc_sl_fitmentchecking",
                        //     headerTitle : "Fitment<br/>Check",
                        //     rowTitle : "",
                        //     iconWidth : "50px",
                        //     iconHeight : "50px",
                        //     position : 15,
                        //     addtlParams : ""
                        // }




                ]
            }

            var FREIGHTINVOICE = {
                        accessorial_mapping : {
                                //FUEL SURCHARGE IS NOT AN ACCESSORIAL
                            // "Fuel Surcharge" : 12231, //Newsprint Freight : Fuel Surcharge (Truck - Percent of Freight),
                            "Unknown Accessorial Line" : 188338,
                            "Detention Charge" : 27415
                        },
                        "FUELSURCHARGE_item" : 12231,
                        "NF_item" : "12493",
                        "FUELSURCHARGE_item_truck_to_whs" : 12231,
                        "FUELSURCHARGE_item_truck_to_cust" : 12231,
                        TAXCODES : {
                                "TAXCODE_NONTAXABLE82" : 82
                        }
                }

        return {
                foo,
                bar,
                getRelatedForecasts,
                references,
                getForecastFilters,
                yearMapping,
                submitIntegrationLog,
                MINIMIZE_UI,
                FREIGHTINVOICE
        }

    });

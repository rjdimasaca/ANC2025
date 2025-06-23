/**
 * @NApiVersion 2.1
 */

//delete integration logs
// var arr = nlapiSearchRecord(nlapiGetRecordType());
// for(var a = 0 ; a < arr.length ; a++)
// {
//     nlapiDeleteRecord(arr[a].getRecordType(), arr[a].getId())
define(['N/query', 'N/record', 'N/runtime', 'N/search', 'N/https'],

    (query, record, runtime, search, https) => {

        const foo = () => {

        }

        const bar = () => {

        }

        var salesForecastJobFolderId = 392686;

        const references = {
                SO_COLUMNS : {
                        GRADE : "custcol_anc_grade",
                        CONSIGNEE : "custcol_consignee",
                        DELIVERYDATE : "custcol_anc_deliverydate",
                        SHIPDATE : "custcol_anc_shipdate",
                        PRODUCTIONDATE : "custcol_anc_productiondate",
                        SALESFORECAST : "custcol_anc_customeralloc_caid",
                        SHIPMENTCAPACITY : "custcol_anc_shipmentcap_id",
                        PRODUCTIONCAPACITYMONTH : "custcol_anc_prodcapmonth_id",
                        PRODUCTIONCAPACITYWEEK : "custcol_anc_prodcapweek_id",
                        LINESTATUS : {
                                id : "custcol_anc_status",
                                options : {
                                        "APPROVED" : {val:1, text:"APPROVED"},
                                        "PENDING" : {val:2, text:"PENDING"},
                                        "REQUIRED" : {val:3, text:"REQUIRED"},
                                        "SHIPPED" : {val:4, text:"SHIPPED"},
                                }
                        },
                        TRANSITLOCATION : {
                                id : "custcol_anc_transitlocation",
                        },
                        TRANSITTIME : {
                                id : "custcol_anc_transittime",
                        },
                        TRANSITOPTMETHOD : {
                                id : "custcol_anc_transitoptmethod",
                        },
                        EQUIPMENT : {
                                id : "custcol_anc_equipment",
                        },
                        EQUIPMENT : {
                                id : "custcol_anc_equipment",
                        },
                        LDCDATE : {
                                id : "custcol_anc_ldcdate",
                        },
                        PRESSRUNDATE : {
                                id : "custcol_anc_pressrundate",
                        },
                        PRESSRUNDATE : {
                                id : "custcol_anc_pressrundate",
                        },
                        PRESSRUNDATE : {
                                id : "custcol_anc_pressrundate",
                        },
                        EXPECTEDTONNAGE : {
                                id : "custcol_anc_expectedtonnage",
                        },
                        TOTALROLLS : {
                                id : "custcol_anc_totalrolls",
                        },
                        ROLLSPERPACK : {
                                id : "custcol_anc_rollsperpack",
                        },
                        WRAPTYPE : {
                                id : "custcol_anc_wraptype",
                        },
                        SHIPPINGLANE : {
                                id : "custcol_anc_shippinglane",
                        },
                        ROLLSONHAND : {
                                id : "custcol_anc_rollsonhand",
                        },
                        RESERVEDROLLS : {
                                id : "custcol_anc_reservedrolls",
                        },
                        BACKORDERROLLS : {
                                id : "custcol_anc_backorderrolls",
                        },
                        CONSIGNEECOL : {
                                id : "custcol_consignee",
                        },

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
                                        originwarehousecity : "custrecord_anc_lane_originwarehousecity",
                                        destination : "custrecord_anc_lane_destination",
                                        crossdockwarehouse : "custrecord_anc_lane_cdw",
                                        crossdockwarehousecity : "custrecord_anc_lane_crossdockcity",
                                }
                        },
                        consignee : {
                                id:"customrecord_alberta_ns_consignee_record",
                                fields : {
                                        city : "custrecord_alberta_ns_city",
                                }
                        },
                        production_forecast : {
                                id: "customrecord_production_forecast",
                                fields: {
                                        month: "custrecord_prodfc_month",
                                        quantity: "custrecord_prodfc_plannedprodpmcap",
                                        year: "custrecord_prodfc_year",
                                        name: "name",
                                },
                        },
                        production_year : {
                                id:"customrecord_anc_pf_years",
                                fields : {
                                        month : "name",
                                        quantity : "name",
                                        year : "custrecord_prodfc_year",
                                        name : "name",
                                },
                                sublists : {
                                        salesforecast : "recmachcustrecord_anc_pf_year",
                                        productionforecast : "recmachcustrecord_prodfc_year"
                                }
                        },
                        shipment : {
                                id : "CuTrSale108" //FIXME
                        },
                        months : {
                                id : "customrecord_anc_pf_months"
                        },
                        shipmentcapacity : {
                                id : "customrecord_anc_dailyshipmentcap"
                        }
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


            function getRelatedShipCap(tranInternalid, lineValList)
            {
                    var compositeKeyResults = {};
                    try
                    {
                            var forecastFilters = getShipCapFilters(tranInternalid, lineValList);
                            var sqlFilters_text = forecastFilters.join(" OR ")

                            log.debug("getRelatedForecasts sqlFilters_text", sqlFilters_text)

                            var sql =
                                `Select
                         sc.id as sc_id,
                         sc.custrecord_anc_dsc_loc as sc_location,
                         sc.custrecord_anc_dsc_fulldate as sc_fulldate

                        FROM
                        customrecord_anc_dailyshipmentcap as sc

                        WHERE
                        ${sqlFilters_text}
                 `

                            log.debug("sql", sql)

                            const sqlResults = query.runSuiteQL({ query: sql }).asMappedResults();

                            log.debug("sqlResults", sqlResults);

                            var keyOrder = ["sc_location", "sc_fulldate"]
                            compositeKeyResults = buildCompositeKeys(keyOrder, sqlResults)
                    }
                    catch(e)
                    {
                            log.error("ERROR in fucntion getRelatedShipCap", e)
                    }

                    log.debug("getRelatedShipCap compositeKeyResults", compositeKeyResults)
                    return compositeKeyResults;
            }

            const getShipCapFilters = (tranInternalId, lineValList) =>
            {
                    var filters = [];
                    try
                    {
                            log.debug("getShipCapFilters lineValList.length", lineValList.length)
                            for(var a = 0 ; a < lineValList.length ; a++)
                            {
                                    var lineVals = lineValList[a];
                                    log.debug("getShipCapFilters lineVals", lineVals)
                                    if(lineVals.shipdate)
                                    {
                                            var sqlForecastFilter = `
                                        (
                                        '${lineVals.shipdate}' = sc.${"custrecord_anc_dsc_fulldate"}
                                        AND
                                        ${lineVals.location} = sc.${"custrecord_anc_dsc_loc"}
                                        )
                                        `
                                            //TODO move to lib
                                            //TODO move to lib
                                            filters.push(sqlForecastFilter)
                                    }
                            }

                            log.debug("getShipCapFilters filters", filters);
                    }
                    catch(e)
                    {
                            log.error("ERROR in function getForecastFilters")
                    }

                    return filters;
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
                                            value : integrationLogObj.request.slice(0,3999)
                                    })
                            }

                            if(integrationLogObj.response)
                            {
                                    recObj.setValue({
                                            fieldId : "custrecord_anc_icl_response",
                                            value : integrationLogObj.response.slice(0,3999)
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
                        {
                                name : "shipments",
                                list : [],
                                title : "Shipments",
                                icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203540&c=1116623_SB2&h=qADtKTHIw11x-nfVLN4KLPPcRqNKm5HmGa960KpNFbYInydL",
                                properties : [

                                ],
                                tdElemHtml : [
                                        `<td align="center"><p>Product<br/>&<br/>Packaging<img width="75px" height="75px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,

                                        ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
                                ],
                                targetScriptId : "customscript_anc_sl_minimize_ui",
                                targetDeploymentId : "customdeploy_anc_sl_minimize_ui",
                                headerTitle : "Shipments",
                                rowTitle : "Shipments",
                                iconWidth : "50px",
                                iconHeight : "50px",
                                position : 10,
                                addtlParams : "&minimizeui=shipments"
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
                        "DEFAULT_FUELSURCHARGE_item" : 12231,
                        "NF_item_truck_to_cust" : "12493", //Newsprint Freight
                        "NF_item_truck_to_whs" : "68403", //Prepaid Newsprint Freight
                        "NF_item_rail_to_cust" : "12493", //Newsprint Freight
                        "NF_item_rail_to_whs" : "68403", //Prepaid Newsprint Freight
                        "FUELSURCHARGE_item_truck_to_cust" : 12231, //Fuel Surcharge (Truck - Percent of Freight)
                        "FUELSURCHARGE_item_truck_to_whs" : 68407, //Prepaid Fuel Surcharge (Truck - Percent of Freight)
                        "FUELSURCHARGE_item_rail_to_cust" : 12232, //Fuel Surcharge (Rail - $/mile)
                        "FUELSURCHARGE_item_rail_to_whs" : 68406, //Prepaid Fuel Surcharge (Rail - $/mile)
                        TAXCODES : {
                                "TAXCODE_NONTAXABLE82" : 82
                        },
                        TEMPORARY_ITEM : "188748", //FIXME
                        DEFAULTCUSTOMER : 549160, //FIXME
                        DEFAULTCONSIGNEE : 305737 //FIXME
                }


            function generateShipments(fitmentRequestData) {
                    var rawResp = https.post({
                            url: "https://loadfitting.anchub.ca/loadfitting/generateshipments",
                            body: fitmentRequestData,
                            headers: {
                                    "Authorization": "Bearer 67afba48c5e94f0689dc4f9cb18afed2",
                                    "Content-Type": "application/json",
                                    "accept": "*/*"
                            }
                    });

                    return rawResp;
            }

            const PTMX = {
                    generateShipments : generateShipments
            }

            function getFitmentObj(rawRequestData)
            {
                    log.debug("getFitmentObj rawRequestData", rawRequestData)
                    var fitmentResponse = {
                            list : []
                    };
                    try
                    {
                            if(rawRequestData[0].line_usecrossdock && rawRequestData[0].line_usecrossdock != "F")
                            {
                                    var fitmentRequestData = {};
                                    fitmentRequestData.JurisdictionName = "Canada" || rawRequestData[0].lane_originloc_country; //TODO

                                    fitmentRequestData.vehicleName = rawRequestData[0].line_equipmenttext/* || "TRTAMDV53"*/; //TODO REMOVE THIS FALLBACK DEFAULT
                                    // fitmentRequestData.transportationMode = "TRUCK"; //TODO
                                    //TODO DEFAULTS to TRUCK if not configured
                                    fitmentRequestData.transportationMode = rawRequestData[0].line_equipment_typetext ? (rawRequestData[0].line_equipment_typetext).toUpperCase() : "TRUCK"; //TODO
                                    fitmentRequestData.orderItems = [];
                            }
                    }
                    catch(e)
                    {
                            log.error("ERROR in function getFitmentObj", e);
                    }
            }

            function getFitmentResponse(group_init_to_final = [], shipmentLineIdTracker)
            {
                    //MULTIPLE LINES
                    log.debug("getFitmentResponse group_init_to_final", group_init_to_final)
                        //8

                    //EXAMPLE
                    // group_init_to_final = [
                    //     {
                    //             "internalid":"61250543",
                    //             "status":"pendingFulfillment",
                    //             "entity":"106127","line_item":"188522",
                    //             "line_item_parent":"188519",
                    //             "line_quantity":"60",
                    //             "line_location":"9",
                    //             "line_locationtext":"ANS Paper (Summary) : ANC Whitecourt Warehouse","line_id":"1",
                    //             "line_sequencenumber":"1",
                    //             "line_uniquekey":"69348155",
                    //             "line_number":"",
                    //             "line_memo":"",
                    //             "line_reservedqty":"",
                    //             "line_reservedweight":"",
                    //             "line_deliverydate":"04/03/2025",
                    //             "line_shipdate":"03/09/2025",
                    //             "line_consignee":"198816",
                    //             "line_consigneetext":"The Arizona Republic",
                    //             "line_consignee_country":"USA",
                    //             "line_crossdock_country":"CA",
                    //             "line_crossdock_countrytext":null,
                    //             "lane_originloc_country":"37",
                    //             "lane_originloc_countrytext":"Canada",
                    //             "line_equipment":"5",
                    //             "line_equipmenttext":"TRTAMHTR53",
                    //             "line_equipment_type":"2",
                    //             "line_equipment_typetext":"Truck",
                    //             "line_rollsperpack":"1",
                    //             "line_transitoptmethod":"2",
                    //             "line_usecrossdock":true,
                    //             "line_item_basis_weight":"673.1",
                    //             "line_item_rolldiameter":"1",
                    //             "line_item_rolldiametertext":"100",
                    //             "line_item_rollwidth":"1",
                    //             "line_item_rollwidthtext":"100",
                    //             "custrecord_anc_lane_cde":"5",
                    //             "custrecord_anc_lane_lce":"6",
                    //             "custrecord_anc_lane_ftte":"1",
                    //             "custrecord_anc_lane_originwarehousecity":"WHITECOURT",
                    //             "custrecord_anc_lane_destinationcity":"Lulu Island",
                    //             "custrecord_anc_lane_crossdockcity":"Lulu Island",
                    //             "custrecord_anc_crossdockeligible":true,"id":"61250543",
                    //             "orig_custrecord_anc_lane_destinationcity":"Deer Valley",
                    //             "orig_line_location":"9",
                    //             "custpage_ifr_leg":"1",
                    //             "subtabname":"69348155",
                    //             "origkeys":" > 03/09/2025 > ANS Paper (Summary) : ANC Whitecourt Warehouse > Deer Valley"
                    //     },
                    //         {"internalid":"61250543","status":"pendingFulfillment","entity":"106127","line_item":"188537","line_item_parent":"188519","line_quantity":"20","line_location":"9","line_locationtext":"ANS Paper (Summary) : ANC Whitecourt Warehouse","line_id":"2","line_sequencenumber":"2","line_uniquekey":"69348156","line_number":"","line_memo":"","line_reservedqty":"","line_reservedweight":"","line_deliverydate":"04/03/2025","line_shipdate":"03/09/2025","line_consignee":"198816","line_consigneetext":"The Arizona Republic","line_consignee_country":"USA","line_crossdock_country":"CA","line_crossdock_countrytext":null,"lane_originloc_country":"37","lane_originloc_countrytext":"Canada","line_equipment":"5","line_equipmenttext":"TRTAMHTR53","line_equipment_type":"2","line_equipment_typetext":"Truck","line_rollsperpack":"1","line_transitoptmethod":"","line_usecrossdock":true,"line_item_basis_weight":"","line_item_rolldiameter":"1","line_item_rolldiametertext":"100","line_item_rollwidth":"2","line_item_rollwidthtext":"200","custrecord_anc_lane_cde":"5","custrecord_anc_lane_lce":"6","custrecord_anc_lane_ftte":"1","custrecord_anc_lane_originwarehousecity":"WHITECOURT","custrecord_anc_lane_destinationcity":"Lulu Island","custrecord_anc_lane_crossdockcity":"Lulu Island","custrecord_anc_crossdockeligible":true,"id":"61250543","orig_custrecord_anc_lane_destinationcity":"Deer Valley","orig_line_location":"9","custpage_ifr_leg":"1","subtabname":"69348156","origkeys":" > 03/09/2025 > ANS Paper (Summary) : ANC Whitecourt Warehouse > Deer Valley"},
                    //         {"internalid":"61250543","status":"pendingFulfillment","entity":"106127","line_item":"188537","line_item_parent":"188519","line_quantity":"30","line_location":"9","line_locationtext":"ANS Paper (Summary) : ANC Whitecourt Warehouse","line_id":"6","line_sequencenumber":"6","line_uniquekey":"69348160","line_number":"","line_memo":"","line_reservedqty":"","line_reservedweight":"","line_deliverydate":"04/03/2025","line_shipdate":"03/09/2025","line_consignee":"305730","line_consigneetext":"Arizona Daily Sun TEST_DIRECT","line_consignee_country":"USA","line_crossdock_country":"CA","line_crossdock_countrytext":null,"lane_originloc_country":"37","lane_originloc_countrytext":"Canada","line_equipment":"5","line_equipmenttext":"TRTAMHTR53","line_equipment_type":"2","line_equipment_typetext":"Truck","line_rollsperpack":"1","line_transitoptmethod":"1","line_usecrossdock":true,"line_item_basis_weight":"","line_item_":""}
                    // ]




                    var fitmentResponse = {
                            list : []
                    }
                    var fitmentRequestData = {};
                    fitmentRequestData.JurisdictionName = "Canada" || group_init_to_final[0].lane_originloc_country; //TODO

                    fitmentRequestData.vehicleName = group_init_to_final[0].line_equipmenttext || "TRTAMDV53"; //TODO REMOVE THIS FALLBACK DEFAULT
                    // fitmentRequestData.transportationMode = "TRUCK"; //TODO
                    //TODO DEFAULTS to TRUCK if not configured
                    fitmentRequestData.transportationMode = group_init_to_final[0].line_equipment_typetext ? (group_init_to_final[0].line_equipment_typetext).toUpperCase() : "TRUCK"; //TODO
                    fitmentRequestData.orderItems = [];

                    for(var a = 0 ; a < group_init_to_final.length; a++)
                    {
                            if(true /*group_init_to_final[a].line_usecrossdock && group_init_to_final[a].line_usecrossdock != "F"*/)
                            {
                                    var rawRequestData = group_init_to_final

                                    try
                                    {


                                            log.debug("xdock=t rawRequestData", rawRequestData);
                                            log.debug("xdock=t before push fitmentRequestData", fitmentRequestData);
                                            log.debug("xdock=t before push fitmentRequestData.orderItems", fitmentRequestData.orderItems);
                                            fitmentRequestData.orderItems = fitmentRequestData.orderItems ? fitmentRequestData.orderItems : [];
                                            log.debug("xdock=t after : push fitmentRequestData.orderItems", fitmentRequestData.orderItems);
                                            fitmentRequestData.orderItems = fitmentRequestData.orderItems || [];
                                            log.debug("xdock=t after || reinit push fitmentRequestData.orderItems", fitmentRequestData.orderItems);

                                            if(fitmentRequestData && !fitmentRequestData.orderItems)
                                            {
                                                    fitmentRequestData.orderItems = [];
                                            }


                                            if(shipmentLineIdTracker[rawRequestData[a].line_uniquekey])
                                            {

                                            }
                                            else
                                            {
                                                    shipmentLineIdTracker[rawRequestData[a].line_uniquekey] = {};
                                            }
                                            shipmentLineIdTracker[rawRequestData[a].line_uniquekey].weight = rawRequestData[a].line_item_basis_weight;

                                            fitmentRequestData.orderItems ? fitmentRequestData.orderItems.push(
                                                {
                                                        ItemId : rawRequestData[a].line_uniquekey,
                                                        Diameter : Number(rawRequestData[a].line_item_rolldiametertext) || 127, //TODO
                                                        Width : Number(rawRequestData[a].line_item_rollwidthtext) || 88.90,
                                                        Weight : rawRequestData[a].line_item_basis_weight || 673.1,
                                                        Nb : rawRequestData[a].line_quantity,
                                                        Type : /*rawRequestData[a].line_transitoptmethod || */1, //ALWAYS TRUCK OR IT WILL ERROR OUT
                                                        RPP : rawRequestData[a].line_item_rollsperpack || 1,
                                                }
                                            ) : ""
                                            log.debug("xdock=t after push fitmentRequestData.orderItems", fitmentRequestData.orderItems);






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


                                            // return rawResp;

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

                                            //FOR LEG1?
                                    }
                                    catch(e)
                                    {
                                            log.error("ERROR in function getFitmentResponse leg2", e);
                                    }
                            }
                            else if(group_init_to_final.line_usecrossdock && group_init_to_final.line_usecrossdock != "F")
                            {
                                    var rawRequestData = group_init_to_final
                                    var fitmentRequestData = {};
                                    fitmentRequestData.JurisdictionName = "Canada" || group_init_to_final.lane_originloc_country; //TODO

                                    fitmentRequestData.vehicleName = group_init_to_final.line_equipmenttext/* || "TRTAMDV53"*/; //TODO REMOVE THIS FALLBACK DEFAULT
                                    // fitmentRequestData.transportationMode = "TRUCK"; //TODO
                                    //TODO DEFAULTS to TRUCK if not configured
                                    fitmentRequestData.transportationMode = group_init_to_final.line_equipment_typetext ? (group_init_to_final.line_equipment_typetext).toUpperCase() : "TRUCK"; //TODO
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

                                            log.debug("xdock=t rawRequestData", rawRequestData);

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

                                            var rawResp = PTMX.generateShipments(fitmentRequestData);

                                            var connection_timeStamp_end = new Date().getTime();

                                            log.debug("straightleg connection time stats", {connection_timeStamp_start, connection_timeStamp_end, duration: connection_timeStamp_start - connection_timeStamp_end})

                                            log.debug("straightleg rawResp.body", rawResp.body)

                                            fitmentResponse.list.push(rawResp)
                                            // return rawResp;

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

                                            //FOR LEG2
                                    }
                                    catch(e)
                                    {
                                            log.error("ERROR in function getFitmentResponse leg1", e);
                                    }
                            }


                            log.debug("LEG1 fitmentRequestData", fitmentRequestData)

                            fitmentRequestData = JSON.stringify(fitmentRequestData)

                            var connection_timeStamp_start = new Date().getTime();

                            var rawResp = PTMX.generateShipments(fitmentRequestData);

                            var connection_timeStamp_end = new Date().getTime();

                            log.debug("LEG1 connection time stats", {connection_timeStamp_start, connection_timeStamp_end, duration: connection_timeStamp_start - connection_timeStamp_end})

                            log.debug("LEG1 rawResp.body", rawResp.body)

                            fitmentResponse.list.push(rawResp)




                    }
                    // if(group_init_to_final.line_usecrossdock && group_init_to_final.line_usecrossdock != "F")
                    // {
                    //         group_init_to_final.line_usecrossdock
                    //
                    // }
                    // fitmentRequestData.country = "Canada"; //TODO

                    //first leg, if it requires cross dock expect 2 legs already



                    log.debug("getFitmentResponse fitmentResponse", fitmentResponse);
                    return fitmentResponse;
            }

        function groupOrderLinesForShipmentGeneration(tranInternalId)
        {
                var filters = [
                        ["type","anyof","SalesOrd"],
                        "AND",
                        ["mainline","is","F"],
                        "AND",
                        ["taxline","is","F"],
                ];
                if(tranInternalId)
                {
                        filters.push("AND")
                        filters.push(["internalid","anyof",[tranInternalId,61250544]])
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
                                    search.createColumn({name: "custrecord_alberta_ns_country", join:"custcol_consignee", label: "line_consignee_country"}),
                                    search.createColumn({name: "country", join : "custcol_anc_transitlocation", label: "line_crossdock_country"}),
                                    search.createColumn({
                                            name: "custrecord_anc_lane_originwarehousecntry",
                                            join: "CUSTCOL_ANC_SHIPPINGLANE",
                                            label: "lane_originloc_country"
                                    }),
                                    // search.createColumn({
                                    //         name: "custrecord_anc_lane_originwarehousecntry",
                                    //         join: "CUSTCOL_ANC_SHIPPINGLANE",
                                    //         label: "lane_originloc_country"
                                    // }),
                                    // search.createColumn({
                                    //         name: "custrecord_anc_lane_originwarehousecntry",
                                    //         join: "CUSTCOL_ANC_SHIPPINGLANE",
                                    //         label: "lane_originloc_country"
                                    // }),
                                    // search.createColumn({name: "custcol_anc_equipment", label: "line_equipment"}), // equipment is not meant to be here
                                    search.createColumn({name: "custcol_anc_equipment", label: "line_equipment"}),
                                    search.createColumn({name: "custrecord_anc_transportmode", join: "custcol_anc_equipment", label: "line_equipment_type"}),
                                    search.createColumn({name: "custcol_anc_rollsperpack", label: "line_rollsperpack"}),
                                    search.createColumn({name: "custcol_anc_transitoptmethod", label: "line_transitoptmethod"}),
                                    search.createColumn({name: "custcol_anc_usecrossdock", label: "line_usecrossdock"}),
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
                                    search.createColumn({name: "custrecord_anc_crossdockeligible", join:"custcol_anc_shippinglane", label: "custrecord_anc_crossdockeligible"}),
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
                                if(label == "line_crossdock_country")
                                {
                                        resObjByColumnKey.line_crossdock_countrytext = res.getText(column);
                                        // resObjByColumnKey.line_crossdock_countrytext = res.getValue(column);
                                }
                                if(label == "lane_originloc_country")
                                {
                                        resObjByColumnKey.lane_originloc_countrytext = res.getText(column);
                                        // resObjByColumnKey.line_crossdock_countrytext = res.getValue(column);
                                }
                                if(label == "line_equipment_type")
                                {
                                        resObjByColumnKey.line_equipment_typetext = res.getText(column);
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
                // var srGroupedByDeliveryDate = groupByKeys(srToObjects, ["line_shipdate", "line_locationtext", "custrecord_anc_lane_destinationcity", /*"line_equipmenttext"*/])
                var srGroupedByDeliveryDate = groupByOrigcityDestcity(srToObjects, ["line_shipdate", "line_locationtext", "custrecord_anc_lane_destinationcity", "line_equipmenttext"])
                log.debug("srGroupedByDeliveryDate", srGroupedByDeliveryDate)

                return srGroupedByDeliveryDate
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

            function groupByOrigcityDestcity(objectArray, property)
            {
                    try
                    {
                            return objectArray.reduce(function (acc, obj) {

                                    // var separator = " | ";
                                    var separator = " > ";
                                    var isCrossDock = true;
                                    var isCrossDock = obj.custrecord_anc_crossdockeligible;

                                    var key = "";
                                    var origkeys = "";
                                    var obj1 = JSON.parse(JSON.stringify(obj))
                                    for(var a = 0 ; a < property.length; a++)
                                    {
                                            obj1["orig_"+property[a]] = obj1[""+property[a]];
                                            origkeys += separator + (obj1[property[a]] || "");
                                            key +=  separator + (obj1[property[a]] || "");
                                    }

                                    obj1["orig_custrecord_anc_lane_destinationcity"] = obj1["custrecord_anc_lane_destinationcity"];
                                    obj1["orig_line_location"] = obj1["line_location"];
                                    obj1.origkeys = origkeys;
                                    // key += "|"

                                    if (!acc[key]) {
                                            acc[key] = {};
                                            acc[key].list = [];
                                    }
                                    var straightObj = acc[key];
                                    straightObj.list.push(obj1);
                                    if (!acc[key]) {
                                            acc[key] = {};
                                            acc[key].leg0 = [];
                                    }
                                    if (!acc[key]) {
                                            acc[key] = {};
                                            acc[key].leg1 = [];
                                    }

                                    if(!isCrossDock || isCrossDock == "F")
                                    {
                                            var key = "";
                                            var origkeys = "";
                                            var obj1 = JSON.parse(JSON.stringify(obj))
                                            for(var a = 0 ; a < property.length; a++)
                                            {
                                                    obj1["orig_"+property[a]] = obj1[""+property[a]];
                                                    origkeys += separator + (obj1[property[a]] || "");
                                                    key +=  separator + (obj1[property[a]] || "");
                                            }

                                            obj1["orig_custrecord_anc_lane_destinationcity"] = obj1["custrecord_anc_lane_destinationcity"];
                                            obj1["orig_line_location"] = obj1["line_location"];
                                            obj1.origkeys = origkeys;
                                            // key += "|"

                                            if (!straightObj["leg0"]) {
                                                    straightObj.leg0 = [];
                                            }
                                            straightObj = acc[key];
                                            straightObj.leg0.push(obj1);
                                    }
                                    else/* if(isCrossDock)*/
                                    {
                                            key = "";
                                            origkeys = "";
                                            //LEG1

                                            var obj1 = JSON.parse(JSON.stringify(obj))
                                            for(var a = 0 ; a < property.length; a++)
                                            {
                                                    origkeys += separator + (obj1[property[a]] || "");
                                                    if(property[a] == "custrecord_anc_lane_destinationcity")
                                                    {
                                                            obj1["orig_"+property[a]] = obj1["custrecord_anc_lane_destinationcity"];
                                                            obj1[property[a]] = obj1["custrecord_anc_lane_crossdockcity"];
                                                    }
                                                    key +=  separator + (obj1[property[a]] || "");
                                            }
                                            obj1["orig_line_location"] = obj1["line_location"];
                                            obj1.custpage_ifr_leg = "1";
                                            obj1.subtabname = obj1["line_uniquekey"];
                                            obj1.origkeys = origkeys;
                                            // key += "|"

                                            if (!straightObj["leg1"]) {
                                                    straightObj.leg1 = [];
                                            }
                                            straightObj.leg1.push(obj1);

                                            key = "";
                                            origkeys = "";

                                            //TODO dont work on LEG2, let this be taken care of LOAD PLANNING PHASE
                                            //TODO just look at LEG1s of crossdocked orderlines, and leg0 or in other words DIRECT
                                            //
                                            // //LEG2
                                            //
                                            // var obj2 = JSON.parse(JSON.stringify(obj))
                                            // for(var a = 0 ; a < property.length; a++)
                                            // {
                                            //         origkeys += separator + (obj2[property[a]] || "");
                                            //         if(property[a] == "line_locationtext")
                                            //         {
                                            //                 obj2["orig_"+property[a]] = obj2["line_locationtext"];
                                            //                 obj2[property[a]] = obj2["custrecord_anc_lane_crossdockcity"];
                                            //         }
                                            //         key +=  separator + (obj2[property[a]] || "");
                                            // }
                                            // obj2["orig_custrecord_anc_lane_destinationcity"] = obj2["custrecord_anc_lane_destinationcity"];
                                            // obj2["orig_line_location"] = obj2["line_location"];
                                            // obj2.custpage_ifr_leg = "2";
                                            // obj2.subtabname = obj2["line_uniquekey"];
                                            // obj2.origkeys = origkeys;
                                            // // key += "|"
                                            //
                                            // if (!straightObj["leg2"]) {
                                            //         straightObj.leg2 = [];
                                            // }
                                            // straightObj.leg2.push(obj2);
                                    }

                                    return acc;
                            }, {});
                    }
                    catch(e)
                    {
                            log.error("ERROR in function groupByOrigcityDestcity", e)
                    }

            }

            function groupByKeys(objectArray, property) {
                    return objectArray.reduce(function (acc, obj) {

                            // var separator = " | ";
                            var separator = " > ";
                            var key = "";
                            var origkeys = "";
                            var isCrossDock = true;
                            var isCrossDock = obj.custrecord_anc_crossdockeligible;
                            if(!isCrossDock || isCrossDock == "F")
                            {
                                    var obj1 = JSON.parse(JSON.stringify(obj))
                                    for(var a = 0 ; a < property.length; a++)
                                    {
                                            obj1["orig_"+property[a]] = obj1[""+property[a]];
                                            origkeys += separator + (obj1[property[a]] || "");
                                            key +=  separator + (obj1[property[a]] || "");
                                    }

                                    obj1["orig_custrecord_anc_lane_destinationcity"] = obj1["custrecord_anc_lane_destinationcity"];
                                    obj1["orig_line_location"] = obj1["line_location"];
                                    obj1.origkeys = origkeys;
                                    // key += "|"

                                    if (!acc[key]) {
                                            acc[key] = [];
                                    }
                                    acc[key].push(obj1);
                            }
                            else/* if(isCrossDock)*/
                            {
                                    //LEG1

                                    var obj1 = JSON.parse(JSON.stringify(obj))
                                    for(var a = 0 ; a < property.length; a++)
                                    {
                                            origkeys += separator + (obj1[property[a]] || "");
                                            if(property[a] == "custrecord_anc_lane_destinationcity")
                                            {
                                                    obj1["orig_"+property[a]] = obj1["custrecord_anc_lane_destinationcity"];
                                                    obj1[property[a]] = obj1["custrecord_anc_lane_crossdockcity"];
                                            }
                                            key +=  separator + (obj1[property[a]] || "");
                                    }
                                    obj1["orig_line_location"] = obj1["line_location"];
                                    obj1.custpage_ifr_leg = "1";
                                    obj1.subtabname = obj1["line_uniquekey"];
                                    obj1.origkeys = origkeys;
                                    // key += "|"

                                    if (!acc[key]) {
                                            acc[key] = [];
                                    }
                                    acc[key].push(obj1);

                                    key = "";
                                    origkeys = "";

                                    //LEG2

                                    var obj2 = JSON.parse(JSON.stringify(obj))
                                    for(var a = 0 ; a < property.length; a++)
                                    {
                                            origkeys += separator + (obj2[property[a]] || "");
                                            if(property[a] == "line_locationtext")
                                            {
                                                    obj2["orig_"+property[a]] = obj2["line_locationtext"];
                                                    obj2[property[a]] = obj2["custrecord_anc_lane_crossdockcity"];
                                            }
                                            key +=  separator + (obj2[property[a]] || "");
                                    }
                                    obj2["orig_custrecord_anc_lane_destinationcity"] = obj2["custrecord_anc_lane_destinationcity"];
                                    obj2["orig_line_location"] = obj2["line_location"];
                                    obj2.custpage_ifr_leg = "2";
                                    obj2.subtabname = obj2["line_uniquekey"];
                                    obj2.origkeys = origkeys;
                                    // key += "|"

                                    if (!acc[key]) {
                                            acc[key] = [];
                                    }
                                    acc[key].push(obj2);
                            }

                            return acc;
                    }, {});
            }

            function getLoadDetails(loadId)
            {
                    var getLoadDetails_result = {};
                    getLoadDetails_result.loadId = loadId;
                    try
                    {

                            getLoadDetails_result.taxId = 82;
                    }
                    catch(e)
                    {
                            log.error("ERROR in function getLoadDetails", e)
                    }

                    return getLoadDetails_result;
            }

            function prepLoad(loadID, otherDetails={}, updateShipment)
            {
                    var OVERRIDE_LOAD_FOR_TESTING = false;
                    var prepShipmentRecId = "";
                    var assumeLoadIsMissing = true;
                    var customerId = "";
                    var consigneeId = "";
                    // var customerId = FREIGHTINVOICE.DEFAULTCUSTOMER
                    // var consigneeId = FREIGHTINVOICE.DEFAULTCONSIGNEE
                    try
                    {
                            if(assumeLoadIsMissing)
                            {

                                    var searchObj = search.create({
                                            type : "customsale_anc_shipment",
                                            filters : [
                                                    ["custbody4", "is", loadID]
                                            ]
                                    });

                                    customerId = searchCustomer_id(otherDetails)
                                    consigneeId = searchConsignee_id(otherDetails)
                                    var searchResultCount = searchObj.runPaged().count;
                                    if(searchResultCount <= 0)
                                    {
                                            log.debug("no result for " + loadID, searchObj.filters)
                                    }
                                    else
                                    {
                                            searchObj.run().each(function(res){
                                                    prepShipmentRecId = res.id;
                                                    return false;
                                            })
                                            if(updateShipment)
                                            {


                                                    var shipmentRecObj = record.load({
                                                            type : "customsale_anc_shipment",
                                                            id : prepShipmentRecId
                                                    });
                                                    shipmentRecObj.setValue({
                                                            fieldId : "entity",
                                                            //         value: 106127,
                                                            // //Lee BHM Corp (Parent) : Arizona Daily Sun
                                                            // // WM5845	6477-WM5845_DUP_1
                                                            value: customerId,
                                                            // //Mittera Albertson's
                                                            //         value: 498581,
                                                            // //Midland Paper Company (Parent) : Midland PRH All Star Book
                                                            // value: 330177,
                                                            //Friesens Corporation - MB CAN
                                                    })

                                                    shipmentRecObj.setValue({
                                                            fieldId : "custbody_consignee",
                                                            //         value: 305730,
                                                            // // Lee BHM Corp (Parent) : Arizona Daily Sun // Arizona Daily Sun TEST Second Consignee
                                                            // //AZ US
                                                            value: consigneeId,
                                                            // //BC Coast 2000 Terminals Ltd.
                                                            // // Lulu Island	BC	CAN
                                                            //         //WM6040
                                                            //         value: 304127,
                                                            // // Friesens Corporation - MB CAN
                                                            // value: 302826,
                                                            //Active Warehouse 9	Mittera (Parent) : Mittera Kroger - AB CAN
                                                    })


                                                    shipmentRecObj.setValue({
                                                            fieldId : "custbody_anc_shipment_leg",
                                                            value: "2"
                                                    })
                                                    shipmentRecObj.setValue({
                                                            fieldId : "custbody4",
                                                            value: loadID
                                                    })
                                                    shipmentRecObj.setValue({
                                                            fieldId : "custbody_anc_equipment",
                                                            value: 1 //TRTAMDV53
                                                    })
                                                    /*
                                                    shipmentRecObj.setValue({
                                                            fieldId : "location",
                                                            value: 9 //ANS Paper (Summary) : ANC Whitecourt Warehouse
                                                    });*/

                                                    shipmentRecObj.setSublistValue({
                                                            sublistId : "item",
                                                            fieldId : "item",
                                                            line : 0,
                                                            value : FREIGHTINVOICE.TEMPORARY_ITEM,
                                                            //NPL79RO : D100cm/40in-W100cm/40in-BNLD
                                                            //Not Shipped
                                                    })
                                                    shipmentRecObj.setSublistValue({
                                                            sublistId : "item",
                                                            fieldId : "quantity",
                                                            line : 0,
                                                            value : 1
                                                            //NPL79RO : D100cm/40in-W100cm/40in-BNLD
                                                            //Not Shipped
                                                    })
                                                    // shipmentRecObj.setSublistValue({
                                                    //         sublistId : "item",
                                                    //         fieldId : "custcol_anc_relatedlineuniquekey",
                                                    //         line : 0,
                                                    //         value : 969350858
                                                    //         //NPL79RO : D100cm/40in-W100cm/40in-BNLD
                                                    //         //Not Shipped
                                                    // })
                                                    // shipmentRecObj.setSublistValue({
                                                    //         sublistId : "item",
                                                    //         fieldId : "custcol_anc_relatedtransaction",
                                                    //         line : 0,
                                                    //         value : 61243742
                                                    //         //Sales Order #SO62862
                                                    // });

                                                    shipmentRecObj.setValue({
                                                            fieldId : "tobeemailed",
                                                            value: false
                                                    })

                                                    prepShipmentRecId = shipmentRecObj.save({
                                                            ignoreMandatoryFields : true,
                                                            enableSourcing : true
                                                    })

                                                    log.debug("prepShipmentRecId", prepShipmentRecId);

                                                    return prepShipmentRecId;
                                            }
                                    }


                                    var shipmentRecObj = record.create({
                                            type : "customsale_anc_shipment",
                                    });
                                    shipmentRecObj.setValue({
                                            fieldId : "entity",
                                            //         value: 106127,
                                            // //Lee BHM Corp (Parent) : Arizona Daily Sun
                                            // // WM5845	6477-WM5845_DUP_1
                                            //         value: 492090,
                                            // //Mittera Albertson's
                                            //         value: 498581,
                                            // //Midland Paper Company (Parent) : Midland PRH All Star Book
                                            value: customerId,
                                            //Friesens Corporation - MB CAN
                                    })

                                    shipmentRecObj.setValue({
                                            fieldId : "custbody_consignee",
                                            //         value: 305730,
                                            // // Lee BHM Corp (Parent) : Arizona Daily Sun // Arizona Daily Sun TEST Second Consignee
                                            // //AZ US
                                            //         value: 300725,
                                            // //BC Coast 2000 Terminals Ltd.
                                            // // Lulu Island	BC	CAN
                                            //         //WM6040
                                            //         value: 304127,
                                            // // Friesens Corporation - MB CAN
                                            value: consigneeId,
                                            //Active Warehouse 9	Mittera (Parent) : Mittera Kroger - AB CAN
                                    })


                                    shipmentRecObj.setValue({
                                            fieldId : "custbody_anc_shipment_leg",
                                            value: "2"
                                    })
                                    shipmentRecObj.setValue({
                                            fieldId : "custbody4",
                                            value: loadID
                                    })
                                    shipmentRecObj.setValue({
                                            fieldId : "custbody_anc_equipment",
                                            value: 1 //TRTAMREF53
                                    })
                                    // shipmentRecObj.setValue({
                                    //         fieldId : "location",
                                    //         value: 9 //ANS Paper (Summary) : ANC Whitecourt Warehouse
                                    // });

                                    shipmentRecObj.setSublistValue({
                                            sublistId : "item",
                                            fieldId : "item",
                                            line : 0,
                                            value : FREIGHTINVOICE.TEMPORARY_ITEM,
                                            //NPL79RO : D100cm/40in-W100cm/40in-BNLD
                                            //Not Shipped
                                    })
                                    shipmentRecObj.setSublistValue({
                                            sublistId : "item",
                                            fieldId : "quantity",
                                            line : 0,
                                            value : 1
                                            //NPL79RO : D100cm/40in-W100cm/40in-BNLD
                                            //Not Shipped
                                    })
                                    // shipmentRecObj.setSublistValue({
                                    //         sublistId : "item",
                                    //         fieldId : "custcol_anc_relatedlineuniquekey",
                                    //         line : 0,
                                    //         value : 969350858
                                    //         //NPL79RO : D100cm/40in-W100cm/40in-BNLD
                                    //         //Not Shipped
                                    // })
                                    // shipmentRecObj.setSublistValue({
                                    //         sublistId : "item",
                                    //         fieldId : "custcol_anc_relatedtransaction",
                                    //         line : 0,
                                    //         value : 61243742
                                    //         //Sales Order #SO62862
                                    // });

                                    shipmentRecObj.setValue({
                                            fieldId : "tobeemailed",
                                            value: false
                                    })

                                    prepShipmentRecId = shipmentRecObj.save({
                                            ignoreMandatoryFields : true,
                                            enableSourcing : true
                                    })

                                    log.debug("prepShipmentRecId", prepShipmentRecId);
                            }
                    }
                    catch(e)
                    {
                            log.error("ERROR in function prepLoad", e)
                    }
                    return prepShipmentRecId;
            }

            function searchCustomer_id(otherDetails)
            {
                    var customerId = otherDetails.customerId || FREIGHTINVOICE.DEFAULTCUSTOMER
                    var consigneeId = otherDetails.consigneeId || FREIGHTINVOICE.DEFAULTCONSIGNEE
                    try
                    {
                            if(otherDetails.customerId)
                            {
                                    var customerSearchObj = search.create({
                                            type: "customer",
                                            filters:
                                                [
                                                        ["externalidstring","contains",`WM${otherDetails.customerId}`]
                                                ],
                                            columns:
                                                [
                                                        search.createColumn({name: "entityid", label: "Name"}),
                                                        search.createColumn({name: "internalid", label: "Internal ID"}),
                                                        search.createColumn({name: "externalid", label: "External ID"})
                                                ]
                                    });
                                    var searchResultCount = customerSearchObj.runPaged().count;
                                    log.debug("customerSearchObj result count",searchResultCount);
                                    customerId = FREIGHTINVOICE.DEFAULTCUSTOMER;
                                    customerSearchObj.run().each(function(result){
                                            // .run().each has a limit of 4,000 results
                                            customerId = result.id;
                                            return false;
                                    });

                            }
                    }
                    catch(e)
                    {
                            log.error("ERROR in function searchCustomer_id", e)
                    }

                    return customerId;
            }
            function searchConsignee_id(otherDetails)
            {
                    var customerId = otherDetails.customerId || FREIGHTINVOICE.DEFAULTCUSTOMER
                    var consigneeId = otherDetails.consigneeId || FREIGHTINVOICE.DEFAULTCONSIGNEE
                    try
                    {
                            if(otherDetails.consigneeId && otherDetails.customerId)
                            {
                                    var customrecord_alberta_ns_consignee_recordSearchObj = search.create({
                                            type: "customrecord_alberta_ns_consignee_record",
                                            filters:
                                                [
                                                        ["externalidstring","is",`${otherDetails.consigneeId}-WM${otherDetails.customerId}`]
                                                ],
                                            columns:
                                                [
                                                        search.createColumn({name: "name", label: "Name"}),
                                                ]
                                    });
                                    var searchResultCount = customrecord_alberta_ns_consignee_recordSearchObj.runPaged().count;
                                    log.debug("customrecord_alberta_ns_consignee_recordSearchObj result count",searchResultCount);
                                    consigneeId = FREIGHTINVOICE.DEFAULTCONSIGNEE;
                                    customrecord_alberta_ns_consignee_recordSearchObj.run().each(function(result){
                                            // .run().each has a limit of 4,000 results
                                            consigneeId = result.id;
                                            return false;
                                    });
                            }
                    }
                    catch(e)
                    {
                            log.error("ERROR in function searchConsignee_id", e)
                    }
                    return consigneeId;
            }


            const CA_TAXCODE_MAPPING_BY_STATE_CODE = {
                    AB : 11,
                    BC : 92,
                    MB : 38,
                    NB : 42,
                    NL : 45,
                    NONTAXABLE : 82,
                    NS : 63,
                    NT : 69,
                    NU : 51,
                    ON : 54,
                    NONTAXABLE : 82,
                    PEI : 60,
                    QC : 57,
                    SK : 20,
                    YT : 66,
                    // NU : 51,
                    // ON : 54,
                    // NT : 69,
                    // NU : 51,
                    // ON : 54,
            }

            function querySoPastLdc(obj)
            {
                    var sql = `SELECT
                    BUILTIN_RESULT.TYPE_STRING("TRANSACTION".transactionnumber) AS transactionnumber /*{transactionnumber#RAW}*/,
                    BUILTIN_RESULT.TYPE_STRING("TRANSACTION".ID) AS transactioninternalid /*{transactionnumber#RAW}*/,
                BUILTIN_RESULT.TYPE_STRING("TRANSACTION".tranid) AS tranid /*{tranid#RAW}*/,
                    transactionLine.linesequencenumber as transactionlinenum,
                BUILTIN_RESULT.TYPE_FLOAT(transactionLine.quantitybackordered) AS quantitybackordered /*{transactionlines.quantitybackordered#RAW}*/,
                BUILTIN_RESULT.TYPE_FLOAT(transactionLine.quantity) AS quantity /*{transactionlines.quantity#RAW}*/,
                transactionLine.custcol_anc_ldcdate AS ldcdate, 
                (CASE WHEN TRUNC(CURRENT_DATE) - TRUNC(transactionLine.custcol_anc_ldcdate) > 1 THEN 1 ELSE 1 END) as ldcdayspast
                    FROM
                    "TRANSACTION",
                        transactionLine
                    WHERE
                    "TRANSACTION"."ID" = transactionLine."TRANSACTION" 
                      
                      AND NVL(transactionLine.taxline, 'F') = 'F'

                      AND (CASE WHEN TRUNC(CURRENT_DATE) - TRUNC(transactionLine.custcol_anc_ldcdate) ${obj.dayspassedoper || "="} ${obj.dayspassed || 1} THEN 1 ELSE 1 END = 1)
                      
                      AND transactionLine.quantity IS NOT NULL

                    `

                    sql += buildTranIdFilter(obj).filterStr;

                    // sql+= `
                    // AND (("TRANSACTION"."ID" = 61250543 AND transactionLine.quantity IS NOT NULL))`

                    log.debug("querySoPastLdc querySoPastLdc sql", sql)
                    const sqlResults = query.runSuiteQL({ query: sql }).asMappedResults();

                    log.debug("querySoPastLdc sqlResults", sqlResults);
                    return sqlResults
            }

            var syncLinesPastLdcUrl = "https://loadfitting.anchub.ca/loadfitting/generateshipments"

            function syncLinesPastLdc(obj)
            {
                    var syncLinesPastLdc_result = {};
                    syncLinesPastLdc_result.by_transactioninternalid = [];
                    syncLinesPastLdc_result.responseList = [];
                    var groupedByInternalId = groupBy(obj, "transactioninternalid");

                    for(var tranInternalId in groupedByInternalId)
                    {
                            log.debug("groupedByInternalId", groupedByInternalId);

                            var requestData = preparePastLdcSyncData(groupedByInternalId[tranInternalId])

                            var rawResp = callPastLdcUrl(requestData)

                            syncLinesPastLdc_result[tranInternalId] = (rawResp);
                            syncLinesPastLdc_result.responseList.push(rawResp);
                    }

                    log.debug("syncLinesPastLdc", syncLinesPastLdc)

                    return syncLinesPastLdc_result;
            }

            function preparePastLdcSyncData(obj)
            {

            }

            function updateLinesPastLdc(recObj, obj)
            {
                    var updateLinesPastLdc = {};

                    var orderedByLineId = obj.sort(function(a, b){
                            return (a.transactionlinenum || 0) - (b.transactionlinenum)
                    });

                    // var lineCount = recObj.getLineCount({
                    //     sublistId : "item"
                    // });
                    // for(var a = 0 ; a < lineCount; a++)
                    // {
                    //
                    // }
                    for(var a = 0 ; a < orderedByLineId.length ; a++)
                    {
                            recObj.setSublistValue({
                                    sublistId : "item",
                                    fieldId : references.SO_COLUMNS.LINESTATUS.id,
                                    line : orderedByLineId[a].transactionlinenum - 1,
                                    value : references.SO_COLUMNS.LINESTATUS.options.REQUIRED.VAL || 3
                            })
                    }

                    updateLinesPastLdc.orderedByLineId = orderedByLineId;
                    log.debug("updateLinesPastLdc", updateLinesPastLdc)
                    return updateLinesPastLdc;
            }


            function callPastLdcUrl(requestData)
            {
                    var callPastLdcUrl_response = "";

                    requestData = JSON.stringify(requestData);

                    callPastLdcUrl_response = https.post({
                            url: syncLinesPastLdcUrl,
                            body: requestData,
                            headers: {
                                    "Authorization": "Bearer 67afba48c5e94f0689dc4f9cb18afed2",
                                    "Content-Type": "application/json",
                                    "accept": "*/*"
                            }
                    });

                    log.debug("callPastLdcUrl callPastLdcUrl_response", callPastLdcUrl_response);
                    return callPastLdcUrl_response;
            }

            function buildTranIdFilter(obj)
            {
                    var functionOutput = {};
                    var filterStr = "";
                    try
                    {

                            var filterList = [];
                            if(obj.traninternalids)
                            {
                                    filterList.push("AND");
                                    filterStr += "AND "
                                    filterStr += " " + obj.filterbyfield;
                                    filterStr += " " + obj.sqlOperator;
                                    filterStr += " " + as_IN_SQL_FILTER(obj.traninternalids).listStringCsv
                            }
                    }
                    catch(e)
                    {
                            log.error("ERROR in function buildTranIdFilter", e)
                    }

                    functionOutput.filterStr = filterStr;
                    functionOutput.filterList = filterList;
                    log.debug("buildTranIdFilter functionOutput.filterStr", functionOutput.filterStr)
                    return functionOutput
            }

            function as_IN_SQL_FILTER(list)
            {
                    var functionOutput = {};
                    try
                    {
                            if(list && list.length > 0)
                            {
                                    var listStringList = list.map(function(elem){

                                            return `${elem}`
                                    });
                                    log.error("listStringList", listStringList)
                                    functionOutput.listStringCsv = `(${listStringList.join(",")})`

                                    log.debug("functionOutput.listStringCsv", functionOutput.listStringCsv)
                            }
                    }
                    catch(e)
                    {
                            log.error("ERROR in function as_IN_SQL_FILTER", e)
                    }

                    log.debug("as_IN_SQL_FILTER functionOutput", functionOutput)
                    return functionOutput;
            }

            function soPastLdc(obj)
            {
                    var functionOutput = {};
                    try
                    {
                        if(obj.recObj)
                        {
                                var linesDetails = getLinesDetails(obj);
                        }
                    }
                    catch(e)
                    {
                            log.error("ERROR in function soPastLdc", e)
                    }

                    return functionOutput;
            }

            function getLinesDetails(obj)
            {
                    var functionOutput = {};
                    try
                    {
                        var lineCount = obj.recObj.getLineCount({
                                sublistId : "item"
                        })

                            for(var a = 0 ; a < lineCount ; a++)
                            {
                                    var line_
                                    var lineDetail = getLineDetails()
                            }
                    }
                    catch(e)
                    {
                            log.error("ERROR in function getLinesDetails", e)
                    }

                    return functionOutput;
            }

            function getLineDetails(obj)
            {
                    var functionOutput = {};
                    try
                    {

                    }
                    catch(e)
                    {
                            log.error("ERROR in function getLineDetils", e)
                    }

                    return functionOutput;
            }

            function getShipmentLocs()
            {
                    var sqlResults = [];
                    try
                    {
                            var sql = `
                                    SELECT
                                            BUILTIN_RESULT.TYPE_STRING(LOCATION.name) AS name,
                                            BUILTIN_RESULT.TYPE_INTEGER(LOCATION.ID) AS ID,
                                            BUILTIN_RESULT.TYPE_STRING(LocationMainAddress.city) AS city,
                                            BUILTIN_RESULT.TYPE_STRING(LOCATION.fullname) AS fullname
                                    FROM
                                            LOCATION,
                                            LocationMainAddress
                                    WHERE
                                            LOCATION.mainaddress = LocationMainAddress.nkey(+)
                                      AND ((LocationMainAddress.city IS NOT NULL AND NVL(LOCATION.isinactive, 'F') = 'F' AND LOCATION.makeinventoryavailable = 'T'))
                            `

                            log.debug("getShipmentLocs sql", sql)

                            sqlResults = query.runSuiteQL({ query: sql }).asMappedResults();

                            log.debug("getShipmentLocs sqlResults", sqlResults);
                    }
                    catch(e)
                    {
                            log.error("ERROR in function getShipmentLocs", e);
                    }

                    return sqlResults;
            }

            function getRelatedProdCap(recId, targetDates)
            {
                    var sqlResults = [];
                    var filterArray = [];
                    var filterText = "";
                    try
                    {
                            filterArray = prodCapDatesAsFilterArray(targetDates);
                            log.debug("getRelatedProdCap filterArray", filterArray);
                            filterText = prodCapDatesAsFilterText(filterArray);
                            var sql = `
                                    SELECT
                                            BUILTIN_RESULT.TYPE_STRING(CUSTOMRECORD_ANC_PRODUCTION_CAPACITY.name) AS name,
                                            (CUSTOMRECORD_ANC_PRODUCTION_CAPACITY.id) AS id,
                                            (CUSTOMRECORD_ANC_PRODUCTION_CAPACITY.custrecord_prodfcw_daterangestart) AS weekstartdate,
                                            (CUSTOMRECORD_ANC_PRODUCTION_CAPACITY.custrecord_prodfcw_daterangeend) AS weekenddate,
                                            (CUSTOMRECORD_ANC_PRODUCTION_CAPACITY.custrecord_prodfcw_capacity) AS weekcapacity,
                                            (CUSTOMRECORD_ANC_PRODUCTION_CAPACITY.custrecord_prodfcw_weeknumber) AS weeknumber
                                    FROM
                                            CUSTOMRECORD_ANC_PRODUCTION_CAPACITY
                                    WHERE
                                            (
                                            ${filterText}
                                            )
                            `

                            log.debug("getRelatedProdCap sql", sql)

                            sqlResults = query.runSuiteQL({ query: sql }).asMappedResults();

                            log.debug("getRelatedProdCap sqlResults", sqlResults);
                    }
                    catch(e)
                    {
                            log.error("ERROR in function getRelatedProdCap", e);
                    }

                    return sqlResults;
            }

            function prodCapDatesAsFilterArray(targetDates)
            {
                    var filterArray = [];
                    for(var a = 0 ; a < targetDates.length ; a++)
                    {
                            //'2025-06-01'
                            filterArray.push(`(DATE '${targetDates[a].productiondate}' BETWEEN CUSTOMRECORD_ANC_PRODUCTION_CAPACITY.custrecord_prodfcw_daterangestart AND CUSTOMRECORD_ANC_PRODUCTION_CAPACITY.custrecord_prodfcw_daterangeend)`)
                    }

                    return filterArray;
            }
            function prodCapDatesAsFilterText(filterArray)
            {
                    var filterText = "";
                    filterText = filterArray.join(" OR ")
                    return filterText;
            }
            function addLeadingZeroToMonths(monthText)
            {
                    if(typeof monthText == "number")
                    {
                            if(monthText < 10)
                            {
                                    return "0" + monthText;
                            }
                            else
                            {
                                    return monthText
                            }
                    }
                    else
                    {
                            if(Number(monthText) < 10)
                            {
                                    return "0" + monthText;
                            }
                            else
                            {
                                    return monthText
                            }
                    }

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
                            console.log("ERROR in function toMDY", e)
                    }
                    console.log("retVal", retVal)
                    return retVal;
            }

            function getEquipmentList(equipIds)
            {
                    var sqlResults = [];
                    try {
                            // var sqlFilters = getForecastFilters(tranInternalid, lineValList);
                            // var sqlFilters_text = forecastFilters.join(" OR ")
                            //
                            // log.debug("getRelatedForecasts sqlFilters_text", sqlFilters_text)

                            var sql =
                                `Select
                                 eq.id as eq_internalid,
                                 eq.custrecord_anc_equipmentweightcap as eq_weightcap,
                                 eq.custrecord_anc_transportmode as eq_transportmode
                                FROM
                                customrecord_anc_equipment as eq`


                            log.debug("getEquipmentList sql", sql)

                            sqlResults = query.runSuiteQL({ query: sql }).asMappedResults();

                            log.debug("getEquipmentList sqlResults", sqlResults);
                    }
                    catch(e)
                    {
                            log.error("ERROR in function getEquipmentList", e)
                    }

                    log.debug("getEquipmentList sqlResults return", sqlResults)
                    return sqlResults;
            }

            return {
                    toMDY,
                    groupBy,
                    groupByKeys,
                    getResults,
                    foo,
                    bar,
                    getRelatedForecasts,
                    references,
                    getForecastFilters,
                    yearMapping,
                    submitIntegrationLog,
                    MINIMIZE_UI,
                    FREIGHTINVOICE,
                    PTMX,
                    getFitmentResponse,
                    generateShipments,
                    groupOrderLinesForShipmentGeneration,
                    getFitmentObj,
                    getLoadDetails,
                    prepLoad,
                    CA_TAXCODE_MAPPING_BY_STATE_CODE,
                    querySoPastLdc,
                    syncLinesPastLdc,
                    callPastLdcUrl,
                    updateLinesPastLdc,
                    salesForecastJobFolderId,
                    getRelatedShipCap,
                    getShipmentLocs,
                    getRelatedProdCap,
                    addLeadingZeroToMonths,
                    getEquipmentList,
                    searchConsignee_id,
                    searchCustomer_id
            }

    });

// getFitmentResponse sample args
// [{"internalid":"61250543","status":"pendingFulfillment","entity":"106127","line_item":"188522","line_item_parent":"188519","line_quantity":"40","line_location":"9","line_locationtext":"Lulu Island","line_id":"1","line_sequencenumber":"1","line_uniquekey":"69348155","line_number":"","line_memo":"","line_reservedqty":"","line_reservedweight":"","line_deliverydate":"04/03/2025","line_shipdate":"03/09/2025","line_consignee":"198816","line_consigneetext":"The Arizona Republic","line_equipment":"5","line_equipmenttext":"TRTAMHTR53","line_rollsperpack":"1","line_transitoptmethod":"1","line_item_basis_weight":"673.1","line_item_rolldiameter":"1","line_item_rolldiametertext":"100","line_item_rollwidth":"1","line_item_rollwidthtext":"100","custrecord_anc_lane_cde":"5","custrecord_anc_lane_lce":"6","custrecord_anc_lane_ftte":"1","custrecord_anc_lane_originwarehousecity":"WHITECOURT","custrecord_anc_lane_destinationcity":"Deer Valley","custrecord_anc_lane_crossdockcity":"Lulu Island","custrecord_anc_crossdockeligible":true,"id":"61250543","orig_line_locationtext":"ANS Paper (Summary) : ANC Whitecourt Warehouse","orig_custrecord_anc_lane_destinationcity":"Deer Valley","orig_line_location":"9","custpage_ifr_leg":"2","subtabname":"69348155","origkeys":" > TRTAMHTR53 > 03/09/2025 > ANS Paper (Summary) : ANC Whitecourt Warehouse > Deer Valley"}]

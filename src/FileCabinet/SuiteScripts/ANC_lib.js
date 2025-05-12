/**
 * @NApiVersion 2.1
 */
define(['N/query'],
    
    (query) => {

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

        return {foo, bar, getRelatedForecasts, references, getForecastFilters, yearMapping}

    });

/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
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
        var yearRecObj = null;
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
            var respMsg = {requestBody};
            try
            {
                integrationLogId = ANC_lib.submitIntegrationLog(integrationLogId,{request:JSON.stringify(requestBody)});

                if(typeof requestBody == "object")
                {
                    var getWeekResults = {};

                    var yearRecId = "";
                    var yearSearch = search.create({
                        type : "customrecord_anc_pf_years",
                        filters : [
                            ["name", "is", `${requestBody.year}`]
                        ]
                    });
                    yearSearch.run().each(function(res){
                        yearRecId = res.id;
                        return false;
                    })

                    if(yearRecId)
                    {
                        yearRecObj = record.load({
                            type : "customrecord_anc_pf_years",
                            id : yearRecId
                        })
                    }
                    else
                    {
                        yearRecObj = record.create({
                            type : "customrecord_anc_pf_years",
                        })

                        yearRecObj.setValue({
                            fieldId : "name",
                            value : requestBody.year
                        })
                    }

                    if(Array.isArray(requestBody.months))
                    {
                        for(var a = 0 ; a < 12 ; a++)
                        {
                            fillProdMonthSublist(a, requestBody);
                        }

                        var submittedYearRecObj = yearRecObj.save();
                        log.debug("submittedYearRecObj multimonth", submittedYearRecObj)
                        getWeekResults = getWeeks(requestBody.year, requestBody.months[0].monthNumber, false)

                        log.debug("getWeekResults", getWeekResults)
                    }
                    else
                    {
                        for(var a = 1 ; a <= 12 ; a++)
                        {
                            fillProdMonthSublist(a, [requestBody]);
                        }

                        var submittedYearRecObj = yearRecObj.save();
                        log.debug("submittedYearRecObj single month", submittedYearRecObj)

                        getWeekResults = getWeeks(requestBody.year, requestBody.months, false)
                        log.debug("getWeekResults", getWeekResults)
                    }
                }
                log.debug("requestBody", requestBody);

            }
            catch(e)
            {
                log.error("ERROR in function post", e)
                respMsg={success:false, message: "ERROR caught: " + JSON.stringify(e), requestBody};
            }

            respMsg.integrationLogId = integrationLogId;
            var respMsgStr = JSON.stringify(respMsg);

            integrationLogId = ANC_lib.submitIntegrationLog(integrationLogId,{response:respMsgStr});
            log.debug(integrationLogId, integrationLogId)
            return respMsgStr
        }

        function fillProdMonthSublist(a, requestBody)
        {
            for(var b = 0 ; b < requestBody.months.length ; b++)
            {
                var monthNumber = requestBody.months[b].monthNumber;
                log.debug("monthNumber", monthNumber);
                var newLineMonthId = (a+1);

                if(newLineMonthId == monthNumber)
                {
                    var monthWithLeadingZero = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;
                    yearRecObj.setSublistValue({
                        sublistId : "recmachcustrecord_prodfc_year",
                        fieldId : "custrecord_prodfc_month",
                        line : a,
                        value : monthNumber
                    })
                    yearRecObj.setSublistValue({
                        sublistId : "recmachcustrecord_prodfc_year",
                        fieldId : "custrecord_prodfc_plannedprodpmcap",
                        line : a,
                        value :requestBody.months[b].quantity
                    })
                    yearRecObj.setSublistValue({
                        sublistId : "recmachcustrecord_prodfc_year",
                        fieldId : "name",
                        line : a,
                        value : monthWithLeadingZero + "|" + requestBody.year
                    })

                }
                else
                {
                    var monthWithLeadingZero = newLineMonthId < 10 ? `0${newLineMonthId}` : `${newLineMonthId}`;

                    yearRecObj.setSublistValue({
                        sublistId : "recmachcustrecord_prodfc_year",
                        fieldId : "custrecord_prodfc_month",
                        line : a,
                        value : a+1
                    })
                    // yearRecObj.setSublistValue({
                    //     sublistId : "recmachcustrecord_prodfc_year",
                    //     fieldId : "custrecord_prodfc_plannedprodpmcap",
                    //     line : a,
                    //     value :requestBody.months[b].quantity
                    // })
                    yearRecObj.setSublistValue({
                        sublistId : "recmachcustrecord_prodfc_year",
                        fieldId : "name",
                        line : a,
                        value : monthWithLeadingZero + "|" + requestBody.year
                    })
                }
            }
        }


        function getWeeks(year, month, trimOverflow = false) {

            log.debug("getWeeks {year,month}", {year,month})

            const weeks = [];
            let weekNumber = 1;

            const jsMonth = month - 1;
            const firstDayOfMonth = new Date(year, jsMonth, 1);
            const lastDayOfMonth = new Date(year, month, 0);

            // Find first Monday on or after the first of the month
            let current = new Date(firstDayOfMonth);
            while (current.getDay() !== 1) {
                current.setDate(current.getDate() + 1); // advance to Monday
            }

            while (weeks.length < 4 && current <= lastDayOfMonth) {
                const weekStart = new Date(current);
                const weekEnd = new Date(current);
                weekEnd.setDate(weekStart.getDate() + 6);

                if (trimOverflow) {
                    if (
                        weekStart.getMonth() === jsMonth &&
                        weekEnd.getMonth() === jsMonth
                    ) {
                        weeks.push({
                            week: weekNumber++,
                            start: formatDate(weekStart),
                            end: formatDate(weekEnd),
                        });
                    }
                } else {
                    if (weekStart.getMonth() === jsMonth) {
                        weeks.push({
                            week: weekNumber++,
                            start: formatDate(weekStart),
                            end: formatDate(weekEnd),
                        });
                    }
                }

                current.setDate(current.getDate() + 7); // move to next Monday
            }

            return weeks;
        }

        function formatDate(date) {
            return date.toISOString().split('T')[0];
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

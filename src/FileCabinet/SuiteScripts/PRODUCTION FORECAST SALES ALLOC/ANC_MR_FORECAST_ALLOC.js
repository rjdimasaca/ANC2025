/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/query', 'N/record', 'N/runtime', 'N/file'],
    /**
     * @param{query} query
     * @param{record} record
     * @param{runtime} runtime
     */
    (query, record, runtime, file) => {
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

        var yearText ="";
        const getInputData = (inputContext) => {

            var currScript = runtime.getCurrentScript();
            var fileId = currScript.getParameter({
                name : "custscript_anc_salesforecastdata"
            }) || 9203794
            log.debug("fileId", fileId);
            yearText = currScript.getParameter({
                name : "custscript_anc_salesforecasttyear"
            }) || 6;
            log.debug("fileId", fileId);
            log.debug("yearText", yearText);

            var fileObj = file.load({
                id : 9203794
            })

            var data = JSON.parse(fileObj.getContents())
            log.debug("getInputData", data)

            return data[yearText].byKeys;

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

        const map = (mapContext) => {



            try
            {


                log.debug("map mapContext", mapContext)
                log.debug("map mapContext.value", mapContext.value)


                var currScript = runtime.getCurrentScript();
                yearText = currScript.getParameter({
                    name : "custscript_anc_salesforecasttyear"
                }) || 2025;

                log.debug("map yearText", yearText)



                log.debug("yearText", yearText)
                var yearSql = `SELECT id, name FROM customrecord_anc_pf_years`;

                if(yearText)
                {
                    yearSql += ` WHERE name = '${yearText}'`;
                }

                log.debug("yearSql", yearSql);

                const years = query.runSuiteQL({ query: yearSql }).asMappedResults();

                var yearRecObj = "";
                if(years.length < 1)
                {
                    yearRecObj = record.create({
                        type : "customrecord_anc_pf_years"
                    });
                    yearRecObj.setValue({
                        fieldId : "name",
                        value : yearText
                    })
                }
                else
                {
                    yearRecObj = record.load({
                        type : "customrecord_anc_pf_years",
                        id : years[0].id
                    });
                }







                var newLineIndex = yearRecObj.getLineCount({
                    sublistId : "recmachcustrecord_anc_pf_year",
                })
                for(var compositeKeys in groupedByYear[yearId].byKeys)
                {
                    var targetIndex = yearRecObj.findSublistLineWithValue({
                        sublistId : "recmachcustrecord_anc_pf_year",
                        fieldId : "custrecord_anc_pf_compositekey",
                        value : compositeKeys
                    });

                    if(targetIndex > -1)
                    {
                        yearRecObj.setSublistValue({
                            sublistId : "recmachcustrecord_anc_pf_year",
                            fieldId : "custrecord_anc_pf_allocation",
                            line : targetIndex,
                            value : groupedByYear[yearId].byKeys[compositeKeys].qty
                        })
                    }
                    else
                    {
                        // log.debug("it does not exist yet? then add it then!")

                        yearRecObj.setSublistValue({
                            sublistId : "recmachcustrecord_anc_pf_year",
                            fieldId : "custrecord_anc_pf_month",
                            line : newLineIndex,
                            value : groupedByYear[yearId].byKeys[compositeKeys].colVals.monthInternalId
                        })
                        yearRecObj.setSublistValue({
                            sublistId : "recmachcustrecord_anc_pf_year",
                            fieldId : "custrecord_anc_pf_customer",
                            line : newLineIndex,
                            value : groupedByYear[yearId].byKeys[compositeKeys].colVals.customerInternalId
                        })
                        yearRecObj.setSublistValue({
                            sublistId : "recmachcustrecord_anc_pf_year",
                            fieldId : "custrecord_anc_pf_consignee",
                            line : newLineIndex,
                            value : groupedByYear[yearId].byKeys[compositeKeys].colVals.consigneeInternalId
                        })
                        yearRecObj.setSublistValue({
                            sublistId : "recmachcustrecord_anc_pf_year",
                            fieldId : "custrecord_anc_pf_grade",
                            line : newLineIndex,
                            value : groupedByYear[yearId].byKeys[compositeKeys].colVals.gradeInternalId
                        })
                        yearRecObj.setSublistValue({
                            sublistId : "recmachcustrecord_anc_pf_year",
                            fieldId : "custrecord_anc_pf_allocation",
                            line : newLineIndex,
                            value : groupedByYear[yearId].byKeys[compositeKeys].colVals.qty
                        })
                        yearRecObj.setSublistValue({
                            sublistId : "recmachcustrecord_anc_pf_year",
                            fieldId : "custrecord_anc_pf_compositekey",
                            line : newLineIndex,
                            value : compositeKeys
                        })
                        newLineIndex++;
                    }
                }

                var submittedYearRecId = yearRecObj.save({
                    ignoreMandatoryFields : true,
                    enableSourcing : true
                });

                log.debug("submittedYearRecId", submittedYearRecId);


                var endTimeStamp = new Date().getTime();
                log.debug("{startTimeStamp,endTimeStamp}", {startTimeStamp,endTimeStamp})

                log.debug("attemptsave year")

                var yearRecInternalId = yearRecObj.save({
                    ignoreMandatoryFields : true,
                    enableSoucrcing : true
                });
                log.debug("yearRecInternalId", yearRecInternalId);
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

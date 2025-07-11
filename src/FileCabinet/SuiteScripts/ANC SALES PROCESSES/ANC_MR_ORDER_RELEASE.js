/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['/SuiteScripts/ANC_lib.js', 'N/file', 'N/format', 'N/https', 'N/email', 'N/query', 'N/record', 'N/runtime', 'N/search', 'N/url'],
    /**
 * @param{file} file
 * @param{format} format
 * @param{https} https
 * @param{query} query
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 * @param{url} url
 */
    (ANC_lib, file, format, https, email, query, record, runtime, search, url) => {
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
            try
            {
                var pastLdcLinesSqlResults = ANC_lib.querySoPastLdc({traninternalids:[61265756], sqlOperator:"IN", filterbyfield :"TRANSACTION.ID", dayspassedoper : ">", dayspassed : 0})

                return pastLdcLinesSqlResults;
            }
            catch(e)
            {

            }
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
            log.debug("mapContext", mapContext);

            var value = mapContext.value;
            if((typeof value).toLowerCase() != 'object')
            {
                value = JSON.parse(value);
            }

            log.debug("mapContext value", value);
            var traninternalid = value.traninternalid;
            log.debug("mapContext traninternalid", traninternalid);

            mapContext.write({
                key : traninternalid,
                value : value
            })
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
        const reduce = (reduceContext) =>
        {
            try
            {
                log.debug("reduce reduceContext", reduceContext);

                var tranInternalid = reduceContext.key;
                log.debug("reduce tranInternalid", tranInternalid);

                if((typeof reduceContext).toLowerCase() != 'object')
                {
                    reduceContext = JSON.parse(reduceContext);
                }

                var values = reduceContext.values;
                if(!reduceContext.value && (typeof values).toLowerCase() != 'object')
                {
                    values = JSON.parse(values);
                }
                else {
                    values
                }
                log.debug("reduce values", values);
                var values = values.map(function(elem){
                    if((typeof elem).toLowerCase() != 'object')
                    {
                        elem = JSON.parse(elem);
                    }
                    return elem;
                })
                // values = JSON.parse(values);
                log.debug("reduce values after parse", values);
                var pastLdcLinesSqlResults = values;

                var groupedByInternalId = ANC_lib.groupBy(pastLdcLinesSqlResults, "traninternalid");
                var syncLinesPastLdcSyncResults_json = ANC_lib.prepareOrderPayload(groupedByInternalId);

                var syncLinesPastLdcSyncResults = ANC_lib.syncLinesPastLdc(syncLinesPastLdcSyncResults_json)

                log.debug("syncLinesPastLdcSyncResults_json.OrderHeader", syncLinesPastLdcSyncResults_json.OrderHeader)
                log.debug("syncLinesPastLdcSyncResults_json.lineItems[0]", syncLinesPastLdcSyncResults_json.lineItems[0])
                log.debug("syncLinesPastLdcSyncResults_json.lineItems[1]", syncLinesPastLdcSyncResults_json.lineItems[1])

                log.debug("syncLinesPastLdcSyncResults", syncLinesPastLdcSyncResults);
                // var updateLinesPastLdcResults = ANC_lib.updateLinesPastLdc(recObj, pastLdcLinesSqlResults);




            }
            catch(e)
            {
                log.error("ERROR in function reduce", e)
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

        return {getInputData, map, reduce, summarize}

    });

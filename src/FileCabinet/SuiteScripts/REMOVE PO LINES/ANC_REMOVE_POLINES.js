/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search) => {
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

        const getInputData = (inputContext) => {

            var transactionSearchObj = search.create({
                type: "transaction",
                settings:[{"name":"consolidationtype","value":"ACCTTYPE"}],
                filters:
                    [
                        // ["formulanumeric: CASE WHEN {lineuniquekey} IN ('71547883','71531382','71545893','71545894','71545896','71551163','71553489','71553490','71553491','71551721','71551722','71551723','71551724','71551725','71551726','71551727','71551728','71551729','71550509','71550510','71530469','71531369','71531370','71531371','71531372','71531373','71531374','71531375','71531376','71531377','71531512','71582732','71650095','71610777','71584165','71650318','71589925','71590481','71590482','71590483','71590484','71581979','71583363','71583298','71583299','71611646','71648431','71648432','71611441','71611819','71611820','71616065','71628839','71628840','71628841','71580345','71590457','71590458','71590542','71634199','71634200','71634201','71592524','71592525','71592526','71592527','71592528','71592529','71592530','71592531','71592532','71581419','71581420','71651599','71651600','71581287','71581288','71583375','71583376','71583377','71583378','71644978','71644979','71644980','71644981','71644982','71644983','71644984','71644985','71644986','71584719','71583480','71583487','71574665','71574666','71644890','71644891','71583367','71583368','71583369','71591256','71591994','71575665','71575666','71590557','71657491','71657492','71657493','71657494','71657495','71589571','71589572','71589573','71590512','71616219','71616220','71616221','71616222','71616223','71616224','71616225','71616226','71572620','71572621','71635493','71635494','71635495','71635496','71635497','71635498','71635499','71635500','71635501','71576807','71576806','71657722','71657723','71657724','71657725','71657726','71657727','71657728','71657729','71657730','71611525','71618018','71618019','71618020','71618021','71618022','71618023','71618024','71618025','71574476','71574477','71574478','71618210','71635460','71635461','71635462','71635463','71635464','71657782','71580421','71636694','71572649','71572650','71572651','71634254','71634255','71634256','71634257','71634258','71634259','71572589','71572590','71592022','71592223','71592224','71592225','71592226','71592227','71592228','71592229','71590511','71590297','71590298','71590299','71590300','71636713','71628811','71628812','71628813','71628814','71654762','71580414','71580415','71655045','71634645','71634646','71616790','71617809','71590182','71590183','71590184','71590185','71607247','71607248','71591594','71591595','71591596','71591597','71591598','71591599','71591600','71611418','71611419','71611420','71611421','71611422','71611423','71611424','71611425','71611426','71574892','71574893','71574894','71574895','71632169','71632172','71632173','71632174','71591964','71591965','71591966','71591967','71591968','71591969','71645037','71645038','71645041') THEN 1 ELSE 0 END","equalto","1"]
                        // ["formulanumeric: CASE WHEN {lineuniquekey} IN ('71657782') THEN 1 ELSE 0 END","equalto","1"]
                        // ["formulanumeric: CASE WHEN {lineuniquekey} IN ('71657782', '71590481', '71590482') THEN 1 ELSE 0 END","equalto","1"]
                        ["formulanumeric: CASE WHEN {lineuniquekey} IN ('71657782') THEN 1 ELSE 0 END","equalto","1"]
                    ],
                columns:
                    [
                        search.createColumn({name: "internalid", label: "Internal ID"}),
                        search.createColumn({name: "tranid", label: "Document Number"}),
                        search.createColumn({name: "lineuniquekey", label: "Line Unique Key", sort:search.Sort.DESC})
                    ]
            });

            return transactionSearchObj;

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
                log.debug("mapContext", mapContext);
                log.debug("mapContext.value", mapContext.value);
                var value = JSON.parse(mapContext.value);
                log.debug("MAP value.values.lineuniquekey", value.values.lineuniquekey);
                // log.debug("mapContext.value.values.lineuniquekey", mapContext.value.values.lineuniquekey);

                mapContext.write({
                    key : mapContext.key,
                    value : value.values.lineuniquekey
                })
            }
            catch(e)
            {
                log.error("ERROR in function mapContext", e)
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
            try
            {
                log.debug("reduceContext", reduceContext);
                log.debug("reduceContext.values", reduceContext.values);
                var values = reduceContext.values;

                values = values.sort(function(a,b){
                    return b-a
                })

                log.debug("REDUCE values.length", values.length)

                var poRecObj = record.load({
                    type : "purchaseorder",
                    id : reduceContext.key
                });

                var lineIndexes = [];
                var uniqueLineIds = [];
                var indexAndUniqueLineIds = [];
                for(var a = 0 ; a < values.length ; a++)
                {
                    var lineIndex = poRecObj.findSublistLineWithValue({
                        sublistId : "item",
                        fieldId : "lineuniquekey",
                        value : values[a]
                    });
                    if(lineIndex != -1)
                    {
                        log.debug("remove this line", lineIndex);

                        poRecObj.removeLine({
                            sublistId : "item",
                            line : lineIndex
                        })

                        lineIndexes.push(lineIndex)
                        uniqueLineIds.push(values[a])
                        indexAndUniqueLineIds.push({
                            u : values[a],
                            i : lineIndex
                        })
                    }
                }

                var submittedPoRecId = "trial mode"
                var submittedPoRecId = poRecObj.save({
                    ignoreMandatoryFields : true,
                    enableSourcing : true
                })

                log.debug("submittedPoRecId " + submittedPoRecId, {submittedPoRecId, lineIndexes, uniqueLineIds})
                //remove sublists
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

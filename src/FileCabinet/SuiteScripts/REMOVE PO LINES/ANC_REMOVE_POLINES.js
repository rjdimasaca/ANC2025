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
                        ["formulanumeric: CASE WHEN {lineuniquekey} IN ('71531458','71553502','71553503','71537703','71543096','71547757','71545881','71547877','71551619','71551975','71546736','71546737','71546738','71547955','71552148','71550498','71550499','71551169','71531503','71531524','71530473','71530482','71530523','71530524','71531467','71531468','71531469','71531470','71531471','71531472','71531473','71531474','71531475','71634078','71591934','71591935','71591936','71591932','71591933','71583153','71624208','71624209','71580863','71583837','71610702','71651676','71651677','71651678','71655198','71659588','71659589','71659590','71659591','71659592','71659593','71659594','71659595','71659596','71662875','71580332','71591910','71648163','71623402','71644889','71634291','71659705','71659706','71659707','71576623','71576624','71576629','71576625','71576626','71576627','71576628','71590532','71590533','71590534','71590535','71590536','71590537','71590538','71610535','71583579','71655700','71655598','71655599','71655600','71655601','71655602','71630203','71582077','71632107','71632108','71584819','71645036','71592007','71579476','71579477','71579478','71579479','71579480','71638290','71638291','71638292','71638293','71618539','71648924','71648925','71560298','71560299','71560300','71589565','71654752','71583481','71656848','71657052','71657518','71623153','71623154','71623155','71658635','71618009','71657752','71657753','71657890','71634210','71634211','71659557','71659128','71659129','71659130','71659131','71584152','71607230','71607231','71607232','71607233','71580049','71635627','71635625','71635626','71659163','71659164','71659165','71572223','71584156','71637791','71610367','71648405','71648406','71634068','71581430','71563158','71572267','71609372','71592011','71650091','71588296','71580761','71572222','71588133','71588280','71588281','71572670','71566012','71575795','71575796','71579010','71579011','71558389','71583271','71588033','71654756','71654757','71654758','71655752','71655753','71560294','71591720','71591721','71591722','71591723','71654778','71561025','71561026','71561027','71561028','71561029','71625876','71651702','71651703','71651704','71651705','71651706','71651707','71651708','71574915','71651712','71622851','71645485','71632178','71636115','71636116','71636117','71636118','71636119','71636120','71636121','71636122','71636123','71580018','71580019','71580020','71580021','71580022','71580023','71580024','71611414','71568415','71568416','71568417') THEN 1 ELSE 0 END","equalto","1"]
                        // ["formulanumeric: CASE WHEN {lineuniquekey} IN ('71657782') THEN 1 ELSE 0 END","equalto","1"]
                        // ["formulanumeric: CASE WHEN {lineuniquekey} IN ('71657782', '71590481', '71590482') THEN 1 ELSE 0 END","equalto","1"]
                        // ["formulanumeric: CASE WHEN {lineuniquekey} IN ('71657782') THEN 1 ELSE 0 END","equalto","1"]
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

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/https', 'N/query', 'N/record', 'N/runtime', 'N/search'],
    /**
 * @param{https} https
 * @param{query} query
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (https, query, record, runtime, search) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) =>
        {
            try
            {
                skydocHelper(scriptContext);
            }
            catch(e)
            {
                log.error("ERROR in function afterSubmit", e)
            }
        }

        function skydocHelper(scriptContext)
        {
            if(scriptContext.newRecord.type == "vendorbill")
            {
                var targetVbId = scriptContext.newRecord.id;
                var fileDetails = {};

                var salesorderSearchObj = search.create({
                    type: "customrecord_tss_aws_s3_ns_file_record",
                    filters:
                        [
                            ["custrecord_tss_transaction_list_record","is",targetVbId],
                            // "AND",
                            // ["custrecord_tss_transaction_list_record.recordtype", "is", "VendBill"]
                        ],
                    columns:
                        [
                            search.createColumn({name: "custrecord_tss_transaction_list_record", label: "tran_internalid"}),
                            search.createColumn({name: "tranid", join:"custrecord_tss_transaction_list_record", label: "tran_docnum"}),
                            search.createColumn({name: "custrecord_tss_aws_s3_ns_location", label: "skydoc_url"}),
                            search.createColumn({name: "custrecord_tss_aws_s3_ns_sizein_bytes", label: "size"}),
                            search.createColumn({name: "custrecord_tss_aws_s3_ns_file_name", label: "file_name"}),
                            search.createColumn({name: "custrecord_tss_aws_s3_ns_version_number", label: "version_num"}),
                            search.createColumn({name: "recordtype", join:"custrecord_tss_transaction_list_record", label: "recordtype"}),
                        ]
                });

                log.debug("filters", JSON.stringify(salesorderSearchObj.filters))

                salesorderSearchObj.run().each(function(res){

                    for(var a = 0 ; a < salesorderSearchObj.columns.length ; a++)
                    {
                        var col = salesorderSearchObj.columns[a];
                        fileDetails[col.label] = res.getValue(col)
                    }

                    return true;
                })
                log.debug("fileDetails", fileDetails)
            }
            else if(scriptContext.newRecord.type == "customrecord_tss_aws_s3_ns_file_record")
            {
                var targetSkydocFileId = scriptContext.newRecord.id;
                var fileDetails = {};

                var salesorderSearchObj = search.create({
                    type: "customrecord_tss_aws_s3_ns_file_record",
                    filters:
                        [
                            ["internalid","is",targetSkydocFileId],
                            // "AND",
                            // ["custrecord_tss_transaction_list_record.recordtype", "is", "VendBill"]
                        ],
                    columns:
                        [
                            search.createColumn({name: "custrecord_tss_transaction_list_record", label: "tran_internalid"}),
                            search.createColumn({name: "tranid", join:"custrecord_tss_transaction_list_record", label: "tran_docnum"}),
                            search.createColumn({name: "custrecord_tss_aws_s3_ns_location", label: "skydoc_url"}),
                            search.createColumn({name: "custrecord_tss_aws_s3_ns_sizein_bytes", label: "size"}),
                            search.createColumn({name: "custrecord_tss_aws_s3_ns_file_name", label: "file_name"}),
                            search.createColumn({name: "custrecord_tss_aws_s3_ns_version_number", label: "version_num"}),
                            search.createColumn({name: "recordtype", join:"custrecord_tss_transaction_list_record", label: "recordtype"}),

                        ]
                });

                log.debug("filters", JSON.stringify(salesorderSearchObj.filters))

                salesorderSearchObj.run().each(function(res){

                    for(var a = 0 ; a < salesorderSearchObj.columns.length ; a++)
                    {
                        var col = salesorderSearchObj.columns[a];
                        fileDetails[col.label] = res.getValue(col)
                    }

                    return true;
                })
                log.debug("fileDetails", fileDetails)
            }
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });

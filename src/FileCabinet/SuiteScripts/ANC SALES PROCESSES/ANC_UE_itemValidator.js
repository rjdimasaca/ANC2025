/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search) => {
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
        const beforeSubmit = (scriptContext) =>
        {
            var itemValidatorObj = {};
            var targetSku = "";
            var targetRec = "";
            try
            {
                targetRec = record.load({
                    type : scriptContext.newRecord.type,
                    id : scriptContext.newRecord.id,
                    isDynamic : true
                })
                itemValidatorObj.g_int = targetRec.getValue({
                    fieldId : "custrecord_anc_itemval_grade"
                })
                itemValidatorObj.g_txt = targetRec.getText({
                    fieldId : "custrecord_anc_itemval_grade"
                })

                itemValidatorObj.d_int = targetRec.getValue({
                    fieldId : "custrecord_anc_itemval_diameter"
                })
                itemValidatorObj.d_txt = targetRec.getText({
                    fieldId : "custrecord_anc_itemval_diameter"
                })


                itemValidatorObj.w_int = targetRec.getValue({
                    fieldId : "custrecord_anc_itemval_width"
                })
                itemValidatorObj.w_txt = targetRec.getText({
                    fieldId : "custrecord_anc_itemval_width"
                })

                itemValidatorObj.c_int = targetRec.getValue({
                    fieldId : "custrecord_anc_itemval_core"
                })
                itemValidatorObj.c_txt = targetRec.getText({
                    fieldId : "custrecord_anc_itemval_core"
                })

                var targetName = "";



                var inventoryitemSearchObj = search.create({
                    type: "inventoryitem",
                    filters:
                        [
                            ["type","anyof","InvtPart"],
                            "AND",
                            ["parent","anyof",itemValidatorObj.g_int],
                            "AND",
                            ["custitem_anc_rolldiameter","anyof",itemValidatorObj.d_int],
                            "AND",
                            ["custitem_anc_rollcore","anyof",itemValidatorObj.c_int],
                            "AND",
                            ["custitem_anc_rollwidth","anyof",itemValidatorObj.w_int]
                        ],
                    columns:
                        [
                            search.createColumn({name: "itemid", label: "Name"}),
                        ]
                });
                // var searchResultCount = inventoryitemSearchObj.runPaged().count;
                // log.debug("inventoryitemSearchObj result count",searchResultCount);
                inventoryitemSearchObj.run().each(function(result){
                    // .run().each has a limit of 4,000 results
                    targetSku = result.id;
                    return false;
                });


                log.debug("itemValidatorObj", itemValidatorObj)
                if(!targetSku)
                {
                    var recObj = record.create({
                        type : "serializedinventoryitem",
                        isDynamic : true
                    });

                    recObj.setValue({
                        fieldId : "matrixtype",
                        value : "CHILD"
                    })
                    recObj.setValue({
                        fieldId : "parent",
                        value : itemValidatorObj.g_int
                    })

                    recObj.setValue({
                        fieldId : "itemid",
                        value : `D${itemValidatorObj.d_txt}-W${itemValidatorObj.w_txt}-${itemValidatorObj.c_txt}`
                    })
                    recObj.setValue({
                        fieldId : "matrixitemnametemplate",
                        value : "D{custitem_anc_rolldiameter}-W{custitem_anc_rollwidth}-{custitem_anc_rollcore}"
                    })

                    recObj.setValue({
                        fieldId : "matrixoptioncustitem_anc_rollwidth",
                        value : itemValidatorObj.w_int
                    })
                    recObj.setValue({
                        fieldId : "matrixoptioncustitem_anc_rolldiameter",
                        value : itemValidatorObj.d_int
                    })
                    recObj.setValue({
                        fieldId : "matrixoptioncustitem_anc_rollcore",
                        value : itemValidatorObj.c_int
                    })


                    recObj.setValue({
                        fieldId : "taxschedule",
                        value : 1
                    })
                    recObj.setValue({
                        fieldId : "assetaccount",
                        value : 591
                    })
                    recObj.setValue({
                        fieldId : "cogsaccount",
                        value : 3613
                    })

                    var submittedItemRecId = recObj.save({
                        ignoreMandatoryFields : true,
                        enableSourcing: true
                    });

                    log.debug("submittedItemRecId", submittedItemRecId);

                    targetSku = submittedItemRecId


                }

                var itemLookup = search.lookupFields({
                    type : "serializedinventoryitem",
                    id : targetSku,
                    columns : ["itemid"]
                })

                targetName = itemLookup.itemid

                // record.submitFields({
                //     type : targetRec.type,
                //     id : targetRec.id,
                //     values : {
                //         name : targetName,
                //         custrecord_anc_itemval_sku : targetSku
                //     }
                // })

                // targetName = `${itemValidatorObj.g_txt} : D${itemValidatorObj.d_txt}-W${itemValidatorObj.w_txt}-${itemValidatorObj.c_txt}`
                // targetName = targetRec.getText({
                //     fieldId : "custrecord_anc_itemval_sku",
                // })
                log.debug("targetName", targetName)

                targetRec = record.load({
                    type : scriptContext.newRecord.type,
                    id : scriptContext.newRecord.id,
                    isDynamic : true
                })

                targetRec.setValue({
                    fieldId : "custrecord_anc_itemval_grade",
                    value : itemValidatorObj.g_int
                })

                targetRec.setValue({
                    fieldId : "custrecord_anc_itemval_sku",
                    value : targetSku
                })

                targetRec.setValue({
                    fieldId : "name",
                    value : targetName
                })

                // targetRec.save();


            }
            catch(e)
            {
                log.error("ERROR in function beforeSubmit", e);
            }
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
            var itemValidatorObj = {};
            var targetSku = "";
            var targetRec = "";
            try
            {
                targetRec = record.load({
                    type : scriptContext.newRecord.type,
                    id : scriptContext.newRecord.id,
                    isDynamic : true
                })
                itemValidatorObj.g_int = targetRec.getValue({
                    fieldId : "custrecord_anc_itemval_grade"
                })
                itemValidatorObj.g_txt = targetRec.getText({
                    fieldId : "custrecord_anc_itemval_grade"
                })

                itemValidatorObj.d_int = targetRec.getValue({
                    fieldId : "custrecord_anc_itemval_diameter"
                })
                itemValidatorObj.d_txt = targetRec.getText({
                    fieldId : "custrecord_anc_itemval_diameter"
                })


                itemValidatorObj.w_int = targetRec.getValue({
                    fieldId : "custrecord_anc_itemval_width"
                })
                itemValidatorObj.w_txt = targetRec.getText({
                    fieldId : "custrecord_anc_itemval_width"
                })

                itemValidatorObj.c_int = targetRec.getValue({
                    fieldId : "custrecord_anc_itemval_core"
                })
                itemValidatorObj.c_txt = targetRec.getText({
                    fieldId : "custrecord_anc_itemval_width"
                })

                var targetName = "";



                var inventoryitemSearchObj = search.create({
                    type: "inventoryitem",
                    filters:
                        [
                            ["type","anyof","InvtPart"],
                            "AND",
                            ["parent","anyof",itemValidatorObj.g_int],
                            "AND",
                            ["custitem_anc_rolldiameter","anyof",itemValidatorObj.d_int],
                            "AND",
                            ["custitem_anc_rollcore","anyof",itemValidatorObj.c_int],
                            "AND",
                            ["custitem_anc_rollwidth","anyof",itemValidatorObj.w_int]
                        ],
                    columns:
                        [
                            search.createColumn({name: "itemid", label: "Name"}),
                        ]
                });
                // var searchResultCount = inventoryitemSearchObj.runPaged().count;
                // log.debug("inventoryitemSearchObj result count",searchResultCount);
                inventoryitemSearchObj.run().each(function(result){
                    // .run().each has a limit of 4,000 results
                    targetSku = result.id;
                    return false;
                });


                if(!targetSku)
                {
                    var recObj = record.create({
                        type : "serializedinventoryitem",
                        isDynamic : true
                    });

                    recObj.setValue({
                        fieldId : "matrixtype",
                        value : "CHILD"
                    })
                    recObj.setValue({
                        fieldId : "parent",
                        value : itemValidatorObj.g_int
                    })

                    recObj.setValue({
                        fieldId : "itemid",
                        value : `D${itemValidatorObj.d_txt}-W${itemValidatorObj.w_txt}-${itemValidatorObj.c_txt}`
                    })
                    recObj.setValue({
                        fieldId : "matrixitemnametemplate",
                        value : "D{custitem_anc_rolldiameter}-W{custitem_anc_rollwidth}-{custitem_anc_rollcore}"
                    })

                    recObj.setValue({
                        fieldId : "matrixoptioncustitem_anc_rollwidth",
                        value : itemValidatorObj.w_int
                    })
                    recObj.setValue({
                        fieldId : "matrixoptioncustitem_anc_rolldiameter",
                        value : itemValidatorObj.d_int
                    })
                    recObj.setValue({
                        fieldId : "matrixoptioncustitem_anc_rollcore",
                        value : itemValidatorObj.c_int
                    })


                    recObj.setValue({
                        fieldId : "taxschedule",
                        value : 1
                    })
                    recObj.setValue({
                        fieldId : "assetaccount",
                        value : 591
                    })
                    recObj.setValue({
                        fieldId : "cogsaccount",
                        value : 3613
                    })

                    var submittedItemRecId = recObj.save({
                        ignoreMandatoryFields : true,
                        enableSourcing: true
                    });

                    log.debug("submittedItemRecId", submittedItemRecId);

                    targetSku = submittedItemRecId


                }

                var itemLookup = search.lookupFields({
                    type : "serializedinventoryitem",
                    id : targetSku,
                    columns : ["itemid"]
                })

                targetName = itemLookup.itemid

                // record.submitFields({
                //     type : targetRec.type,
                //     id : targetRec.id,
                //     values : {
                //         name : targetName,
                //         custrecord_anc_itemval_sku : targetSku
                //     }
                // })

                // targetName = `${itemValidatorObj.g_txt} : D${itemValidatorObj.d_txt}-W${itemValidatorObj.w_txt}-${itemValidatorObj.c_txt}`
                // targetName = targetRec.getText({
                //     fieldId : "custrecord_anc_itemval_sku",
                // })
                log.debug("targetName", targetName)

                targetRec = record.load({
                    type : scriptContext.newRecord.type,
                    id : scriptContext.newRecord.id,
                    isDynamic : true
                })

                targetRec.setValue({
                    fieldId : "custrecord_anc_itemval_grade",
                    value : itemValidatorObj.g_int
                })

                targetRec.setValue({
                    fieldId : "custrecord_anc_itemval_sku",
                    value : targetSku
                })

                targetRec.setValue({
                    fieldId : "name",
                    value : targetName
                })

                targetRec.save();


            }
            catch(e)
            {
                log.error("ERROR in function afterSubmit", e);
            }
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

/**
 * @author      Rodmar Dimasaca : netrodsuite@gmail.com / rod@joycloud.dev
 * @devdate     May 01 2025
 * for Alyssa Engelbert
 * to fix PO Bill - make copy feature also copying the billaddress text
 * even if it's been updated on the Vendor Addressbook
 * directly developed in Production
 * ---this is the only scene we tested, using VB:202501 (internalid 62092591)
 *
 */
define(['N/search', 'N/record'],
    /**
 * @param{search} search
 * @param{record} record
 */
    (search, record) => {
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
            try
            {
                // log.debug("scriptContext.type", scriptContext.type)
                if(scriptContext.type == "create" || scriptContext.type == "copy")
                {
                    setVendorAddress(scriptContext);
                }

            }
            catch(e)
            {
                log.error("ERROR in function beforeLoad", e)
            }
        }

        const setVendorAddress = (scriptContext) => {

            try
            {
                var targetVendorId = scriptContext.newRecord.getValue({
                    fieldId : "entity"
                });
                var vendorRecObj = record.load({
                    type : "vendor",
                    id : targetVendorId
                })

                var addrlineCount = vendorRecObj.getLineCount({
                    sublistId : "addressbook"
                });


                var default_body_addr = vendorRecObj.getValue({
                    sublistId : "addressbook",
                    fieldId : "defaultaddress",
                });

                for(var a = 0 ; a < addrlineCount ; a++)
                {
                    var lineAddr_defaultbilling = vendorRecObj.getSublistValue({
                        sublistId : "addressbook",
                        fieldId : "defaultbilling",
                        line : a
                    });

                    // log.debug("lineAddr_defaultbilling", lineAddr_defaultbilling)

                    if(lineAddr_defaultbilling && lineAddr_defaultbilling != "F")
                    {
                        var lineAddr_internalid = vendorRecObj.getSublistValue({
                            sublistId : "addressbook",
                            fieldId : "internalid",
                            line : a
                        });

                        var lineAddr_addrtext = vendorRecObj.getSublistValue({
                            sublistId : "addressbook",
                            fieldId : "billaddress",
                            line : a
                        });

                        var curr_billaddresstext = scriptContext.newRecord.getValue({
                            fieldId : "billaddress"
                        });

                        var curr_billaddress = scriptContext.newRecord.getValue({
                            fieldId : "billingaddress"
                        });

                        // log.debug("{lineAddr_internalid, curr_billaddress, lineAddr_addrtext}", {lineAddr_internalid, curr_billaddress, curr_billaddresstext, lineAddr_addrtext, default_body_addr})

                        if((lineAddr_internalid && lineAddr_internalid != curr_billaddress) || (default_body_addr && default_body_addr != curr_billaddresstext))
                        {
                            // scriptContext.newRecord.setValue({
                            //     fieldId : "billaddress",
                            //     value : ""
                            // })
                            // scriptContext.newRecord.setValue({
                            //     fieldId : "billaddresslist",
                            //     value : ""
                            // })

                            scriptContext.newRecord.setValue({
                                fieldId : "billaddress",
                                value : default_body_addr
                            });
                            scriptContext.newRecord.setValue({
                                fieldId : "billaddresslist",
                                value : lineAddr_internalid
                            });


                            log.debug("overriden bill address", {lineAddr_internalid, curr_billaddress, default_body_addr, curr_billaddresstext})
                            break;
                        }
                        else
                        {
                            continue;
                        }

                    }
                }
            }
            catch(e)
            {
                log.error("ERROR in function setVendorAddress", e)
            }
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
        const afterSubmit = (scriptContext) => {

        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });

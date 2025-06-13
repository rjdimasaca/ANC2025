/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/file', 'N/https', 'N/query', 'N/record', 'N/runtime', 'N/search', 'N/task', 'N/ui/serverWidget'],
    /**
     * @param{file} file
     * @param{https} https
     * @param{query} query
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{task} task
     * @param{serverWidget} serverWidget
     */
    (file, https, query, record, runtime, search, task, serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) =>
        {
            try {
                loadPlanningUi(scriptContext);
            }
            catch(e)
            {
                log.error("ERROR in function onRequest", e.message)
            }
        }

        function loadPlanningUi(scriptContext)
        {
            try
            {
                addElements(scriptContext);
                // fillSublist(scriptContext);
            }
            catch(e)
            {
                log.error("ERROR in function loadPlanningUi", e)
            }
        }

        var sublistObj1 = {};
        var sublistObj2 = {};
        function fillSublist(scriptContext)
        {
            try
            {
            }
            catch(e)
            {
                log.error("ERROR in function fillSublist", e)
            }
        }

        function addElements(scriptContext)
        {
            try
            {
                form = serverWidget.createForm({
                    title : "Load Planning",
                    hideNavBar : false
                });

                form.addSubmitButton({
                    id : `custpage_button_lp_submit`,
                    label : `Reprocess`,
                })

                form.addTab({
                    id : `custpage_subtab_lp_tab1`,
                    label : `Planning for Exception`,
                })

                //input
                sublistObj1 = form.addSublist({
                    type : "list",
                    id : "custpage_subtab_lp_sublist1",
                    tab : "custpage_subtab_lp_tab1",
                    label : `Planning Exception`
                })

                sublistObj1.addField({
                    type : "Checkbox",
                    id : "custpage_fld_lp_select",
                    label : `Select`,
                    // source : ""
                })
                sublistObj1.addField({
                    type : "Select",
                    id : "custpage_fld_lp_shipment1",
                    label : `Shipment No`,
                    source : "customsale_anc_shipment"
                })
                sublistObj1.addField({
                    type : "text",
                    id : "custpage_fld_lp_destination1",
                    label : `Destination`,
                    // source : ""
                })
                sublistObj1.addField({
                    type : "date",
                    id : "custpage_fld_lp_deldate1",
                    label : `Delivery Date`,
                    // source : ""
                })
                sublistObj1.addField({
                    type : "percent",
                    id : "custpage_fld_lp_loadefficiency1",
                    label : `Loading Efficiency`,
                    // source : ""
                })
                sublistObj1.addField({
                    type : "Select",
                    id : "custpage_fld_lp_status1",
                    label : `Status`,
                    source : "customlist_anc_sostatus"
                })
                sublistObj1.addField({
                    type : "Checkbox",
                    id : "custpage_fld_lp_crossdockelig1",
                    label : `Cross Dock Eligible`,
                    // source : ""
                })




                form.addTab({
                    id : `custpage_subtab_lp_tab2`,
                    label : `Everything else`,
                })
                //review
                sublistObj2 = form.addSublist({
                    type : "list",
                    id : "custpage_subtab_lp_sublist2",
                    tab : "custpage_subtab_lp_tab2",
                    label : `Others`
                })
                sublistObj2.addField({
                    type : "Select",
                    id : "custpage_fld_lp_shipment2",
                    label : `Shipment No`,
                    source : "customsale_anc_shipment"
                })
                sublistObj2.addField({
                    type : "text",
                    id : "custpage_fld_lp_destination2",
                    label : `Destination`,
                    // source : ""
                })
                sublistObj2.addField({
                    type : "date",
                    id : "custpage_fld_lp_deldate2",
                    label : `Delivery Date`,
                    // source : ""
                })
                sublistObj2.addField({
                    type : "percent",
                    id : "custpage_fld_lp_loadefficiency2",
                    label : `Loading Efficiency`,
                    // source : ""
                })
                sublistObj2.addField({
                    type : "Select",
                    id : "custpage_fld_lp_status2",
                    label : `Status`,
                    source : "customlist_anc_sostatus"
                })
                sublistObj2.addField({
                    type : "Checkbox",
                    id : "custpage_fld_lp_crossdockelig2",
                    label : `Cross Dock Eligible`,
                    // source : ""
                })



                var shipmentSql1 = `SELECT
                                        BUILTIN_RESULT.TYPE_DATE(TRANSACTION.trandate) AS trandate,
                                        BUILTIN_RESULT.TYPE_STRING(TRANSACTION.id) AS internalid,
                                        BUILTIN_RESULT.TYPE_STRING(TRANSACTION.memo) AS memo,
                                        BUILTIN_RESULT.TYPE_INTEGER(TRANSACTION.entity) AS entity,
                                        BUILTIN_RESULT.TYPE_STRING(TRANSACTION.tranid) AS tranid,
                                        BUILTIN_RESULT.TYPE_STRING(TRANSACTION.trandisplayname) AS trandisplayname,
                                        BUILTIN_RESULT.TYPE_STRING(TRANSACTION.TYPE) AS TYPE,
                                        BUILTIN_RESULT.TYPE_CURRENCY(TRANSACTION.foreigntotal, BUILTIN.CURRENCY(TRANSACTION.foreigntotal)) AS foreigntotal
                                    FROM
                                        TRANSACTION,
                                        transactionLine
                                    WHERE
                                        TRANSACTION.ID = transactionLine.TRANSACTION
                                      AND TRANSACTION.custbody_anc_shipstatus = 2
                                      AND ((TRANSACTION.custbody_anc_loadingefficiency =< 50 AND TRANSACTION.TYPE IN ('CuTrSale108') AND NVL(transactionLine.mainline, 'F') = 'T'))`

                const sqlResults1 = query.runSuiteQL({ query: shipmentSql1 }).asMappedResults();


                var shipmentSql2 = `SELECT
                                        BUILTIN_RESULT.TYPE_DATE(TRANSACTION.trandate) AS trandate,
                                        BUILTIN_RESULT.TYPE_DATE(TRANSACTION.custbody_anc_shipstatus) AS custbody_anc_shipstatus,
                                        BUILTIN_RESULT.TYPE_STRING(TRANSACTION.id) AS internalid,
                                        BUILTIN_RESULT.TYPE_STRING(TRANSACTION.memo) AS memo,
                                        BUILTIN_RESULT.TYPE_INTEGER(TRANSACTION.entity) AS entity,
                                        BUILTIN_RESULT.TYPE_STRING(TRANSACTION.tranid) AS tranid,
                                        BUILTIN_RESULT.TYPE_STRING(TRANSACTION.trandisplayname) AS trandisplayname,
                                        BUILTIN_RESULT.TYPE_STRING(TRANSACTION.TYPE) AS TYPE,
                                        BUILTIN_RESULT.TYPE_CURRENCY(TRANSACTION.foreigntotal, BUILTIN.CURRENCY(TRANSACTION.foreigntotal)) AS foreigntotal
                                    FROM
                                        TRANSACTION,
                                        transactionLine
                                    WHERE
                                        TRANSACTION.ID = transactionLine.TRANSACTION
                                      AND TRANSACTION.custbody_anc_shipstatus != 2
                                      AND ((TRANSACTION.custbody_anc_loadingefficiency > 50 AND TRANSACTION.TYPE IN ('CuTrSale108') AND NVL(transactionLine.mainline, 'F') = 'T'))`

                const sqlResults2 = query.runSuiteQL({ query: shipmentSql2 }).asMappedResults();


                log.debug("shipmentSql1", shipmentSql1);
                log.debug("shipmentSql2", shipmentSql2);
                log.debug("sqlResults1", sqlResults1);
                log.debug("sqlResults2", sqlResults2);



                for(var a = 0 ; a < sqlResults1.length; a++)
                {
                    sublistObj1.setSublistValue({
                        id : "custpage_fld_lp_shipment1",
                        line : a,
                        value : sqlResults1[a].internalid
                    })
                }

                for(var a = 0 ; a < sqlResults2.length; a++)
                {
                    sublistObj2.setSublistValue({
                        id : "custpage_fld_lp_shipment2",
                        line : a,
                        value : sqlResults2[a].internalid
                    })
                }





























                scriptContext.response.writePage({
                    pageObj : form,
                    pageObject : form
                })
            }
            catch(e)
            {
                log.error("ERROR in function loadPlanningUi", e)
            }
        }

        return {onRequest}

    });

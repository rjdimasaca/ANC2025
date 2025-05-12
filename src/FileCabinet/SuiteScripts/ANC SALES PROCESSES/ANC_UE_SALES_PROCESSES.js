/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 *
 * Author       :       Rodmar Dimasaca / rod@joycloud.solutions / netrodsuite@gmail.com
 * Description  :       For ANC
 * File Name    :       ANC_UE_SALES_PROCESSES.js
 * Script Name  :       ANC UE SALES PROCESSES
 * Script Id    :       customscript_ue_sales_processes
 * Deployment Id:       customdeploy_ue_sales_processes
 * API Version  :       2.1
 * version      :       1.0.0
 *
 */
define(['/SuiteScripts/ANC_lib.js','N/query', 'N/https', 'N/record', 'N/runtime', 'N/ui/dialog', 'N/ui/message', 'N/ui/serverWidget', 'N/url'],
    /**
     * @param{https} https
     * @param{record} record
     * @param{runtime} runtime
     * @param{dialog} dialog
     * @param{message} message
     * @param{serverWidget} serverWidget
     * @param{url} url
     */
    (ANC_lib, query, https, record, runtime, dialog, message, serverWidget, url) => {
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
                log.debug("beforeLoad ANC_lib", ANC_lib)
                eval_requestforecastadj(scriptContext)
                addElements(scriptContext);
            }
            catch(e)
            {
                log.error("ERROR in function beforeLoad", e);
            }
        }


        var elemList =
        {
            bodyElems : {
                buttons : [
                    {
                        name : "custpage_soprocesses_fitcheck",
                        id : "custpage_soprocesses_fitcheck",
                        label : "Fitment Check",
                        functionName : "alert('Fitment Check')",
                        targetScript : "customscript_anc_sl_fitmentchecking",
                        targetDeployment : "customdeploy_anc_sl_fitmentchecking",
                        processid : "fitmentcheck",
                    },
                    {
                        name : "custpage_soprocesses_invcheck",
                        id : "custpage_soprocesses_invcheck",
                        label : "Inventory Check",
                        functionName : "alert('Inventory Check')",
                        targetScript : "customscript_anc_sl_salesprocesses",
                        targetDeployment : "customdeploy_anc_sl_salesprocesses",
                        processid : "inventorycheck",
                    },
                    // {
                    //     name : "custpage_soprocesses_grreservation",
                    //     id : "custpage_soprocesses_grreservation",
                    //     label : "SO:GR Reservation",
                    //     functionName : "alert('Grade Run Reservation')",
                    //     targetScript : "customscript_anc_sl_salesprocesses",
                    //     targetDeployment : "customdeploy_anc_sl_salesprocesses",
                    //     processid : "grreservation",
                    // },
                    {
                        name : "custpage_soprocesses_forecastcheck",
                        id : "custpage_soprocesses_forecastcheck",
                        label : "Forecast Check",
                        functionName : "alert('Forecast Check')",
                        targetScript : "customscript_anc_sl_salesprocesses",
                        targetDeployment : "customdeploy_anc_sl_salesprocesses",
                        processid : "forecastcheck",
                    },
                    {
                        name : "custpage_soprocesses_reqforecastadj",
                        id : "custpage_soprocesses_reqforecastadj",
                        label : "Request Forecast Adjustment",
                        functionName : "alert('Request Forecast Adjustment')",
                        targetScript : "customscript_anc_sl_salesprocesses",
                        targetDeployment : "customdeploy_anc_sl_salesprocesses",
                        processid : "requestforecastadj",
                    },
                ],
            },
            sublistElems : [

            ]
        }

        var salesAllocRecType = "customrecord_anc_pf_"
        function eval_requestforecastadj(scriptContext)
        {
            // salesAllocRecType

            var eval_requestforecastadj_res = {};

            var itemGradeList = [];
            var lineCount = scriptContext.newRecord.getLineCount({
                sublistId : "item"
            });

            var itemIdList = [];
            var itemGradeIdList = [];
            var gradeLineMapping = {};
            var lineGradeMapping = {};
            var orderLinesByConsignee = {};

            var sqlFilters = [];
            var sqlFilters_text = "";


            var compositeKeys = {};

            for(var a = 0 ; a < lineCount ; a++)
            {
                var lineGradeId = scriptContext.newRecord.getSublistValue({
                    sublistId : "item",
                    fieldId : "custcol_anc_grade",
                    line : a
                });
                var lineQty = scriptContext.newRecord.getSublistValue({
                    sublistId : "item",
                    fieldId : "quantity",
                    line : a
                });
                var lineConsignee = scriptContext.newRecord.getSublistValue({
                    sublistId : "item",
                    fieldId : "custcol_consignee",
                    line : a
                });
                var lineDate = scriptContext.newRecord.getSublistValue({
                    sublistId : "item",
                    fieldId : "custcol_anc_deliverydate",
                    line : a
                });


                log.debug("lineDate", lineDate)

                if(typeof lineDate != "object" && lineDate != "null" && lineDate)
                {
                    log.debug("NON date blineDate", lineDate)
                    lineDate = new Date(lineDate);
                    log.debug("NON date alineDate", lineDate)
                }
                else
                {
                    log.debug("alrd date blineDate", lineDate)
                    lineDate = lineDate ? new Date(lineDate) : new Date();
                    log.debug("alrd date alineDate", lineDate)
                }

                var lineDate_year = lineDate.getFullYear();
                var lineDate_year_plain = lineDate.getFullYear();

                log.debug("lineDate_year fullyear", lineDate_year)

                lineDate_year = `'${lineDate_year}'`
                log.debug("lineDate_yearlineDate_year", lineDate_year)


                var lineDate_month = lineDate.getMonth() + 1;

                log.debug("lineDate_month", lineDate_month)


                sqlFilters.push(`(
                sf.custrecord_anc_pf_grade = ${lineGradeId} 
                AND 
                y.name = ${lineDate_year} 
                AND 
                sf.custrecord_anc_pf_month = ${lineDate_month} 
                AND 
                sf.custrecord_anc_pf_consignee = ${lineConsignee}
                )`)


                var compositeKey = `${lineGradeId}_${lineConsignee}_${lineDate_month}_${lineDate_year_plain}`

                log.debug("compositeKey", compositeKey)

                sqlFilters_text = sqlFilters.join( " OR " )

                log.debug("sqlFilters_text", sqlFilters_text);

                if(gradeLineMapping[lineGradeId])
                {
                    gradeLineMapping[lineGradeId].lines.push(a);
                    gradeLineMapping[lineGradeId].totalQty += lineQty;
                }
                else
                {
                    gradeLineMapping[lineGradeId] = {};
                    gradeLineMapping[lineGradeId].lines = [a];
                    gradeLineMapping[lineGradeId].totalQty = lineQty;
                }

                if(lineGradeMapping[lineGradeId])
                {
                    lineGradeMapping[a].grades.push(lineGradeId);
                    lineGradeMapping[a].totalQty += lineQty;
                }
                else
                {
                    lineGradeMapping[a] = {};
                    lineGradeMapping[a].grades = [lineGradeId];
                    lineGradeMapping[a].totalQty = lineQty;
                }


                if(compositeKeys[compositeKey])
                {
                    compositeKeys[compositeKey].lines.push(a);
                    compositeKeys[compositeKey].totalQty += lineQty;
                }
                else
                {
                    compositeKeys[compositeKey] = {};
                    compositeKeys[compositeKey].lines = [a];
                    compositeKeys[compositeKey].totalQty = lineQty;
                }

                itemGradeIdList.push(`'${lineGradeId}'`);
            }

            log.debug("itemGradeIdList", itemGradeIdList);
            log.debug("lineGradeMapping", lineGradeMapping);
            log.debug("gradeLineMapping", gradeLineMapping);
            log.debug("compositeKeys", compositeKeys);

            var itemGradeIdList_joined = `(${itemGradeIdList.join(",")})`;


            log.debug("itemGradeIdList_joined", itemGradeIdList_joined);


            var sql =
            `Select
                 sf.custrecord_anc_pf_grade as sf_grade,
                 sf.custrecord_anc_pf_allocation as sf_allocation,
                 sf.custrecord_anc_pf_year as sf_year,
                 sf.custrecord_anc_pf_month as sf_month,
                 sf.custrecord_anc_pf_consignee as sf_consignee,
                 y.name as y_name,
                 m.name as m_name

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

            log.debug("sqlResults", sqlResults)

            var sqlResults_byKey = groupByKeys(sqlResults, ["sf_grade", "sf_consignee", "sf_month", "y_name"]);

            eval_requestforecastadj_res.sqlResults = sqlResults;
            eval_requestforecastadj_res.sqlResults_byKey = sqlResults_byKey;
            eval_requestforecastadj_res.gradeLineMapping = gradeLineMapping;
            eval_requestforecastadj_res.lineGradeMapping = lineGradeMapping;
            eval_requestforecastadj_res.itemGradeIdList = itemGradeIdList;

            log.debug("eval_requestforecastadj_res", eval_requestforecastadj_res);

            log.debug("sqlResults_byKey", sqlResults_byKey);

            var linesToHighlight_yellow = [];
            var linesToHighlight_orange = [];
            for(var compositeKey in compositeKeys)
            {
                if(sqlResults_byKey[compositeKey] && sqlResults_byKey[compositeKey][0])
                {
                    //TODO you need to look at other orders, not just this salesorder
                    if(sqlResults_byKey[compositeKey][0].sf_allocation < compositeKeys[compositeKey].totalQty)
                    {
                        log.debug("detected forecast issue on lines", compositeKeys[compositeKey].lines)
                        linesToHighlight_yellow = linesToHighlight_yellow.concat(compositeKeys[compositeKey].lines)
                    }
                    else
                    {
                        log.debug("NO forecast issue on lines", compositeKeys[compositeKey].lines)
                    }
                }
                else
                {
                    log.debug("detected forecast issue on lines, no forcast found", compositeKeys[compositeKey].lines)
                    linesToHighlight_orange = linesToHighlight_orange.concat(compositeKeys[compositeKey].lines)
                }
            }

            log.debug("linesToHighlight_orange", linesToHighlight_orange)
            log.debug("linesToHighlight_yellow", linesToHighlight_yellow)

            var yellowHtml = "";
            if(linesToHighlight_orange.length > 0)
            {
                // highlightItemSplitsSpecificRows(linesToHighlight_orange, 'orange');
                yellowHtml += `highlightItemSplitsSpecificRows(${JSON.stringify(linesToHighlight_orange)}, 'orange');`
            }
            var orangeHtml = "";
            if(linesToHighlight_yellow.length > 0)
            {
                // highlightItemSplitsSpecificRows(linesToHighlight_yellow, 'yellow')
                orangeHtml += `highlightItemSplitsSpecificRows(${JSON.stringify(linesToHighlight_yellow)}, 'yellow');`
            }

            var inlineHtmlField = scriptContext.form.addField({
                id: "custpage_anc_forecasthighlighter",
                type: "inlinehtml",
                label: "ANC SALES_forecasthighlighter"
            });

            var inlineHtmlFieldValue =`<script>


            console.log('wasap man111')
            function highlightItemSplitsSpecificRows(rowIndices, color = 'lightblue', apply = true) {
              const tableElement = document.getElementById('item_splits');

              if (!tableElement || tableElement.tagName !== 'TABLE') {
                console.error('Table with ID "item_splits" not found or is not a table element.');
                return;
              }

              const rows = Array.from(tableElement.querySelectorAll('tbody > tr'));
              // Filter out the header row to get data rows for 0-based indexing
              const dataRows = rows.filter(row => !row.classList.contains('uir-machine-headerrow'));

              rowIndices.forEach(index => {
                // Check if the index is valid for the data rows
                if (index >= 0 && index < dataRows.length) {
                  const row = dataRows[index];
                  const cells = row.querySelectorAll('td');

                  cells.forEach(cell => {
                    if (apply) {
                      // Apply background color with !important to override existing styles
                      cell.style.setProperty('background-color', color, 'important');
                    } else {
                      // Remove the applied background color style
                      cell.style.removeProperty('background-color');
                    }
                  });
                } else {
                }
              });
            }
            
            jQuery(document).ready(function() {
                ${orangeHtml}
                console.log('wasap man orange')
                ${yellowHtml}
                console.log('wasap man yellow')
            })
            </script>`

            inlineHtmlField.defaultValue = inlineHtmlFieldValue;

            return eval_requestforecastadj_res;

        }

        function groupBy(array, key) {
            return array.reduce(function (acc, obj) {
                let groupKey = obj[key];
                acc[groupKey] = acc[groupKey] || [];
                acc[groupKey].push(obj);
                return acc;
            }, {});
        }

        function groupByKeys(objectArray, property) {
            return objectArray.reduce(function (acc, obj) {

                var key = "";
                for(var a = 0 ; a < property.length; a++)
                {
                    if(!key)
                    {
                        key += (obj[property[a]] || "");
                    }
                    else
                    {
                        key += "_" + (obj[property[a]] || "");
                    }
                }
                // key += "|"

                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(obj);
                return acc;
            }, {});
        }

        function completeFunction(nsObj,scriptContext)
        {
            var targetUrl = "";
            if(nsObj.targetScript && nsObj.targetDeployment)
            {
                var baseUiUrl = url.resolveScript({
                    scriptId : nsObj.targetScript,
                    deploymentId : nsObj.targetDeployment
                });

                targetUrl = baseUiUrl +"&traninternalid=" + scriptContext.newRecord.id
                targetUrl += "&processid=" + nsObj.processid
            }

            // nsObj.functionName = `alert('completeFunction${nsObj.label}')`
            nsObj.functionName = `window.open('${targetUrl}', 'popupWindow', 'width=1440,height=700,scrollbars=yes')`



        }

        const addElements = (scriptContext) => {
            try
            {
                var lineUrls = [];

                log.debug("scriptContext.type", scriptContext.type)

                if (scriptContext.type == "view" || scriptContext.type == "edit") {

                    log.debug("elemList.bodyElems.buttons", {a:elemList.bodyElems, b:elemList.bodyElems.buttons})

                    if(scriptContext.type == "view")
                    {
                        for(var j = 0 ; j < elemList.bodyElems.buttons.length; j++) {
                            log.debug("elemList.bodyElems[j]", elemList.bodyElems.buttons[j]);

                            var nsObj = elemList.bodyElems.buttons[j];
                            completeFunction(nsObj,scriptContext);

                            scriptContext.form.addButton(
                                nsObj
                            )
                        }

                        for(var j = 0 ; j < elemList.sublistElems.length; j++)
                        {
                            var groupElem = elemList.sublistElems[j];

                            var base_fitmentAndReserveUiUrl = "/app/site/hosting/scriptlet.nl?script=5576&deploy=1";
                            var base_fitmentAndReserveUiUrl = url.resolveScript({
                                scriptId : groupElem.targetScriptId,
                                deploymentId : groupElem.targetDeploymentId
                            });
                            log.debug("base_fitmentAndReserveUiUrl", base_fitmentAndReserveUiUrl);
                            base_fitmentAndReserveUiUrl += "&traninternalid=" + scriptContext.newRecord.id
                            // base_fitmentAndReserveUiUrl += "&tranentity=" + scriptContext.newRecord.getValue({fieldId : "entity"})
                            // base_fitmentAndReserveUiUrl += "&trandate=" + scriptContext.newRecord.getValue({fieldId : "trandate"})
                            // base_fitmentAndReserveUiUrl += "&tranheaderitem=" + scriptContext.newRecord.getValue({fieldId : "assemblyitem"})
                            // base_fitmentAndReserveUiUrl += "&tranheadercreatedfrom=" + scriptContext.newRecord.getValue({fieldId : "createdfrom"})

                            // var othercompObj = getOtherComponents(scriptContext);
                            // var othercompparam = "&othercomp=" + othercompObj.stringify;
                            // base_fitmentAndReserveUiUrl += othercompparam;

                            log.debug("base_fitmentAndReserveUiUrl", base_fitmentAndReserveUiUrl);

                            var lineCount = scriptContext.newRecord.getLineCount({
                                sublistId : "item"
                            })

                            for(var a = 0  ; a < lineCount ; a++)
                            {
                                // var lastSubstituteId = scriptContext.newRecord.getSublistValue({sublistId : "item", fieldId : "custcol_r8l_itemsubstitution", line : a})
                                var substitutionCount = scriptContext.newRecord.getSublistValue({sublistId : "item", fieldId : "custcol_r8l_substitutioncount", line : a});


                                substitutionCount = Number(substitutionCount || 0);
                                log.debug("substitutionCount", substitutionCount);
                                if(substitutionCount > 0)
                                {
                                    var substitutionUiUrl = "substituted";
                                    lineUrls.push(substitutionUiUrl);
                                }
                                else
                                {
                                    var substitutionUiUrl = "" + base_fitmentAndReserveUiUrl;
                                    substitutionUiUrl += "&tranlinenum=" + scriptContext.newRecord.getSublistValue({sublistId : "item", fieldId : "line", line : a})
                                    // substitutionUiUrl += "&tranlineitem=" + scriptContext.newRecord.getSublistValue({sublistId : "item", fieldId : "item", line : a})
                                    // substitutionUiUrl += "&tranlineqty=" + scriptContext.newRecord.getSublistValue({sublistId : "item", fieldId : "quantity", line : a})
                                    substitutionUiUrl += "&tranlinesequence=" + (Number(a) + 1)

                                    // substitutionUiUrl += "&othercompf=" + JSON.stringify(filteredArr);
                                    lineUrls.push(substitutionUiUrl);
                                }


                            }

                            log.debug("lineUrls", lineUrls);

                            var inlineHtmlFieldValue = `
                        <script>
                        jQuery(document).ready(function() {
                            // alert(12345);
                            var anc_minimized_ui = false;
                            
                            var minimize_ui_interval = setInterval(function(){
                                var minimize_ui_tds = jQuery(".minimize_ui_elem_td0${groupElem.name}");
                                // console.log("anc_minimized_ui_${groupElem.name}", anc_minimized_ui)
                                console.log("minimize_ui_tds_${groupElem.name}", minimize_ui_tds)
                                if(/*!anc_minimized_ui || */minimize_ui_tds.length == 0)
                                {
                                    var rows = [];
                                    console.log("scriptContext.type", "${scriptContext.type}"=="view");
                                    if(("${scriptContext.type}"=="view") == true)
                                    {
                                        console.log("its true")
                                        rows = jQuery("#item_splits.uir-machine-table tbody tr");
                                    }
                                    else if("${scriptContext.type}"=="edit")
                                    {
                                        console.log("its false")
                                        rows = jQuery("tr[id^=item_row]");
                                        rows = jQuery("#item_splits.uir-machine-table tbody tr[id^=item_]");
                                    }
                                    
                                    console.log("rows", rows);
                                    
                                    
                                    rows.each(function(index, elem){
                                        
                                        var lineUrls = ${JSON.stringify(lineUrls)};
                                        
                                        // console.log("lineUrls", lineUrls);
                                        
                                        window["lineUrl_" + index] = lineUrls[index]
                                    
                                        if(index==0)
                                        {
                                            // console.log("jQuery(this).children()" + index, jQuery(this).children());
                                            // jQuery(this).prepend("<td>${groupElem.headerTitle}</td>") 
                                            // jQuery(this).prepend("<td height="100%" class="listheadertd listheadertextb uir-column-large" style="" data-label="Units" data-nsps-type="columnheader" data-nsps-label="Units" data-nsps-id="columnheader_item_units"><div class="listheader">${groupElem.headerTitle}</td>") 
                                            // jQuery(this).prepend('<td height="100%" class="listheadertdleft listheadertextb uir-column-large" style="" data-label="Item" data-nsps-type="columnheader" data-nsps-label="Item" data-nsps-id="columnheader_item_item"><div class="listheader">${groupElem.headerTitle}<img class="uir-hover-icon" src="/images/hover/icon_hover.png?v=2025.1" alt="" border="0" style="margin-left:8px;vertical-align:middle;" title="This column is hoverable"></div></td>')   
                                            jQuery(this).children().eq(${groupElem.position}).before(jQuery('<td height="100%" class="minimize_ui_elem_td0${groupElem.name} listheadertd listheadertextb uir-column-large" style="" data-label="Units" data-nsps-type="columnheader" data-nsps-label="Units" data-nsps-id="columnheader_item_units"><div class="listheader">${groupElem.headerTitle}</td>'));
                                            
                                            anc_minimized_ui = true;
                                        }
                                        else
                                        {
                                            // console.log("jQuery(this).children()" + index, jQuery(this).children());
                                            // var newTdHtml = '<td align="center"><img width="25px" height="25px" src="https://tstdrv1469253.app.netsuite.com/core/media/media.nl?id=58980&c=TSTDRV1469253&h=cb99Jl9ybtFCXBKZyIxOi8rE3eIQMbaejHergNw3VHVbiTGL" style="cursor: pointer;" onclick="window.open(window.lineUrl_';
                                            
                                            var newTdHtml = "";
                                            if(${groupElem.tdElementEnd})
                                            {
                                                newTdHtml = ${groupElem.tdElementStart}
                                                newTdHtml += (index-1)
                                                newTdHtml += ${groupElem.tdElementEnd}
                                            }
                                            else
                                            {
                                                newTdHtml = '<td class="minimize_ui_elem_td0${groupElem.name}" align="center"><p>${groupElem.rowTitle}<br/><img width="${groupElem.iconWidth}" height="${groupElem.iconHeight}" src="${groupElem.icon}" style="cursor: pointer;" onclick="window.open(window.lineUrl_';
                                        
                                                newTdHtml += (index-1) + ', \\'popupWindow\\', \\'width=700,height=700,scrollbars=yes\\'); return false;" alt="Click to open popup"></p></td>'
                                    
                                            }
                                            
                                            var lineUrl = lineUrls[index-1]
                                            if(lineUrl != "substituted")
                                            {
                                                // jQuery(this).prepend(newTdHtml);
                                                jQuery(this).children().eq(${groupElem.position}).before(jQuery(newTdHtml));
                                            }
                                            else
                                            {
                                                // jQuery(this).prepend('<td align="center">Reserved</td>');
                                                jQuery(this).children().eq(${groupElem.position}).before(jQuery('<td align="center">Reserved</td>'));
                                            }
                                            
                                            anc_minimized_ui = true;
                                        }
                                    })
                                }
                                else
                                {
                                    clearInterval(minimize_ui_interval);
                                }
                            }, 3000)
                            
                        });
                        </script>
                        `

                            var inlineHtmlField = scriptContext.form.addField({
                                id: "custpage_anc_salesprocesses_html" + j,
                                type: "inlinehtml",
                                label: "ANC SALES PROCESSES" + j
                            });

                            inlineHtmlField.defaultValue = inlineHtmlFieldValue;

                        }
                    }
                }
            } catch (e) {
                log.error("ERROR in function addElements", e);
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
            try
            {

            }
            catch(e)
            {
                log.error("ERROR in function beforeSubmit", e)
            }

        }

        var doSaveAfterSubmit = false;
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
            log.debug("afterSubmit , call implementSF");
            var recObj = record.load({
                type : scriptContext.newRecord.type,
                id : scriptContext.newRecord.id
            });
            implementSF(recObj);

            if(doSaveAfterSubmit)
            {
                var submittedRecId = recObj.save({
                    ignoreMandatoryFields : true,
                    enableSourcing : true
                })

                log.debug("submittedRecId", submittedRecId);
            }

        }


        var yearMapping = {};
        function implementSF(recObj)
        {
            var doImplementSf = true;
            yearMapping = ANC_lib.yearMapping;


            try
            {
                if(doImplementSf)
                {
                    var lineCount = recObj.getLineCount({
                        sublistId : "item"
                    });

                    log.debug("implementSF lineCount", lineCount)
                    log.debug("implementSF ANC_lib.references", ANC_lib.references)
                    var lineValList = [];
                    var headerEntity = recObj.getValue({
                        fieldId : "entity"
                    })

                    for(var a = 0 ; a < lineCount ; a++)
                    {
                        var lineVals = {}
                        lineVals.customer = headerEntity;
                        lineVals.grade = recObj.getSublistValue({
                            sublistId : "item",
                            fieldId : ANC_lib.references.SO_COLUMNS.GRADE,
                            line : a
                        })
                        lineVals.consignee = recObj.getSublistValue({
                            sublistId : "item",
                            fieldId : ANC_lib.references.SO_COLUMNS.CONSIGNEE,
                            line : a
                        })
                        lineVals.deliverydate = recObj.getSublistValue({
                            sublistId : "item",
                            fieldId : ANC_lib.references.SO_COLUMNS.DELIVERYDATE,
                            line : a
                        })
                        lineVals.month = lineVals.deliverydate ? (new Date(lineVals.deliverydate).getMonth())+ 1 : (new Date().getMonth()) + 1;
                        lineVals.year = lineVals.deliverydate ? new Date(lineVals.deliverydate).getFullYear() : new Date().getFullYear();
                        lineValList.push(lineVals);
                    }
                    log.debug("lineValList", lineValList);


                    var compositeKeyResults = ANC_lib.getRelatedForecasts(recObj.id, lineValList)
                    log.debug("implementSF compositeKeyResults", compositeKeyResults);
                    var SF_RESULTSBYCOMPOSITEKEY = compositeKeyResults.groupedByCompositekey;


                    //TODO you can optimize this because it performs another loop that it already had.
                    for(var a = 0 ; a < lineCount ; a++)
                    {
                        var lineVals = {}
                        lineVals.customer = headerEntity;
                        lineVals.grade = recObj.getSublistValue({
                            sublistId : "item",
                            fieldId : ANC_lib.references.SO_COLUMNS.GRADE,
                            line : a
                        })
                        lineVals.consignee = recObj.getSublistValue({
                            sublistId : "item",
                            fieldId : ANC_lib.references.SO_COLUMNS.CONSIGNEE,
                            line : a
                        })
                        lineVals.deliverydate = recObj.getSublistValue({
                            sublistId : "item",
                            fieldId : ANC_lib.references.SO_COLUMNS.DELIVERYDATE,
                            line : a
                        })
                        lineVals.month = lineVals.deliverydate ? (new Date(lineVals.deliverydate).getMonth())+ 1 : (new Date().getMonth()) + 1;
                        lineVals.year = lineVals.deliverydate ? new Date(lineVals.deliverydate).getFullYear() : new Date().getFullYear();

                        //TODO if not in yearmapping then refrain from proceeding, just from the start, dont waste effort if year is not mapped.
                        // you have a defaulting anyway so year will always be mapped, but what if its's 2051?!?!?
                        var lineCompositeKey = `${lineVals.customer}_${lineVals.consignee}_${lineVals.grade}_${lineVals.month}_${yearMapping[lineVals.year]}`;

                        log.debug("setting SF COLUMN lineCompositeKey", lineCompositeKey);
                        // log.debug("setting SF COLUMN SF_RESULTSBYCOMPOSITEKEY[lineCompositeKey].sf_id", SF_RESULTSBYCOMPOSITEKEY[lineCompositeKey].sf_id);
                        if(SF_RESULTSBYCOMPOSITEKEY[lineCompositeKey])
                        {
                            if(SF_RESULTSBYCOMPOSITEKEY[lineCompositeKey].sf_id) {
                                recObj.setSublistValue({
                                    sublistId: "item",
                                    fieldId: ANC_lib.references.SO_COLUMNS.SALESFORECAST,
                                    line: a,
                                    value: SF_RESULTSBYCOMPOSITEKEY[lineCompositeKey].sf_id
                                })

                                doSaveAfterSubmit = true;
                            }
                            else
                            {
                                recObj.setSublistValue({
                                    sublistId: "item",
                                    fieldId: ANC_lib.references.SO_COLUMNS.SALESFORECAST,
                                    line: a,
                                    value: ""
                                })

                                doSaveAfterSubmit = true;
                            }
                        }
                        else
                        {
                            recObj.setSublistValue({
                                sublistId: "item",
                                fieldId: ANC_lib.references.SO_COLUMNS.SALESFORECAST,
                                line: a,
                                value: ""
                            })

                            doSaveAfterSubmit = true;
                        }



                    }
                    log.debug("lineValList", lineValList);

                }
            }
            catch(e)
            {
                log.error("ERROR in funtion implementSF", e)
            }
        }



        return {/*beforeLoad,*/ beforeSubmit, afterSubmit}

    });






// function highlightItemSplitsSpecificRows(color = 'lightblue', apply = true) {
//     const tableElement = document.getElementById('item_splits');
//
//     console.log("tableElement", tableElement)
//
//     if (!tableElement || tableElement.tagName !== 'TABLE') {
//         console.error('Table with ID "item_splits" not found or is not a table element.');
//         return;
//     }
//
//     const rows = tableElement.querySelectorAll('tbody > tr');
//
//     rows.forEach(row => {
//         // Skip the header row if it has the observed header class
//         if (row.classList.contains('uir-machine-headerrow')) {
//             return;
//         }
//
//         const cells = row.querySelectorAll('td');
//         cells.forEach(cell => {
//             if (apply) {
//                 // Apply background color with !important to override existing styles
//                 cell.style.setProperty('background-color', color, 'important');
//             } else {
//                 // Remove the applied background color style
//                 cell.style.removeProperty('background-color');
//             }
//         });
//     });
// }
//
// highlightItemSplitsSpecificRows()
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
define(['/SuiteScripts/ANC_lib.js','N/query', 'N/format', 'N/search', 'N/https', 'N/record', 'N/runtime', 'N/ui/dialog', 'N/ui/message', 'N/ui/serverWidget', 'N/url'],
    /**
     * @param{https} https
     * @param{record} record
     * @param{runtime} runtime
     * @param{dialog} dialog
     * @param{message} message
     * @param{serverWidget} serverWidget
     * @param{url} url
     */
    (ANC_lib, query, format, search, https, record, runtime, dialog, message, serverWidget, url) => {
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


        var csv_rows = [];
        var csv_text = "";
        var linesToHighlight_yellow = [];
        var linesToHighlight_orange = [];
        function showReqForecastButton()
        {
            var retVal = false;
            try
            {
                if(linesToHighlight_yellow.length > 0 || linesToHighlight_orange.length > 0)
                {
                    retVal = true;
                }
            }
            catch(e)
            {
                log.error("ERROR in function showReqForecastButton", e);
            }
            return retVal;
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
                        condition : showReqForecastButton
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

            try
            {
                var newRecord = scriptContext.newRecord;
                var itemGradeList = [];
                var lineCount = newRecord.getLineCount({
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
                    //make month the last part of the compositeKey to make it easy for the salesforecasting piece
                    // var compositeKey = `${lineDate_year_plain}_${lineGradeId}_${lineConsignee}_${lineDate_month}`

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
            }
            catch(e) {
                log.error("ERROR in function eval_requestforecastadj", e)
            }


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

                            if(!nsObj.condition)
                            {
                                scriptContext.form.addButton(
                                    nsObj
                                )
                            }
                            else
                            {
                                if(nsObj.condition())
                                {
                                    scriptContext.form.addButton(
                                        nsObj
                                    )
                                }
                            }

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

        function prepItems(recObj)
        {
            var prepItems_result = {list:[]};
            try
            {
                var lineCount = recObj.getLineCount({
                    sublistId : "item"
                });
                for(var a = 0 ; a < lineCount ; a++)
                {
                    var lineObj = {};
                    lineObj["line_index"] = a;
                    lineObj.line_item = recObj.getSublistValue({
                        sublistId : "item",
                        fieldId : "item",
                        line : a
                    });
                    lineObj.line_overrideopts = recObj.getSublistValue({
                        sublistId : "item",
                        fieldId : "custcol_anc_item_override_options",
                        line : a
                    });
                    lineObj.line_grade = recObj.getSublistValue({
                        sublistId : "item",
                        fieldId : "custcol_anc_grade",
                        line : a
                    });
                    // lineObj["line_item"] = line_item;
                    // lineObj["custcol_anc_item_override_options"] = line_overrideopts;
                    // lineObj[line_item] = line_item;

                    lineObj.line_overrideopts_stringify = `{${lineObj.line_overrideopts.split("\n").join(",")}}`;
                    log.debug("lineObj after overrideopts stringify", lineObj.line_overrideopts_stringify);
                    lineObj.line_overrideopts_obj = JSON.parse(lineObj.line_overrideopts_stringify);
                    log.debug("lineObj after overrideopts parse", lineObj)


                    if(lineObj.line_overrideopts_obj && lineObj.line_overrideopts_obj["G"])
                    {
                        prepItems_result.list.push(lineObj);
                    }
                    // var line_item = recObj.getSublistValue({
                    //     sublistId : "item",
                    //     fieldId : "item",
                    //     line : a
                    // });

                    prepItems_result.byItem = groupBy(prepItems_result.list, "line_item");
                    prepItems_result.byIndex = groupBy(prepItems_result.list, "line_index");
                    prepItems_result.byGrade = groupBy(prepItems_result.list, "line_grade");
                }



                for (var gradeId in prepItems_result.byGrade)
                {
                    for(var a = 0 ; a < prepItems_result.byGrade[gradeId].length ; a++)
                    {
                        var opts = prepItems_result.byGrade[gradeId][a].line_overrideopts_obj;
                        log.debug("opts after prepitems", opts)
                        if(opts.D && opts.W && opts.Core)
                        {
                            var csv_row = [];
                            // var opts = prepItems_result.byGrade[a].line_overrideopts_stringify;
                            csv_row.push(gradeId, opts.D, opts.W, (opts.Core || opts.CORE));
                            log.debug("csv_row after prepitems", csv_row)
                            var csv_row_text = csv_row.join(",");
                            log.debug("csv_row_text after prepitems", csv_row_text)

                            csv_rows.push(csv_row_text)
                        }


                    }

                }

                csv_text = csv_rows.join("\n")


                log.debug("prepItems csv_text", csv_text)


            }
            catch(e)
            {
                log.error("ERROR in function prepItems", e)
            }

            log.debug("prepItems_result", prepItems_result);
            return prepItems_result;
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

            //create mimssing item
            // prepItems(recObj); //deprecated, use item validator custom record/dropdown

            determineLane(recObj);

            implementSF(recObj);
            //
            // implementFitment(recObj);


            if(doSaveAfterSubmit)
            {
                var submittedRecId = recObj.save({
                    ignoreMandatoryFields : true,
                    enableSourcing : true
                })

                log.debug("afterSubmit submittedRecId after prepitems, determinelane, implemFitment", submittedRecId);
            }

            var recObj = record.load({
                type : scriptContext.newRecord.type,
                id : scriptContext.newRecord.id
            });

            //call it after shipdate is resolved
            implementShipCap(recObj);

            //call it after shipdate,proddate is resolved //TODO
            implementProdCap(recObj);

            var pastLdcLinesSqlResults = ANC_lib.querySoPastLdc({traninternalids:[scriptContext.newRecord.id], sqlOperator:"IN", filterbyfield :"TRANSACTION.ID", dayspassedoper : ">", dayspassed : 0})

            var syncLinesPastLdcSyncResults = ANC_lib.syncLinesPastLdc(pastLdcLinesSqlResults)

            var updateLinesPastLdcResults = ANC_lib.updateLinesPastLdc(recObj, pastLdcLinesSqlResults)

            var submittedRecId = recObj.save({
                ignoreMandatoryFields : true,
                enableSourcing : true
            })

            log.debug("afterSubmit after LDC LOGIC", submittedRecId);
        }

        function implementFitment(recObj)
        {
            try
            {
                var srGroupedByDeliveryDate = ANC_lib.groupOrderLinesForShipmentGeneration(recObj.id)

                for(var date in srGroupedByDeliveryDate)
                {
                    var fitmentResponse = ANC_lib.getFitmentResponse(srGroupedByDeliveryDate[date]);

                    log.debug("fitmentResponse", fitmentResponse)

// // no of rolls * weight / equipment weight = utilization
//                     //total the weight of each equipment
//                     var itemStats = {};
//                     var fitmentResponse_body = fitmentResponse.body;
//                     log.debug("typeof fitmentResponse_body", typeof fitmentResponse_body)
//                     fitmentResponse_body = fitmentResponse_body ? JSON.parse(fitmentResponse_body) : [];
//                     log.debug("fitmentResponse_body", fitmentResponse_body)
//                     var fitmentResponse_body_shipments = fitmentResponse_body.shipments || [];
//
//                     for(var shipCtr = 0 ; shipCtr < fitmentResponse_body_shipments.length ; shipCtr++)
//                     {
//                         for(var shipItemsCtr = 0 ; shipItemsCtr < fitmentResponse_body_shipments[shipCtr].shipmentItems.length ; shipItemsCtr++)
//                         {
//                             var responseItemId = fitmentResponse_body_shipments[shipCtr].shipmentItems[shipItemsCtr].itemId;
//                             if(itemStats[responseItemId])
//                             {
//                                 itemStats[responseItemId].truckCount++;
//                                 itemStats[responseItemId].shipmentNumbers.push(fitmentResponse_body_shipments[shipCtr].shipmentNumber)
//                             }
//                             else
//                             {
//                                 itemStats[responseItemId] = {};
//                                 itemStats[responseItemId].shipmentNumbers = [];
//                                 itemStats[responseItemId].truckCount = 1;
//                             }
//                         }
//                     }
//
//
//                     log.debug("itemStats", itemStats)
//
//
//                     for(var slfldCtr = 0 ; slfldCtr < sublistSettings.sublistFields.length ; slfldCtr++)
//                     {
//
//                         var sublistFieldObj = fitmentReservationSublist.addField(sublistSettings.sublistFields[slfldCtr])
//                         if(sublistSettings.sublistFields[slfldCtr].displayType)
//                         {
//                             sublistFieldObj.updateDisplayType({
//                                 displayType : sublistSettings.sublistFields[slfldCtr].displayType
//                             });
//                         }
//                         if(sublistSettings.sublistFields[slfldCtr].defaultValue)
//                         {
//                             sublistFieldObj.defaultValue = sublistSettings.sublistFields[slfldCtr].defaultValue
//                         }
//                     }
//
//
//                     //END new specs based on ERD provided 03/12/2025
//
//                     var deliveryDateGroup = srGroupedByDeliveryDate[date];
//                     for(var c = 0 ; c < deliveryDateGroup.length ; c++)
//                     {
//                         var resObjByColumnKey = deliveryDateGroup[c]
//
//                         var firstSoRefLineIndex = (multiGradeIndex || 0);
//                         for(var b = 0; b < fitmentLineLimit; b++)
//                         {
//                             if(b == 0)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_ifr_tietoline",
//                                     line : multiGradeIndex || b,
//                                     value : (multiGradeIndex || b)+1
//                                 })
//                             }
//                             else if(b > 0)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_ifr_tietoline",
//                                     line : multiGradeIndex || b,
//                                     value : firstSoRefLineIndex
//                                 })
//                             }
//                             if(resObjByColumnKey.internalid)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_ifr_so",
//                                     line : multiGradeIndex || b,
//                                     value : resObjByColumnKey.internalid
//                                 })
//                             }
//
//                             // log.debug("resObjByColumnKey.line_deliverydate", resObjByColumnKey.line_deliverydate);
//                             log.debug("resObjByColumnKey.line_shipdate", resObjByColumnKey.line_shipdate);
//                             if(resObjByColumnKey.line_deliverydate)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_col_ifr_line_deliverydate",
//                                     line : multiGradeIndex || b,
//                                     value : /*"03/03/2025"*/resObjByColumnKey.line_deliverydate
//                                 })
//                             }
//                             if(resObjByColumnKey.line_shipdate)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_col_ifr_line_shipdate",
//                                     line : multiGradeIndex || b,
//                                     value : /*"03/03/2025"*/resObjByColumnKey.line_shipdate
//                                 })
//                             }
//
//                             //FILL BY ORDER QTY
//                             if(resObjByColumnKey.line_quantity)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_col_ifr_orderqty",
//                                     line : multiGradeIndex || b,
//                                     value : resObjByColumnKey.line_quantity
//                                 })
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_ifr_consignee",
//                                     line : multiGradeIndex || b,
//                                     value : resObjByColumnKey.line_consignee
//                                 })
//                             }
//                             if(resObjByColumnKey.line_quantity)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_col_ifr_reservedqty",
//                                     line : multiGradeIndex || b,
//                                     value : (resObjByColumnKey.line_reservedqty || 0)
//                                 })
//                             }
//                             if(resObjByColumnKey.line_equipment)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_col_ifr_equipment",
//                                     line : multiGradeIndex || b,
//                                     value : (resObjByColumnKey.line_equipment)
//                                 })
//                             }
//                             if(resObjByColumnKey.line_quantity)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_col_ifr_inputqty",
//                                     line : multiGradeIndex || b,
//                                     value : resObjByColumnKey.line_quantity - (resObjByColumnKey.line_reservedqty || 0)
//                                 })
//                             }
//                             if(resObjByColumnKey.line_consginee)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_col_ifr_consginee",
//                                     line : multiGradeIndex || b,
//                                     value : (resObjByColumnKey.line_consginee)
//                                 })
//                             }
//
//
//
//
//                             //FILL BY ORDER WEIGHT
//                             if(resObjByColumnKey.line_quantity)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_col_ifr_orderweight",
//                                     line : multiGradeIndex || b,
//                                     value : resObjByColumnKey.line_quantity
//                                 })
//                             }
//                             if(resObjByColumnKey.line_quantity)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_col_ifr_reservedweight",
//                                     line : multiGradeIndex || b,
//                                     value : (resObjByColumnKey.line_reservedweight || 0)
//                                 })
//                             }
//                             if(resObjByColumnKey.line_quantity)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_col_ifr_inputweight",
//                                     line : multiGradeIndex || b,
//                                     value : resObjByColumnKey.line_quantity - (resObjByColumnKey.line_reservedweight || 0)
//                                 })
//                             }
//
//
//
//
//                             if(resObjByColumnKey.line_id)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_ifr_lineref",
//                                     line : multiGradeIndex || b,
//                                     value : resObjByColumnKey.line_id
//                                 })
//                             }
//                             if(resObjByColumnKey.line_uniquekey)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_ifr_lineuniquekey",
//                                     line : multiGradeIndex || b,
//                                     value : resObjByColumnKey.line_uniquekey
//                                 })
//                             }
//                             if(resObjByColumnKey.custrecord_anc_crossdockeligible && resObjByColumnKey.custrecord_anc_crossdockeligible != "F")
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_ifr_iscrossdock",
//                                     line : multiGradeIndex || b,
//                                     value : "T"
//                                 })
//                             }
//                             if(resObjByColumnKey.custpage_ifr_leg)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_ifr_leg",
//                                     line : multiGradeIndex || b,
//                                     value : (resObjByColumnKey.custpage_ifr_leg)
//                                 })
//                             }
//                             if(resObjByColumnKey.internalid && resObjByColumnKey.line_id)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_ifr_solineref",
//                                     line : multiGradeIndex || b,
//                                     value : resObjByColumnKey.internalid + "_" + resObjByColumnKey.line_id
//                                 })
//                             }
//                             if(resObjByColumnKey.line_item)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_ifr_item",
//                                     line : multiGradeIndex || b,
//                                     value : resObjByColumnKey.line_item
//                                 })
//                             }
//                             if(resObjByColumnKey.line_location)
//                             {
//                                 fitmentReservationSublist.setSublistValue({
//                                     id : "custpage_ifr_location",
//                                     line : multiGradeIndex || b,
//                                     value : resObjByColumnKey.line_location
//                                 })
//                             }
//
//                             // loadid: "17424",
//                             //     loadnumber: "4",
//                             // weightplanned: "weight planned",
//                             // percentage: "34.567"
//
//                             // fitmentReservationSublist.setSublistValue({
//                             //     id : sublistSettings.sublistFields[slfldCtr1].id,
//                             //     line : multiGradeIndex || b,
//                             //     value : fitmentResponse.list[b][sublistSettings.sublistFields[slfldCtr1].sourceApiRespKey]
//                             // })
//
//                             log.debug("sublistSettings.sublistFields.length", sublistSettings.sublistFields.length);
//
//
//                             log.debug("resObjByColumnKey.line_uniquekey", resObjByColumnKey.line_uniquekey)
//                             if(itemStats[resObjByColumnKey.line_uniquekey])
//                             {
//                                 for(var slfldCtr1 = 0 ; slfldCtr1 < sublistSettings.sublistFields.length ; slfldCtr1++)
//                                 {
//                                     // log.debug("fsublistSettings.sublistFields[slfldCtr1].sourceApiRespKey 0 ", sublistSettings.sublistFields[slfldCtr1].sourceApiRespKey)
//
//                                     if(sublistSettings.sublistFields[slfldCtr1].sourceApiRespKey)
//                                     {
//                                         if(itemStats[resObjByColumnKey.line_uniquekey][sublistSettings.sublistFields[slfldCtr1].sourceApiRespKey])
//                                         {
//                                             log.debug("fitmentResponse:itemStats[resObjByColumnKey.line_uniquekey][sublistSettings.sublistFields[slfldCtr1].sourceApiRespKey] 1 ", itemStats[resObjByColumnKey.line_uniquekey][sublistSettings.sublistFields[slfldCtr1].sourceApiRespKey])
//
//                                             fitmentReservationSublist.setSublistValue({
//                                                 id : sublistSettings.sublistFields[slfldCtr1].id,
//                                                 line : multiGradeIndex || b,
//                                                 value : itemStats[resObjByColumnKey.line_uniquekey][sublistSettings.sublistFields[slfldCtr1].sourceApiRespKey]
//                                             })
//                                         }
//
//                                     }
//
//                                 }
//                             }
//
//
//
//                             if(allowMultiGrade)
//                             {
//                                 multiGradeIndex++;
//                             }
//                         }
//                     }
//
//                     a++;
                }
            }
            catch(e)
            {
                log.error("ERROR in function implementFitment", e)
            }
        }

        function determineLane(recObj)
        {
            var doDetermineLane = true;
            try
            {
                if(doDetermineLane)
                {
                    var lineCount = recObj.getLineCount({
                        sublistId : "item"
                    });
                    var header_consigneeId = recObj.getValue({
                        fieldId : "custbody_consignee"
                    });
                    var custbody_anc_ldc = recObj.getValue({
                        fieldId : "custbody_anc_ldc"
                    });
                    var header_consigneeLookup = search.lookupFields({
                        type : ANC_lib.references.RECTYPES.consignee.id,
                        id : header_consigneeId,
                        columns : ANC_lib.references.RECTYPES.consignee.fields.city
                    })
                    var header_consigneeCity = header_consigneeLookup[ANC_lib.references.RECTYPES.consignee.fields.city]
                    log.debug("header_consigneeCity.", header_consigneeCity);

                    var header_originWarehouse = recObj.getValue({
                        fieldId : "location"
                    })

                    var lineDetailsSql = `
                        SELECT
                            BUILTIN_RESULT.TYPE_STRING(Location_SUB.city) AS loc_city,
                            BUILTIN_RESULT.TYPE_STRING(CUSTOMRECORD_ALBERTA_NS_CONSIGNEE_RECORD.custrecord_alberta_ns_city) AS cons_city,
                            BUILTIN_RESULT.TYPE_INTEGER(CUSTOMRECORD_ALBERTA_NS_CONSIGNEE_RECORD.ID) AS cons_id,
                            BUILTIN_RESULT.TYPE_INTEGER(Location_SUB.id_join) AS loc_id
                        FROM
                            TRANSACTION,
                            CUSTOMRECORD_ALBERTA_NS_CONSIGNEE_RECORD,
                            (SELECT
                                 LOCATION.ID AS id_join,
                                 LocationMainAddress.city AS city
                             FROM
                                 LOCATION,
                                 LocationMainAddress
                             WHERE
                                 LOCATION.mainaddress = LocationMainAddress.nkey(+)
                            ) Location_SUB,
                            transactionLine
                        WHERE
                            (((transactionLine.custcol_consignee = CUSTOMRECORD_ALBERTA_NS_CONSIGNEE_RECORD.ID(+) AND transactionLine.LOCATION = Location_SUB.id_join(+)) AND TRANSACTION.ID = transactionLine.TRANSACTION))
                          AND ((TRANSACTION.ID IN ('${recObj.id}') AND NVL(transactionLine.mainline, 'F') = 'F' AND NVL(transactionLine.taxline, 'F') = 'F'))
                    `

                    var lineDetailsSqlRes = query.runSuiteQL({ query: lineDetailsSql }).asMappedResults();
                    lineDetailsSqlRes_byCons = groupBy(lineDetailsSqlRes, "cons_id")
                    lineDetailsSqlRes_byLoc = groupBy(lineDetailsSqlRes, "loc_id")
                    lineDetailsSqlRes_byCity_loc = groupByKeys(lineDetailsSqlRes, ["cons_city", "loc_id"])

                    log.debug("lineDetailsSqlRes_byCons", lineDetailsSqlRes_byCons);
                    log.debug("lineDetailsSqlRes_byCity_loc", lineDetailsSqlRes_byCity_loc);
                    log.debug("lineDetailsSqlRes_byLoc", lineDetailsSqlRes_byLoc);

                    var laneFiltersArray = [];
                    for(var city_loc in lineDetailsSqlRes_byCity_loc)
                    {
                        var consigneeCity = lineDetailsSqlRes_byCity_loc[city_loc][0].cons_city ? lineDetailsSqlRes_byCity_loc[city_loc][0].cons_city : header_consigneeCity;
                        var originWarehouse = lineDetailsSqlRes_byCity_loc[city_loc][0].loc_city ? lineDetailsSqlRes_byCity_loc[city_loc][0].loc_city : lineDetailsSqlRes_byLoc[header_originWarehouse].loc_city;
                        laneFiltersArray.push(
                            `(
                            ${ANC_lib.references.RECTYPES.lane.fields.originwarehousecity} = '${originWarehouse}'
                            AND ${ANC_lib.references.RECTYPES.lane.fields.destinationcity} = '${consigneeCity}'
                            )`
                        )
                    }

                    var laneFiltersStr = laneFiltersArray.join(" OR ");

                    //i need city_whsid
                    var laneSql = `
                        SELECT lane.id as lane_id,
                               lane.custrecord_anc_lane_destination as cons_id,
                               lane.custrecord_anc_lane_destinationcity as lane_destcity,
                               lane.custrecord_anc_lane_originwarehouse as lane_origloc,
                               lane.custrecord_anc_lane_originwarehousecity as lane_origcity,
                               
                               lane.custrecord_anc_lane_cdw as lane_xdockloc,
                               lane.custrecord_anc_lane_crossdockcity as lane_xdockcity,
                               lane.custrecord_anc_lane_cdtt as lane_xdocktt,
                               lane.custrecord_anc_lane_cdc as lane_xdockcost,
                               lane.custrecord_anc_lane_cde as lane_xdockeq,

                               lane.custrecord_anc_lane_lcpt as lane_lcpt,
                               lane.custrecord_anc_lane_lctt as lane_lctt,
                               lane.custrecord_anc_lane_lce as lane_lceq,


                               lane.custrecord_fttc as lane_fttc,
                               lane.custrecord_anc_lane_ftt as lane_ftt,
                               lane.custrecord_anc_lane_ftte as lane_ftteq,
                               
                               lane.custrecord_anc_lane_ltt as lane_ltt,
                               lane.custrecord_anc_crossdockeligible as lane_xdockelig,
                        FROM ${ANC_lib.references.RECTYPES.lane.id} as lane 
                        WHERE
                            lane.isinactive = 'F'
                        AND 
                            (${laneFiltersStr})
                    `

                    // SELECT lane.id FROM customrecord_anc_shippinglanes as lane JOIN customrecord_alberta_ns_consignee_record as cons ON cons.ID = lane.custrecord_anc_lane_destination WHERE lane.isinactive = 'F' AND ( lane.custrecord_anc_lane_originwarehouse = '215' AND cons.ID = 198816)

                    log.debug("determineLane laneSql", laneSql)
                    const laneSqlResults = query.runSuiteQL({ query: laneSql }).asMappedResults();

                    log.debug("laneSqlResults", laneSqlResults)


                    laneSqlResults_byCity_loc = groupByKeys(laneSqlResults, ["lane_destcity", "lane_origcity"]);

                    log.debug("laneSqlResults_byCity_loc", laneSqlResults_byCity_loc);

                    // log.debug("implementSF lineCount", lineCount)
                    // log.debug("implementSF ANC_lib.references", ANC_lib.references)
                    // var lineValList = [];
                    // var headerEntity = recObj.getValue({
                    //     fieldId : "entity"
                    // });
                    //
                    // var targetOriginLoc = recObj.getValue({
                    //     fieldId : "location"
                    // });
                    // var targetConsignee = recObj.getValue({
                    //     fieldId : "custbody_consignee"
                    // });
                    // var targetConsigneeCity = recObj.getValue({
                    //     fieldId : "custbody_consignee"
                    // });
                    //
                    for(var a = 0 ; a < lineCount ; a++)
                    {
                        var lineVals = {}
                        lineVals.consignee = recObj.getSublistValue({
                            sublistId : "item",
                            fieldId : ANC_lib.references.SO_COLUMNS.CONSIGNEE,
                            line : a
                        })
                        log.debug("RESOLVE LINE CONSIGNEE lineVals", lineVals)

                        lineVals.consigneeCity = lineDetailsSqlRes_byCons[""+lineVals.consignee][0].cons_city || header_consigneeCity;

                        // log.debug("RESOLVE LINE CONSIGNEE lineVals", {lineVals, byCons:lineDetailsSqlRes_byCons[""+lineVals.consignee], byCons_consCity:lineDetailsSqlRes_byCons[""+lineVals.consignee].cons_city, header_consigneeCity})

                        lineVals.location = recObj.getSublistValue({
                            sublistId : "item",
                            fieldId : "location",
                            line : a
                        })
                        lineVals.location = lineVals.location ? lineVals.location : header_originWarehouse;
                        lineVals.origincity = lineDetailsSqlRes_byLoc[""+lineVals.location][0].loc_city


                        var line_destCity_origloc = lineVals.consigneeCity + "_" + lineVals.origincity
                        log.debug("setting shippinglane index" + a, {a, line_destCity_origloc})
                        if(laneSqlResults_byCity_loc[line_destCity_origloc])
                        {


                            lineVals.optmethod = recObj.getSublistValue({
                                sublistId : "item",
                                fieldId : "custcol_anc_transitoptmethod",
                                line : a
                            })

                            var transitTime = "";
                            var xdockElig = laneSqlResults_byCity_loc[line_destCity_origloc][0].lane_xdockelig
                            var targetEquip = "";


                            var xdockCost = laneSqlResults_byCity_loc[line_destCity_origloc][0].lane_xdockcost;
                            var directLowestCost = laneSqlResults_byCity_loc[line_destCity_origloc][0].lane_lcpt
                            var lane_lceq = laneSqlResults_byCity_loc[line_destCity_origloc][0].lane_lceq
                            var lane_xdockeq = laneSqlResults_byCity_loc[line_destCity_origloc][0].lane_xdockeq
                            var lane_xdocktt = laneSqlResults_byCity_loc[line_destCity_origloc][0].lane_xdocktt
                            var lane_lctt = laneSqlResults_byCity_loc[line_destCity_origloc][0].lane_lctt
                            var xdock_direct_diff = xdockCost - directLowestCost;
                            //LOWEST COST
                            //BY DEFAULT LOWEST COSt, so if left blank then assume LOWEST COST
                            if(!lineVals.optmethod || lineVals.optmethod == 1)
                            {

                                log.debug("xdockElig", xdockElig)
                                //if you want fastest time, then you never look at cross docks - Mike, Rod
                                if(xdockElig && xdockElig != "F")
                                {

                                    //xdock attributes such as cost will be maintained by delivery planner, manually - Mike, Rod
                                    //it is manageable enough for the delivery planner - Mike, Rod
                                    //TODO no thresholds
                                    //xdock9 - direct10 = -1, if diff is under 0 then we want to use xdock cause it's cheaper
                                    log.debug("set usecrossdock = T", xdock_direct_diff)
                                    if(xdock_direct_diff < 0)
                                    {
                                        recObj.setSublistValue({
                                            sublistId : "item",
                                            fieldId : "custcol_anc_usecrossdock",
                                            line : a,
                                            value : true
                                        })
                                        log.debug("set custcol_anc_usecrossdock", "T")

                                        //only if xdock eq is defined
                                        if(lane_xdockeq)
                                        {
                                            recObj.setSublistValue({
                                                sublistId : "item",
                                                fieldId : "custcol_anc_equipment",
                                                line : a,
                                                value : lane_xdockeq
                                            })
                                            recObj.setSublistValue({
                                                sublistId : "item",
                                                fieldId : "custcol_anc_transittime",
                                                line : a,
                                                value : lane_xdocktt
                                            })
                                        }

                                        transitTime = lane_xdocktt
                                    }
                                    //xdock elig, but direct lowest cost is cheaper
                                    else
                                    {
                                        //only if direct lowest cost equip is defined
                                        if(lane_lceq)
                                        {
                                            recObj.setSublistValue({
                                                sublistId : "item",
                                                fieldId : "custcol_anc_equipment",
                                                line : a,
                                                value : lane_lceq
                                            })

                                            recObj.setSublistValue({
                                                sublistId : "item",
                                                fieldId : "custcol_anc_transittime",
                                                line : a,
                                                value : lane_lctt
                                            })

                                        }

                                        transitTime = lane_lctt
                                    }
                                }
                                //not xdock eligible, auto refer to direct lowest cost
                                else
                                {
                                    recObj.setSublistValue({
                                        sublistId : "item",
                                        fieldId : "custcol_anc_usecrossdock",
                                        line : a,
                                        value : false
                                    })
                                    //only if direct lowest cost equip is defined
                                    if(lane_lceq)
                                    {
                                        recObj.setSublistValue({
                                            sublistId : "item",
                                            fieldId : "custcol_anc_equipment",
                                            line : a,
                                            value : lane_lceq
                                        })
                                    }

                                    recObj.setSublistValue({
                                        sublistId : "item",
                                        fieldId : "custcol_anc_transittime",
                                        line : a,
                                        value : lane_lctt
                                    })

                                    transitTime = lane_lctt
                                }



                            }
                            else if(lineVals.optmethod == 2)
                            //FASTEST TRANSIT TIME
                            {
                                log.debug("FTT", laneSqlResults_byCity_loc);
                                //YOU DONT NEED TO LOOK AT XDOCKS, xdocks will never be faster - MIKE, ROD
                                //only if direct lowest cost equip is defined
                                var lane_ftteq = laneSqlResults_byCity_loc[line_destCity_origloc][0].lane_ftteq
                                var lane_ftt = laneSqlResults_byCity_loc[line_destCity_origloc][0].lane_ftt

                                recObj.setSublistValue({
                                    sublistId : "item",
                                    fieldId : "custcol_anc_usecrossdock",
                                    line : a,
                                    value : false
                                })

                                if(lane_ftteq)
                                {
                                    recObj.setSublistValue({
                                        sublistId : "item",
                                        fieldId : "custcol_anc_equipment",
                                        line : a,
                                        value : lane_ftteq
                                    })
                                }

                                recObj.setSublistValue({
                                    sublistId : "item",
                                    fieldId : "custcol_anc_transittime",
                                    line : a,
                                    value : lane_ftt
                                })

                                transitTime = lane_ftt
                            }

                            //TODO example , line 1 used to be 0403 deliver ship 0325, but should be 0403 - 2 days = 0401
                            var newShipDate = "";
                            var newProductionDate = "";
                            var newLdcDate = "";
                            var deliverydate = recObj.getSublistValue({
                                sublistId : "item",
                                fieldId : ANC_lib.references.SO_COLUMNS.DELIVERYDATE,
                                line : a
                            });
                            var ldcDate = recObj.getSublistValue({
                                sublistId : "item",
                                fieldId : ANC_lib.references.SO_COLUMNS.DELIVERYDATE,
                                line : a
                            });
                            //need deep copies
                            var deliverydate_forprod = recObj.getSublistValue({
                                sublistId : "item",
                                fieldId : ANC_lib.references.SO_COLUMNS.DELIVERYDATE,
                                line : a
                            });
                            log.debug("raw deliverydate", deliverydate)
                            log.debug("raw deliverydate_forprod", deliverydate_forprod)
                            log.debug("transitTime", transitTime)

                            if(deliverydate)
                            {
                                deliverydate = new Date(deliverydate);
                                if(typeof deliverydate == "object")
                                {
                                    newShipDate = deliverydate.setDate(deliverydate.getDate() - transitTime)
                                    newProductionDate = deliverydate_forprod.setDate(deliverydate_forprod.getDate() - transitTime - 1)

                                    newLdcDate = new Date(newShipDate);
                                    newLdcDate = newLdcDate.setDate(newLdcDate.getDate() - custbody_anc_ldc)
                                }
                                else
                                {
                                    newShipDate = new Date(deliverydate).setDate(deliverydate.getDate() - transitTime)
                                    newProductionDate = new Date(deliverydate_forprod).setDate(deliverydate_forprod.getDate() - transitTime - 1)

                                    newLdcDate = new Date(newShipDate);
                                    newLdcDate = newLdcDate.setDate(newLdcDate.getDate() - custbody_anc_ldc)
                                }
                                newShipDate = (typeof newShipDate) != "object" ? new Date(newShipDate) : newShipDate;
                                newProductionDate = (typeof newProductionDate) != "object" ? new Date(newProductionDate) : newProductionDate;
                                newLdcDate = (typeof newLdcDate) != "object" ? new Date(newLdcDate) : newLdcDate;

                                var newShipDate = format.format({
                                    value: newShipDate,
                                    type: format.Type.DATE
                                });

                                var newProductionDate = format.format({
                                    value: newProductionDate,
                                    type: format.Type.DATE
                                });

                                var newLdcDate = format.format({
                                    value: newLdcDate,
                                    type: format.Type.DATE
                                });

                                log.debug("newProductionDate", newProductionDate);
                                log.debug("newShipDate", newShipDate);
                                log.debug("newLdcDate", newLdcDate);
                                // transitTime
                                //update shipdate
                                if(newShipDate)
                                {
                                    recObj.setSublistText({
                                        sublistId : "item",
                                        fieldId : "custcol_anc_shipdate",
                                        line : a,
                                        // value : newShipDate,
                                        text : newShipDate
                                    })
                                }
                                if(newProductionDate)
                                {
                                    recObj.setSublistText({
                                        sublistId : "item",
                                        fieldId : "custcol_anc_productiondate",
                                        line : a,
                                        // value : newProductionDate,
                                        text : newProductionDate
                                    })
                                }

                                //06012025
                                if(newLdcDate)
                                {
                                    recObj.setSublistText({
                                        sublistId : "item",
                                        fieldId : "custcol_anc_ldcdate",
                                        line : a,
                                        // value : newLdcDate,
                                        text : newLdcDate
                                    })
                                }
                            }





                            doSaveAfterSubmit = true;
                            log.debug("attempt to set line " + a, {a, lane_id : laneSqlResults_byCity_loc[line_destCity_origloc][0].lane_id})

                            log.debug("lineVals", lineVals)


                            recObj.setSublistValue({
                                sublistId : "item",
                                fieldId : "custcol_anc_shippinglane",
                                line : a,
                                value : laneSqlResults_byCity_loc[line_destCity_origloc][0].lane_id
                            })
                            // recObj.setSublistValue({
                            //     sublistId : "item",
                            //     fieldId : "custcol_anc_shippinglane",
                            //     line : a,
                            //     value : ""
                            // })
                            log.debug("successfully set")

                        }
                    }
                    // log.debug("lineValList", lineValList);
                    //
                    //
                    // var compositeKeyResults = ANC_lib.getRelatedForecasts(recObj.id, lineValList)
                    // log.debug("implementSF compositeKeyResults", compositeKeyResults);
                    // var SF_RESULTSBYCOMPOSITEKEY = compositeKeyResults.groupedByCompositekey;
                    //
                    //
                    // //TODO you can optimize this because it performs another loop that it already had.
                    // for(var a = 0 ; a < lineCount ; a++)
                    // {
                    //     var lineVals = {}
                    //     lineVals.customer = headerEntity;
                    //     lineVals.grade = recObj.getSublistValue({
                    //         sublistId : "item",
                    //         fieldId : ANC_lib.references.SO_COLUMNS.GRADE,
                    //         line : a
                    //     })
                    //     lineVals.consignee = recObj.getSublistValue({
                    //         sublistId : "item",
                    //         fieldId : ANC_lib.references.SO_COLUMNS.CONSIGNEE,
                    //         line : a
                    //     })
                    //     lineVals.deliverydate = recObj.getSublistValue({
                    //         sublistId : "item",
                    //         fieldId : ANC_lib.references.SO_COLUMNS.DELIVERYDATE,
                    //         line : a
                    //     })
                    //     lineVals.month = lineVals.deliverydate ? (new Date(lineVals.deliverydate).getMonth())+ 1 : (new Date().getMonth()) + 1;
                    //     lineVals.year = lineVals.deliverydate ? new Date(lineVals.deliverydate).getFullYear() : new Date().getFullYear();
                    //
                    //     //TODO if not in yearmapping then refrain from proceeding, just from the start, dont waste effort if year is not mapped.
                    //     // you have a defaulting anyway so year will always be mapped, but what if its's 2051?!?!?
                    //     var lineCompositeKey = `${lineVals.customer}_${lineVals.consignee}_${lineVals.grade}_${lineVals.month}_${yearMapping[lineVals.year]}`;
                    //
                    //     log.debug("setting SF COLUMN lineCompositeKey", lineCompositeKey);
                    //     // log.debug("setting SF COLUMN SF_RESULTSBYCOMPOSITEKEY[lineCompositeKey].sf_id", SF_RESULTSBYCOMPOSITEKEY[lineCompositeKey].sf_id);
                    //     if(SF_RESULTSBYCOMPOSITEKEY[lineCompositeKey])
                    //     {
                    //         if(SF_RESULTSBYCOMPOSITEKEY[lineCompositeKey].sf_id) {
                    //             recObj.setSublistValue({
                    //                 sublistId: "item",
                    //                 fieldId: ANC_lib.references.SO_COLUMNS.SALESFORECAST,
                    //                 line: a,
                    //                 value: SF_RESULTSBYCOMPOSITEKEY[lineCompositeKey].sf_id
                    //             })
                    //
                    //             doSaveAfterSubmit = true;
                    //         }
                    //         else
                    //         {
                    //             recObj.setSublistValue({
                    //                 sublistId: "item",
                    //                 fieldId: ANC_lib.references.SO_COLUMNS.SALESFORECAST,
                    //                 line: a,
                    //                 value: ""
                    //             })
                    //
                    //             doSaveAfterSubmit = true;
                    //         }
                    //     }
                    //     else
                    //     {
                    //         recObj.setSublistValue({
                    //             sublistId: "item",
                    //             fieldId: ANC_lib.references.SO_COLUMNS.SALESFORECAST,
                    //             line: a,
                    //             value: ""
                    //         })
                    //
                    //         doSaveAfterSubmit = true;
                    //     }
                    //
                    //
                    //
                    // }
                    // log.debug("lineValList", lineValList);

                }
            }
            catch(e)
            {
                log.error("ERROR in funtion determineLane", e)
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

        function implementShipCap(recObj)
        {
            var doImplement = true;
            yearMapping = ANC_lib.yearMapping;


            try
            {
                if(doImplement)
                {
                    var lineCount = recObj.getLineCount({
                        sublistId : "item"
                    });

                    log.debug("implementShipCap lineCount", lineCount)
                    log.debug("implementShipCap ANC_lib.references", ANC_lib.references)
                    var lineValList = [];
                    var headerEntity = recObj.getValue({
                        fieldId : "entity"
                    })
                    log.debug("lineVals after entity", headerEntity)
                    var headerLocation = recObj.getValue({
                        fieldId : "location"
                    })
                    log.debug("lineVals after location", headerLocation)

                    for(var a = 0 ; a < lineCount ; a++)
                    {
                        var lineVals = {}

                        log.debug("lineVals after lineVals declared", lineVals)

                        lineVals.shipdate = recObj.getSublistValue({
                            sublistId : "item",
                            fieldId : ANC_lib.references.SO_COLUMNS.SHIPDATE || "custcol_anc_shipdate",
                            line : a
                        });

                        lineVals.shipdate = format.format({
                            value: lineVals.shipdate,
                            type: format.Type.DATE
                        });

                        log.debug("lineVals after shipdate", lineVals)
                        lineVals.location = recObj.getSublistValue({
                            sublistId : "item",
                            fieldId : "location",
                            line : a
                        }) || headerLocation;
                        log.debug("lineVals after location", lineVals)
                        lineValList.push(lineVals);
                    }
                    log.debug("lineValList", lineValList);


                    var compositeKeyResults = ANC_lib.getRelatedShipCap(recObj.id, lineValList)
                    log.debug("implementShipCap compositeKeyResults", compositeKeyResults);
                    var RESULTSBYCOMPOSITEKEY = compositeKeyResults.groupedByCompositekey;


                    //TODO you can optimize this because it performs another loop that it already had.
                    for(var a = 0 ; a < lineCount ; a++)
                    {
                        var lineVals = {}
                        lineVals.shipdate = recObj.getSublistValue({
                            sublistId : "item",
                            fieldId : ANC_lib.references.SO_COLUMNS.SHIPDATE || "custcol_anc_shipdate",
                            line : a
                        });
                        lineVals.location = recObj.getSublistValue({
                            sublistId : "item",
                            fieldId : "location",
                            line : a
                        }) || headerLocation;

                        lineVals.shipdate = format.format({
                            value: lineVals.shipdate,
                            type: format.Type.DATE
                        });

                        //TODO if not in yearmapping then refrain from proceeding, just from the start, dont waste effort if year is not mapped.
                        // you have a defaulting anyway so year will always be mapped, but what if its's 2051?!?!?
                        var lineCompositeKey = `${lineVals.location}_${lineVals.shipdate}`;

                        log.debug("setting SC COLUMN lineCompositeKey", lineCompositeKey);
                        // log.debug("setting SF COLUMN SF_RESULTSBYCOMPOSITEKEY[lineCompositeKey].sf_id", SF_RESULTSBYCOMPOSITEKEY[lineCompositeKey].sf_id);
                        if(RESULTSBYCOMPOSITEKEY[lineCompositeKey])
                        {
                            if(RESULTSBYCOMPOSITEKEY[lineCompositeKey].sc_id) {
                                recObj.setSublistValue({
                                    sublistId: "item",
                                    fieldId: ANC_lib.references.SO_COLUMNS.SHIPMENTCAPACITY,
                                    line: a,
                                    value: RESULTSBYCOMPOSITEKEY[lineCompositeKey].sc_id
                                })

                                doSaveAfterSubmit = true;
                            }
                            else
                            {
                                recObj.setSublistValue({
                                    sublistId: "item",
                                    fieldId: ANC_lib.references.SO_COLUMNS.SHIPMENTCAPACITY,
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
                                fieldId: ANC_lib.references.SO_COLUMNS.SHIPMENTCAPACITY,
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
                log.error("ERROR in funtion implementShipCap", e)
            }
        }

        //TODo
        function implementProdCap(recObj)
        {
            var doImplement = true;
            yearMapping = ANC_lib.yearMapping;


            try
            {
                if(doImplement)
                {
                    var lineCount = recObj.getLineCount({
                        sublistId : "item"
                    });

                    log.debug("implementProdCap lineCount", lineCount)
                    log.debug("implementProdCap ANC_lib.references", ANC_lib.references)
                    var lineValList = [];

                    for(var a = 0 ; a < lineCount ; a++)
                    {
                        var lineVals = {}

                        log.debug("implementProdCap lineVals after lineVals declared", lineVals)

                        lineVals.productiondate = recObj.getSublistValue({
                            sublistId : "item",
                            fieldId : ANC_lib.references.SO_COLUMNS.PRODUCTIONDATE || "custcol_anc_productiondate",
                            line : a
                        });

                        lineVals.productiondate_date = new Date(lineVals.productiondate);
                        lineVals.productiondate = `${new Date(lineVals.productiondate_date).getFullYear()}-${new Date(lineVals.productiondate_date).getMonth()+1}-${new Date(lineVals.productiondate_date).getDate()}`

                        // lineVals.productiondate = format.format({
                        //     value: lineVals.productiondate,
                        //     type: format.Type.DATE
                        // });
                        log.debug("implementProdCap lineVals after productiondate", lineVals)
                        lineValList.push(lineVals);
                    }
                    log.debug("implementProdCap lineValList", lineValList);


                    var compositeKeyResults = ANC_lib.getRelatedProdCap(recObj.id, lineValList)
                    log.debug("implementProdCap compositeKeyResults", compositeKeyResults);
                    // var RESULTSBYCOMPOSITEKEY = compositeKeyResults.groupedByCompositekey;


                    //TODO you can optimize this because it performs another loop that it already had.
                    for(var a = 0 ; a < lineCount ; a++)
                    {
                        var lineVals = {}
                        lineVals.productiondate = recObj.getSublistValue({
                            sublistId : "item",
                            fieldId : ANC_lib.references.SO_COLUMNS.PRODUCTIONDATE || "custcol_anc_productiondate",
                            line : a
                        });

                        // lineVals.productiondate = format.format({
                        //     value: lineVals.productiondate,
                        //     type: format.Type.DATE
                        // });

                        var prodDate_dateObj = new Date(lineVals.productiondate)
                        log.debug("prodDate_dateObj", prodDate_dateObj);

                        var existingWeeklyProdCaps = compositeKeyResults.filter(function(elem){
                            var startDate = new Date(elem.weekstartdate);
                            var endDate = new Date(elem.weekenddate);
                            log.debug("{prodDate_dateObj,startDate,endDate}", {prodDate_dateObj,startDate,endDate})
                            log.debug("(startDate <= prodDate_dateObj && endDate >= prodDate_dateObj)", (startDate <= prodDate_dateObj && endDate >= prodDate_dateObj))
                            if(startDate <= prodDate_dateObj && endDate >= prodDate_dateObj)
                            {
                                return true;
                            }
                            else
                            {
                                return false;
                            }
                        });
                        log.debug("existingWeeklyProdCaps", existingWeeklyProdCaps)

                        if(existingWeeklyProdCaps.length > 0)
                        {
                            recObj.setSublistValue({
                                sublistId: "item",
                                fieldId: ANC_lib.references.SO_COLUMNS.PRODUCTIONCAPACITYWEEK,
                                line: a,
                                value: existingWeeklyProdCaps[0].id
                            });

                            log.debug(`LINE ${a} PRODCAP set to`, existingWeeklyProdCaps[0].id)
                        }



                    }
                    log.debug("lineValList", lineValList);

                }
            }
            catch(e)
            {
                log.error("ERROR in funtion implementShipCap", e)
            }
        }



        return {beforeLoad, beforeSubmit, afterSubmit}

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
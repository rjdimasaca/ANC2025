/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 *
 * Author       :       Rodmar Dimasaca / rod@joycloud.solutions / netrodsuite@gmail.com
 * Description  :       For ANC
 * File Name    :       ANC_UE_MINIMIZE_UI.js
 * Script Name  :       ANC UE MINIMIZE UI
 * Script Id    :       customscript_ue_minimize_ui
 * Deployment Id:       customdeploy_ue_minimize_ui
 * API Version  :       2.1
 * version      :       1.0.0
 *
 */
define(['/SuiteScripts/ANC_lib.js', 'N/https', 'N/record', 'N/runtime', 'N/ui/dialog', 'N/ui/message', 'N/ui/serverWidget', 'N/url'],
    /**
 * @param{https} https
 * @param{record} record
 * @param{runtime} runtime
 * @param{dialog} dialog
 * @param{message} message
 * @param{serverWidget} serverWidget
 * @param{url} url
 */
    (ANC_lib, https, record, runtime, dialog, message, serverWidget, url) => {
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
                elemList = ANC_lib.MINIMIZE_UI.elemList;
                hideColumns(scriptContext);
                addElements(scriptContext);
            }
            catch(e)
            {
                log.error("ERROR in function beforeLoad", e);
            }
        }

        function hideColumns(scriptContext)
        {
            try
            {
                if(scriptContext.type == "view")
                {
                    var columnsToHide = ["options","rate","amount","taxrate1","taxrate2","shipaddress", "shippingaddress", "shippingaddress_key", "shipaddress_display", "shippingcarrier", "shipcarrier", "shipcarrier_display", "shipgroup", "shipmethod", "shipvia", "shippingmethod", "shipping_method"];
                    // var columnsToHide = ["options"];
                    // var columnsToHide = ["options","rate","amount","taxrate1","taxrate2"];

                    for(var a = 0 ; a < columnsToHide.length ; a++)
                    {
                        try
                        {
                            var targetFieldObj = scriptContext.form.getSublist({id: 'item'}).getField({id: columnsToHide[a]});

                            if(targetFieldObj)
                            {
                                targetFieldObj.updateDisplayType({
                                    displayType : "hidden"
                                })

                                log.debug("targetFieldObj to hide" + columnsToHide[a], targetFieldObj)
                            }
                        }
                        catch(e_hidecol)
                        {
                            log.error("CANNOT HIDE COLUMN " + columnsToHide[a], e_hidecol)
                        }
                    }

                }
            }
            catch(e)
            {
                log.error("ERROR in function hideColumns", e)
            }
        }

        //TODO MOVE TO LIBRARY
        var elemList = [];

        const addElements = (scriptContext) => {
            try
            {
                var lineUrls = [];
                if (scriptContext.type == "view" /*|| scriptContext.type == "edit"*/) {


                    elemList = elemList.sort(function(a,b){
                        return b.position - a.position
                    })


                    for(var j = 0 ; j < elemList.length; j++)
                    {
                        lineUrls = [];
                        var groupElem = elemList[j];

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

                        if(groupElem.addtlParams)
                        {
                            base_fitmentAndReserveUiUrl += groupElem.addtlParams
                        }

                        var lineCount = scriptContext.newRecord.getLineCount({
                            sublistId : "item"
                        })

                        for(var a = 0  ; a < lineCount ; a++)
                        {
                            // var lastSubstituteId = scriptContext.newRecord.getSublistValue({sublistId : "item", fieldId : "custcol_r8l_itemsubstitution", line : a})
                            var doMinimizeUi = true;


                            if(doMinimizeUi)
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
                                    
                                    window["lineUrl_${groupElem.name}" + index] = lineUrls[index]
                                
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
                                            // newTdHtml = '<td class="minimize_ui_elem_td0${groupElem.name}" align="center"><p>${groupElem.rowTitle}<br/><img width="${groupElem.iconWidth}" height="${groupElem.iconHeight}" src="${groupElem.icon}" style="cursor: pointer;" onclick="window.open(window.lineUrl_${groupElem.name}';
                                            //
                                            // newTdHtml += (index-1) + ', \\'popupWindow\\', \\'width=700,height=700,scrollbars=yes\\'); return false;" alt="Click to open popup"></p></td>'
                                            
                                            newTdHtml = '<td class="minimize_ui_elem_td0${groupElem.name}" align="center"><img width="${groupElem.iconWidth}" height="${groupElem.iconHeight}" src="${groupElem.icon}" style="cursor: pointer;" onclick="window.open(window.lineUrl_${groupElem.name}';
                                    
                                            // newTdHtml += (index-1) + ',' + "'" + (index-1) + 'popupWindow${groupElem.name},' + ' \\'popupWindow${groupElem.name}\\', \\'width=700,height=700,scrollbars=yes\\'); return false;" alt="Click to open popup"></td>'
                                            newTdHtml += (index-1) + ',' + "'" + "popupWindow${groupElem.name}" + (index-1) + "'," + ' \\'width=700,height=700,scrollbars=yes\\'); return false;" alt="Click to open popup"></td>'
                                
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
                            
                        });
                        </script>
                        `

                        var inlineHtmlField = scriptContext.form.addField({
                            id: "custpage_anc_minimize_ui_html" + j,
                            type: "inlinehtml",
                            label: "ANC Minimize UI HTML" + j
                        });

                        inlineHtmlField.defaultValue = inlineHtmlFieldValue;

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

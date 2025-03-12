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
define(['N/https', 'N/record', 'N/runtime', 'N/ui/dialog', 'N/ui/message', 'N/ui/serverWidget', 'N/url'],
    /**
 * @param{https} https
 * @param{record} record
 * @param{runtime} runtime
 * @param{dialog} dialog
 * @param{message} message
 * @param{serverWidget} serverWidget
 * @param{url} url
 */
    (https, record, runtime, dialog, message, serverWidget, url) => {
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
                    var columnsToHide = ["options","taxrate1","taxrate2","taxrate2", "shipaddress", "shippingaddress", "shippingaddress_key", "shipaddress_display", "shippingcarrier", "shipcarrier", "shipcarrier_display", "shipgroup", "shipmethod", "shipvia", "shippingmethod", "shipping_method"];
                    // var columnsToHide = ["options"];

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
        var elemList = [
            {
                name : "warehouse_and_logistics",
                list : [],
                title : "Logistics",
                icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG",
                properties : [

                ],
                tdElemHtml : [
                    `<td align="center"><p>Logistics<br/><img width="75px" height="75px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,

                    ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
                ],
                targetScriptId : "customscript_anc_sl_minimize_ui",
                targetDeploymentId : "customdeploy_anc_sl_minimize_ui",
                headerTitle : "Logistics",
                rowTitle : "Logistics",
                iconWidth : "50px",
                iconHeight : "50px",
                position : 10,
                addtlParams : "&minimizeui=warehouse_and_logistics"
            },
            {
                name : "orderquantity_and_inventorystatus",
                list : [],
                title : "Inventory",
                icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203538&c=1116623_SB2&h=GBFNo186_VXtycKD8lQ8h1BqLzd9c6FG3wq_rEZNvsLpQU9N",
                properties : [

                ],
                tdElemHtml : [
                    `<td align="center"><p>Qty&Status<br/><img width="75px" height="75px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,

                    ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
                ],
                targetScriptId : "customscript_anc_sl_minimize_ui",
                targetDeploymentId : "customdeploy_anc_sl_minimize_ui",
                headerTitle : "Inventory",
                rowTitle : "Qty<br/>Status",
                iconWidth : "50px",
                iconHeight : "50px",
                position : 10,
                addtlParams : "&minimizeui=orderquantity_and_inventorystatus"
            },
            {
                name : "product_and_packaging",
                list : [],
                title : "Packaging",
                icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203539&c=1116623_SB2&h=Al2AWzDaC39Xoch4LmAX2-WdvZ-DGfERnRBArgrJctLb72QV",
                properties : [

                ],
                tdElemHtml : [
                    `<td align="center"><p>Product<br/>&<br/>Packaging<img width="75px" height="75px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,

                    ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
                ],
                targetScriptId : "customscript_anc_sl_minimize_ui",
                targetDeploymentId : "customdeploy_anc_sl_minimize_ui",
                headerTitle : "Packaging",
                rowTitle : "Packaging",
                iconWidth : "50px",
                iconHeight : "50px",
                position : 10,
                addtlParams : "&minimizeui=product_and_packaging"
            },
            {
                name : "customer_and_shipping_information",
                list : [],
                title : "Customer & Shipping Information",
                icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203540&c=1116623_SB2&h=qADtKTHIw11x-nfVLN4KLPPcRqNKm5HmGa960KpNFbYInydL",
                properties : [

                ],
                tdElemHtml : [
                    `<td align="center"><p>Product<br/>&<br/>Packaging<img width="75px" height="75px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,

                    ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
                ],
                targetScriptId : "customscript_anc_sl_minimize_ui",
                targetDeploymentId : "customdeploy_anc_sl_minimize_ui",
                headerTitle : "Shipping",
                rowTitle : "Shipping",
                iconWidth : "50px",
                iconHeight : "50px",
                position : 10,
                addtlParams : "&minimizeui=customer_and_shipping"
            },
            {
                name : "graderun_reservation",
                list : [],
                title : "Grade Run Reservation",
                icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203558&c=1116623_SB2&h=pD37UzYzvN7o6bv03_Q0xtV7QvmUzmLnabI8wV-cDD8Qj-Hx",
                // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203556&c=1116623_SB2&h=9LRWts-XaNsvfWEGThTpxop3PPh_vw9a5NL8XkmR0s-IMKXQ",
                // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203552&c=1116623_SB2&h=MN-utZwPfu8HdYVArnZgof3D9B7h0I8-zrYC9jESuG41PgRG",
                // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203548&c=1116623_SB2&h=bmBfsZKAzX1cWJW3k6JWscc898dfKvCqn4-HlAnnSmEdv9b-",
                // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203546&c=1116623_SB2&h=b78Hwg-A3GdVaZkoRGhCGPfUdZ-46PpS4e87hlLXZCd31zlg",
                // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203547&c=1116623_SB2&h=T3_gjlsgsuFfQOjmnJ88n0duN5T6UHxs17J4UTxsfshVHFn0",
                properties : [

                ],
                tdElemHtml : [
                    `<td align="center"><p><img width="100px" height="100px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,

                    ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
                ],
                targetScriptId : "customscript_anc_sl_salesprocesses",
                targetDeploymentId : "customdeploy_anc_sl_salesprocesses",
                headerTitle : "Grade Run<br/>Reservation",
                rowTitle : "",
                iconWidth : "50px",
                iconHeight : "50px",
                position : 0,
                addtlParams : "&processid=grreservation"
            },
            {
                name : "scheduling_and_keydates",
                list : [],
                title : "Key Dates",
                icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203556&c=1116623_SB2&h=9LRWts-XaNsvfWEGThTpxop3PPh_vw9a5NL8XkmR0s-IMKXQ",
                // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203552&c=1116623_SB2&h=MN-utZwPfu8HdYVArnZgof3D9B7h0I8-zrYC9jESuG41PgRG",
                // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203548&c=1116623_SB2&h=bmBfsZKAzX1cWJW3k6JWscc898dfKvCqn4-HlAnnSmEdv9b-",
                // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203546&c=1116623_SB2&h=b78Hwg-A3GdVaZkoRGhCGPfUdZ-46PpS4e87hlLXZCd31zlg",
                // icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203547&c=1116623_SB2&h=T3_gjlsgsuFfQOjmnJ88n0duN5T6UHxs17J4UTxsfshVHFn0",
                properties : [

                ],
                tdElemHtml : [
                    `<td align="center"><p><img width="100px" height="100px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,

                    ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
                ],
                targetScriptId : "customscript_anc_sl_minimize_ui",
                targetDeploymentId : "customdeploy_anc_sl_minimize_ui",
                headerTitle : "Key Dates",
                rowTitle : "",
                iconWidth : "50px",
                iconHeight : "50px",
                position : 10,
                addtlParams : "&minimizeui=scheduling_and_keydates"
            },
            // {
            //     name : "fitment_check",
            //     list : [],
            //     title : "Fitment Check",
            //     icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203554&c=1116623_SB2&h=kTJFfuyMLg3xSqJ3X2VCVHc9OqW4GxxNPE8KEga83kzlgzYJ",
            //     properties : [
            //
            //     ],
            //     tdElemHtml : [
            //         `<td align="center"><p>Product<br/>&<br/>Packaging<img width="75px" height="75px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,
            //
            //         ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
            //     ],
            //     // tdElementStart:`<td class="minimize_ui_elem_td0TEST" align="center"><p>TEST1<br/><img width="25px" height="25px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203519&c=1116623_SB2&h=LtlOhAYTLDyMXRBethELwZMrys0xDpb03GNVp9glCEtxUR3q" style="cursor: pointer;" onclick="nlExtOpenWindow(window.lineUrl_`,
            //     // tdElementEnd:`', 'childdrecord', 700, 700, this, true,'');</p></td>`,
            //     // tdElementStart:'<td class="minimize_ui_elem_td0fitment_check" align="center"><p>Fitment<br/>Check<br/><img width="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203540&c=1116623_SB2&h=qADtKTHIw11x-nfVLN4KLPPcRqNKm5HmGa960KpNFbYInydL" height="25px" src="25px" style="cursor: pointer;" onclick="window.open(window.lineUrl_',
            //     // tdElementEnd:', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>',
            //
            //
            //     targetScriptId : "customscript_anc_sl_fitmentchecking",
            //     targetDeploymentId : "customdeploy_anc_sl_fitmentchecking",
            //     headerTitle : "Fitment<br/>Check",
            //     rowTitle : "",
            //     iconWidth : "50px",
            //     iconHeight : "50px",
            //     position : 15,
            //     addtlParams : ""
            // }




        ]

        const addElements = (scriptContext) => {
            try
            {
                var lineUrls = [];
                if (scriptContext.type == "view" /*|| scriptContext.type == "edit"*/) {
                    // var elemList = [
                    //     {
                    //         warehouse_and_logistics : {
                    //             list : [],
                    //             title : "W&L",
                    //             icon : "https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG",
                    //             properties : [
                    //
                    //             ],
                    //             tdElemHtml : [
                    //                 `<td align="center"><p>W&L<br/><img width="75px" height="75px" src="https://1116623-sb2.app.netsuite.com/core/media/media.nl?id=9203525&c=1116623_SB2&h=2o0tcA7GgL-Ks2Zfeomc6r_d4v-ly5uw_wONtpN70kpJzyuG" style="cursor: pointer;" onclick="window.open(window.lineUrl_`,
                    //
                    //                 ', \'popupWindow\', \'width=700,height=700,scrollbars=yes\'); return false;" alt="Click to open popup"></p></td>'
                    //             ]
                    //         }
                    //     }
                    // ]

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

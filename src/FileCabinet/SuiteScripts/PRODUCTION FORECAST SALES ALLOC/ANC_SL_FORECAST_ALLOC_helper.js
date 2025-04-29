/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/query', 'N/record'], (query, record) => {
    const onRequest = (context) => {


        log.debug("context",context)
        log.debug("context.request",context.request)
        log.debug("body",context.request.body)
        log.debug("parameters",context.request.parameters)


        var groupedByYear = {};
        if(context.request.parameters.submitdata=="T")
        {
            var reqBodyObj = JSON.parse(context.request.body);
            for(var compositeKey in reqBodyObj.compositeKeys)
            {
                var compositeKeyBreakdown = compositeKey.split("_");

                var yearInternalId = compositeKeyBreakdown[0]
                var monthInternalId = compositeKeyBreakdown[1]
                var customerInternalId = compositeKeyBreakdown[2]
                var consigneeInternalId = compositeKeyBreakdown[3]
                var gradeInternalId = compositeKeyBreakdown[4]
                var qty = reqBodyObj.compositeKeys[compositeKey]

                var compositeObj ={};
                compositeObj[compositeKey] = reqBodyObj.compositeKeys[compositeKey]

                if(groupedByYear[yearInternalId])
                {
                    groupedByYear[yearInternalId].entries.push(compositeObj)
                    groupedByYear[yearInternalId].byKeys[compositeKey] = {
                        qty : qty,
                        colVals : {
                            monthInternalId,
                            customerInternalId,
                            consigneeInternalId,
                            gradeInternalId,
                            qty
                        }
                    }
                }
                else
                {
                    groupedByYear[yearInternalId] = {
                        entries : [
                            compositeObj
                        ]
                    }
                    groupedByYear[yearInternalId].byKeys = {}
                    groupedByYear[yearInternalId].byKeys[compositeKey] = {
                        qty : qty,
                        colVals : {
                            monthInternalId,
                            customerInternalId,
                            consigneeInternalId,
                            gradeInternalId,
                            qty
                        }
                    }
                    // groupedByYear[yearInternalId].entries.push(compositeKeyBreakdown)
                }
            }

            log.debug("groupedByYear", groupedByYear);


            for(var yearId in groupedByYear)
            {
                var yearRecObj = record.load({
                    type : "customrecord_anc_pf_years",
                    id : yearId
                })

                // for(var a = 0 ; a < groupedByYear[yearId].entries.length ; a++)
                // {
                //     yearRecObj.findSublistLineWithValue({
                //         sublistId : "recmachcustrecord_anc_pf_year",
                //         fieldId : "custrecord_anc_pf_compositekey",
                //         value : groupedByYear[yearId].entries[a].
                //     })
                // }

                var newLineIndex = yearRecObj.getLineCount({
                    sublistId : "recmachcustrecord_anc_pf_year",
                })
                for(var compositeKeys in groupedByYear[yearId].byKeys)
                {
                    var targetIndex = yearRecObj.findSublistLineWithValue({
                        sublistId : "recmachcustrecord_anc_pf_year",
                        fieldId : "custrecord_anc_pf_compositekey",
                        value : compositeKeys
                    });

                    if(targetIndex > -1)
                    {
                        yearRecObj.setSublistValue({
                            sublistId : "recmachcustrecord_anc_pf_year",
                            fieldId : "custrecord_anc_pf_allocation",
                            line : targetIndex,
                            value : groupedByYear[yearId].byKeys[compositeKeys].qty
                        })
                    }
                    else
                    {
                        log.debug("it does not exist yet? then add it then!")

                        yearRecObj.setSublistValue({
                            sublistId : "recmachcustrecord_anc_pf_year",
                            fieldId : "custrecord_anc_pf_month",
                            line : newLineIndex,
                            value : groupedByYear[yearId].byKeys[compositeKeys].colVals.monthInternalId
                        })
                        yearRecObj.setSublistValue({
                            sublistId : "recmachcustrecord_anc_pf_year",
                            fieldId : "custrecord_anc_pf_customer",
                            line : newLineIndex,
                            value : groupedByYear[yearId].byKeys[compositeKeys].colVals.customerInternalId
                        })
                        yearRecObj.setSublistValue({
                            sublistId : "recmachcustrecord_anc_pf_year",
                            fieldId : "custrecord_anc_pf_consignee",
                            line : newLineIndex,
                            value : groupedByYear[yearId].byKeys[compositeKeys].colVals.consigneeInternalId
                        })
                        yearRecObj.setSublistValue({
                            sublistId : "recmachcustrecord_anc_pf_year",
                            fieldId : "custrecord_anc_pf_grade",
                            line : newLineIndex,
                            value : groupedByYear[yearId].byKeys[compositeKeys].colVals.gradeInternalId
                        })
                        yearRecObj.setSublistValue({
                            sublistId : "recmachcustrecord_anc_pf_year",
                            fieldId : "custrecord_anc_pf_allocation",
                            line : newLineIndex,
                            value : groupedByYear[yearId].byKeys[compositeKeys].colVals.qty
                        })
                        yearRecObj.setSublistValue({
                            sublistId : "recmachcustrecord_anc_pf_year",
                            fieldId : "custrecord_anc_pf_compositekey",
                            line : newLineIndex,
                            value : compositeKeys
                        })
                        newLineIndex++;
                    }
                }

                var submittedYearRecId = yearRecObj.save({
                    ignoreMandatoryFields : true,
                    enableSourcing : true
                });

                log.debug("submittedYearRecId", submittedYearRecId);
            }

            context.response.write(JSON.stringify(groupedByYear)); // Return data as JSON
        }
        else
        {
            const customerConsigneeSql = `
            SELECT
                cust.id AS customer_id,
                cust.entityid AS customer_name,
                con.id AS consignee_id,
                con.name AS consignee_name,
                parent.entityid AS parent_entityid
            FROM customer cust
                     JOIN customrecord_alberta_ns_consignee_record con
                          ON con.custrecord_alberta_ns_customer = cust.id
                     JOIN customersubsidiaryrelationship csr ON csr.entity = cust.ID
                     JOIN customer parent ON parent.ID = cust.parent
            WHERE cust.isinactive='F' AND con.isinactive='F' AND csr.subsidiary=5
        `;
            const itemSql = `
            SELECT itemid, id,  FROM item
            WHERE isserialitem='T'
              AND
                parent IS NULL
              AND
                isinactive = 'F'
              AND
                matrixtype = 'PARENT'
        `;
            const monthSql = `SELECT id, name FROM customrecord_anc_pf_months`;
            const yearSql = `SELECT id, name FROM customrecord_anc_pf_years WHERE name='2024' OR name='2025'`;

            const customers = query.runSuiteQL({ query: customerConsigneeSql }).asMappedResults();
            const items = query.runSuiteQL({ query: itemSql }).asMappedResults();
            const months = query.runSuiteQL({ query: monthSql }).asMappedResults();
            const years = query.runSuiteQL({ query: yearSql }).asMappedResults();


            log.debug("customers", customers.length)

            log.debug("items", items.length)

            log.debug("months", months.length)

            log.debug("years", years.length)


            forecastSql = `SELECT customrecord_anc_pf_.*
            FROM customrecord_anc_pf_ 
                JOIN customrecord_anc_pf_years ON customrecord_anc_pf_.custrecord_anc_pf_year = customrecord_anc_pf_years.ID 
            WHERE customrecord_anc_pf_years.name='2024' OR customrecord_anc_pf_years.name='2025'`;
            const existingForecast = query.runSuiteQL({ query: forecastSql }).asMappedResults();

            log.debug("existingForecast", existingForecast);


            var forecastByCompositeKey = {};
            for(var a = 0 ; a < existingForecast.length ; a++)
            {
                forecastByCompositeKey[`${existingForecast[a].custrecord_anc_pf_year}_${existingForecast[a].custrecord_anc_pf_month}_${existingForecast[a].custrecord_anc_pf_customer}_${existingForecast[a].custrecord_anc_pf_consignee}_${existingForecast[a].custrecord_anc_pf_grade}`] = {
                    vals:existingForecast[a],
                    parent : existingForecast[a].custrecord_anc_pf_parent,
                    id : existingForecast[a].id,
                    qty : existingForecast[a].custrecord_anc_pf_allocation
                };
            }
            log.debug("forecastByCompositeKey",forecastByCompositeKey);


            // Build permutations
            let combinations = [];
            years.forEach(year => {
                months.forEach(month => {
                    items.forEach(item => {
                        customers.forEach(c => {
                            combinations.push({
                                year, month, item,
                                customer: { id: c.customer_id, name: c.customer_name, parent_entityid : c.parent_entityid },
                                consignee: { id: c.consignee_id, name: c.consignee_name }
                            });
                        });
                    });
                });
            });

            log.debug("combinations.length", combinations.length)
            log.debug("combinations", combinations)

            // log.debug("combinations.splice", combinations.splice(0, 100000))
            // combinations = combinations.splice(0, 100000);


            const tableRows = combinations.map(row => `
                <tr>
                    <td>${row.year.id}_${row.month.id}_${row.customer.id}_${row.consignee.id}_${row.item.id}</td>
                    <td>${row.year.name}</td>
                    <td>${row.month.name}</td>
                    <td>${row.customer.parent_entityid}</td>
                    <td>${row.customer.name}</td>
                    <td>${row.consignee.name}</td>
                    <td>${row.item.itemid}</td>
                    <td></td>
                    <td>
                        <input type="number"
                               name="alloc_${row.year.id}_${row.month.id}_${row.customer.id}_${row.consignee.id}_${row.item.id}"
                               style="width: 60px;" />
                    </td>
                </tr>
            `).join('');

            log.debug("tableRows", tableRows);


            const responseData = combinations.map(row => ({
                compositeKey: `${row.year.id}_${row.month.id}_${row.customer.id}_${row.consignee.id}_${row.item.id}`,
                year: `${row.year.name}`,
                month: `${row.month.name}`,
                customerGroup: `${row.customer.parent_entityid}`,
                customer: `${row.customer.name}`,
                consignee: `${row.consignee.name}`,
                grade: `${row.item.itemid}`,
                currQty : forecastByCompositeKey[`${row.year.id}_${row.month.id}_${row.customer.id}_${row.consignee.id}_${row.item.id}`] ? forecastByCompositeKey[`${row.year.id}_${row.month.id}_${row.customer.id}_${row.consignee.id}_${row.item.id}`].qty : 0

            }));

            log.debug("responseData", responseData);

            context.response.write(JSON.stringify(responseData)); // Return data as JSON
        }
    };

    return { onRequest };
});

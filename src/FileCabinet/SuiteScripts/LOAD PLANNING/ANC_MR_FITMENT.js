/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['/SuiteScripts/ANC_lib.js', 'N/query', 'N/record', 'N/search', 'N/runtime'],
    (ANC_lib, query, record, search, runtime) => {

        const TEMPORARY_SHIPMENT_ITEM = 188748;

        const getInputData = (inputContext) => {
            const shipmentInput = JSON.parse(runtime.getCurrentScript().getParameter({
                name: 'custscript_anc_mr_fitment_ids'
            }) || '{}');

            const shipmentsAndOrders = ANC_lib.getShipmentsAndOrders(shipmentInput);
            const srGroupedByDeliveryDate = ANC_lib.groupOrderLinesForShipmentGeneration(null, shipmentsAndOrders.lineuniquekeys);

            return Object.values(srGroupedByDeliveryDate);
        };

        const map = (context) => {
            try {
                const shipmentGroup = JSON.parse(context.value);
                const shipmentLineIdTracker = {};
                const equipmentList = ANC_lib.getEquipmentList();

                const groupList_bylist = shipmentGroup.list || [];
                const groupByLineUniqueKey = ANC_lib.groupBy(groupList_bylist, 'line_uniquekey');

                const fitmentResponse = ANC_lib.getFitmentResponse(groupList_bylist, shipmentLineIdTracker);
                const fitmentResponseList = fitmentResponse.list || [];

                for (const fitment of fitmentResponseList) {
                    const body = fitment.body ? JSON.parse(fitment.body) : { shipments: [] };

                    for (const shipmentData of body.shipments) {
                        const shipmentRec = record.create({
                            type: 'customsale_anc_shipment',
                            isDynamic: true
                        });

                        shipmentRec.setValue({ fieldId: 'memo', value: '✅✅✅' });

                        let totalWeight = 0;
                        let entity = null, location = null, deliveryDate = null, shipDate = null, equipment = null, consignee = null;


                        for (const item of shipmentData.shipmentItems) {
                            const itemId = item.itemId;
                            const nb = item.nb;
                            const resLine = (groupByLineUniqueKey[itemId] || [])[0];
                            if (!resLine) continue;

                            log.debug("resLine", resLine);

                            if (!entity) {
                                entity = resLine.entity || shipmentsAndOrders.entity;
                                location = resLine.line_location;
                                deliveryDate = resLine.line_deliverydate;
                                shipDate = resLine.line_shipdate;
                                equipment = resLine.line_equipment;
                                consignee = resLine.line_consignee;
                            }

                            if (entity) shipmentRec.setValue({ fieldId: 'entity', value: entity });
                            if (location) shipmentRec.setValue({ fieldId: 'location', value: location });
                            if (consignee) shipmentRec.setValue({ fieldId: 'custbody_consignee', value: consignee });
                            if (deliveryDate) shipmentRec.setText({ fieldId: 'custbody_anc_deliverydate', text: deliveryDate });
                            if (shipDate) shipmentRec.setText({ fieldId: 'custbody_anc_shipdate', text: shipDate });
                            if (equipment) shipmentRec.setValue({ fieldId: 'custbody_anc_equipment', value: equipment });


                            const lineWeight = nb * (shipmentLineIdTracker[itemId]?.weight || 1);
                            totalWeight += lineWeight;

                            shipmentRec.selectNewLine({ sublistId: 'item' });
                            shipmentRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: TEMPORARY_SHIPMENT_ITEM });
                            shipmentRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: nb });
                            shipmentRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: 0 });
                            shipmentRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_anc_actualitemtobeshipped', value: resLine.line_item });
                            shipmentRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_consignee', value: consignee });
                            shipmentRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_anc_relatedtransaction', value: resLine.internalid });
                            shipmentRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_anc_relatedlineuniquekey', value: resLine.line_uniquekey });
                            shipmentRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_anc_shipment_linetotalweight', value: resLine.line_item_basis_weight });
                            shipmentRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_anc_equipment', value: resLine.line_equipment });
                            shipmentRec.commitLine({ sublistId: 'item' });
                        }

                        const utilization = ANC_lib.computeLoadUtilization(equipmentList, { line_equipment: equipment }, totalWeight);



                        shipmentRec.setValue({ fieldId: 'custbody_anc_loadingefficiency', value: utilization.shipmentUtilRate });

                        const shipmentId = shipmentRec.save({ ignoreMandatoryFields: true });
                        log.debug('Created shipment', shipmentId);
                    }
                }
            }
            catch(e)
            {
                log.error("ERROR in function map", e)
            }

        };

        const reduce = (context) => {};
        const summarize = (summary) => {
            log.audit('Map/Reduce Summary', {
                usage: summary.usage,
                yields: summary.yields,
                concurrency: summary.concurrency
            });

            summary.output.iterator().each((key, value) => {
                log.audit(`Output Key: ${key}`, value);
                return true;
            });
        };

        return { getInputData, map, reduce, summarize };
    });

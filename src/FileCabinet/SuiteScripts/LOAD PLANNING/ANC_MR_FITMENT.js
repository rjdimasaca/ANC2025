/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['/SuiteScripts/ANC_lib.js', 'N/query', 'N/record', 'N/search', 'N/runtime'],
    (ANC_lib, query, record, search, runtime) => {

        const TEMPORARY_SHIPMENT_ITEM = 188748;

        const getInputData = () => {
            const rawInput = runtime.getCurrentScript().getParameter({
                name: 'custscript_anc_mr_fitment_ids'
            });
            const shipmentLineKeys = JSON.parse(rawInput || '{}');

            log.debug("rawInput", rawInput);
            const shipmentsAndOrders = ANC_lib.getShipmentsAndOrders(shipmentLineKeys);
            // const grouped = ANC_lib.groupOrderLinesForShipmentGeneration(null, shipmentsAndOrders.lineuniquekeys, );
            const grouped = ANC_lib.groupOrderLinesForShipmentGeneration(null, null, shipmentsAndOrders.lineuniquekeys);

            log.debug("grouped", grouped);

            return Object.values(grouped);
        };

        const map = (context) => {
            try {
                const shipmentGroup = JSON.parse(context.value);
                log.debug("shipmentGroup", shipmentGroup)
                const shipmentLineIdTracker = {};
                log.debug("shipmentLineIdTracker", shipmentLineIdTracker)
                const equipmentList = ANC_lib.getEquipmentList();

                const groupList = shipmentGroup.list || [];
                const groupByLineKey = ANC_lib.groupBy(groupList, 'line_uniquekey');
                log.debug("groupByLineKey", groupByLineKey)

                const fitmentResponse = ANC_lib.getFitmentResponse(groupList, shipmentLineIdTracker);
                log.debug("fitmentResponse", fitmentResponse)
                const shipments = fitmentResponse.list || [];
                log.debug("shipments", shipments)

                for (const fitment of shipments) {
                    const responseBody = fitment.body ? JSON.parse(fitment.body) : { shipments: [] };

                    for (const shipment of responseBody.shipments) {
                        const rec = record.create({ type: 'customsale_anc_shipment', isDynamic: true });

                        rec.setValue({
                            fieldId :  "entity",
                            value : 549160
                        })

                        rec.setValue({ fieldId: 'memo', value: '✅✅✅' });

                        let entity, location, consignee, deliveryDate, shipDate, equipment, soInternalid;
                        let totalWeight = 0;







                        for (const item of shipment.shipmentItems) {
                            const lineKey = item.itemId;
                            const qty = item.nb;
                            const line = (groupByLineKey[lineKey] || [])[0];
                            if (!line || !qty) continue;

                            if (!entity) {
                                // entity = line.entity;
                                location = line.line_location;
                                consignee = line.line_consignee;
                                deliveryDate = line.line_deliverydate;
                                shipDate = line.line_shipdate;
                                equipment = line.line_equipment;
                                soInternalid = line.custcol_anc_relatedtransaction;
                            }

                            if (entity) rec.setValue({ fieldId: 'entity', value: entity });
                            if (location) rec.setValue({ fieldId: 'location', value: location });
                            if (consignee) rec.setValue({ fieldId: 'custbody_consignee', value: consignee });
                            if (deliveryDate) rec.setText({ fieldId: 'custbody_anc_deliverydate', text: deliveryDate });
                            if (shipDate) rec.setText({ fieldId: 'custbody_anc_shipdate', text: shipDate });
                            if (equipment) rec.setValue({ fieldId: 'custbody_anc_equipment', value: equipment });

                            const lineWeight = qty * (shipmentLineIdTracker[lineKey]?.weight || 1);
                            totalWeight += lineWeight;

                            rec.selectNewLine({ sublistId: 'item' });
                            rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: TEMPORARY_SHIPMENT_ITEM });
                            rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: qty });
                            rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: 0 });
                            rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_anc_actualitemtobeshipped', value: line.line_item });
                            rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_consignee', value: consignee });
                            rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_anc_relatedtransaction', value: line.custcol_anc_relatedtransaction });
                            rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_anc_relatedlineuniquekey', value: line.line_uniquekey }); //TODO fix this, this should be the SO lineuniquekey
                            rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_anc_shipment_linetotalweight', value: line.line_item_basis_weight });
                            rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_anc_equipment', value: line.line_equipment });
                            rec.commitLine({ sublistId: 'item' });
                        }

                        const utilization = ANC_lib.computeLoadUtilization(equipmentList, { line_equipment: equipment }, totalWeight);


                        rec.setValue({ fieldId: 'custbody_anc_loadingefficiency', value: utilization.shipmentUtilRate });

                        const id = rec.save({ ignoreMandatoryFields: true });
                        log.audit('Rebuilt shipment', id);
                    }
                }
            } catch (e) {
                log.error('ERROR in function map', e);
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

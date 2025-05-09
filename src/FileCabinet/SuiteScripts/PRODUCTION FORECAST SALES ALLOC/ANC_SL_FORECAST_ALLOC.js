/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/query'], (serverWidget, query) => {
    const onRequest = (context) => {
        if (context.request.method === 'GET') {
            const form = serverWidget.createForm({ title: 'Sales Forecast' });

            const filterFieldGroupObj = form.addFieldGroup({
                id: 'custpage_fldgroup_filters',
                label: 'Pre-Filters'
            });

            const yearFieldObj = form.addField({
                id: 'custpage_filter_years',
                type: serverWidget.FieldType.SELECT,
                source : "customrecord_anc_pf_years",
                label: "Year",
                container : "custpage_fldgroup_filters"
            });
            const monthFieldObj = form.addField({
                id: 'custpage_filter_month',
                type: serverWidget.FieldType.MULTISELECT,
                source : "customrecord_anc_pf_months",
                label: "Months",
                container : "custpage_fldgroup_filters"
            });
            const customerGroupFieldObj = form.addField({
                id: 'custpage_filter_customergroup',
                type: serverWidget.FieldType.MULTISELECT,
                source : "customer",
                label: "Customer Group",
                container : "custpage_fldgroup_filters"
            });
            const customerFieldObj = form.addField({
                id: 'custpage_filter_customer',
                type: serverWidget.FieldType.MULTISELECT,
                source : "customer",
                label: "Customer",
                container : "custpage_fldgroup_filters"
            });
            const customerConsigneeFieldObj = form.addField({
                id: 'custpage_filter_consignee',
                type: serverWidget.FieldType.MULTISELECT,
                source : "customrecord_alberta_ns_consignee_record",
                label: "Consignee",
                container : "custpage_fldgroup_filters"
            });
            const gradeFieldObj = form.addField({
                id: 'custpage_filter_grade',
                type: serverWidget.FieldType.MULTISELECT,
                source : "item",
                label: "Grade",
                container : "custpage_fldgroup_filters"
            });

            const forecastFieldGroupObj = form.addFieldGroup({
                id: 'custpage_fldgroup_forecast',
                label: 'Sales Forecast'
            });

            // var inlineHtmlField = {}
            const inlineHtmlField = form.addField({
                id: 'custpage_inlinehtml',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'HTML Table',
                container : "custpage_fldgroup_forecast"
            });

            const html = `
<script>jQuery("[data-field-name='custpage_inlinehtml']").parents('td').eq(1).css('width', '100%');</script>
                <html>
                <head>
                    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
                    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
                    <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
                    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
                    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
                    <script src="https://cdn.datatables.net/fixedheader/3.2.0/js/dataTables.fixedHeader.min.js"></script>
                    <style>
                      #loadingModal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.5);
                        color: white;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-size: 20px;
                        z-index: 9999;
                        visibility: visible;
                      }
                    
                      #loadingModal.hidden {
                        visibility: hidden;
                      }
                    
                      .spinner {
                        border: 4px solid rgba(255, 255, 255, 0.3);
                        border-top: 4px solid white;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        animation: spin 1s linear infinite;
                      }
                    
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    </style>
                    
                    
                    <script>
                        document.addEventListener('DOMContentLoaded', () => {
                            const currentYear = new Date().getFullYear().toString();
                            document.querySelector("#years").value = currentYear;
                
                            
                        });
                    </script>
                    
                    
                    <div id="loadingModal">
                      <div class="spinner"></div>
                      <span>Loading... Please wait</span>
                    </div>
                    
                    <script>
                        require([], function() {
                            window.onload = function() {
                                jQuery(document).ready(function($) {
                                    
                                    $('#loadingModal').removeClass('hidden');
                                    $('#loadingModal').addClass('hidden');
                                    
                                });
                            };
                        });
                    </script>
                </head>
                <body>
                    <form id="customerForm">
                    
                        <button type="button" onclick="collectInput()">Submit Changes</button>
                        
                        <button type="button" onclick="copyToYear()">Copy to Year</button>
                        <button type="button" onclick="copyToYear()">Copy from Year</button>
                        
                        
                        <label for="years">Target Year:</label>
                        <select id="years">
                          <option value="2026">2026</option>
                          <option value="2025">2025</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                        </select>
                        
                        <button type="button" onclick="preFilterYear()">Pre-Filter</button>
                        
                        <table id="customerTable" class="display" style="width:100%">
                            <thead>
                                <tr>
                                    <th>COMPOSITE KEY</th>
                                    <th>Year</th>
                                    <th>Month</th>
                                    <th>Customer Group</th>
                                    <th>Customer</th>
                                    <th>Consignee</th>
                                    <th>Grade</th>
                                    <th>Allocation</th>
                                </tr>
                                <tr>
                                    <th><input type="text" class="filter-input" data-column="0" placeholder="Filter Composite Key" /></th>
                                    <th><input type="text" class="filter-input" data-column="1" placeholder="Filter Year" /></th>
                                    <th><input type="text" class="filter-input" data-column="2" placeholder="Filter Month" /></th>
                                    <th><input type="text" class="filter-input" data-column="3" placeholder="Filter Customer Group" /></th>
                                    <th><input type="text" class="filter-input" data-column="4" placeholder="Filter Customer" /></th>
                                    <th><input type="text" class="filter-input" data-column="5" placeholder="Filter Consignee" /></th>
                                    <th><input type="text" class="filter-input" data-column="6" placeholder="Filter Grade" /></th>
                                    <th><input type="text" class="filter-input" data-column="7" placeholder="Filter Allocation" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Initially empty rows -->
                            </tbody>
                        </table>
                        <br/>
                        <button type="button" onclick="collectInput()">Submit Changes</button>
                        
                        <button type="button" onclick="copyToYear()">Copy to Year</button>
                        <button type="button" onclick="copyToYear()">Copy from Year</button>
                    </form>
                    <script>
                        function preFilterYear()
                        {
                            var table = $('#customerTable').DataTable({
                                orderCellsTop: true,
                                fixedHeader: true,
                                dom: '<"top"ilp>rt<"bottom"lpi><"clear">',
                                pageLength: 100,
                                initComplete: function () {
                                    // const api = this.api();
                                }
                            });
                            
                            // table = $('#customerTable').DataTable();
                            // table.clear().draw();
                            
                            
                            // Fetch data asynchronously
                            $.ajax({
                                url: '/app/site/hosting/scriptlet.nl?script=5595&deploy=1' + "&year=" + document.querySelector("#years").value,
                                method: 'POST',
                                success: function(data) {
                                    data = JSON.parse(data);
                                    var tableRows = data.map(function(row) {
                                        return '<tr>' +
                                            '<td>' + row.compositeKey + '</td>' +
                                            '<td>' + row.year + '</td>' +
                                            '<td>' + row.month + '</td>' +
                                            '<td>' + row.customerGroup + '</td>' +
                                            '<td>' + row.customer + '</td>' +
                                            '<td>' + row.consignee + '</td>' +
                                            '<td>' + row.grade + '</td>' +
                                            '<td><input value=' + row.currQty + ' origvalue=' + row.currQty + ' type="number" name="' + row.compositeKey + '" style="width: 60px;" /></td>' +
                                        '</tr>';
                                    }).join('');
                                    
                                    // Add fetched rows into the table
                                    table.rows.add($(tableRows)).draw();
                                    
                                    
                                    $('#loadingModal').removeClass('hidden');
                                    $('#loadingModal').addClass('hidden');
                                },
                                error: function() {
                                    alert('Error fetching data');
                                }
                            });
                            
                            // Simple Filtering Functionality
                            $("input[type='text']").on("keyup", function() {
                                var columnIdx = $(this).data('column');
                                table.column(columnIdx).search(this.value).draw();
                            });
                        }
                        function collectInput() {
                            const data = {};
                        
                            var table = $('#customerTable').DataTable();
                            var tableRows = table.rows().nodes(); // DataTables API
                        
                            $(tableRows).find('input[type="number"]').each(function() {
                                const origValue = this.getAttribute('origvalue');
                                const currentValue = this.value;
                                if (origValue !== currentValue || (origValue==="0" && currentValue==="")) {
                                    data[this.name] = currentValue;
                                }
                            });
                        
                            console.log('Collected Allocation Input:', data);
                            alert('Open the console to see collected data. You can send it to NetSuite.');
                            
                            
                            $.ajax({
                                url: '/app/site/hosting/scriptlet.nl?script=5595&deploy=1&submitdata=T',
                                method: 'POST',
                                success: function(data) {
                                    
                                    console.log("resp data", data)
                                    // const tableRows = data.map(function(row) {
                                    //     return '<tr>' +
                                    //         '<td>' + row.compositeKey + '</td>' +
                                    //         '<td>' + row.year + '</td>' +
                                    //         '<td>' + row.month + '</td>' +
                                    //         '<td>' + row.customerGroup + '</td>' +
                                    //         '<td>' + row.customer + '</td>' +
                                    //         '<td>' + row.consignee + '</td>' +
                                    //         '<td>' + row.grade + '</td>' +
                                    //         '<td>' + row.parent + '</td>' +
                                    //         '<td><input value=' + row.currQty + ' origvalue=' + row.currQty + ' type="number" name="' + row.compositeKey + '" style="width: 60px;" /></td>' +
                                    //     '</tr>';
                                    // }).join('');
                                    //
                                    // // Add fetched rows into the table
                                    // table.rows.add($(tableRows)).draw();
                                    
                                    
                                },
                                data : JSON.stringify({compositeKeys : data}),
                                error: function() {
                                    alert('Error posting data');
                                }
                            });
                        }
                        
                        function copyToYear() {
                        
                            var confirmResults = prompt("What year do you want to setup?")

                            if(Number(confirmResults) != "NaN")
                            {
                                const data = {};
                        
                                var table = $('#customerTable').DataTable();
                                var tableRows = table.rows().nodes(); // DataTables API
                            
                                $(tableRows).find('input[type="number"]').each(function() {
                                    const origValue = this.getAttribute('origvalue');
                                    const currentValue = this.value;
                                    if (origValue !== currentValue || (origValue==="0" && currentValue==="")) {
                                        data[this.name] = currentValue;
                                    }
                                });
                            
                                console.log('Collected Allocation Input:', data);
                                alert('Open the console to see collected data. You can send it to NetSuite.');
                                
                                
                                $.ajax({
                                    url: '/app/site/hosting/scriptlet.nl?script=5595&deploy=1&copyToYear=' + confirmResults,
                                    method: 'POST',
                                    success: function(data) {
                                        
                                        console.log("resp data", data)
                                        // const tableRows = data.map(function(row) {
                                        //     return '<tr>' +
                                        //         '<td>' + row.compositeKey + '</td>' +
                                        //         '<td>' + row.year + '</td>' +
                                        //         '<td>' + row.month + '</td>' +
                                        //         '<td>' + row.customerGroup + '</td>' +
                                        //         '<td>' + row.customer + '</td>' +
                                        //         '<td>' + row.consignee + '</td>' +
                                        //         '<td>' + row.grade + '</td>' +
                                        //         '<td>' + row.parent + '</td>' +
                                        //         '<td><input value=' + row.currQty + ' origvalue=' + row.currQty + ' type="number" name="' + row.compositeKey + '" style="width: 60px;" /></td>' +
                                        //     '</tr>';
                                        // }).join('');
                                        //
                                        // // Add fetched rows into the table
                                        // table.rows.add($(tableRows)).draw();
                                        
                                        
                                    },
                                    data : JSON.stringify({compositeKeys : data}),
                                    error: function() {
                                        alert('Error posting data');
                                    }
                                });
                            }
                            else
                            {
                                alert("Aborted, invalid input " + confirmResults)
                            }
                        
                            
                        }
                    </script>
                </body>
                </html>
            `;

            inlineHtmlField.defaultValue = html;
            context.response.writePage(form);
        }
    };

    return { onRequest };
});

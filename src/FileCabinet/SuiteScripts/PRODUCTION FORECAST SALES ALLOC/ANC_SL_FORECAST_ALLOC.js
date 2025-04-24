/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search'], (serverWidget, search) => {
    const onRequest = (context) => {
        if (context.request.method === 'GET') {
            const form = serverWidget.createForm({ title: 'Sales Forecast' });

            const inlineHtmlField = form.addField({
                id: 'custpage_inlinehtml',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'HTML Table'
            });


            // Fetch data from a saved search (or define one inline)
            const customerSearch = search.create({
                type: "customrecord_anc_pf_",
                columns: [
                    'custrecord_anc_pf_year',
                    'custrecord_anc_pf_customer', 'custrecord_anc_pf_consignee', 'custrecord_anc_pf_grade',
                    'custrecord_anc_pf_parent', 'custrecord_anc_pf_month', 'custrecord_anc_pf_allocation'
                ],
                filters: []
            });




            const results = [];
            const gradeSet = new Set();

            customerSearch.run().each(result => {

                const grade = result.getText({ name: 'custrecord_anc_pf_grade' }) || '';
                gradeSet.add(grade);

                results.push({
                    custrecord_anc_pf_year: result.getValue({ name: 'custrecord_anc_pf_year' }),
                    custrecord_anc_pf_month: result.getValue({ name: 'custrecord_anc_pf_month' }),
                    custrecord_anc_pf_customer: result.getValue({ name: 'custrecord_anc_pf_customer' }),
                    custrecord_anc_pf_consignee: result.getValue({ name: 'custrecord_anc_pf_consignee' }),
                    custrecord_anc_pf_grade: result.getValue({ name: 'custrecord_anc_pf_grade' }),
                    custrecord_anc_pf_parent: result.getValue({ name: 'custrecord_anc_pf_parent' }),
                    custrecord_anc_pf_allocation: result.getValue({ name: 'custrecord_anc_pf_allocation' }),

                    custrecord_anc_pf_year_text: result.getText({ name: 'custrecord_anc_pf_year' }),
                    custrecord_anc_pf_month_text: result.getText({ name: 'custrecord_anc_pf_month' }),
                    custrecord_anc_pf_customer_text: result.getText({ name: 'custrecord_anc_pf_customer' }),
                    custrecord_anc_pf_consignee_text: result.getText({ name: 'custrecord_anc_pf_consignee' }),
                    custrecord_anc_pf_grade_text: result.getText({ name: 'custrecord_anc_pf_grade' }),
                    custrecord_anc_pf_parent_text: result.getText({ name: 'custrecord_anc_pf_parent' }),
                    custrecord_anc_pf_allocation_text: result.getText({ name: 'custrecord_anc_pf_allocation' }),
                });
                return results.length < 100; // limit to 100 rows
            });

            // Convert to HTML table rows
            const tableRows = results.map(row => `
        <tr>
          <td>${row.custrecord_anc_pf_year_text || ''}</td>
          <td>${row.custrecord_anc_pf_month_text || ''}</td>
          <td>${row.custrecord_anc_pf_customer_text || ''}</td>
          <td>${row.custrecord_anc_pf_consignee_text || ''}</td>
          <td>${row.custrecord_anc_pf_grade_text || ''}</td>
          <td>${row.custrecord_anc_pf_parent_text || ''}</td>
          <td>
            <input type="number" 
               name="custrecord_anc_pf_allocation_${row.id}" 
               value="${row.custrecord_anc_pf_allocation || ''}" 
               style="width: 60px;" />
          </td>
        </tr>
      `).join('');

            const gradeOptions = [...gradeSet].map(grade => `<option value="${grade}">${grade}</option>`).join('');


            // Combine full HTML
            const html = `
        <html>
        <head>
          <link rel="stylesheet" type="text/css"
                href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
          <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
          <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
          <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
          <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
          <script>
            require([], function() {
              window.onload = function() {
                jQuery(document).ready(function($) {
                  $('#customerTable thead tr')
                    .clone(true)
                    .addClass('filters')
                    .appendTo('#customerTable thead');

                  const table = $('#customerTable').DataTable({
                      columnDefs: [
                        { targets: 5, visible: false } // assuming Parent is column index 5
                      ],
                    orderCellsTop: true,
                    fixedHeader: true,
                    initComplete: function () {
                      var api = this.api();
                      api.columns().eq(0).each(function (colIdx) {
                        var cell = $('.filters th').eq(colIdx);
                    
                        // Skip Allocation (editable) column
                        if (colIdx === 5) {
                          $(cell).html('');
                          return;
                        }
                    
                        var uniqueVals = {};
                        api.column(colIdx).data().each(function (val) {
                          if (val) uniqueVals[val] = true;
                        });
                    
                        var sortedOptions = '';
                        Object.keys(uniqueVals).sort().forEach(function (val) {
                          sortedOptions += '<option value="' + val + '">' + val + '</option>';
                        });
                    
                        // Add multiselect dropdown with Select2
                        var select = $('<select multiple style="width:100%">' + sortedOptions + '</select>')
                          .appendTo(cell.empty())
                          .on('change', function () {
                            var selected = $(this).val();
                            if (selected && selected.length > 0) {
                              api.column(colIdx)
                                .search(selected.join('|'), true, false) // regex match
                                .draw();
                            } else {
                              api.column(colIdx).search('').draw();
                            }
                          });
                    
                        select.select2({ placeholder: 'Filter...', width: 'resolve' });
                    
                        // Add optional freeform input below
                        $('<input type="text" placeholder="Search..." style="width:100%; margin-top:4px;" />')
                          .appendTo(cell)
                          .on('keyup change', function () {
                            api.column(colIdx).search(this.value).draw();
                          });
                      });
                    }
                  });
                });
              };
            });
          </script>
        </head>
        <body>
          <form id="customerForm">
            <table id="customerTable" class="display" style="width:100%">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Month</th>
                  <th>Customer</th>
                  <th>Consignee</th>
                  <th>Grade</th>
                  <th>Parent</th>
                  <th>Allocation</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            <br/>
            <button type="button" onclick="collectInput()">Submit Changes</button>
          </form>
          <script>
            function collectInput() {
              const inputs = document.querySelectorAll('input[type="number"]');
              const data = {};
              inputs.forEach(input => {
                data[input.name] = input.value;
              });
              console.log('Collected Allocation Input:', data);
              alert('Open the console to see collected data. You can send it to NetSuite.');
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
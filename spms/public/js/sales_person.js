var selected_suggestion = null;
var selected_suggestion_id = null;

var selected_customer_suggestion = null;
var selected_customer_suggestion_id = null;
var customer_address_values_json = null;
// function progress_bar(frm, table_name, field_name, options = { color: "", text: "" }) {
//     for (let row of $(`[data-fieldname = ${table_name}] .grid-body .rows`).children()) {
//         let idx = $(row).data("idx") - 1;
//         console.log(frm.doc[table_name]);
//         console.log("idx");
//         console.log(idx);

//         let row_info = frm.doc[table_name][idx];
//         // console.log(row_info)
//         // console.log("field_name")
//         // console.log(field_name)
//         // console.log("-----------")

//         // console.log(row_info.hasOwnProperty(field_name)); // Check if the field exists in row_info
//         // console.log(typeof row_info[field_name]); // Check the type of the field
//         // console.log("-------------")

//         const width = row_info[field_name]
//         row.firstChild.querySelector(`[data-fieldname=${field_name}]`)
//             .innerHTML =
//             `<div class="progress" style="height: 20px; font-size: 13px;font-weight:500;">
// 				<div style="width:${width}%;background:${options.color && options.color};" class="progress-bar" role="progressbar">${options.text && options.text}${width}%</div>
// 			</div>`
//     }
// }

// function progress_bar(frm, table_name, field_name, options = { color: "", text: "" }) {
//     for (let row of $(`[data-fieldname = ${table_name}] .grid-body .rows`).children()) {
//         let idx = parseInt($(row).data("idx")) - 1; // Corrected idx assignment
//         let row_info = frm.doc[table_name][idx];
//         const width = row_info[field_name]
//         row.firstChild.querySelector(`[data-fieldname=${field_name}]`)
//             .innerHTML =
//             `<div class="progress" style="height: 20px; font-size: 13px;font-weight:500;">
// 				<div style="width:${width}%;background:${options.color && options.color};" class="progress-bar" role="progressbar">${options.text && options.text}${width}%</div>
// 			</div>`
//     }
// }
// function progress_bar(frm, table_name, field_name, options = { color: "", text: "" }) {
//     // Convert collection of rows to array for using indexOf
//     let rows = Array.from($(`[data-fieldname = ${table_name}] .grid-body .rows`).children());

//     for (let row of rows) {
//         let idx = rows.indexOf(row);
//         let row_info = frm.doc[table_name][idx];
//         const width = row_info[field_name];
//         row.firstChild.querySelector(`[data-fieldname=${field_name}]`)
//             .innerHTML =
//             `<div class="progress" style="height: 20px; font-size: 13px;font-weight:500;">
// 				<div style="width:${width}%;background:${options.color && options.color};" class="progress-bar" role="progressbar">${options.text && options.text}${width}%</div>
// 			</div>`;
//     }
// }
function progress_bar(frm, table_name, field_name, f1, f2, options = { color: "", text: "" }) {
    // Convert collection of rows to array for using indexOf
    let rows = Array.from($(`[data-fieldname = ${table_name}] .grid-body .rows`).children());

    for (let row of rows) {
        let idx = rows.indexOf(row);
        let row_info = frm.doc[table_name][idx];
        const width = ((row_info[f2] / row_info[f1]) * 100).toFixed(1);
        row.firstChild.querySelector(`[data-fieldname=${field_name}]`)
            .innerHTML =
            `<div class="progress" style="height: 20px; font-size: 13px;font-weight:500;">
				<div style="width:${width}%;background:${options.color && options.color};" class="progress-bar" role="progressbar">${options.text && options.text}${width}%</div>
			</div>`;
    }
}

function calculateProgressBar(frm) {
    // Get the values from the form fields
    var targetSales = frm.doc.custom_target || 0; // default to 0 if field is empty
    var achievedSales = frm.doc.custom_achieved || 0; // default to 0 if field is empty

    var totalCollected = frm.doc.custom_total_collected || 0; // default to 0 if field is empty
    var additionalCollected = frm.doc.custom_additional_collected || 0; // default to 0 if field is empty

    // Calculate the sales progress percentage
    var salesPercentage = 0;
    if (targetSales > 0) {
        salesPercentage = (achievedSales / targetSales) * 100;
    }

    // Calculate productivity
    var productivity = (totalCollected + additionalCollected) / 2;

    // Update the progress bar for sales
    var salesProgressBar = frm.fields_dict['custom_sales_achievement'];
    salesProgressBar.$wrapper.css('width', salesPercentage + '%');
    salesProgressBar.$wrapper.text(salesPercentage.toFixed(2) + '%');
    salesProgressBar.$wrapper.css('color', 'white'); // Set text color to white
    salesProgressBar.$wrapper.css('text-align', 'center'); // Center the text

    // Change the color based on sales progress
    if (salesPercentage < 50) {
        salesProgressBar.$wrapper.removeClass('bg-success bg-warning').addClass('bg-danger');
    } else if (salesPercentage >= 50 && salesPercentage < 100) {
        salesProgressBar.$wrapper.removeClass('bg-danger bg-success').addClass('bg-warning');
    } else {
        salesProgressBar.$wrapper.removeClass('bg-danger bg-warning').addClass('bg-success');
    }

    // Update the progress bar for productivity
    var productivityProgressBar = frm.fields_dict['percentage']; // Assuming it's the same progress bar element
    productivityProgressBar.$wrapper.css('width', productivity + '%');
    productivityProgressBar.$wrapper.text(productivity.toFixed(2) + '%');
    productivityProgressBar.$wrapper.css('color', 'white'); // Set text color to white
    productivityProgressBar.$wrapper.css('text-align', 'center'); // Center the text

    // Change the color based on productivity
    if (productivity < 50) {
        productivityProgressBar.$wrapper.removeClass('bg-success bg-warning').addClass('bg-danger');
    } else if (productivity >= 50 && productivity < 100) {
        productivityProgressBar.$wrapper.removeClass('bg-danger bg-success').addClass('bg-warning');
    } else {
        productivityProgressBar.$wrapper.removeClass('bg-danger bg-warning').addClass('bg-success');
    }
}
function set_css(frm, dataField, achievedField, targetField, percentageElementId) {
    var data = frm.doc[dataField];

    if (data) {
        let total_number_of_visits = 0;
        let total_verified_visits = 0;
        for (let row of data) {
            total_number_of_visits += row.number_of_visits;
            total_verified_visits += row.verified_visits;
        }

        let productivity_percentage = (total_verified_visits / total_number_of_visits) * 100;
        var percentage;
        percentage = (frm.doc[achievedField] / frm.doc[targetField]) * 100;

        let avg_percentage = (productivity_percentage + percentage) / 2 || 0;

        let percentageElement = document.getElementById(percentageElementId);
        percentageElement.style.width = `${avg_percentage}%`;
        percentageElement.style.backgroundColor = `#ef476f`; // red
        percentageElement.innerText = `${Math.round(avg_percentage)}%`;
        if (avg_percentage >= 50 && avg_percentage < 90) {
            percentageElement.style.backgroundColor = `#edae49`; // yellow
            percentageElement.innerText = `${Math.round(avg_percentage)}%`;
        }
        else if (avg_percentage >= 90 && avg_percentage < 100) {
            percentageElement.style.backgroundColor = `#57cc99`; // green
            percentageElement.innerText = `${Math.round(avg_percentage)}%`;
        }
        else if (avg_percentage >= 100) {
            percentageElement.style.backgroundColor = `#57cc99`; // green
            percentageElement.innerText = `Completed ${Math.round(avg_percentage)}%`;
        }
    }
}

let first_try = true
function refresh_when_click_btn(frm) {
    /* Used to refresh the page when the user clicks on the next page, first page, previous page, or last
    page. */
    if (first_try) {
        $(".next-page").click(function () {
            frm.refresh()
        })
        $(".first-page").click(function () {
            frm.refresh()
        })
        $(".prev-page").click(function () {
            frm.refresh()
        })
        $(".last-page").click(function () {
            frm.refresh()
        })
        first_try = false
    }
}

frappe.ui.form.on('Sales Person', {
    refresh: function (frm) {
        if (frm.doc.custom_type != "Collect") {
            frm.add_custom_button(__('Remove Client'), () => {
                // Get the custom_productivity child table data
                let existingClients = frm.doc.custom_productivity;
                // Create the dialog
                let dialog = new frappe.ui.Dialog({
                    title: 'Remove Clients',
                    fields: [
                        {
                            'fieldname': 'clients_table',
                            'fieldtype': 'HTML',
                            'options': `
                ${existingClients.map(client => `
                    <button class="btn client-button border" style="margin: 5px;" data-client="${client.client}">${client.name1}</button>
                `).join('')}
            `
                        }
                    ],
                    primary_action_label: 'Remove',
                    primary_action() {
                        let clientsToRemove = [];
                        document.querySelectorAll('.client-button.btn-danger').forEach(button => {
                            clientsToRemove.push(button.dataset.client);
                            console.log("button.dataset.client");
                            console.log(button.dataset.client);

                        });
                        console.log("clientsToRemove");
                        console.log(clientsToRemove);

                        if (clientsToRemove.length > 0) {
                            frappe.call({
                                method: 'spms.utils.utils.remove_client_from_sales_person',
                                args: {
                                    'values': clientsToRemove,
                                    'doc': frm.doc
                                },
                                callback: function (response) {
                                    var res = response.message;
                                    if (res) {
                                        frappe.msgprint(__('Removed Clients Successfully'));
                                        dialog.hide();
                                        frm.reload_doc();
                                    } else {
                                        frappe.msgprint(__('Error Removing Client'));
                                    }
                                }
                            });
                        } else {
                            frappe.msgprint(__('No Clients to Remove'));
                        }
                    }
                });

                // Event delegation for click events
                dialog.$wrapper.find('.client-button').on('click', function (event) {
                    $(this).toggleClass('btn-danger');
                });


                dialog.show();
            }).addClass('bg-danger').css({
                "color": "white",
            });

            frm.add_custom_button(__('Add Client'), () => {
                var dialog = new frappe.ui.Dialog({
                    title: 'Create Client',
                    fields: [
                        { 'fieldname': 'salutation', 'fieldtype': 'Link', 'label': 'Salutation', 'reqd': 1, 'options': "Salutation" },
                        {
                            'fieldname': 'sb1',
                            'fieldtype': 'Section Break',
                        },
                        {
                            'fieldname': 'first_name',
                            'fieldtype': 'Data',
                            'label': 'First Name', 'reqd': 1,
                            'onchange': function () {
                                var inputName = this.get_value();
                                frappe.db.get_list('Client', {
                                    filters: {
                                        'full_name': ['like', '%' + inputName + '%']
                                    },
                                    fields: ['full_name', 'name']
                                }).then(suggestions => {
                                    let htmlField = dialog.get_field('suggestions');
                                    if (suggestions.length > 0) {
                                        htmlField.$wrapper.empty(); // clear the HTML field
                                        htmlField.$wrapper.append("Suggestions: <br>");

                                        suggestions.forEach(suggestion => {
                                            let suggestionElement = $(`<p><a class="btn btn-info" href="">${suggestion.full_name}</a></p>`);
                                            suggestionElement.click(() => {
                                                frappe.db.get_doc('Client', suggestion.name).then(doc => {
                                                    selected_suggestion = suggestion.full_name;
                                                    selected_suggestion_id = suggestion.name;

                                                    dialog.set_values({
                                                        'first_name': doc.first_name,
                                                        'middle_name': doc.middle_name,
                                                        'last_name': doc.last_name,
                                                        'salutation': doc.salutation,
                                                        'class': doc.class,
                                                        'type': doc.type,
                                                        'department': doc.department,
                                                        'phone': doc.phone,
                                                        'territory': doc.territory
                                                    });
                                                });
                                            });
                                            htmlField.$wrapper.append(suggestionElement);
                                        });
                                    }
                                });
                            }
                        },
                        {
                            'fieldname': 'suggestions',
                            'fieldtype': 'HTML',
                            'label': 'Suggestions'
                        },
                        {
                            'fieldname': 'middle_name',
                            'fieldtype': 'Data',
                            'label': 'Middle Name',
                        },
                        {
                            'fieldname': 'last_name',
                            'fieldtype': 'Data',
                            'label': 'Last Name',
                            'reqd': 1
                        },
                        {
                            'fieldname': 'tb2',
                            'fieldtype': 'Column Break',
                        },
                        { 'fieldname': 'territory', 'fieldtype': 'Link', 'label': 'Territory', 'reqd': 1, 'options': 'Territory' },
                        { 'fieldname': 'phone', 'fieldtype': 'Phone', 'label': 'Phone', 'reqd': 1, "default": "+964-" },
                        { 'fieldname': 'department', 'fieldtype': 'Link', 'label': 'Department', 'reqd': 0, 'options': 'Doctor Department' },

                        {
                            'fieldname': 'sb1',
                            'fieldtype': 'Section Break',
                        },
                        { 'fieldname': 'class', 'fieldtype': 'Select', 'label': 'Class', 'reqd': 1, 'options': 'A\nA+\nB\nB+\nC' },
                        {
                            'fieldname': 'tb5',
                            'fieldtype': 'Column Break',
                        },
                        {
                            'fieldname': 'type', 'fieldtype': 'Link', 'label': 'Type', 'reqd': 1,
                            'options': 'Client Types'
                        },
                        {
                            'fieldname': 'sb5',
                            'fieldtype': 'Section Break',
                        },
                        {
                            'fieldname': 'sb3',
                            'fieldtype': 'Section Break',
                        },
                        {
                            'fieldname': 'address_html',
                            'fieldtype': 'HTML',
                            'label': 'Address',
                            'reqd': 0,
                            'options': ''
                        }
                    ],
                    primary_action_label: 'Submit',
                    size: 'large', // small, large, extra-large 
                    primary_action(values) {
                        var fn = values.first_name + (values.middle_name == "" ? "" : (" " + values.middle_name)) + " " + values.last_name;
                        console.log(values);
                        // Extract address values from HTML input fields
                        var address_values_json = {
                            'address_line_1': $('#address-line-1').val(),
                            'address_line_2': $('#address-line-2').val(),
                            'city': $('#city').val(),
                            'state': $('#state').val(),
                            'zip_code': $('#zip-code').val(),
                            'country': $('#country').val()
                        };
                        if (fn == selected_suggestion) {

                            frappe.call({
                                method: 'spms.utils.utils.create_client_to_sales_person',
                                args: {
                                    'values': values,
                                    'doc': frm.doc,
                                    'client': selected_suggestion_id,
                                    'address': address_values_json
                                }, callback: function (response) {
                                    var res = response.message;
                                    if (res) {
                                        frappe.msgprint(__('Added Client Successfully'));
                                        dialog.hide();
                                        frm.reload_doc();
                                    } else {
                                        frappe.msgprint(__('Error Adding Client'));
                                    }
                                }
                            });
                        } else {
                            frappe.call({
                                method: 'spms.utils.utils.create_client_to_sales_person',
                                args: {
                                    'values': values,
                                    'doc': frm.doc,
                                    'client': null, 'address': address_values_json

                                }, callback: function (response) {
                                    var res = response.message;
                                    if (res) {
                                        frappe.msgprint(__('Added Client Successfully'));
                                        dialog.hide();
                                        frm.reload_doc();
                                    } else {
                                        frappe.msgprint(__('Error Adding Client'));
                                    }
                                }
                            });
                        }
                        // Your primary action code here
                    }
                });
                dialog.show();

                // Set the HTML content for the address field
                var address_html = `
                        <div class="row">
                            <div class="col-md-6">
                                <label for="address-line-1">Address Line 1:</label>
                                <input type="text" id="address-line-1" name="address-line-1" class="form-control"><br>
    
                                <label for="address-line-2">Address Line 2:</label>
                                <input type="text" id="address-line-2" name="address-line-2" class="form-control"><br>
    
                                <label for="city">City:</label>
                                <input type="text" id="city" name="city" class="form-control"><br>
                            </div>
                            <div class="col-md-6">
                                <label for="state">State:</label>
                                <input type="text" id="state" name="state" class="form-control"><br>
    
                                <label for="zip-code">Zip Code:</label>
                                <input type="text" id="zip-code" name="zip-code" class="form-control"><br>
    
                                <label for="country">Country:</label>
                                <input type="text" id="country" name="country" class="form-control"><br>
                            </div>
                        </div>
                    `;

                dialog.fields_dict.address_html.$wrapper.html(address_html);

            }).addClass('bg-success', 'text-white').css({
                "color": "white",
            });

            frm.add_custom_button(__('Set Target'), () => {
                let targets = frm.doc.custom_target_breakdown;
                console.log(targets);

                // Prepare the table HTML
                let tableHtml = '<table class="table table-bordered">';
                tableHtml += `
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th class="bg-danger">Delete</th>
                    </tr>
                </thead>
                <tbody>
                `;

                // // Add rows to the table
                // for (let target of targets) {
                //     tableHtml += `<tr><td>${target.item}</td><td contenteditable="true" id="target_${target.item.replace(/\s+/g, '_')}">${target.quantity}</td></tr>`;
                // }
                // Add rows to the table
                for (let target of targets) {
                    tableHtml += `<tr><td>${target.item}</td><td contenteditable="true" id="target_${target.item.replace(/\s+/g, '_')}">${target.quantity}</td><td><input type="checkbox" id="checkbox_${target.item.replace(/\s+/g, '_')}"></td></tr>`;
                }
                // tableHtml += '</tbody></table>';
                // Create the sub-dialog for adding a new row
                let subDialog = new frappe.ui.Dialog({
                    title: 'Add Item',
                    fields: [
                        {
                            'fieldname': 'item',
                            'label': 'Item',
                            'fieldtype': 'Link',
                            'options': 'Item',
                            'reqd': 1
                        },
                        {
                            'fieldname': 'quantity',
                            'label': 'Quantity',
                            'fieldtype': 'Float',
                            'reqd': 1
                        }
                    ],
                    primary_action_label: 'Add Row',
                    primary_action() {
                        // Retrieve entered values from the sub-dialog
                        let newItem = subDialog.get_value('item').trim(); // Trim whitespace from the item
                        let newQuantity = subDialog.get_value('quantity');

                        // Check if the item already exists in targets
                        if (targets.some(target => target.item === newItem)) {
                            frappe.msgprint('Item already exists in the list.');
                            return;
                        }

                        // Append a new row to the table
                        tableHtml += `<tr><td>${newItem}</td><td contenteditable="true" id="target_${newItem.replace(/\s+/g, '_')}">${newQuantity}</td></tr>`;

                        // Update the HTML in the main dialog's table field
                        dialog.get_field('targets_table').$wrapper.html(tableHtml);

                        // Add the new target to the targets array
                        targets.push({
                            item: newItem,
                            quantity: newQuantity
                        });

                        // Hide the sub-dialog
                        subDialog.hide();

                        // Empty the form fields
                        subDialog.fields_dict.item.set_value('');
                        subDialog.fields_dict.quantity.set_value('');
                    }

                });


                // Create the main dialog
                let dialog = new frappe.ui.Dialog({
                    title: 'Set Target',
                    fields: [
                        {
                            'fieldname': 'month_select',
                            'label': 'Month (optional)',
                            'fieldtype': 'Select',
                            'options': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                            'reqd': 0,
                            'onchange': function () {
                                let selectedMonth = dialog.get_value('month_select');
                                let year = new Date().getFullYear(); // You can adjust the year as per your requirement
                                let startDate = new Date(year, monthToIndex(selectedMonth), 1);
                                let endDate = new Date(year, monthToIndex(selectedMonth) + 1, 0);
                                dialog.fields_dict.from.set_value(startDate);
                                dialog.fields_dict.to.set_value(endDate);
                            }
                        }, {
                            'fieldname': 'section_break',
                            'fieldtype': 'Section Break',
                        },
                        {
                            'fieldname': 'from',
                            'label': 'From',
                            'fieldtype': 'Date',
                            'reqd': 1,
                            'default': frm.doc.custom_from
                        },
                        //add column break
                        {
                            'fieldname': 'column_break',
                            'fieldtype': 'Column Break',
                        },
                        {
                            'fieldname': 'to',
                            'label': 'To',
                            'fieldtype': 'Date',
                            'reqd': 1,
                            'default': frm.doc.custom_to
                        },
                        {
                            'fieldname': 'section_break',
                            'fieldtype': 'Section Break',
                        },
                        {
                            'fieldname': 'target',
                            'label': 'Target',
                            'fieldtype': 'Float',
                            'reqd': 1,
                            'default': frm.doc.custom_target
                        },
                        {
                            'fieldname': 'section_break',
                            'fieldtype': 'Section Break',
                        },
                        {
                            'fieldname': 'targets_table',
                            'fieldtype': 'HTML',
                            'options': tableHtml
                        },
                        // Add a button to open the sub-dialog for adding a new row
                        {
                            'fieldname': 'add_row_button',
                            'label': 'Add Item',
                            'fieldtype': 'Button',
                            'icon': 'plus',
                            'click': function () {
                                subDialog.show();
                            }
                        }
                    ],
                    primary_action_label: 'Set Target',
                    primary_action() {
                        console.log(targets);
                        let quantities = {};
                        // Retrieve quantities from the table
                        for (let target of targets) {
                            console.log(target.item);
                            let element = document.getElementById(`target_${target.item.replace(/\s+/g, '_')}`);
                            if (element) {
                                quantities[target.item] = parseFloat(element.innerText);
                            } else {
                                console.error(`Element with ID 'target_${target.item.replace(/\s+/g, '_')}' not found.`);
                            }
                        }


                        console.log(quantities);
                        let checkedItems = {};
                        // Retrieve checked items
                        targets.forEach(target => {
                            let checkbox = document.getElementById(`checkbox_${target.item.replace(/\s+/g, '_')}`);
                            if (checkbox && checkbox.checked) {
                                // checkedItems.push({"item":target.item});
                                checkedItems["item"] = target.item;
                            }
                        });
                        frappe.call({
                            method: 'spms.utils.utils.set_target',
                            args: {
                                'values': dialog.get_values(),
                                'quantities': quantities, // Pass quantities as JSON
                                'doc': frm.doc,
                                'checked_items': checkedItems, // Pass checked items as JSON

                            },
                            callback: function (response) {
                                var res = response.message;
                                if (res) {
                                    frappe.msgprint(__('Set Target Successfully'));
                                    if (frm.doc.custom_type == "Sales") {
                                        set_css(frm, 'custom_productivity', 'custom_achieved', 'custom_target', 'percentage');

                                    } else if (frm.doc.custom_type == "Collect") {
                                        set_css(frm, 'custom_customer_collects_goal', 'custom_total_collected', 'custom_total_targets', 'percentage_collect');
                                    } else {
                                        set_css(frm, 'custom_productivity', 'custom_achieved', 'custom_target', 'percentage');
                                        set_css(frm, 'custom_customer_collects_goal', 'custom_total_collected', 'custom_total_targets', 'percentage_collect');
                                    }
                                    dialog.hide();
                                    frm.refresh();
                                } else {
                                    frappe.msgprint(__('Error Setting Target'));
                                }
                            }
                        });
                    }
                });

                // Show the main dialog
                dialog.show();
                // Helper function to convert month name to index
                function monthToIndex(month) {
                    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(month);
                }
            }).addClass('bg-info').css({
                "color": "white",
            });


        }
        if (frm.doc.custom_type != "Sales") {

            frm.add_custom_button(__('Remove Customer'), () => {
                // Get the custom_productivity child table data
                let existingClients = frm.doc.custom_customer_collects_goal;
                console.log("existingClients");
                console.log(existingClients);

                // Create the dialog
                let dialog = new frappe.ui.Dialog({
                    title: 'Remove Clients',
                    fields: [
                        {
                            'fieldname': 'clients_table',
                            'fieldtype': 'HTML',
                            'options': `
                                            ${existingClients.map(client => `
                                            <button class="btn  border" style="margin: 5px;" id="${client.customer}" onclick="this.classList.toggle('btn-danger')">${client.customer}</button>                            `).join('')}
                                        `
                        }
                    ],
                    primary_action_label: 'Remove',
                    primary_action() {
                        let clientsToRemove = existingClients.filter(client => document.getElementById(client.customer).classList.contains('btn-danger'));
                        if (clientsToRemove.length > 0) {
                            frappe.call({
                                method: 'spms.utils.utils.remove_customer_from_sales_person',
                                args: {
                                    'values': clientsToRemove.map(client => client.customer), 'doc': frm.doc
                                },
                                callback: function (response) {
                                    var res = response.message;
                                    if (res) {
                                        frappe.msgprint(__('Removed Clients Successfully'));
                                        dialog.hide();
                                        frm.reload_doc();
                                    } else {
                                        frappe.msgprint(__('Error Removing Client'));
                                    }
                                }
                            });
                        } else {
                            frappe.msgprint(__('No Clients to Remove'));
                        }
                    }
                });

                dialog.show();
            }).addClass('bg-danger').css({
                "color": "white",
            });


            frm.add_custom_button(__('Set Collecting Target'), () => {
                let targets = frm.doc.custom_customer_collects_goal;
                console.log(targets);

// Prepare the table HTML
let tableHtml = '<table class="table table-bordered">';
tableHtml += '<thead><tr><th>Customer</th><th>Amount of Money</th><th class="bg-danger">Delete</th></tr></thead><tbody>';

// Add rows to the table
for (let target of targets) {
    tableHtml += `
    <tr>
        <td>${target.customer}</td>
        <td contenteditable="true" id="target_${target.customer.replace(/\s+/g, '_')}">${target.amount_of_money}</td>
        <td><input type="checkbox" class="checkbox" id="checkbox_${target.customer.replace(/\s+/g, '_')}"></td>
    </tr>`;
}

tableHtml += '</tbody></table>';


                // Create the sub-dialog for adding a new row
                let subDialog = new frappe.ui.Dialog({
                    title: 'Add Customer',
                    fields: [
                        {
                            'fieldname': 'customer',
                            'label': 'Customer',
                            'fieldtype': 'Data',
                            // 'options': 'Customer',
                            'reqd': 1,
                            'onchange': function () {
                                var inputName = this.get_value();

                                frappe.db.get_list('Customer', {
                                    filters: {
                                        'customer_name': ['like', '%' + inputName + '%']
                                    },
                                    fields: ['customer_name', 'name']
                                }).then(suggestions => {
                                    let htmlField = subDialog.get_field('suggestions_customer');
                                    if (suggestions.length > 0) {
                                        htmlField.$wrapper.empty(); // clear the HTML field
                                        htmlField.$wrapper.append("Suggestions: <br>");

                                        suggestions.forEach(suggestion => {
                                            let suggestionElement = $(`<p><a class="btn btn-info" href="">${suggestion.customer_name}</a></p>`);
                                            suggestionElement.click(() => {
                                                subDialog.set_values({
                                                    'customer': suggestion.customer_name
                                                });
                                            });
                                            // Extract address values from HTML input fields
                                            customer_address_values_json = {
                                                'address_line_1': $('#address-line-1').val(),
                                                'address_line_2': $('#address-line-2').val(),
                                                'city': $('#city').val(),
                                                'state': $('#state').val(),
                                                'zip_code': $('#zip-code').val(),
                                                'country': $('#country').val()
                                            };
                                            htmlField.$wrapper.append(suggestionElement);
                                        });
                                    }
                                });
                            }
                        },
                        {
                            'fieldname': 'suggestions_customer',
                            'fieldtype': 'HTML',
                            'label': 'Suggestions'
                        },
                        {
                            'fieldname': 'amount_of_money',
                            'label': 'Amount of Money',
                            'fieldtype': 'Float',
                            'reqd': 1
                        },
                        {
                            'fieldname': 'address_html',
                            'fieldtype': 'HTML',
                            'label': 'Address',
                            'reqd': 0,
                            'options': ''
                        }
                    ],
                    primary_action_label: 'Add Customer',
                    primary_action() {

                        // Retrieve entered values from the sub-dialog
                        let newCustomer = subDialog.get_value('customer').trim(); // Trim whitespace from the item
                        let newAmount = subDialog.get_value('amount_of_money');

                        // Check if the item already exists in targets
                        if (targets.some(target => target.customer === newCustomer)) {
                            frappe.msgprint('Customer already exists in the list.');
                            return;
                        }

                        // Append a new row to the table
                        tableHtml += `<tr><td>${newCustomer}</td><td contenteditable="true" id="target_${newCustomer.replace(/\s+/g, '_')}">${newAmount}</td></tr>`;
                        // Update the HTML in the main dialog's table field
                        dialog.get_field('targets_table').$wrapper.html(tableHtml);


                        targets.push({
                            customer: newCustomer,
                            amount_of_money: newAmount
                        });
                        subDialog.hide(); // Hide the sub-dialog                        // Empty the form fields
                        subDialog.fields_dict.customer.set_value('');
                        subDialog.fields_dict.amount_of_money.set_value('');
                    }

                });

                // Create the main dialog
                let dialog = new frappe.ui.Dialog({
                    title: 'Set Target',
                    fields: [{
                        'fieldname': 'month_select',
                        'label': 'Month (optional)',
                        'fieldtype': 'Select',
                        'options': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                        'reqd': 0,
                        'onchange': function () {
                            let selectedMonth = dialog.get_value('month_select');
                            let year = new Date().getFullYear(); // You can adjust the year as per your requirement
                            let startDate = new Date(year, monthToIndex(selectedMonth), 1);
                            let endDate = new Date(year, monthToIndex(selectedMonth) + 1, 0);
                            dialog.fields_dict.from.set_value(startDate);
                            dialog.fields_dict.to.set_value(endDate);
                        }
                    }, {
                        'fieldname': 'section_break',
                        'fieldtype': 'Section Break',
                    },
                    {
                        'fieldname': 'from',
                        'label': 'From',
                        'fieldtype': 'Date',
                        'reqd': 1,
                        'default': frm.doc.custom_from_
                    },
                    //add column break
                    {
                        'fieldname': 'column_break',
                        'fieldtype': 'Column Break',
                    },
                    {
                        'fieldname': 'to',
                        'label': 'To',
                        'fieldtype': 'Date',
                        'reqd': 1,
                        'default': frm.doc.custom_to_
                    },
                    {
                        'fieldname': 'section_break',
                        'fieldtype': 'Section Break',
                    },
                    {
                        'fieldname': 'target_type',
                        'label': 'Target Type',
                        'fieldtype': 'Select',
                        'reqd': 1,
                        'options': "Customer Debt-based Target\nFixed Target",
                        'default': frm.doc.custom__target_type,
                        'onchange': function () {
                            let target_type = dialog.get_value('target_type');
                            if (target_type === 'Customer Debt-based Target') {
                                dialog.get_field('target').$wrapper.hide();
                            } else {
                                dialog.get_field('target').$wrapper.show();
                            }
                        }
                    },
                    {
                        'fieldname': 'target',
                        'label': 'Target',
                        'fieldtype': 'Float',
                        'reqd': 1,
                        'default': frm.doc.custom_additional_target
                    },
                    {
                        'fieldname': 'section_break',
                        'fieldtype': 'Section Break',
                    },
                    {
                        'fieldname': 'targets_table',
                        'fieldtype': 'HTML',
                        'options': tableHtml
                    },
                    // Add a button to open the sub-dialog for adding a new row
                    {
                        'fieldname': 'add_row_button',
                        'label': 'Add Customer',
                        'fieldtype': 'Button',
                        'icon': 'plus',
                        'click': function () {
                            subDialog.show();

                            // Set the HTML content for the address field
                            var address_html = `
                            <div class="row">
                                <div class="col-md-6">
                                    <label for="address-line-1">Address Line 1:</label>
                                    <input type="text" id="address-line-1" name="address-line-1" class="form-control"><br>

                                    <label for="address-line-2">Address Line 2:</label>
                                    <input type="text" id="address-line-2" name="address-line-2" class="form-control"><br>

                                    <label for="city">City:</label>
                                    <input type="text" id="city" name="city" class="form-control"><br>
                                </div>
                                <div class="col-md-6">
                                    <label for="state">State:</label>
                                    <input type="text" id="state" name="state" class="form-control"><br>

                                    <label for="zip-code">Zip Code:</label>
                                    <input type="text" id="zip-code" name="zip-code" class="form-control"><br>

                                    <label for="country">Country:</label>
                                    <input type="text" id="country" name="country" class="form-control"><br>
                                </div>
                            </div>
                        `;

                            subDialog.fields_dict.address_html.$wrapper.html(address_html);
                        }
                    }
                    ],
                    primary_action_label: 'Set Target',
                    primary_action() {
                        let quantities = {};
                        // Retrieve quantities from the table
                        for (let target of targets) {
                            let element = document.getElementById(`target_${target.customer.replace(/\s+/g, '_')}`);
                            if (element) {
                                quantities[target.customer] = parseFloat(element.innerText);
                            } else {
                                console.error(`Element with ID 'target_${target.customer.replace(/\s+/g, '_')}' not found.`);
                            }
                        }
                        let checkedItems = {};
                        // Retrieve checked items
                        targets.forEach(target => {
                            let checkbox = document.getElementById(`checkbox_${target.customer.replace(/\s+/g, '_')}`);
                            if (checkbox && checkbox.checked) {
                                checkedItems["item"] = target.customer;
                            }
                        });
                        frappe.call({
                            method: 'spms.utils.utils.set_collecting_target',
                            args: {
                                'values': dialog.get_values(),
                                'quantities': quantities, // Pass quantities as JSON
                                'doc': frm.doc,
                                "address": customer_address_values_json,
                                'checked_items': checkedItems, // Pass checked items as JSON

                            },
                            callback: function (response) {
                                var res = response.message;
                                if (res) {
                                    frappe.msgprint(__('Set Target Successfully'));
                                    if (frm.doc.custom_type == "Sales") {
                                        set_css(frm, 'custom_productivity', 'custom_achieved', 'custom_target', 'percentage');

                                    } else if (frm.doc.custom_type == "Collect") {
                                        set_css(frm, 'custom_customer_collects_goal', 'custom_total_collected', 'custom_total_targets', 'percentage_collect');
                                    } else {
                                        set_css(frm, 'custom_productivity', 'custom_achieved', 'custom_target', 'percentage');
                                        set_css(frm, 'custom_customer_collects_goal', 'custom_total_collected', 'custom_total_targets', 'percentage_collect');
                                    }
                                    dialog.hide();
                                    frm.refresh();
                                } else {
                                    frappe.msgprint(__('Error Setting Target'));
                                }
                            }
                        });
                    }
                });
                // Helper function to convert month name to index
                function monthToIndex(month) {
                    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(month);
                }
                // Show the main dialog
                dialog.show();
                let target_type = dialog.get_value('target_type');
                if (target_type === 'Customer Debt-based Target') {
                    dialog.get_field('target').$wrapper.hide();
                } else {
                    dialog.get_field('target').$wrapper.show();
                }
            }).addClass('bg-info').css({
                "color": "white",
            });

        }
        refresh_when_click_btn(frm)
        if (frm.doc.custom_type == "Sales") {
            set_css(frm, 'custom_productivity', 'custom_achieved', 'custom_target', 'percentage');

        } else if (frm.doc.custom_type == "Collect") {
            set_css(frm, 'custom_customer_collects_goal', 'custom_total_collected', 'custom_total_targets', 'percentage_collect');
        } else {
            set_css(frm, 'custom_productivity', 'custom_achieved', 'custom_target', 'percentage');
            set_css(frm, 'custom_customer_collects_goal', 'custom_total_collected', 'custom_total_targets', 'percentage_collect');
        }
        progress_bar(frm, "custom_productivity", "achievement", "number_of_visits", "verified_visits");
        progress_bar(frm, "custom_target_breakdown", "achievement", "quantity", "sold");
    },
    custom_fixed_target: function (frm) {
        frm.set_value("custom_total_targets", frm.doc.custom_fixed_target);
        frm.refresh();
    },

    /* A trigger that is called when the user changes the value of the field "additional_target_int" in
    the Collects Goal doctype. */
    custom_additional_target: function (frm) {
        frm.set_value("custom_total_targets", total + frm.doc.custom_additional_target);
        frm.refresh();
    },

    /* It clears the table and sets the values of the fields to 0 */
    custom_target_type: function (frm) {
        reset_target_values(frm)
    },
    after_save: function (frm) {
        frm.set_df_property("custom_target_type", "read_only", 1)
        frm.set_df_property("custom_type", "read_only", 1)

    },
    validate: function (frm) {
        let diff_days = frappe.datetime.get_day_diff(frm.doc.custom_to, frm.doc.custom_from);
        frm.set_value('custom_number_of_days', diff_days);

    }
});

frappe.ui.form.on('Productivity', {
    /* A function that is called when the class field is changed. */
    class_name: function (frm, cdt, cdn) {
        let row = locals[cdt][cdn]
        /* A switch statement that is used to set the number of visits based on the class of the doctor. */
        switch (row.class_name) {
            case "A":
                row.number_of_visits = 3
                break
            case "A+":
                row.number_of_visits = 4
                break
            case "A-":
                row.number_of_visits = 2
                break
            case "B":
                row.number_of_visits = 2
                break
            case "C":
                row.number_of_visits = 1
                break
            case "D":
                row.number_of_visits = 1
                break
        }
        frm.refresh()
    }
})

function reset_target_values(frm) {
    frm.clear_table("custom_customer_collects_goal");
    frm.set_value("custom_additional_target", 0);
    frm.set_value("custom_fixed_target", 0);
    frm.set_value("custom_total_targets", 0);
    frm.refresh();
}

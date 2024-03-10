
var selected_suggestion = null;
var selected_suggestion_id = null;
frappe.ui.form.on('Sales Person', {
    refresh(frm) {
      
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
                            <style>
                                .client-table th, .client-table td {
                                    width: 150px;
                                    border: 1px solid black;
                                    text-align: left;
                                    padding: 8px;
                                }
                                .client-table {
                                    border-collapse: collapse;
                                }
                            </style>
                            <table class="client-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Client</th>
                                        <th>Name</th>
                                        <th>Class</th>
                                        <th>Achievement</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${existingClients.map(client => `
                                        <tr>
                                            <td><input type="checkbox" id="${client.client}" checked></td>
                                            <td>${client.client}</td>
                                            <td>${client.name1}</td>
                                            <td>${client.class}</td>
                                            <td>${client.achievement}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        `
                    }
                ],
                primary_action_label: 'Remove',
                primary_action() {
                    let clientsToRemove = existingClients.filter(client => document.getElementById(client.client).checked);
                    
                    if (clientsToRemove.length > 0) {
                        frappe.call({
                            method: 'spms.utils.utils.remove_client_from_sales_person',
                            args: {
                                'values': clientsToRemove.map(client => client.client), 'doc': frm.doc
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
        }).addClass('bg-danger', 'text-white').css({
            "color": "white",
        });
          frm.add_custom_button(__('Add Client'), () => {
            var dialog = new frappe.ui.Dialog({
                title: 'Create Client',
                fields: [
                    {
                        'fieldname': 'full_name',
                        'fieldtype': 'Data',
                        'label': 'Full Name',
                        'reqd': 1,
                        'onchange': function () {
                            var inputName = this.get_value();
                            frappe.db.get_list('Client', {
                                filters: {
                                    'full_name': ['like', '%' + inputName + '%']
                                },
                                fields: ['full_name', 'name']
                            }).then(suggestions => {
                                let htmlField = dialog.get_field('suggestions');
                                htmlField.$wrapper.empty(); // clear the HTML field
                                htmlField.$wrapper.append("Suggestions: <br>");

                                suggestions.forEach(suggestion => {
                                    let suggestionElement = $(`<p><a style="color:blue;" href="">${suggestion.full_name}</a></p>`);
                                    suggestionElement.click(() => {
                                        frappe.db.get_doc('Client', suggestion.name).then(doc => {
                                            selected_suggestion = suggestion.full_name;
                                            selected_suggestion_id = suggestion.name;
                                            dialog.set_values({
                                                'full_name': suggestion.full_name,
                                                'salutation': doc.salutation,
                                                'class': doc.class,
                                                'department': doc.department,
                                                'phone': doc.phone,
                                                'territory': doc.territory
                                            });
                                        });
                                    });
                                    htmlField.$wrapper.append(suggestionElement);
                                });
                            });
                        }
                    },
                    {
                        'fieldname': 'suggestions',
                        'fieldtype': 'HTML',
                        'label': 'Suggestions'
                    },
                    { 'fieldname': 'salutation', 'fieldtype': 'Data', 'label': 'Salutation', 'reqd': 1 },
                    { 'fieldname': 'class', 'fieldtype': 'Select', 'label': 'Class', 'reqd': 1, 'options': 'A\nA+\nB\nB+\nC' },
                    { 'fieldname': 'department', 'fieldtype': 'Link', 'label': 'Department', 'reqd': 1, 'options': 'Doctor Department' },
                    { 'fieldname': 'phone', 'fieldtype': 'Phone', 'label': 'Phone', 'reqd': 1, "default": "+964-" },
                    { 'fieldname': 'territory', 'fieldtype': 'Link', 'label': 'Territory', 'reqd': 1, 'options': 'Territory' },
                ],
                primary_action_label: 'Submit',
                primary_action(values) {
                    console.log(values);
                    if(values.full_name == selected_suggestion){
                        frappe.call({
                            method: 'spms.utils.utils.create_client_to_sales_person',
                            args: {
                                'values': values,
                                'doc': frm.doc,
                                'is_present':true,
                                'client':selected_suggestion_id
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
                    }else{
                        frappe.call({
                            method: 'spms.utils.utils.create_client_to_sales_person',
                            args: {
                                'values': values,
                                'doc': frm.doc,
                                'is_present':false,
                                'client':null
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
                        });                    }
                    // Your primary action code here
                }
            });
            dialog.show();
        }).addClass('bg-success', 'text-white').css({
            "color": "white",
        });

    }

});

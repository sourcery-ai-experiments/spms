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
                            ${existingClients.map(client => `
                            <button class="btn  border" style="margin: 5px;" id="${client.client}" onclick="this.classList.toggle('btn-danger')">${client.name1}</button>                            `).join('')}
                        `
                    }
                ],
                primary_action_label: 'Remove',
                primary_action() {
                    let clientsToRemove = existingClients.filter(client => document.getElementById(client.client).classList.contains('btn-danger'));
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
        }).addClass('bg-danger').css({
            "color": "white",
        });

        frm.add_custom_button(__('Add Client'), () => {
            var dialog = new frappe.ui.Dialog({
                title: 'Create Client',
                fields: [
                    { 'fieldname': 'salutation', 'fieldtype': 'Link', 'label': 'Salutation', 'reqd': 1, 'options': "Salutation" },
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
                    { 'fieldname': 'class', 'fieldtype': 'Select', 'label': 'Class', 'reqd': 1, 'options': 'A\nA+\nB\nB+\nC' },
                    { 'fieldname': 'department', 'fieldtype': 'Link', 'label': 'Department', 'reqd': 1, 'options': 'Doctor Department' },
                    { 'fieldname': 'phone', 'fieldtype': 'Phone', 'label': 'Phone', 'reqd': 1, "default": "+964-" },
                    { 'fieldname': 'territory', 'fieldtype': 'Link', 'label': 'Territory', 'reqd': 1, 'options': 'Territory' },
                ],
                primary_action_label: 'Submit',
                primary_action(values) {
                    console.log(values);
                    if (values.full_name == selected_suggestion) {
                        frappe.call({
                            method: 'spms.utils.utils.create_client_to_sales_person',
                            args: {
                                'values': values,
                                'doc': frm.doc,
                                'is_present': true,
                                'client': selected_suggestion_id
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
                                'is_present': false,
                                'client': null
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
        }).addClass('bg-success', 'text-white').css({
            "color": "white",
        });

        frm.add_custom_button(__('Set Target'), () => {

            let targets = frm.doc.custom_target_breakdown;
            console.log(targets);

            // Prepare the table HTML
            let tableHtml = '<table class="table table-bordered">';
            tableHtml += '<thead><tr><th>Item</th><th>Quantity</th></tr></thead><tbody>';

            // Add rows to the table
            for (let target of targets) {
                tableHtml += `<tr><td>${target.item}</td><td contenteditable="true">${target.quantity}</td></tr>`;
            }

            tableHtml += '</tbody></table>';

            // Create the dialog
            let dialog = new frappe.ui.Dialog({
                title: 'Set Target',
                fields: [
                    {
                        'fieldname': 'from',
                        'label': 'From',
                        'fieldtype': 'Date',
                        'reqd': 1
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
                        'reqd': 1
                    },
                    {
                        'fieldname': 'section_break',
                        'fieldtype': 'Section Break',
                    },
                    {
                        'fieldname': 'target',
                        'label': 'Target',
                        'fieldtype': 'Float',
                        'reqd': 1
                    },
                    {
                        'fieldname': 'section_break',
                        'fieldtype': 'Section Break',
                    },
                    {
                        'fieldname': 'targets_table',
                        'fieldtype': 'HTML',
                        'options': tableHtml
                    }

                ],
                primary_action_label: 'Set Target',
                primary_action() {

                    frappe.call({
                        method: 'spms.utils.utils.set_target',
                        args: {
                            'values': dialog.get_values(),
                            'doc': frm.doc
                        },
                        callback: function (response) {
                            var res = response.message;
                            if (res) {
                                frappe.msgprint(__('Set Target Successfully'));
                                dialog.hide();
                                frm.reload_doc();
                            } else {
                                frappe.msgprint(__('Error Setting Target'));
                            }
                        }
                    });

                }
            });

            dialog.show();

            // // Add the HTML field to the dialog
            // dialog.fields.push({
            //     'fieldname': 'targets_table',
            //     'fieldtype': 'HTML',
            //     'options': tableHtml
            // });


        }).addClass('bg-info').css({
            "color": "white",
        });

    }

});


function progress_bar(frm, table_name, field_name, options = { color: "", text: "" }) {
    for (let row of $(`[data-fieldname = ${table_name}] .grid-body .rows`).children()) {
        let idx = $(row).data("idx") - 1
        let row_info = frm.doc[table_name][idx]
        const width = row_info[field_name]
        row.firstChild.querySelector(`[data-fieldname=${field_name}]`)
            .innerHTML =
            `<div class="progress" style="height: 20px; font-size: 13px;font-weight:500;">
				<div style="width:${width}%;background:${options.color && options.color};" class="progress-bar" role="progressbar">${options.text && options.text}${width}%</div>
			</div>`
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
        refresh_when_click_btn(frm)
        progress_bar(frm, "custom_customer_collects_goal", "achieved_collects")
        progress_bar(frm, "custom_customer_collects_goal", "achieved_visits")
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
    }
});
frappe.ui.form.on('Sales Person', {
    refresh: function (frm) {
        refresh_when_click_btn(frm)
        progress_bar(frm, "custom_productivity", "achievement")
        progress_bar(frm, "custom_target_breakdown", "achievement")
    },
    "custom_to": function (frm) {
        if (frm.doc.custom_to < frm.doc.custom_from) {
            frappe.msgprint("Please, Select Valid Period for Target)")
        }

        // find diff between in and out date
        let diff_days = frappe.datetime.get_day_diff(frm.doc.custom_to, frm.doc.custom_from);
        frm.set_value("custom_number_of_days", diff_days);
    }
});
frappe.ui.form.on('Productivity', {
    /* A function that is called when the class field is changed. */
    class: function (frm, cdt, cdn) {
        let row = locals[cdt][cdn]
        /* A switch statement that is used to set the number of visits based on the class of the doctor. */
        switch (row.class) {
            case "A":
                row.number_of_visits = 3
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

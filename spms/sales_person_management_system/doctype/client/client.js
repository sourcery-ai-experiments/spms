// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

/* A function that is called when the form is refreshed. */
frappe.ui.form.on('Client', {
	refresh: function (frm) {
		/* Setting the query for the reference_name field in the doctor_reference table. */
		frm.set_query('reference_name', 'doctor_reference', function (doc, cdt, cdn) {
			var d = locals[cdt][cdn];
			return {
				filters: [
					['Customer', 'territory', 'in', frm.doc.territory]
				]
			};
		});
	},
	// validate : function (frm){
	// 	// Add validation logic here
    //     const phone_number = frm.doc.phone
    //     const phoneRegex = /^(?:0)(?:\d\s?){10}$/;

    //     if (!phoneRegex.test(phone_number)) {
    //         frappe.msgprint("Phone number must be correct please");
    //         frappe.validated = false; // Prevent saving if validation fails
    //     }
	// }
});
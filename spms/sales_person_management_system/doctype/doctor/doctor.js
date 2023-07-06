// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

/* A function that is called when the form is refreshed. */
frappe.ui.form.on('Doctor', {
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
	}
});
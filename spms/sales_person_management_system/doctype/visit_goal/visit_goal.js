// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

frappe.ui.form.on('Visit Goal', {
	"to": function (frm) {
		if (frm.doc.to < frm.doc.from) {
			frappe.msgprint("Please, Select Valid Period for Target)")
		}

		// find diff between in and out date
		let diff_days = frappe.datetime.get_day_diff(frm.doc.to, frm.doc.from);
		frm.set_value("number_of_days", diff_days);
	}
})

frappe.ui.form.on('Visit Goal', {
	refresh: function (frm) {
		frm.set_query('doctor', 'doctor_visit_goal', function (doc, cdt, cdn) {
			var d = locals[cdt][cdn];
			return {
				filters: [
					['Doctor', 'territory', 'in', frm.doc.territory]
				]
			};
		});
	}
});

frappe.ui.form.on('Visit Goal', {
	refresh: function (frm) {
		frm.set_query('reference', 'doctor_visit_goal', function (doc, cdt, cdn) {
			var d = locals[cdt][cdn];
			return {
				filters: [
					['Customer', 'territory', 'in', frm.doc.territory]
				]
			};
		});
	}
});

// claculating the number of visit depending on the class value(A,B,C,D)
frappe.ui.form.on("Doctor Visit Goal", {
	class: function (frm, cdt, cdn) {
		let child = locals[cdt][cdn];
		switch (child.class) {
			case "A":
				child.number_of_visit = 3
				break
			case "B":
				child.number_of_visit = 2
				break
			case "C":
				child.number_of_visit = 1
				break
			case "D":
				child.number_of_visit = 1
				break
		}
		frm.refresh()
	}
});

// making the progress bar for the Visit Goal doctype 
frappe.ui.form.on('Visit Goal', {
	refresh: function (frm) {
		set_css(frm);
	}
})

function set_css(frm) {
	let total_number_of_visits = 0
	let total_verified_visits = 0

	for (let row of frm.doc.doctor_visit_goal) {
		total_number_of_visits += row.number_of_visit
		total_verified_visits += row.verified_visits
	}
	let percentage = (total_verified_visits / total_number_of_visits) * 100
	document.getElementById("percentage").style.width = `${percentage}%`
	document.getElementById("percentage").style.backgroundColor = `#FF5858`
	document.getElementById("percentage").innerText = `${Math.round(percentage)}%`
}
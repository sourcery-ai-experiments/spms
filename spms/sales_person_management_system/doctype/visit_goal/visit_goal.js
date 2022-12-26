// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

let doctor_list = []
let name_of_row_in_doctor_visit_goal = {}
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

frappe.ui.form.on("Doctor Visit Goal", {

	
});
// claculating the number of visit depending on the class value(A,B,C,D)
frappe.ui.form.on("Doctor Visit Goal", {

	doctor: function (frm, cdt, cdn) {
		let child = locals[cdt][cdn];
		if(!doctor_list.includes(child.doctor)){
			doctor_list.push(child.doctor)
			// tracking the doctor and class for 'doctor_visit_goal_remove' function
			name_of_row_in_doctor_visit_goal[cdn] = {
				doctor_name : child.doctor,
				doctor_class : child.class
			}
			switch (child.class) {
				case "A":
					frm.doc.number_of_visits += 3
					break
				case "B":
					frm.doc.number_of_visits += 2
					break
				case "C":
					frm.doc.number_of_visits += 1
					break
				case "D":
					frm.doc.number_of_visits += 1
					break
			}
		}
		frm.refresh()
	},
	doctor_visit_goal_remove: function(frm,cdt,cdn){
		const deleted_doctor_name = name_of_row_in_doctor_visit_goal[cdn].doctor_name
		const deleted_doctor_class = name_of_row_in_doctor_visit_goal[cdn].doctor_class

		let doctor_not_exists_in_child_table = true
		for(let row of frm.doc.doctor_visit_goal){
			if(row.doctor === deleted_doctor_name){
				doctor_not_exists_in_child_table = false
				break
			}
		}
		if(doctor_not_exists_in_child_table){
			const index = doctor_list.indexOf(deleted_doctor_name)
			doctor_list.splice(index,1)
			switch (deleted_doctor_class) {
				case "A":
					frm.doc.number_of_visits -= 3
					break
				case "B":
					frm.doc.number_of_visits -= 2
					break
				case "C":
					frm.doc.number_of_visits -= 1
					break
				case "D":
					frm.doc.number_of_visits -= 1
					break
			}
		}
		frm.refresh()
	},

});

// making the progress bar for the Visit Goal doctype 
frappe.ui.form.on('Visit Goal', {
	refresh: function (frm) {
		set_css(frm);
	}
})

function set_css(frm) {
	let total_number_of_visits = frm.doc.number_of_visits
	let total_verified_visits = frm.doc.verified_visits

	// for (let row of frm.doc.doctor_visit_goal) {
	// 	total_verified_visits += row.verified_visits
	// }
	let percentage = (total_verified_visits / total_number_of_visits) * 100
	document.getElementById("percentage").style.width = `${percentage}%`
	document.getElementById("percentage").style.backgroundColor = `#d90429`
	document.getElementById("percentage").innerText = `${Math.round(percentage)}%`
	if (percentage === 100){
		document.getElementById("percentage").style.backgroundColor = `#06d6a0`
		document.getElementById("percentage").innerText = `Completed 100%`
	}
}
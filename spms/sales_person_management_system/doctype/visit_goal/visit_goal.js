// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

// let doctor_list = [] // not used anymore
// let name_of_row_in_doctor_visit_goal = {} // not used anymore

// adding new row to progress bar tables
function append_to_table(table_id,width){
	let color = ""
	let completed_text = ""
	if(width < 50){
		color = "#ef476f"
	}
	else if(width >= 50 && width < 90){
		// not changed
		color = "#edae49"
	}
	else if(width >= 90 && width < 100){
		color = "#57cc99"
	}
	else{
		color = "#57cc99"
		completed_text = "Completed "
	}
	$(`#${table_id}`).append(`<div class="grid-row">
		<div class="data-row row">
			<div class="col grid-static-col col-xs-12 ">
				<div class="progress" style="height: 20px; font-size: 13px;font-weight:500">
					<div style="width:${width}%;background:${color}" class="progress-bar" role="progressbar">${completed_text}${width}%</div>
				</div>
			</div>
		</div>
	</div>`)
}



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
		frm.set_query('doctor', 'productivity', function (doc, cdt, cdn) {
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
		// check if there are any row in target breakdown table
		if(frm.doc.target_breakdown){
			// loop throw every row and append new progress bar for that row
			for (let row of frm.doc.target_breakdown){
				row.achievement = Math.round(row.sold / row.quantity * 100)
				append_to_table("rows-1",row.achievement || 0)
			}
		}
		// check if there are any row in productivity table
		if(frm.doc.productivity){
			// loop throw every row and append new progress bar for that row
			for (let row of frm.doc.productivity){
				row.achievement = Math.round(row.verified_visits / row.number_of_visits * 100)
				append_to_table("rows-2",row.achievement || 0)
			}
		}
	}
});
frappe.ui.form.on('Target Breakdown', {
	// add new progress bar on adding new row 
	target_breakdown_add : function(frm){
		append_to_table("rows-1",0)
	},
	// refresh the page after removing a row to remove the progress bar for that row
	target_breakdown_remove : function(frm){
		frm.refresh()
	}
})
frappe.ui.form.on('Productivity', {
	// add new progress bar on adding new row 
	productivity_add : function(frm){
		append_to_table("rows-2",0)
	},
	// refresh the page after removing a row to remove the progress bar for that row
	productivity_remove : function(frm){
		frm.refresh()
	},
	class : function(frm,cdt,cdn){
		let row = locals[cdt][cdn]
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
// claculating the number of visit depending on the class value(A,B,C,D)
// frappe.ui.form.on("Doctor Visit Goal", {

// 	doctor: function (frm, cdt, cdn) {
// 		let child = locals[cdt][cdn];
// 		// tracking the doctor and class for 'doctor_visit_goal_remove' function
// 		name_of_row_in_doctor_visit_goal[cdn] = {
// 			doctor_name : child.doctor,
// 			doctor_class : child.class
// 		}
// 		if(!doctor_list.includes(child.doctor)){
// 			doctor_list.push(child.doctor)
			
// 			switch (child.class) {
// 				case "A":
// 					frm.doc.number_of_visits += 3
// 					frm.add_child("doc_num_of_visits",{
// 						doctor : child.doctor,
// 						number_of_visits : 3
// 					})
// 					break
// 				case "B":
// 					frm.doc.number_of_visits += 2
// 					frm.add_child("doc_num_of_visits",{
// 						doctor : child.doctor,
// 						number_of_visits : 2
// 					})
// 					break
// 				case "C":
// 					frm.doc.number_of_visits += 1
// 					frm.add_child("doc_num_of_visits",{
// 						doctor : child.doctor,
// 						number_of_visits : 1
// 					})
// 					break
// 				case "D":
// 					frm.doc.number_of_visits += 1
// 					frm.add_child("doc_num_of_visits",{
// 						doctor : child.doctor,
// 						number_of_visits : 1
// 					})
// 					break
// 			}
// 		}
// 		frm.refresh()
// 	},
// 	doctor_visit_goal_remove: function(frm,cdt,cdn){
// 		const deleted_doctor_name = name_of_row_in_doctor_visit_goal[cdn].doctor_name
// 		const deleted_doctor_class = name_of_row_in_doctor_visit_goal[cdn].doctor_class

// 		let doctor_not_exists_in_child_table = true

// 		for(let row of frm.doc.doctor_visit_goal){
// 			if(row.doctor === deleted_doctor_name){
// 				doctor_not_exists_in_child_table = false
// 				break
// 			}
// 		}
// 		if(doctor_not_exists_in_child_table){
// 			const index = doctor_list.indexOf(deleted_doctor_name)
// 			doctor_list.splice(index,1)
// 			frm.get_field("doc_num_of_visits").grid.grid_rows[index].remove()
// 			switch (deleted_doctor_class) {
// 				case "A":
// 					frm.doc.number_of_visits -= 3
// 					// console.log(frm.get_field("doc_num_of_visits").grid.grid_rows[index])
// 					break
// 				case "B":
// 					frm.doc.number_of_visits -= 2
// 					break
// 				case "C":
// 					frm.doc.number_of_visits -= 1
// 					break
// 				case "D":
// 					frm.doc.number_of_visits -= 1
// 					break
// 			}
// 		}
// 		frm.refresh()
// 	},

// });

// making the progress bar for the Visit Goal doctype 
frappe.ui.form.on('Visit Goal', {
	refresh: function (frm) {
		set_css(frm);
	}
})

function set_css(frm) {
	if(!frm.doc.productivity){
		return
	}
	let total_number_of_visits =  0
	let total_verified_visits =  0
	for(let row of frm.doc.productivity){
		total_number_of_visits += row.number_of_visits 
		total_verified_visits += row.verified_visits 
	}

	let productivity_percentage = (total_verified_visits / total_number_of_visits) * 100
	let percentage = (frm.doc.achieved / frm.doc.target) * 100

	let avg_percentage = (productivity_percentage + percentage) / 2

	document.getElementById("percentage").style.width = `${avg_percentage}%`
	document.getElementById("percentage").style.backgroundColor = `#ef476f` // red 
	document.getElementById("percentage").innerText = `${Math.round(avg_percentage)}%`
	if (avg_percentage >= 50 && avg_percentage < 90){
		document.getElementById("percentage").style.backgroundColor = `#edae49` // yellow 
		document.getElementById("percentage").innerText = `${Math.round(avg_percentage)}%`
	}
	else if (avg_percentage >= 90 && avg_percentage < 100){
		document.getElementById("percentage").style.backgroundColor = `#57cc99` // green
		document.getElementById("percentage").innerText = `${Math.round(avg_percentage)}%`
	}
	else if (avg_percentage >= 100){
		document.getElementById("percentage").style.backgroundColor = `#57cc99` // green
		document.getElementById("percentage").innerText = `Completed ${Math.round(avg_percentage)}%`
	}
}



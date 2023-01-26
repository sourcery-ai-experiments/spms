// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

let first_try = true

/**
 * It returns an object with two properties, color and completed_text
 * @param width - The width of the progress bar.
 * @returns An object with two properties: color and completed_text
 */
function get_progress_data(width) {
	let color = ""
	let completed_text = ""
	if (width < 50) {
		color = "#ef476f"
	}
	else if (width >= 50 && width < 90) {
		// not changed
		color = "#edae49"
	}
	else if (width >= 90 && width < 100) {
		color = "#57cc99"
	}
	else {
		color = "#57cc99"
		completed_text = "Completed "
	}
	return {
		color, completed_text
	}
}



/* Used to make sure that the user selects a valid period for the target. */
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

/* Used to filter the doctors in the productivity table based on the territory of the visit goal. */
frappe.ui.form.on('Visit Goal', {
	refresh: function (frm) {
		frm.set_query('doctor', 'productivity', function (doc, cdt, cdn) {
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
		if(frm.doc.productivity){
			for(let row of frm.doc.productivity){
				row.achievement = Math.round(row.verified_visits / row.number_of_visits * 100)
			}
		}
		if(frm.doc.target_breakdown){
			for(let row of frm.doc.target_breakdown){
				row.achievement = Math.round(row.sold / row.quantity * 100)
			}
		}
	}
})
frappe.ui.form.on('Visit Goal', {
	refresh: function (frm) {

		/* Used to refresh the page when the user clicks on the next page, first page, previous page, or last
		page Buttons */
		refresh_when_click_btn(frm)
		progress_bar(frm,"productivity","achievement")
		progress_bar(frm,"target_breakdown","achievement")
		// /* Used to make the progress bar for the achievement field in the productivity table. */
		// for (let row of $("[data-fieldname = 'productivity'] .grid-body .rows").children()) {
		// 	let idx = $(row).data("idx") - 1
		// 	const productivity_row = frm.doc["productivity"][idx]
		// 	productivity_row.achievement = Math.round(productivity_row.verified_visits / productivity_row.number_of_visits * 100)
		// 	const { color, completed_text } = get_progress_data(productivity_row.achievement)
		// 	row.firstChild.querySelector("[data-fieldname='achievement']").innerHTML = `<div class="progress" style="height: 20px; font-size: 13px;font-weight:500">
		// 		<div style="width:${productivity_row.achievement}%;background:${color}" class="progress-bar" role="progressbar">${completed_text}${productivity_row.achievement}%</div>
		// 	</div>`
		// }
		// /* Used to make the progress bar for the achievement field in the target breakdown table. */
		// for (let row of $("[data-fieldname = 'target_breakdown'] .grid-body .rows").children()) {
		// 	let idx = $(row).data("idx") - 1
		// 	const target_breakdown_row = frm.doc["target_breakdown"][idx]
		// 	target_breakdown_row.achievement = target_breakdown_row.achievement = Math.round(target_breakdown_row.sold / target_breakdown_row.quantity * 100)
		// 	const { color, completed_text } = get_progress_data(target_breakdown_row.achievement)
		// 	row.firstChild.querySelector("[data-fieldname='achievement']").innerHTML = `<div class="progress" style="height: 20px; font-size: 13px;font-weight:500">
		// 		<div style="width:${target_breakdown_row.achievement}%;background:${color}" class="progress-bar" role="progressbar">${completed_text}${target_breakdown_row.achievement}%</div>
		// 	</div>`
		// }
	}
})

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

function progress_bar(frm,table_name,field_name,options = {color:"",text:""}){
    for(let row of $(`[data-fieldname = ${table_name}] .grid-body .rows`).children()) {
        let idx = $(row).data("idx") - 1
        let row_info = frm.doc[table_name][idx]
        const width = row_info[field_name]
        row.firstChild.querySelector(`[data-fieldname=${field_name}]`)
        .innerHTML = 
            `<div class="progress" style="height: 20px; font-size: 13px;font-weight:500;border-radius:300px">
                <div style="width:${width}%;background:${options.color&&options.color};" class="progress-bar" role="progressbar">${options.text&&options.text}${width}%</div>
            </div>`
    }
}


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

/* Used to make the progress bar for the Visit Goal doctype. */
frappe.ui.form.on('Visit Goal', {
	refresh: function (frm) {
		set_css(frm);
	}
})

/**
 * It takes the percentage of the achieved target and the productivity percentage and calculates the
 * average of the two. Then it sets the width of the progress bar to the average percentage and sets
 * the background color of the progress bar to red, yellow or green depending on the average percentage
 * @param frm - The current form object.
 * @returns the percentage of the target achieved.
 */
function set_css(frm) {
	if (frm.doc.productivity) {
		
		let total_number_of_visits = 0
		let total_verified_visits = 0
	for (let row of frm.doc.productivity) {
		total_number_of_visits += row.number_of_visits
		total_verified_visits += row.verified_visits
	}
	
	let productivity_percentage = (total_verified_visits / total_number_of_visits) * 100
	let percentage = (frm.doc.achieved / frm.doc.target) * 100

	let avg_percentage = (productivity_percentage + percentage) / 2 || 0

	document.getElementById("percentage").style.width = `${avg_percentage}%`
	document.getElementById("percentage").style.backgroundColor = `#ef476f` // red 
	document.getElementById("percentage").innerText = `${Math.round(avg_percentage)}%`
	if (avg_percentage >= 50 && avg_percentage < 90) {
		document.getElementById("percentage").style.backgroundColor = `#edae49` // yellow 
		document.getElementById("percentage").innerText = `${Math.round(avg_percentage)}%`
	}
	else if (avg_percentage >= 90 && avg_percentage < 100) {
		document.getElementById("percentage").style.backgroundColor = `#57cc99` // green
		document.getElementById("percentage").innerText = `${Math.round(avg_percentage)}%`
	}
	else if (avg_percentage >= 100) {
		document.getElementById("percentage").style.backgroundColor = `#57cc99` // green
		document.getElementById("percentage").innerText = `Completed ${Math.round(avg_percentage)}%`
	}
}
}



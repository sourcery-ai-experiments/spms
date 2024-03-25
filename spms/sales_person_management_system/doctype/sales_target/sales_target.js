// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt


/* Adding a button to the form. */
frappe.ui.form.on('Sales Target', {
	refresh: function (frm) {
		frm.add_custom_button(__('Reset Fields'), function () {
			resetFields(frm)
		}).addClass("btn-danger");
	}
});


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
frappe.ui.form.on('Sales Target', {
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
frappe.ui.form.on('Sales Target', {
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

/* Used to calculate the achievement percentage for the productivity table and the target breakdown
table. */
frappe.ui.form.on('Sales Target', {
	refresh: function (frm) {
		if (frm.doc.productivity) {
			for (let row of frm.doc.productivity) {
				row.achievement = Math.round(row.verified_visits / row.number_of_visits * 100)
			}
		}
		if (frm.doc.target_breakdown) {
			for (let row of frm.doc.target_breakdown) {
				row.achievement = Math.round(row.sold / row.quantity * 100)
			}
		}
	}
})

/* Used to refresh the page when the user clicks on the next page, first page, previous page, or last
page. */
frappe.ui.form.on('Sales Target', {
	refresh: function (frm) {
		refresh_when_click_btn(frm)
		progress_bar(frm, "productivity", "achievement")
		progress_bar(frm, "target_breakdown", "achievement")
	}
})

/**
 * > When the user clicks on the pagination buttons, the page will refresh
 * @param frm - The form object
 */
function refresh_when_click_btn(frm) {
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

/**
 * It takes a frappe form, a table name, a field name, and an options object, and then it replaces the
 * field with a progress bar
 * @param frm - The current form object
 * @param table_name - The name of the table you want to add the progress bar to.
 * @param field_name - The field name of the field you want to display the progress bar for.
 * @param [options] - 
 */
function progress_bar(frm, table_name, field_name, options = { color: "", text: "" }) {
	console.log(frm);
    console.log(table_name);
    console.log(field_name);
	for (let row of $(`[data-fieldname = ${table_name}] .grid-body .rows`).children()) {
		console.log(row);

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


/* A function that is called when the class field is changed. It is used to set the number of visits
based on the class of the doctor. */
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

/* Used to filter the parent field in the visit goal doctype. */
cur_frm.fields_dict['parent_visit_goal'].get_query = function (doc, cdt, cdn) {
	return {
		filters: [
			['Sales Target', 'is_group', '=', 1],
			['Sales Target', 'name', '!=', doc.name]
		]
	}
}

/* Used to filter the old parent field in the visit goal doctype. */
cur_frm.fields_dict['old_parent'].get_query = function (doc, cdt, cdn) {
	return {
		filters: [
			['Sales Target', 'is_group', '=', 1],
			['Sales Target', 'name', '!=', doc.name]
		]
	}
}

/* Used to make the progress bar for the Sales Target doctype. */
frappe.ui.form.on('Sales Target', {
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

/**
 * It resets the fields of the form
 * @param frm - The form object
 */
function resetFields(frm) {
	frm.doc.achieved = 0
	frm.doc.from = null
	frm.doc.to = null
	frm.doc.target = 0
	frm.doc.number_of_days = 0
	frm.doc.parent_visit_goal = null
	resetProductivityTable(frm)
	resetTargetBreakdownTable(frm)
	frm.refresh()
}


/**
 * "Reset the verified visits and achievement fields in the productivity table."
 * 
 * The function is called from the "Reset" button in the productivity table
 * @param frm - The current form object
 */
function resetProductivityTable(frm) {
	for (let row of frm.doc.productivity) {
		row.verified_visits = 0;
		row.achievement = 0
	}
}

/**
 * "Reset the achievement and sold columns of the target breakdown table."
 * 
 * The function takes a single argument, which is the form object
 * @param frm - The current form object
 */
function resetTargetBreakdownTable(frm) {
	for (let row of frm.doc.target_breakdown) {
		row.achievement = 0;
		row.sold = 0;
	}
}

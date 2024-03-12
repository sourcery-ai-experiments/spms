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

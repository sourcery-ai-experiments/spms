// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

/* Adding two buttons to the form. */
frappe.ui.form.on('Collection Target', {
	refresh: function (frm) {
		frm.add_custom_button(__('Reset Progress'), function () {
			frappe.msgprint("this button will Reset Progress");
		}, __("Utilities"));

		frm.add_custom_button(__('Reset Fields'), function () {
			frappe.msgprint("this button will Reset all fields");
		}, __("Utilities"));
	}
});

// tracking changes in the child table 'Customer Collection Target' which is
let total = 0

/* A trigger that is called when the user changes the value of the field "to" in the Collection Target
doctype. */
frappe.ui.form.on('Collection Target', {
	/* A trigger that is called when the user changes the value of the field "to" in the Collection Target
	doctype. */
	"to": function (frm) {
		if (frm.doc.to < frm.doc.from) {
			frappe.msgprint("Please, Select Valid Period for Target)")
		}

		// find diff between in and out date
		let diff_days = frappe.datetime.get_day_diff(frm.doc.to, frm.doc.from);
		frm.set_value("number_of_days", diff_days);
	},

	/* A trigger that is called when the user changes the value of the field "fixed_target" in the
	Collection Target doctype. */
	fixed_target: function (frm) {
		frm.set_value("total_targets", frm.doc.fixed_target);
		frm.refresh();
	},

	/* A trigger that is called when the user changes the value of the field "additional_target_int" in
	the Collection Target doctype. */
	additional_target_int: function (frm) {
		frm.set_value("total_targets", total + frm.doc.additional_target_int);
		frm.refresh();
	},

	/* It clears the table and sets the values of the fields to 0 */
	target_type: function (frm) {
		reset_target_values(frm)
	}

});

/* A trigger that is called when the user adds a new row to the table. */
frappe.ui.form.on('Customer Collection Target', {
	customer_collects_goal_add: function (frm, cdt, cdn) {
		total = 0;
		$.each(frm.doc.customer_collects_goal || [], function (i, d) {
			total += flt(d.amount_of_money);
		});
		if (frm.doc.target_type == "Debt + Additional Target")
			frm.set_value("total_targets", total + frm.doc.additional_target_int);
		else
			frm.set_value("total_targets", total);
		frm.refresh();
	}
});

/* A trigger that is called when the user removes a row from the table. */
frappe.ui.form.on('Customer Collection Target', {
	customer_collects_goal_remove: function (frm, cdt, cdn) {
		total = 0;
		$.each(frm.doc.customer_collects_goal || [], function (i, d) {
			total += flt(d.amount_of_money);
		});
		if (frm.doc.target_type == "Debt + Additional Target")
			frm.set_value("total_targets", total + frm.doc.additional_target_int);
		else
			frm.set_value("total_targets", total);
		frm.refresh();
	}
});

/* A trigger that is called when the user changes the value of the field "amount_of_money" in the
Customer Collection Target doctype. */
frappe.ui.form.on('Customer Collection Target', {
	amount_of_money: function (frm, cdt, cdn) {
		total = 0;
		$.each(frm.doc.customer_collects_goal || [], function (i, d) {
			total += flt(d.amount_of_money);
		});
		if (frm.doc.target_type == "Debt + Additional Target")
			frm.set_value("total_targets", total + frm.doc.additional_target_int);
		else
			frm.set_value("total_targets", total);
		frm.refresh();
	}
});

/* A trigger that is called when the user adds a new row to the table. */
frappe.ui.form.on('Commissions range', {
	form_render: function (frm, cdt, cdn) {
		$.each(frm.doc.commissions_range || [], function (i, d) {
			if (d.from_ > d.to_) {
				msgprint('Please, (From) Percentage is Greater than (To) Percentage');
				validated = false;
			} else if (d.to_ < d.from_) {
				msgprint('Please, (To) Percentage is Less than (From) Percentage');
				validated = false;
			} else if (d.to_ == d.from_ && d.to_ != 0 && d.from_ != 0) {
				msgprint('Please, (To) Percentage is Equal to (From) Percentage');
				validated = false;
			}
		});
	}
});

/* A trigger that is called when the user changes the value of the field "territory" in the
Collection Target doctype. */
frappe.ui.form.on('Collection Target', {
	refresh: function (frm) {
		// progress_bar("customer_collects_goal","verified_collects",100,0,{text:"Done "})
		/* A query that filters the customers based on the territory of the current form. */
		frm.set_query('customer', 'customer_collects_goal', function (doc, cdt, cdn) {
			return {
				filters: [
					['Customer', 'territory', 'in', frm.doc.territory],
				]
			};
		});
		set_css(frm);
	}
})

/* Used to filter the parent field in the Collection Target doctype. */
cur_frm.fields_dict['parent_collects_goal'].get_query = function (doc, cdt, cdn) {
	return {
		filters: [
			['Collection Target', 'is_group', '=', 1],
			['Collection Target', 'name', '!=', doc.name]
		]
	}
}

/* Used to filter the old parent field in the Collection Target doctype. */
cur_frm.fields_dict['old_parent'].get_query = function (doc, cdt, cdn) {
	return {
		filters: [
			['Collection Target', 'is_group', '=', 1],
			['Collection Target', 'name', '!=', doc.name]
		]
	}
}

/* Calculating the achieved collects and achieved visits for each row in the table. */
frappe.ui.form.on('Collection Target', {
	refresh: function (frm) {
		if (frm.doc.customer_collects_goal) {
			for (let row of frm.doc.customer_collects_goal) {
				row.achieved_collects = (row.verified_collects / row.amount_of_money) * 100 || 0
				row.achieved_collects = Math.round(row.achieved_collects)
				row.achieved_visits = (row.verified_visits / row.number_of_visits) * 100
				row.achieved_visits = Math.round(row.achieved_visits)
			}
		}
	}
})

/* A trigger that is called when the user refreshes the form. */
frappe.ui.form.on('Collection Target', {
	refresh: function (frm) {
		refresh_when_click_btn(frm)
		progress_bar(frm, "customer_collects_goal", "achieved_collects")
		progress_bar(frm, "customer_collects_goal", "achieved_visits")
	}
})

/* It makes the target type field read only after saving the form. */
frappe.ui.form.on('Collection Target', {
	after_save: function (frm) {
		frm.set_df_property("target_type", "read_only", 1)
	}
})

/**
 * It takes the percentage of the total collected amount and sets the width of the progress bar to that
 * percentage
 * @param frm - The current form object.
 */
function set_css(frm) {
	let percentage = (frm.doc.total_collected / frm.doc.total_targets) * 100
	document.getElementById("percentage").style.width = `${percentage}%`
	document.getElementById("percentage").innerText = `${Math.round(percentage)}%`
}


/**
 * It clears the table and sets the values of the fields to 0
 * @param frm - The current form object.
 */
function reset_target_values(frm) {
	frm.clear_table("customer_collects_goal");
	frm.set_value("additional_target_int", 0);
	frm.set_value("fixed_target", 0);
	frm.set_value("total_targets", 0);
	frm.refresh();
}

/**
 * It takes a table field, a field name, and an optional color and text, and then it replaces the field
 * with a progress bar
 * @param frm - The current form object
 * @param table_name - The name of the table you want to add the progress bar to.
 * @param field_name - The name of the field that you want to display as a progress bar.
 * @param [options] - 
 */
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

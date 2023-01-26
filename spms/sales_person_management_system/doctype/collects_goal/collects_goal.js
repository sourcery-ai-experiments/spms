// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

// tracking changes in the child table 'Customer Collects Goal' which is
let total = 0

/* A trigger that is called when the user changes the value of the field "to" in the Collects Goal
doctype. */
frappe.ui.form.on('Collects Goal', {
	/* A trigger that is called when the user changes the value of the field "to" in the Collects Goal
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
	Collects Goal doctype. */
	fixed_target: function (frm) {
		frm.set_value("total_targets", frm.doc.fixed_target);
		frm.refresh();
	},

	/* A trigger that is called when the user changes the value of the field "additional_target_int" in
	the Collects Goal doctype. */
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
frappe.ui.form.on('Customer Collects Goal', {
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
frappe.ui.form.on('Customer Collects Goal', {
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
Customer Collects Goal doctype. */
frappe.ui.form.on('Customer Collects Goal', {
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
Collects Goal doctype. */
frappe.ui.form.on('Collects Goal', {
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
frappe.ui.form.on('Collects Goal', {
	refresh: function (frm) {
		refresh_when_click_btn(frm)
		progress_bar(frm,"customer_collects_goal","verified_collects")
	}
})

/* It makes the target type field read only after saving the form. */
frappe.ui.form.on('Collects Goal', {
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

function progress_bar(frm,table_name,field_name,options = {color:"",text:""}){
	for(let row of $(`[data-fieldname = ${table_name}] .grid-body .rows`).children()) {
		let idx = $(row).data("idx") - 1
		let row_info = frm.doc[table_name][idx]
		const width = row_info[field_name]
		row.firstChild.querySelector(`[data-fieldname=${field_name}]`)
		.innerHTML = 
			`<div class="progress" style="height: 20px; font-size: 13px;font-weight:500;">
				<div style="width:${width}%;background:${options.color&&options.color};" class="progress-bar" role="progressbar">${options.text&&options.text}${width}%</div>
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

// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

// traking changes in the child table 'Customer Collects Goal' which is
let total = 0

frappe.ui.form.on('Collects Goal', {
	"to": function (frm) {
		if (frm.doc.to < frm.doc.from) {
			frappe.msgprint("Please, Select Valid Period for Target)")
		}

		// find diff between in and out date
		let diff_days = frappe.datetime.get_day_diff(frm.doc.to, frm.doc.from);
		frm.set_value("number_of_days", diff_days);
	},
	fixed_target : function(frm){
		frm.set_value("total_targets", frm.doc.fixed_target);
		frm.refresh();
	},
	additional_target_int : function(frm){
		frm.set_value("total_targets", total + frm.doc.additional_target_int);
		frm.refresh();
	}
})

// Trigger When Add New Row To Table
frappe.ui.form.on('Customer Collects Goal', {
	customer_collects_goal_add: function (frm, cdt, cdn) {
		total = 0;
		$.each(frm.doc.customer_collects_goal || [], function (i, d) {
			total += flt(d.amount_of_money);
		});
		if(frm.doc.target_type == "Debt + Additional Target")
			frm.set_value("total_targets", total + frm.doc.additional_target_int );
		else
			frm.set_value("total_targets", total);
		frm.refresh();
	}
});

// Trigger When Remove Row Table
frappe.ui.form.on('Customer Collects Goal', {
	customer_collects_goal_remove: function (frm, cdt, cdn) {
		total = 0;
		$.each(frm.doc.customer_collects_goal || [], function (i, d) {
			total += flt(d.amount_of_money);
		});
		if(frm.doc.target_type == "Debt + Additional Target")
			frm.set_value("total_targets", total + frm.doc.additional_target_int );
		else
			frm.set_value("total_targets", total);
		frm.refresh();
	}
});

// Trigger On Every Event On [amount_of_money] Field
frappe.ui.form.on('Customer Collects Goal', {
	amount_of_money: function (frm, cdt, cdn) {
		total = 0;
		$.each(frm.doc.customer_collects_goal || [], function (i, d) {
			total += flt(d.amount_of_money);
		});
		if(frm.doc.target_type == "Debt + Additional Target")
			frm.set_value("total_targets", total + frm.doc.additional_target_int );
		else
			frm.set_value("total_targets", total);
		frm.refresh();
	}
});

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

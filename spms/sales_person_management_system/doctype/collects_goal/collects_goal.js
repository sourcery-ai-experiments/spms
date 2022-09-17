// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt


frappe.ui.form.on('Collects Goal', {
	"to":function(frm) {
		if(frm.doc.to < frm.doc.from){
	        frappe.msgprint("Please, Select Valid Period for Target)")
	    }
	    
	    // find diff between in and out date
	    let diff_days = frappe.datetime.get_day_diff( frm.doc.to, frm.doc.from );
	    frm.set_value("number_of_days",diff_days);
	}
})
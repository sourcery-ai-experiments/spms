
function calculate_amounts(frm){
	frappe.db.get_single_value('SPMS Settings', 'max_discount_on_collecting').then(res => {
		let max_discount = res;
		if (frm.doc.custom_discount_percentage < max_discount) {
			frm.set_value("paid_amount", frm.doc.custom_total_paid - (frm.doc.custom_total_paid * (frm.doc.custom_discount_percentage / 100)));
			frm.set_value("custom_discount_amount", frm.doc.custom_total_paid * (frm.doc.custom_discount_percentage / 100));
			frm.refresh();
		} else {
			frappe.msgprint('The discount must be less than ' + max_discount + '%');
		}
	});
}



frappe.ui.form.on('Payment Entry', {
	custom_discount_percentage: function (frm) {
		calculate_amounts(frm)
	},
	custom_total_paid: function(frm){
		calculate_amounts(frm)
	},
	paid_amount: function(frm){
		frm.set_value("custom_discount_percentage", (100/frm.doc.custom_total_paid ) * (frm.doc.custom_total_paid - frm.doc.paid_amount) );
		frm.set_value("custom_discount_amount", frm.doc.custom_total_paid * (frm.doc.custom_discount_percentage / 100));
		frm.refresh();
	},
    custom_discount_amount: function(frm){
		const discount = frm.doc.custom_discount_amount/frm.doc.custom_total_paid
		frm.set_value("paid_amount", frm.doc.custom_total_paid - (frm.doc.custom_total_paid * discount));
		frm.set_value("custom_discount_percentage", discount*100)
		frm.refresh();
	}
})















frappe.ui.form.on('Sales Team', {
	sales_person:function(frm) {
        for(var i=0; i<frm.doc.sales_team.length;i++){
            frm.doc.sales_team[i].incentives = frm.doc.net_total * (frm.doc.sales_team[i].commission_rate / 100);
        }
        frm.refresh();
	}
});
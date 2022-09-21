// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

frappe.ui.form.on('Collecting', {
	amount:function(frm) {
		var result = 0;
		if(frm.doc.amount_currency == "USD" && frm.doc.amount_currency != frm.doc.company_currency){
		    frm.set_value("exchange_rate", 1450);
            frm.refresh();
		    result = frm.doc.amount * frm.doc.exchange_rate;
		}
		if(frm.doc.amount_currency == "IQD" && frm.doc.amount_currency != frm.doc.company_currency){
		    frm.set_value("exchange_rate", 0.00069);
            frm.refresh();
		    result = frm.doc.amount * frm.doc.exchange_rate;
		}
		frm.set_value("amount_other_currency", result);
		frm.refresh();
	}
});

frappe.ui.form.on('Collecting', {
	exchange_rate:function(frm) {
		var result = 0;
        if(frm.doc.amount_currency == "USD" && frm.doc.amount_currency != frm.doc.company_currency){
            frm.set_value("exchange_rate", 1450);
            frm.refresh();
		    result = frm.doc.amount * frm.doc.exchange_rate;
		}
		if(frm.doc.amount_currency == "IQD" && frm.doc.amount_currency != frm.doc.company_currency){
		    frm.set_value("exchange_rate", 0.00069);
            frm.refresh();
		    result = frm.doc.amount * frm.doc.exchange_rate;
		}
		frm.set_value("amount_other_currency", result);
		frm.refresh();
	}
});

frappe.ui.form.on('Collecting', {
    refresh:function(frm){
        frm.set_query('invoice_no', 'invoices', function(doc, cdt, cdn) {
            var d = locals[cdt][cdn];
            return {
        		filters: [
        			['Sales Invoice', 'customer', 'in', frm.doc.customer],
        			['Sales Invoice', 'status', '!=', 'Paid'],
        		]
            };
        });
        
	    frm.set_query("amount_currency", function(){
	        return{
	            filters: [
	                ["Currency", "currency_name", "in", ['USD', 'IQD']]     
	           ]
	        };
	    });
    }
});

frappe.ui.form.on('Collecting', {
	refresh:function(frm) {
    	frm.add_custom_button("Get All Unpaid Sales Invoice", function(){
            let d = new frappe.ui.Dialog({
                title: 'Enter Customer details',
                fields: [
                    {
                        label: 'Customer Name',
                        fieldname: 'customer_name',
                        fieldtype: 'Link',
                        default: frm.doc.customer,
                        options: 'Customer'
                    }
                ],
                primary_action_label: 'Get Invoices',
                primary_action(values) {
                    frappe.db.get_list('Sales Invoice', {
                    	filters: {
                            'status': ['!=','Paid'],
                            'customer': values.customer_name
                    	},
                    	fields: ['name','net_total','posting_date','outstanding_amount','status'],
                    	limit: 500
                    }).then(res => {
                    	for(var i=0; i < res.length; i++){
                    	    var row = frappe.model.add_child(frm.doc, "Collects", "invoices");
                            row.invoice_no = res[i].name;
                            row.total = res[i].net_total;
                            row.posting_date = res[i].date;
                            row.out_standing_amount = res[i].outstanding_amount;
                            row.status = res[i].status;
                            frm.refresh_fields("invoices");
                    	}
                    });
                    d.hide();
                }
            });
            
            d.show();
    	}).addClass("btn-primary").css({});
	}
});~
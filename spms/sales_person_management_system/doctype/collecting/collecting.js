// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

frappe.ui.form.on('Collecting', {
	setup: function (frm) {
		frm.set_query("customer", function () {
			return {
				filters: [
					["Customer", "territory", "in", frm.doc.sales_person_territory]
				]
			};
		});
	}
});

// Get Location From The User
frappe.ui.form.on('Collecting', {
	onload(frm) {
		function onPositionRecieved(position) {
			var longitude = position.coords.longitude;
			var latitude = position.coords.latitude;
			frm.set_value('longitude', longitude);
			frm.set_value('latitude', latitude);
			fetch('https://api.opencagedata.com/geocode/v1/json?q=' + latitude + '+' + longitude + '&key=de1bf3be66b546b89645e500ec3a3a28')
				.then(response => response.json())
				.then(data => {
					var address = data['results'][0].formatted;
					frm.set_value('current_address', address);
				})
				.catch(err => console.log(err));
			frm.set_df_property('my_location', 'options', '<div class="mapouter"><div class="gmap_canvas"><iframe width=100% height="300" id="gmap_canvas" src="https://maps.google.com/maps?q=' + latitude + ',' + longitude + '&t=&z=17&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe><a href="https://yt2.org/youtube-to-mp3-ALeKk00qEW0sxByTDSpzaRvl8WxdMAeMytQ1611842368056QMMlSYKLwAsWUsAfLipqwCA2ahUKEwiikKDe5L7uAhVFCuwKHUuFBoYQ8tMDegUAQCSAQCYAQCqAQdnd3Mtd2l6"></a><br><style>.mapouter{position:relative;text-align:right;height:300px;width:100%;}</style><style>.gmap_canvas {overflow:hidden;background:none!important;height:300px;width:100%;}</style></div></div>');
			frm.refresh_field('my_location');
		}

		function locationNotRecieved(positionError) {
			console.log(positionError);
		}

		if (frm.doc.longitude && frm.doc.latitude) {
			frm.set_df_property('my_location', 'options', '<div class="mapouter"><div class="gmap_canvas"><iframe width=100% height="300" id="gmap_canvas" src="https://maps.google.com/maps?q=' + frm.doc.latitude + ',' + frm.doc.longitude + '&t=&z=17&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe><a href="https://yt2.org/youtube-to-mp3-ALeKk00qEW0sxByTDSpzaRvl8WxdMAeMytQ1611842368056QMMlSYKLwAsWUsAfLipqwCA2ahUKEwiikKDe5L7uAhVFCuwKHUuFBoYQ8tMDegUAQCSAQCYAQCqAQdnd3Mtd2l6"></a><br><style>.mapouter{position:relative;text-align:right;height:300px;width:100%;}</style><style>.gmap_canvas {overflow:hidden;background:none!important;height:300px;width:100%;}</style></div></div>');
			frm.refresh_field('my_location');
		} else {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(onPositionRecieved, locationNotRecieved, { enableHighAccuracy: true });
			} else {
				frappe.msgprint('Pleas Enable the Location Service');
			}
		}
	}
});


// Validate If Location Service Is Off
frappe.ui.form.on('Collecting', {
	before_save: function (frm) {
		if (!frm.doc.longitude && !frm.doc.latitude) {
			frappe.msgprint('Pleas Enable the Location Service');
		}
	}
});

// Calculate Amount On Change Of Amount Field
frappe.ui.form.on('Collecting', {
	amount: function (frm) {
		if (frm.doc.amount_currency != frm.doc.company_currency) {
			calculateTheAmount(frm);
		} else {
			frm.set_value('amount_other_currency', frm.doc.amount);
			frm.refresh();
		}
	}
});

// Calculate Amount On Change Of Amount Currency Field
frappe.ui.form.on('Collecting', {
	amount_currency: function (frm) {
		if (frm.doc.amount_currency != frm.doc.company_currency) {
			frappe.db.get_value("Currency Exchange", {
				"from_currency": frm.doc.amount_currency,
				"to_currency": frm.doc.company_currency
			}, ['exchange_rate'], function (value) {
				frm.set_value("exchange_rate", value.exchange_rate);
				frm.refresh();
			});
			calculateTheAmount(frm);
		} else {
			frm.set_value('amount_other_currency', frm.doc.amount);
			frm.refresh();
		}
	}
});

// Add Helper Description For Changing The Currency
frappe.ui.form.on('Collecting', {
	amount_currency: function (cur_frm) {
		if (cur_frm.doc.amount_currency && cur_frm.doc.company_currency) {
			var default_label = __(frappe.meta.docfield_map[cur_frm.doctype]["exchange_rate"].label);
			cur_frm.fields_dict.exchange_rate.set_label(default_label +
				repl(" (1 %(amount_currency)s = [?] %(company_currency)s)", cur_frm.doc));
		}
	}
});

// Calculate Amount With Exchange Rate On Exchange Rate Changes
frappe.ui.form.on('Collecting', {
	exchange_rate: function (frm) {
		calculateTheAmount(frm);
	}
});

// Calculate Amount Function
function calculateTheAmount(frm) {
	var result = 0;
	result = frm.doc.amount * frm.doc.exchange_rate;
	frm.set_value("amount_other_currency", result);
	frm.refresh();
}

frappe.ui.form.on('Collecting', {
	refresh: function (frm) {
		frm.set_query('invoice_no', 'invoices', function (doc, cdt, cdn) {
			var d = locals[cdt][cdn];
			return {
				filters: [
					['Sales Invoice', 'customer', 'in', frm.doc.customer],
					['Sales Invoice', 'status', '!=', 'Paid'],
				]
			};
		});

		frm.set_query("amount_currency", function () {
			return {
				filters: [
					["Currency", "currency_name", "in", ['USD', 'IQD']]
				]
			};
		});
	}
});

frappe.ui.form.on('Collecting', {
	refresh: function (frm) {
		//add this condition
		if (frm.doc.docstatus != 1) {
			frm.add_custom_button("Get All Unpaid Sales Invoice", function () {
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
								'status': ['!=', 'Paid'],
								'customer': values.customer_name
							},
							fields: ['name', 'net_total', 'posting_date', 'outstanding_amount', 'status'],
							limit: 500
						}).then(res => {
							for (var i = 0; i < res.length; i++) {
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

		// show two button when submit it
		if (frm.doc.docstatus == 1) {
			// add Payment Entry button
			var customer_n = frm.doc.customer
			frm.add_custom_button("Create Payment Entry", function () {
				frappe.new_doc("Payment Entry",
					{
						party_type: "Customer",
						party: customer_n,
					},
				);
				// frappe.route_options = {
				// 	"party_type": frm.doc.customer,
				// 	"party": "Customer",
				// };
				// frappe.set_route("payment-entry", "new-payment-entry");
			}).addClass("btn-primary").css({});

			// add Journal Entry button
			frm.add_custom_button("Create Journal Entry", function () {
				frappe.set_route("journal-entry", "new-journal-entry");
			}).addClass("btn-primary").css({});
		}

	}
});
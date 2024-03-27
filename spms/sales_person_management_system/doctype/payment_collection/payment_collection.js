// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

/* A filter for the customer field. */
frappe.ui.form.on('Payment Collection', {
	setup: function (frm) {
		frm.set_query("customer", function () {
			return {
				filters: [
					// ["Customer", "territory", "in", frm.doc.sales_person_territory]
				]
			};
		});
	}
});

/* This code is used to get the location of the user and show it on the map. */
frappe.ui.form.on('Payment Collection', {
	onload(frm) {
		function onPositionReceived(position) {
			let longitude = position.coords.longitude;
			let latitude = position.coords.latitude;
			frm.set_value('longitude', longitude);
			frm.set_value('latitude', latitude);
			fetch('https://api.opencagedata.com/geocode/v1/json?q=' + latitude + '+' + longitude + '&key=de1bf3be66b546b89645e500ec3a3a28')
				.then(response => response.json())
				.then(data => {
					let address = data['results'][0].formatted;
					frm.set_value('current_address', address);
				})
				.catch(err => console.log(err));
			frm.set_df_property('my_location', 'options', '<div class="mapouter"><div class="gmap_canvas"><iframe width=100% height="300" id="gmap_canvas" src="https://maps.google.com/maps?q=' + latitude + ',' + longitude + '&t=&z=17&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe><a href="https://yt2.org/youtube-to-mp3-ALeKk00qEW0sxByTDSpzaRvl8WxdMAeMytQ1611842368056QMMlSYKLwAsWUsAfLipqwCA2ahUKEwiikKDe5L7uAhVFCuwKHUuFBoYQ8tMDegUAQCSAQCYAQCqAQdnd3Mtd2l6"></a><br><style>.mapouter{position:relative;text-align:right;height:300px;width:100%;}</style><style>.gmap_canvas {overflow:hidden;background:none!important;height:300px;width:100%;}</style></div></div>');
			frm.refresh_field('my_location');
		}

		function locationNotReceived(positionError) {
			console.log(positionError);
		}

		if (frm.doc.longitude && frm.doc.latitude) {
			frm.set_df_property('my_location', 'options', '<div class="mapouter"><div class="gmap_canvas"><iframe width=100% height="300" id="gmap_canvas" src="https://maps.google.com/maps?q=' + frm.doc.latitude + ',' + frm.doc.longitude + '&t=&z=17&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe><a href="https://yt2.org/youtube-to-mp3-ALeKk00qEW0sxByTDSpzaRvl8WxdMAeMytQ1611842368056QMMlSYKLwAsWUsAfLipqwCA2ahUKEwiikKDe5L7uAhVFCuwKHUuFBoYQ8tMDegUAQCSAQCYAQCqAQdnd3Mtd2l6"></a><br><style>.mapouter{position:relative;text-align:right;height:300px;width:100%;}</style><style>.gmap_canvas {overflow:hidden;background:none!important;height:300px;width:100%;}</style></div></div>');
			frm.refresh_field('my_location');
		} else {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(onPositionReceived, locationNotReceived, { enableHighAccuracy: true });
			} else {
				frappe.msgprint('Pleas Enable the Location Service');
			}
		}
	}
});


/* A validation to check if the location service is off. */
frappe.ui.form.on('Payment Collection', {
	before_save: function (frm) {
		if (!frm.doc.longitude && !frm.doc.latitude) {
			frappe.msgprint('Pleas Enable the Location Service');
		}
	}
});

/* A validation to check if the amount currency is not equal to the company currency then calculate the
amount. */
frappe.ui.form.on('Payment Collection', {
	amount: function (frm) {
		if (frm.doc.amount_currency != frm.doc.company_currency) {
			calculateTheAmount(frm);
		} else {
			frm.set_value('amount_other_currency', frm.doc.amount);
			frm.refresh();
		}
	}
});

/* A validation to check if the amount currency is not equal to the company currency then calculate the
amount. */
frappe.ui.form.on('Payment Collection', {
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

/* A validation to check if the amount currency is not equal to the company currency then calculate the
amount. */
frappe.ui.form.on('Payment Collection', {
	amount_currency: function (cur_frm) {
		if (cur_frm.doc.amount_currency && cur_frm.doc.company_currency) {
			let default_label = __(frappe.meta.docfield_map[cur_frm.doctype]["exchange_rate"].label);
			cur_frm.fields_dict.exchange_rate.set_label(default_label +
				repl(" (1 %(amount_currency)s = [?] %(company_currency)s)", cur_frm.doc));
		}
	},
	discount_percentage: function (frm) {
		var init_amount = frm.doc.initial_amount;
		frappe.db.get_single_value('SPMS Settings', 'max_discount_on_collecting').then(function (v) {
			var max_discount = v;
			var discount_value = 0;
			if (frm.doc.discount_type === "Percentage") {
				discount_value = init_amount * (frm.doc.discount_percentage / 100);
			} else {
				discount_value = frm.doc.discount;
			}

			if (discount_value < max_discount || max_discount === 0) {
				frm.doc.amount = init_amount - discount_value;
				frm.refresh_field("amount");
				frm.doc.discount_amount = discount_value;
				frm.refresh_field("discount_amount");

			} else {
				console.log("gg");
			}

			if (frm.doc.discount_amount != null) {
				frm.doc.initial_amount = frm.doc.amount + frm.doc.discount_amount;
			} else {
				frm.doc.initial_amount = frm.doc.amount;
			}
		});
	},
	discount: function (frm) {
		var init_amount = frm.doc.initial_amount;
		frappe.db.get_single_value('SPMS Settings', 'max_discount_on_collecting').then(function (v) {
			var max_discount = v;
			var discount_value = 0;
			if (frm.doc.discount_type === "Percentage") {
				discount_value = init_amount * (frm.doc.discount_percentage / 100);
			} else {
				discount_value = frm.doc.discount;
			}

			if (discount_value < max_discount || max_discount === 0) {
				frm.doc.amount = init_amount - discount_value;
				frm.refresh_field("amount");
				frm.doc.discount_amount = discount_value;
				frm.refresh_field("discount_amount");

			} else {
				console.log("gg");
			}

			if (frm.doc.discount_amount != null) {
				frm.doc.initial_amount = frm.doc.amount + frm.doc.discount_amount;
			} else {
				frm.doc.initial_amount = frm.doc.amount;
			}
		});
	}, initial_amount: function (frm) {
		var init_amount = frm.doc.initial_amount;
		frappe.db.get_single_value('SPMS Settings', 'max_discount_on_collecting').then(function (v) {
			var max_discount = v;
			var discount_value = 0;
			if (frm.doc.discount_type === "Percentage") {
				discount_value = init_amount * (frm.doc.discount_percentage / 100);
			} else {
				discount_value = frm.doc.discount;
			}

			if (discount_value < max_discount || max_discount === 0) {
				frm.doc.amount = init_amount - discount_value;
				frm.refresh_field("amount");
				frm.doc.discount_amount = discount_value;
				frm.refresh_field("discount_amount");

			} else {
				console.log("gg");
			}

			if (frm.doc.discount_amount != null) {
				frm.doc.initial_amount = frm.doc.amount + frm.doc.discount_amount;
			} else {
				frm.doc.initial_amount = frm.doc.amount;
			}
		});
	},
	total_paid: function (frm) {
		console.log("Abc");
		var total_allocated = 0;
		frm.doc.invoices.forEach(function (invoice) {
			total_allocated += invoice.allocated;
		});
		frm.set_value('total_unallocated', frm.doc.total_paid - total_allocated);
	}
});

/* A validation to check if the amount currency is not equal to the company currency then calculate the
amount. */
frappe.ui.form.on('Payment Collection', {
	exchange_rate: function (frm) {
		calculateTheAmount(frm);
	}
});

frappe.ui.form.on('Payment Collection', {
	after_save: function (frm) {
		// frappe.db.get_single_value('SPMS Settings', 'max_discount_on_collecting').then(res => {
		// 	let max_discount = res;
		// 	var discount_value;
		// 	if(frm.doc.discount_type == "Percentage"){
		// 		discount_value=(frm.doc.total_paid * (frm.doc.discount_percentage / 100));
		// 	}else{
		// 		discount_value=frm.doc.discount;
		// 	}
		// 	if (discount_value < max_discount || max_discount == 0) {

		// 		frm.set_value("amount", frm.doc.total_paid - discount_value);
		// 		frm.set_value("discount_amount", discount_value);
		// 		frm.save();
		// 		// frm.refresh();
		// 	} else {
		// 		frappe.msgprint('The discount must be less than ' + max_discount + '%');
		// 	}
		// });
	}
});


/**
 * "When the user changes the amount or exchange rate, calculate the amount in the other currency."
 * 
 * The function is called when the user changes the amount or exchange rate
 * @param frm - The current form object.
 */
function calculateTheAmount(frm) {
	let result = 0;
	result = frm.doc.amount * frm.doc.exchange_rate;
	frm.set_value("amount_other_currency", result);
	frm.refresh();
}

/* A validation to check if the amount currency is not equal to the company currency then calculate the
amount. */
frappe.ui.form.on('Payment Collection', {
	refresh: function (frm) {
		/* A query to get the invoices that are not paid and belong to the customer. */
		frm.set_query('invoice_no', 'invoices', function (doc, cdt, cdn) {
			return {

				filters: [
					['Sales Invoice', 'customer', 'in', frm.doc.customer],
					// ['Sales Invoice', 'status', '!=', 'Paid']
					['Sales Invoice', 'status', 'not in', ['Paid', 'Cancelled', 'Return', 'Draft']]
				]
			};
		});

		/* A filter for the amount currency field. */
		frm.set_query("amount_currency", function () {
			return {
				filters: [
					["Currency", "currency_name", "in", ['USD', 'IQD']]
				]
			};
		});
	}
});

/* A validation to check if the document status is not equal to 1 then add a button to get all the
unpaid sales invoices. */
frappe.ui.form.on('Payment Collection', {
	refresh: function (frm) {
		if (frm.doc.docstatus != 1) {
			frm.add_custom_button("Get All Unpaid Sales Invoice", function () {
				let dialog = new frappe.ui.Dialog({
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
								'status': ['!=', 'Draft'],
								'outstanding_amount': ['>', 0],
								'customer': values.customer_name
							},
							fields: ['name', 'net_total', 'posting_date', 'outstanding_amount', 'status', 'currency'],
							limit: 500
						}).then(res => {
							for (const element of res) {
								let row = frappe.model.add_child(frm.doc, "Collects", "invoices");
								row.invoice_no = element.name;
								row.total = element.net_total;
								row.posting_date = element.date;
								row.out_standing_amount = element.outstanding_amount;
								row.status = element.status;
								row.currency = element.currency;
								frm.refresh_fields("invoices");
							}
							var total_allocated = 0;
							frm.doc.invoices.forEach(function (invoice) {
								if (!isNaN(invoice.allocated))
									total_allocated += invoice.allocated;
							});
							frm.set_value('total_unallocated', frm.doc.total_paid - total_allocated);
							frm.refresh_field('total_unallocated');
						});
						dialog.hide();
					}
				});
				dialog.show();
			}).addClass("btn-primary").css({});
		}
	}
});
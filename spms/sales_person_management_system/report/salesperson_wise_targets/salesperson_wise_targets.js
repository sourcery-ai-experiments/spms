// Copyright (c) 2024, aoai and contributors
// For license information, please see license.txt

frappe.query_reports["Salesperson-Wise Targets"] = {
	"filters": [
		{
			"fieldname": "salesperson",
			"label": __("Salesperson"),
			"fieldtype": "Link",
			"options": "Sales Person",
			"reqd": 1
		},
		{
			"fieldname": "company",
			"label": __("Company"),
			"fieldtype": "Link",
			"options": "Company",
			"reqd": 1
		},
		{
			"fieldname": "month",
			"label": __("Month"),
			"fieldtype": "Select",
			'options': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			"reqd": 1
		},
		{
			"fieldname": "territory",
			"label": __("Territory"),
			"fieldtype": "Link",
			"options": "Territory",
			"reqd": 0
		}
	]
};

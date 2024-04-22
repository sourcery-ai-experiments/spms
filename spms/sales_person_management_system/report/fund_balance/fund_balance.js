// Copyright (c) 2024, Osama Muhammed and contributors
// For license information, please see license.txt
/* eslint-disable */
function add_years(date, years) {
    var result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
}
frappe.query_reports["Fund Balance"] = {
	"filters": [
		{
			"fieldname": "account",
			"label": __("Account"),
			"fieldtype": "MultiSelectList",
			"options": "Account",
			"width": 500,
			get_data: function (txt) {
				return frappe.db.get_link_options('Account', txt, {
				});
			}
		},
		{
			"fieldname": "from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"width": 100,
			"default": frappe.datetime.add_months(frappe.datetime.get_today(), -12),
			"reqd": 1,
		},
		{
			"fieldname": "to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"width": 100,
			"default": frappe.datetime.get_today(),
			"reqd": 1,
			"on_change": function(query_report) {
				if (!query_report.date_range_change) {
					query_report.set_filter_value('date_range', '');
				}
			}
		},
		{
			"fieldname": "date_range",
			"label": __("Date Range"),
			"fieldtype": "Select",
			"options": ["", "Daily", "Weekly", "Monthly", "Yearly"],
			"default": "Monthly",
			"on_change": function(query_report) {
				var date_range = query_report.get_filter_value('date_range');
				var to_date = new Date();
				var from_date;
		
				switch(date_range) {
					case "Daily":
						from_date = to_date;
						break;
					case "Weekly":
						from_date = new Date(to_date.getFullYear(), to_date.getMonth(), to_date.getDate() - to_date.getDay());
						break;
					case "Monthly":
						from_date = new Date(to_date.getFullYear(), to_date.getMonth(), 1);
						break;
					case "Yearly":
						from_date = new Date(to_date.getFullYear(), 0, 1);
						break;
					case "None":
						return;
				}
		
				query_report.date_range_change = true;
				query_report.set_filter_value('from_date', from_date);
				query_report.set_filter_value('to_date', to_date);
				query_report.date_range_change = false;
			}
		},
		{
            "fieldname": "company",
            "label": __("Company"),
            "fieldtype": "Link",
            "options": "Company",
            "width": 100,
            "on_change": function(query_report) {
                company = query_report.get_filter_value('company');
                const cost_center_filter = query_report.get_filter('cost_center');
                cost_center_filter.df.get_query = function(doc, cdt, cdn) {
					// query_report.refresh();
                    return {
                        filters: {
                            "company": company
                        }
                    };
                };
                cost_center_filter.refresh();
				query_report.refresh();

            }
        },
        {
            "fieldname": "cost_center",
            "label": __("Cost Center"),
            "fieldtype": "Link",
            "options": "Cost Center",
            "width": 100,
            "get_query": function(doc, cdt, cdn) {
                return {
                    filters: {
                        "company": company
                    }
                };
            },
        },
		{
			"fieldname": "root_type",
			"label": __("Root Type"),
			"fieldtype": "Select",
			"options": ["All", "Asset", "Liability", "Income", "Expense", "Equity"],
			"default": "All",
		},
		{
			"fieldname": "account_type",
			"label": __("Account Type"),
			"fieldtype": "Select",
			"options": [
				"All",
				"Accumulated Depreciation",
				"Asset Received But Not Billed",
				"Bank",
				"Cash",
				"Chargeable",
				"Capital Work in Progress",
				"Cost of Goods Sold",
				"Depreciation",
				"Equity",
				"Expense Account",
				"Expenses Included In Asset Valuation",
				"Expenses Included In Valuation",
				"Fixed Asset",
				"Income Account",
				"Payable",
				"Receivable",
				"Round Off",
				"Stock",
				"Stock Adjustment",
				"Stock Received But Not Billed",
				"Service Received But Not Billed",
				"Tax",
				"Temporary"
			],
			"default": "All",
		},
	],
};
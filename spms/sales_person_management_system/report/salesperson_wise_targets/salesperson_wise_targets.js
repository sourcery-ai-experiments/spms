// Copyright (c) 2024, aoai and contributors
// For license information, please see license.txt
const months = [
	'January', 'February', 'March', 'April', 'May', 'June', 
	'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
const currentDate = new Date();

const currentMonthIndex = currentDate.getMonth();

const currentMonthName = months[currentMonthIndex];

frappe.query_reports["Salesperson-wise targets"] = {
	"filters": [
		{
			fieldname: "salesperson",
			label: __("Salesperson"),
			fieldtype: "Link",
			options: "Sales Person",
		},
		{
			fieldname: "company",
			label: __("Company"),
			fieldtype: "Link",
			options: "Company",
			default: frappe.defaults.get_user_default('company'),
		},
		{
			fieldname: "month",
			label: __("Month"),
			fieldtype: "Select",
			options: months,
			default:currentMonthName
		},
		{
			fieldname: "territory",
			label: __("Territory"),
			fieldtype: "Link",
			options: "Territory",
			default: "Iraq",
		}
	]
};

// Copyright (c) 2024, aoai and contributors
// For license information, please see license.txt

let today = frappe.datetime.get_today();

let todayDate = frappe.datetime.str_to_obj(today);

// Calculate the date 2 weeks ago
let twoWeeksAgoDate = new Date(todayDate.getTime() - (14 * 24 * 60 * 60 * 1000));

// Calculate the date 2 weeks later
let twoWeeksLaterDate = new Date(todayDate.getTime() + (14 * 24 * 60 * 60 * 1000));

// Format the dates as strings
let twoWeeksAgoDateString = frappe.datetime.obj_to_str(twoWeeksAgoDate);
let twoWeeksLaterDateString = frappe.datetime.obj_to_str(twoWeeksLaterDate);

frappe.query_reports["Salesperson-Wise Detailed"] = {
	"filters": [
		{
            fieldname: 'salesperson',
            label: __('Salesperson'),
            fieldtype: 'Link',
            options: 'Sales Person',
        },
		{
            fieldname: 'company',
            label: __('Company'),
            fieldtype: 'Link',
            options: 'Company',
            default: frappe.defaults.get_user_default('company')
        },
		{
            fieldname: 'fromDate',
            label: __('From Date'),
            fieldtype: 'Date',
            default: twoWeeksAgoDateString,
			reqd: 1
        },
		{
            fieldname: 'toDate',
            label: __('To Date'),
            fieldtype: 'Date',
            default: twoWeeksLaterDateString,
			reqd: 1
        },
		{
            fieldname: 'territory',
            label: __('Territory'),
            fieldtype: 'Link',
            options: 'Territory',
        },
	]
};

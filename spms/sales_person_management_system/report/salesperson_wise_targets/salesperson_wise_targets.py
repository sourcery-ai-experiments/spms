import frappe
from frappe.utils import nowdate, getdate, get_first_day, get_last_day
from dateutil.relativedelta import relativedelta

def execute(filters=None):
    columns = [
        {
            "label": "Salesperson",
            "fieldname": "salesperson",
            "fieldtype": "Link",
            "options": "Sales Person",
            "width": 120,
        },
        {
            "label": "Sales Target (Amount)",
            "fieldname": "sales_target_amount",
            "fieldtype": "Currency",
            "width": 200,
        },
        {
            "label": "Achieved Sales Amount (Total)",
            "fieldname": "achieved_sales_amount",
            "fieldtype": "Currency",
            "width": 200,
        },
        {
            "label": "Collection Target (Amount)",
            "fieldname": "collection_target_amount",
            "fieldtype": "Currency",
            "width": 200,
        },
        {
            "label": "Achieved Payment Entry Amount (Total)",
            "fieldname": "achieved_payment_entry_amount",
            "fieldtype": "Currency",
            "width": 200,
        },
        {
            "label": "Sales Visits Target (Number)",
            "fieldname": "sales_visits_target",
            "fieldtype": "Int",
            "width": 200,
        },
        {
            "label": "Number of Sales Visits (Count)",
            "fieldname": "number_of_sales_visits",
            "fieldtype": "Int",
            "width": 200,
        },
        {
            "label": "Number of Payment Visits (Count)",
            "fieldname": "number_of_payment_visits",
            "fieldtype": "Int",
            "width": 200,
        },
    ]
    data = get_report_data(filters)
    return columns, data

def get_report_data(filters):
    data = []
    sales_persons = frappe.db.sql("""
    select name from `tabSales Person`
    """, as_dict=0)
    salesperson_ = filters.get("salesperson")
    if salesperson_:
        sales_persons = [(salesperson_,)] # add it as tuple to be on the same shape of the sql query result
    month_name = filters.get("month")
    company = filters.get("company")
    territory = filters.get("territory")

    start_date = get_first_day(month_name)
    end_date = get_last_day(month_name)
    for salesperson_tuple in sales_persons:
        salesperson = salesperson_tuple[0]
        sales_target_amount = frappe.db.sql(
            """
            SELECT sum(tvg.target) from `tabVisit Goal` tvg
			where sales_person = %s
            AND `from` >= %s
            AND `to` <= %s
            AND company = %s
            AND territory = %s
            """,
            (salesperson, start_date, end_date, company, territory)
        )[0][0] or 0

        collection_target_amount = frappe.db.sql(
            """
            SELECT SUM(`total_targets`)
            FROM `tabCollects Goal`
            WHERE `sales_person` = %s
            AND `from` >= %s
            AND `to` <= %s
            AND company = %s
            AND territory = %s
            """,
            (salesperson, start_date, end_date, company, territory)
        )[0][0] or 0

        achieved_sales_amount = frappe.db.sql(
            """
            SELECT SUM(si.net_total) 
            FROM `tabSales Invoice` AS si
            JOIN `tabSales Team` AS st ON si.name = st.parent
            WHERE st.sales_person = %s
            AND si.posting_date BETWEEN %s AND %s
            AND si.docstatus = 1
            AND company = %s
            """,
            (salesperson, start_date, end_date, company)
        )[0][0] or 0

        achieved_payment_entry_amount = frappe.db.sql(
            """
            SELECT SUM(pe.paid_amount)
            FROM `tabPayment Entry` AS pe
            JOIN `tabCommission` AS com ON pe.name = com.parent
            WHERE com.sales_person = %s
            AND pe.posting_date BETWEEN %s AND %s
            AND pe.docstatus = 1
            AND company = %s
            """,
            (salesperson, start_date, end_date, company)
        )[0][0] or 0

        sales_visits_target = frappe.db.sql(
            """
            SELECT sum(p.number_of_visits) from `tabProductivity` p
			join `tabVisit Goal` tvg 
			on p.parent = tvg.name
			WHERE tvg.sales_person = %s
            AND tvg.creation BETWEEN %s AND %s
            AND tvg.company = %s
            AND tvg.territory = %s
            """,
            (salesperson, start_date, end_date, company, territory)
        )[0][0] or 0

        number_of_sales_visits = frappe.db.sql(
            """
            SELECT COUNT(*)
            FROM `tabSales Visit`
            WHERE visited_by = %s
            AND creation BETWEEN %s AND %s
            AND company = %s
            AND territory = %s
            """,
            (salesperson, start_date, end_date, company, territory)
        )[0][0] or 0

        number_of_payment_visits = frappe.db.sql(
            """
            SELECT COUNT(*)
            FROM `tabPayment Collection`
            WHERE visited_by = %s
            AND creation BETWEEN %s AND %s
            AND company = %s
            AND territory = %s
            """,
            (salesperson, start_date, end_date, company, territory)
        )[0][0] or 0

        data.append(
            {
                "salesperson": salesperson,
                "sales_target_amount": sales_target_amount,
                "achieved_sales_amount": achieved_sales_amount,
                "collection_target_amount": collection_target_amount,
                "achieved_payment_entry_amount": achieved_payment_entry_amount,
                "sales_visits_target": sales_visits_target,
                "number_of_sales_visits": number_of_sales_visits,
                "number_of_payment_visits": number_of_payment_visits,
            }
        )

    return data

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

    data = []
    if filters:
        salesperson = filters.get("salesperson")
        month_name = filters.get("month")
        company = filters.get("company")
        territory = filters.get("territory")
        sales_target_amount = 0
        collection_target_amount = 0

        # Mapping month names to their numerical representations
        month_map = {
            "January": 1,
            "February": 2,
            "March": 3,
            "April": 4,
            "May": 5,
            "June": 6,
            "July": 7,
            "August": 8,
            "September": 9,
            "October": 10,
            "November": 11,
            "December": 12,
        }

        # Get the current month and year
        current_date = getdate(nowdate())
        current_month = int(current_date.strftime("%m"))
        # current_year = int(current_date.strftime("%Y"))

        start_date = get_first_day(month_name)
        end_date = get_last_day(month_name)

        if current_month == month_map.get(month_name):
            # Retrieve total sales target value from Sales Person doctype
            sales_target_amount = frappe.get_value(
                "Sales Person", {"name": salesperson}, "custom_target"
            )
            # Retrieve total collection target value from Sales Person doctype
            collection_target_amount = frappe.get_value(
                "Sales Person", {"name": salesperson}, "custom_total_targets"
            )
        else:
            # Retrieve total sales target value from Sales Target doctype
            sales_target_amount = frappe.db.sql(
                """
                SELECT SUM(`target`)
                FROM `tabSales Target`
                WHERE `sales_person` = %s
                AND `from_` >= %s
                AND `to` <= %s
                AND company = %s
				AND territory = %s) 
                """,
                (salesperson, start_date, end_date,company,territory),
            )[0][0]
            # Retrieve total collection target value from Sales Target doctype
            collection_target_amount = frappe.db.sql(
                """
                SELECT SUM(`total_targets`)
                FROM `tabCollection Target`
                WHERE `sales_person` = %s
                AND `from` >= %s
                AND `to` <= %s
                AND company = %s
				AND territory = %s
                """,
                (salesperson, start_date, end_date,company,territory),
            )[0][0]

        achieved_sales_amount = frappe.db.sql(
            """
            (SELECT SUM(si.net_total) 
            FROM `tabSales Invoice` AS si
            JOIN `tabSales Team` AS st ON si.name = st.parent
            WHERE st.sales_person = %s
            AND si.posting_date BETWEEN %s AND %s
            AND si.docstatus = 1
            AND company = %s)
            """,
            (salesperson, start_date, end_date,company),
        )[0][0]

        achieved_payment_entry_amount = (
            frappe.db.sql(
                """
            SELECT SUM(pe.paid_amount)
            FROM `tabPayment Entry` AS pe
            JOIN `tabCommission` AS com ON pe.name = com.parent
            WHERE com.sales_person = %s
            AND pe.posting_date BETWEEN %s AND %s
            AND pe.docstatus = 1
            AND company = %s
        """,
                (salesperson, start_date, end_date,company),
            )[0][0]
            or 0
        )
        sales_visits_target = 0
        if current_month == month_map.get(month_name):
            # Retrieve total number of visits from Sales Person doctype
            sales_p = frappe.get_value("Sales Person", {"name": salesperson}, "name")
            sp = frappe.get_doc("Sales Person", sales_p)
            sales_visits_target = len(sp.custom_productivity)
        else:
            sales_targets = frappe.db.sql(
                """
                SELECT name
                FROM `tabSales Target`
                WHERE sales_person = %s
                AND `from_` >= %s
                AND `to` <= %s
                AND company = %s
				AND territory = %s
            """,
                (salesperson, start_date, end_date,company,territory),
            )

            if len(sales_targets) != 0:
                sales_t = frappe.get_doc("Sales Target", sales_targets[0][0])
                sales_visits_target = len(sales_t.productivity)

        number_of_sales_visits = frappe.db.sql(
            """
            SELECT COUNT(*)
            FROM `tabSales Visit`
            WHERE visited_by = %s
            AND creation BETWEEN %s AND %s
            AND company = %s
            AND territory = %s
            """,
            (salesperson, start_date, end_date,company,territory),
        )[0][0]

        number_of_payment_visits = frappe.db.sql(
            """
            SELECT COUNT(*)
            FROM `tabPayment Collection`
            WHERE visited_by = %s
            AND creation BETWEEN %s AND %s
            AND company = %s
            AND territory = %s
            """,
            (salesperson, start_date, end_date,company,territory),
        )[0][0]

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

    return columns, data

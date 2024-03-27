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
    ]

    data = []
    if filters:
        salesperson = filters.get("salesperson")
        month_name = filters.get("month")
        company = filters.get("company")
        territory = filters.get("territory")
        sales_target_qty = 0
        sales_target_amount = 0

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
            "December": 12
        }

        # Get the current month and year
        current_date = getdate(nowdate())
        current_month = int(current_date.strftime("%m"))
        current_year = int(current_date.strftime("%Y"))

        if current_month == month_map.get(month_name) and current_year == int(month_name[3:]):
            # Retrieve total sales target value from Sales Person doctype
            sales_target_amount = frappe.get_value(
                "Sales Person",
                {"name": salesperson},
                "custom_target"
            )
        else:
            # Retrieve total target value from Sales Target doctype based on the selected month
            start_date = get_first_day(month_name)
            end_date = get_last_day(month_name)
            
            sales_target_amount = frappe.db.sql("""
				SELECT SUM(`target`)
				FROM `tabSales Target`
				WHERE `sales_person` = %s
				AND `from_` <= %s
				AND `to` <= %s
                """, (salesperson, start_date, end_date))[0][0]

        data.append(
            {
                "salesperson": salesperson,
                "sales_target_qty": sales_target_qty,
                "sales_target_amount": sales_target_amount,
            }
        )

    return columns, data

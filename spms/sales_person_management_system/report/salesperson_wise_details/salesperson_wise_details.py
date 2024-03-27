import frappe

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
            "label": "Customers Added (Count)",
            "fieldname": "customers_added",
            "fieldtype": "Int",
            "width": 200,
        },
        {
            "label": "Achieved Sales Amount (Total)",
            "fieldname": "sales_amount",
            "fieldtype": "Currency",
            "width": 200,
        },
        {
            "label": "Discounts on Sales (Total)",
            "fieldname": "discounts_on_sales",
            "fieldtype": "Currency",
            "width": 200,
        },
        {
            "label": "Sales Visits (Count)",
            "fieldname": "sales_visits_count",
            "fieldtype": "Int",
            "width": 200,
        },
        {
            "label": "Payment Collections (Count)",
            "fieldname": "sales_payment_count",
            "fieldtype": "Int",
            "width": 200,
        },
        {
            "label": "Discounts on Payment (Total)",
            "fieldname": "discounts_on_payment",
            "fieldtype": "Currency",
            "width": 200,
        }
    ]

    data = []
    if filters:
        salesperson = filters.get("salesperson")
        from_date = filters.get("from_date")
        to_date = filters.get("to_date")

        combined_query = f"""
            SELECT 
                (SELECT COUNT(c.customer_name) 
                    FROM `tabCustomer` AS c
                    JOIN `tabSales Team` AS st ON c.name = st.parent
                    WHERE st.sales_person = '{salesperson}'
                    AND c.creation BETWEEN '{from_date}' AND '{to_date}') AS customer_count,
                (SELECT SUM(si.grand_total) 
                    FROM `tabSales Invoice` AS si
                    JOIN `tabSales Team` AS st ON si.name = st.parent
                    WHERE st.sales_person = '{salesperson}'
                    AND si.creation BETWEEN '{from_date}' AND '{to_date}'
                    AND si.docstatus = 1) AS total_sales_amount,
                (SELECT SUM(si.discount_amount) 
                    FROM `tabSales Invoice` AS si
                    JOIN `tabSales Team` AS st ON si.name = st.parent
                    WHERE st.sales_person = '{salesperson}'
                    AND si.creation BETWEEN '{from_date}' AND '{to_date}'
                    AND si.docstatus = 1) AS total_discounts,
                (SELECT COUNT(sv.name)
                    FROM `tabSales Visit` AS sv
                    WHERE sv.visited_by = '{salesperson}'
                    AND sv.docstatus = 1
                    AND sv.creation BETWEEN '{from_date}' AND '{to_date}') AS sales_visits_count,         
                (SELECT COUNT(pc.name)
                    FROM `tabPayment Collection` AS pc
                    WHERE pc.visited_by = '{salesperson}'
                    AND pc.docstatus = 1
                    AND pc.creation BETWEEN '{from_date}' AND '{to_date}') AS payment_collections_count,
				(
					SELECT SUM(
						CASE
							WHEN pe.custom_discount_amount != 0 THEN pe.custom_discount_amount
							ELSE pe.custom_discount_percentage / 100 * pe.paid_amount
						END
					)
					FROM `tabPayment Entry` AS pe
					JOIN `tabCommission` AS com ON pe.name = com.parent
					WHERE com.sales_person = '{salesperson}'
					AND pe.posting_date BETWEEN '{from_date}' AND '{to_date}'
					AND pe.docstatus = 1
				) AS total_discounts_on_payment
        """

        sql_res = frappe.db.sql(combined_query, as_dict=False)
        customer_count = sql_res[0][0]
        total_sales_amount = sql_res[0][1]
        total_discounts = sql_res[0][2]
        sales_visits_count = sql_res[0][3]
        sales_payment_count = sql_res[0][4]
        total_discounts_on_payment = sql_res[0][5]

        data.append({
            "salesperson": salesperson,
            "customers_added": customer_count,
            "sales_amount": total_sales_amount,
            "discounts_on_sales": total_discounts,
            "sales_visits_count": sales_visits_count,
            "sales_payment_count": sales_payment_count,
            "discounts_on_payment": total_discounts_on_payment
        })

        return columns, data

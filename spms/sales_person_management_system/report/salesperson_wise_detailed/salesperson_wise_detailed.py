import frappe

def execute(filters=None):
  columns = [
      {"label": "Salesperson Name", "fieldname": "salesperson", "fieldtype": "Data", "width": 150},
      {"label": "Customers Added", "fieldname": "customers_added", "fieldtype": "Int", "width": 120},
      {"label": "Achieved Sales Amount", "fieldname": "sales_amount", "fieldtype": "Currency", "width": 150},
      {"label": "Discounts on Sales", "fieldname": "sales_discounts", "fieldtype": "Currency", "width": 150},
      {"label": "Achieved Payment Entry Amount", "fieldname": "payment_amount", "fieldtype": "Currency", "width": 200},
      {"label": "Discounts on Payment", "fieldname": "payment_discounts", "fieldtype": "Currency", "width": 150},
      {"label": "Number of Sales Visits", "fieldname": "sales_visits", "fieldtype": "Int", "width": 150},
      {"label": "Number of Payment Visits", "fieldname": "payment_visits", "fieldtype": "Int", "width": 150}
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
  from_date = filters.get("fromDate")
  to_date = filters.get("toDate")
  company = filters.get("company")
  territory = filters.get("territory")

  for salesperson_tuple in sales_persons:
    salesperson = salesperson_tuple[0]
    customers_added = f"""
            select count(*) from `tabCustomer` tc 
            join `tabSales Team` tst 
            ON tst.parent = tc.name 
            join `tabSales Person` tsp 
            on tst.sales_person = tsp.name 
            where tst.sales_person = '{salesperson}'
            and tsp.territory = '{territory}' 
            and tsp.creation BETWEEN '{from_date}' and '{to_date}'
    """
    customers_added = frappe.db.sql(customers_added, as_dict=False)

    sales_amount = f"""
    SELECT SUM(si.grand_total) 
    FROM `tabSales Invoice` AS si
    JOIN `tabSales Team` AS st ON si.name = st.parent
    WHERE st.sales_person = '{salesperson}'
    AND si.creation BETWEEN '{from_date}' and '{to_date}'
    AND si.docstatus = 1
    AND si.company = '{company}'
    """
    sales_amount = frappe.db.sql(sales_amount, as_dict=False)

    sales_discounts = f"""
    SELECT SUM(si.base_discount_amount) 
    FROM `tabSales Invoice` AS si
    JOIN `tabSales Team` AS st ON si.name = st.parent
    WHERE st.sales_person = '{salesperson}'
    AND si.creation BETWEEN '{from_date}' and '{to_date}'
    AND si.docstatus = 1
    AND si.company = '{company}'
    """
    sales_discounts = frappe.db.sql(sales_discounts, as_dict=False)

    sales_visits = f"""
    SELECT COUNT(sv.name)
    FROM `tabSales Visit` AS sv
    WHERE sv.visited_by = '{salesperson}'
    AND sv.docstatus = 1
    AND sv.creation BETWEEN '{from_date}' AND '{to_date}'
    AND sv.company = '{company}'
    AND territory = '{territory}'
    """
    sales_visits = frappe.db.sql(sales_visits, as_dict=False)
    payment_amount = f"""
            SELECT SUM(pe.paid_amount)
    FROM `tabPayment Entry` AS pe
    JOIN `tabCommission` AS com ON pe.name = com.parent
    WHERE com.sales_person = '{salesperson}'
    AND pe.posting_date BETWEEN '{from_date}' AND '{to_date}'
    AND pe.docstatus = 1
      AND pe.company = '{company}'
    """
    payment_amount = frappe.db.sql(payment_amount, as_dict=False)
    payment_discounts = f"""
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
    AND pe.company = '{company}'
    """
    payment_discounts = frappe.db.sql(payment_discounts, as_dict=False)
    payment_visits = f"""
            SELECT COUNT(pc.name)
    FROM `tabPayment Collection` AS pc
    WHERE pc.visited_by = '{salesperson}'
    AND pc.docstatus = 1
    AND pc.creation BETWEEN '{from_date}' AND '{to_date}'
    AND pc.company = '{company}'
    AND territory = '{territory}'
    """
    payment_visits = frappe.db.sql(payment_visits, as_dict=False)
    data.append(
        {
            "salesperson": salesperson,
            "customers_added": customers_added[0][0],
            "sales_amount": sales_amount[0][0],
            "sales_discounts": sales_discounts[0][0],
            "payment_amount": payment_amount,
            "payment_discounts": payment_discounts,
            "sales_visits": sales_visits[0][0],
            "payment_visits": payment_visits[0][0],
        }
    )

  return data

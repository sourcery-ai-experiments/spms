import frappe

def update_target_on_sales_invoice_submit(doc, method) -> None:
    visit_goal_name = frappe.db.get_value('Visit Goal', {
    'sales_person': doc.sales_person,
    'company':doc.company,
        'from':['<=', doc.posting_date],
        'to':['>=', doc.posting_date]
    },['name'], as_dict=1)

    visit_goal_doc = frappe.get_doc('Visit Goal', visit_goal_name)


    for row in visit_goal_doc.target_breakdown:
        for item in doc.items:
            if item.item_code == row.item:
                row.sold = row.sold + item.qty
                break
            
    visit_goal_doc.achieved = visit_goal_doc.achieved + doc.total

    visit_goal_doc.save()
    frappe.msgprint("Its works")
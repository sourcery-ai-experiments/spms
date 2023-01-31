import frappe


def update_target_on_sales_invoice_submit(doc, method) -> None:
    if doc.sales_person and doc.sales_person != "":
        visit_goal_name = frappe.db.get_value('Visit Goal', {
            'sales_person': doc.sales_person,
            'company': doc.company,
            'from': ['<=', doc.posting_date],
            'to': ['>=', doc.posting_date]
        }, ['name'], as_dict=1)

        visit_goal_doc = frappe.get_doc('Visit Goal', visit_goal_name)

        for row in visit_goal_doc.target_breakdown:
            for item in doc.items:
                if item.item_code == row.item:
                    row.sold = row.sold + item.qty
                    break

        visit_goal_doc.achieved = visit_goal_doc.achieved + doc.base_net_total

        visit_goal_doc.save()
        # Getting the sales person doc from the sales person in visit goal doc
        sales_person_doc = frappe.get_doc("Sales Person", doc.sales_person)
        # Traversing the tree upwards , to the parents and Updating the acheived & sold for the parent sales person.
        # we check if the parent_sales_person is not equal to 'Sales Team' which is the root of the sales person tree
        while sales_person_doc.parent_sales_person != "Sales Team":
            parent_visit_goal_name = frappe.db.get_value('Visit Goal', {
                'sales_person': sales_person_doc.parent_sales_person,
                'company': doc.company,
                'from': ['<=', doc.posting_date],
                'to': ['>=', doc.posting_date]
            }, ['name'], as_dict=1)
            parent_visit_goal = frappe.get_doc(
                'Visit Goal', parent_visit_goal_name)
            parent_visit_goal.achieved = parent_visit_goal.achieved + doc.base_net_total
            for row in parent_visit_goal.target_breakdown:
                for item in doc.items:
                    if item.item_code == row.item:
                        row.sold = row.sold + item.qty
                        break
            parent_visit_goal.save()
            # updating the sales person doc to the parent sales person doc.
            sales_person_doc = frappe.get_doc(
                "Sales Person", parent_visit_goal.sales_person)

import frappe

from .utils import get_visit_goal


def update_target(doc, method, operator) -> None:
    """
    It updates the target breakdown and achieved amount of the visit goal of the sales person of the
    given document
    
    :param doc: The document that is being saved
    :param method: The method name of the hook
    :param operator: 1 for creation and -1 for deletion
    :return: None
    """
    if not doc.sales_person or doc.sales_person == "":
        return

    visit_goal_doc = get_visit_goal(doc)
    update_target_breakdown(doc, visit_goal_doc, operator)
    visit_goal_doc.achieved += operator * doc.base_net_total
    visit_goal_doc.save()
    sales_person_doc = frappe.get_doc("Sales Person", doc.sales_person)
    update_parent_targets(doc, sales_person_doc, operator)


def update_target_breakdown(doc, visit_goal_doc, operator) -> None:
    """
    "For each row in the visit goal document, find the corresponding item in the sales invoice document
    and update the sold value."
    
    The function is called twice: once when the sales invoice is submitted and once when it is
    cancelled. The operator is used to determine whether to add or subtract the quantity from the sold
    value
    
    :param doc: The Sales Invoice document
    :param visit_goal_doc: The visit goal document that you want to update
    :param operator: 1 for adding, -1 for subtracting
    """
    for row in visit_goal_doc.target_breakdown:
        for item in doc.items:
            if item.item_code == row.item:
                row.sold += operator * item.qty
                break


def update_parent_targets(doc, sales_person_doc, operator) -> None:
    """
    It updates the parent sales person's visit goal with the sales order's base net total
    
    :param doc: The current document
    :param sales_person_doc: The sales person document
    :param operator: This is a number that tells the function whether to add or subtract the value from
    the target
    """
    parent_visit_goal_name = frappe.db.get_value('Visit Goal', {
        'sales_person': sales_person_doc.parent_sales_person,
        'company': doc.company,
        'from': ['<=', doc.posting_date],
        'to': ['>=', doc.posting_date]
    }, ['name'], as_dict=1)
    parent_visit_goal = frappe.get_doc(
        'Visit Goal', parent_visit_goal_name)
    parent_visit_goal.achieved += operator * doc.base_net_total
    update_target_breakdown(doc, parent_visit_goal, operator)
    parent_visit_goal.save()


def update_target_on_sales_invoice_submit(doc, method) -> None:
    """
    When a sales invoice is submitted, update the target
    
    :param doc: The document object
    :param method: The method that is being called
    """
    update_target(doc, method, 1)


def update_target_on_sales_invoice_cancel(doc, method) -> None:
    """
    When a sales invoice is cancelled, update the target by subtracting the amount of the invoice.
    
    :param doc: The document that is being saved
    :param method: The method that is being called
    """
    update_target(doc, method, -1)

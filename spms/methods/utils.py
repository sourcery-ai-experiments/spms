import qrcode
import frappe
from frappe.utils import cstr
from random import randint
from datetime import date


def generate_qrcode(site_name, route_name):
    """
    It generates a QR code image and saves it to the public folder of the site

    :param site_name: The name of the site
    :param route_name: The name of the route you want to generate a QR code for
    :return: The path to the file.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(f'{site_name}/{route_name}')

    file_name = f'{randint(1, 100000)}-{date.today()}'
    img = qr.make_image(fill_color="black", back_color="white")

    current_site_name = cstr(frappe.local.site)
    img.save(f"{current_site_name}/public/files/{file_name}.png")

    return f"/files/{file_name}.png"


def update_visit_goal(self, operation):
    """
    It updates the verified visits for the sales person and all the parent sales persons in the tree
    :param operation: 1 for increment, -1 for decrement
    """
    def update_visit_goal_for_doctor(visit_goal_doc, doctor_name, operation):
        for row in visit_goal_doc.productivity:
            if row.doctor == doctor_name:
                row.verified_visits += operation
                row.achievement = round(
                    row.verified_visits / row.number_of_visits * 100)

        visit_goal_doc.save()

        return frappe.get_doc("Sales Person", visit_goal_doc.sales_person)

    visit_goal_doc = self.get_visit_goal_doc(self.visited_by)
    sales_person_doc = update_visit_goal_for_doctor(
        visit_goal_doc, self.doctor_name, operation)

    # Traverse the tree upwards and update the verified visits for the parent sales person
    parent_visit_goal = self.get_visit_goal_doc(
        sales_person_doc.parent_sales_person)
    sales_person_doc = update_visit_goal_for_doctor(
        parent_visit_goal, self.doctor_name, operation)


def get_visit_goal(doc):
    """
    Get the visit goal for the given sales person and company for the given date

    :param doc: The current document that is being saved
    :return: A dictionary with the name of the visit goal
    """
    visit_goal_name = frappe.db.get_value("Visit Goal", {
        "sales_person": doc.sales_person,
        "company": doc.company,
        "from": ["<=", doc.posting_date],
        "to": [">=", doc.posting_date]
    }, ["name"], as_dict=1)

    return frappe.get_doc("Visit Goal", visit_goal_name)


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

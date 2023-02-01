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


def calculate_fixed_target(doc, collects_goal_doc, operation):
    """
    It takes the amount of the payment and adds it to the total collected amount of the collects goal

    :param doc: The document that is being saved
    :param collects_goal_doc: The document that is being updated
    :param operation: 1 for addition, -1 for subtraction
    """
    collects_goal_doc.total_collected += (frappe.utils.flt(
        doc.amount_other_currency)*operation)
    calculate_incentives(collects_goal_doc)
    collects_goal_doc.save()


def update_customer_table(doc, collects_goal_doc, operation):
    """
    It updates the customer collects goal table in the collects goal document

    :param doc: The document that is being saved
    :param collects_goal_doc: The collects goal document that will be updated
    :param operation: 1 for insert, -1 for delete
    """
    # Checking if the customer is in the table. If it is, then it will update the table. If it is not,
    # then it will add the amount to the additional collected.
    customer_not_found = True
    for row in collects_goal_doc.customer_collects_goal:
        if (row.customer == doc.customer):
            row.verified_collects += (doc.amount_other_currency * operation)
            row.verified_visits += operation
            customer_not_found = False
            break

    # If the customer is not found in the table, then it will add the amount to the additional collected.
    if customer_not_found:
        collects_goal_doc.additional_collected += (
            doc.amount_other_currency * operation)

    # Adding the verified collects of each customer in the customer collects goal table and adding it to
    # the additional collected.
    total = sum(
        i.verified_collects for i in collects_goal_doc.customer_collects_goal)
    total += collects_goal_doc.additional_collected

    # Updating the total collected and calculating the incentives.
    collects_goal_doc.total_collected = frappe.utils.flt(total)
    calculate_incentives(collects_goal_doc)
    collects_goal_doc.save()


def update_collects_goal(doc, operation):
    """
    It updates the target of the collects goal and the parent collects goal if the parent exists

    :param doc: The document that is being saved
    :param operation: 1 for add, -1 for subtract
    """
    collects_goal_doc = get_collects_goal_doc(doc)
    if (
        collects_goal_doc.parent_collects_goal
        and collects_goal_doc.parent_collects_goal != ""
    ):
        parent_collects_goal_doc = frappe.get_doc(
            'Collects Goal', collects_goal_doc.parent_collects_goal
        )
    else:
        parent_collects_goal_doc = None

    # Checking if the target type is fixed target, then it will calculate the fixed target.
    if collects_goal_doc.target_type == "Fixed Target":
        calculate_fixed_target(doc, collects_goal_doc, operation)
        if parent_collects_goal_doc:
            if parent_collects_goal_doc.target_type != "Fixed Target":
                frappe.throw(
                    "Parent and Child must have the same target type.")
            calculate_fixed_target(doc, parent_collects_goal_doc, 1)

    # Updating the customer collects goal table in the collects goal document
    elif collects_goal_doc.target_type == "Customer Debt-based Target":
        update_customer_table(doc, collects_goal_doc, operation)
        if parent_collects_goal_doc:
            if parent_collects_goal_doc.target_type != "Customer Debt-based Target":
                frappe.throw(
                    "Parent and Child must have the same target type.")
            update_customer_table(doc, parent_collects_goal_doc, operation)


def get_collects_goal_doc(doc):
    """
    It gets the name of the Collects Goal that is active for the Sales Person on the date of the Visit
    :return: The name of the Collects Goal
    """
    collect_goal_name = frappe.db.get_value('Collects Goal', {
        'sales_person': doc.visited_by,
        'company': doc.company,
        'from': ['<=', doc.date],
        'to': ['>=', doc.date]
    }, ['name'], as_dict=1)

    # Get objects for Specific Collects Goal
    return frappe.get_doc('Collects Goal', collect_goal_name)


def calculate_incentives(collects_goal_doc):
    """
    If the total collected is greater than or equal to the total targets, then the total incentives is
    equal to the commission percentage of the total collected

    :param collects_goal_doc: The document object of the Collect Goal
    """
    total_incentives = 0
    if len(collects_goal_doc.commissions_range) != 0:
        target_percentage = (collects_goal_doc.total_collected /
                             collects_goal_doc.total_targets) * 100
        for i in collects_goal_doc.commissions_range:
            if target_percentage >= i.from_ and target_percentage <= i.to_:
                total_incentives = (i.commission / 100) * \
                    collects_goal_doc.total_collected
                break
    collects_goal_doc.incentives = frappe.utils.flt(total_incentives)
    collects_goal_doc.save()

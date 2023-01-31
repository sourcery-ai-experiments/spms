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
                row.achievement = round(row.verified_visits / row.number_of_visits * 100)

        visit_goal_doc.save()

        return frappe.get_doc("Sales Person", visit_goal_doc.sales_person)

    visit_goal_doc = self.get_visit_goal_doc(self.visited_by)
    sales_person_doc = update_visit_goal_for_doctor(visit_goal_doc, self.doctor_name, operation)

    # Traverse the tree upwards and update the verified visits for the parent sales person
    while sales_person_doc.parent_sales_person != "Sales Team":
        parent_visit_goal = self.get_visit_goal_doc(sales_person_doc.parent_sales_person)
        frappe.msgprint("its works")
        sales_person_doc = update_visit_goal_for_doctor(parent_visit_goal, self.doctor_name, operation)
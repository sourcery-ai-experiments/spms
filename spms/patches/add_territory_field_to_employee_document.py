import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_field

def execute():
    company = frappe.get_all('Company', filters = {'country': 'Iraq'})

    if not company:
        return

    create_custom_field('Employee', {
        'fieldname': 'territory',
        'label': 'Territory',
        'fieldtype': 'Link',
        'options': 'Territory',
        'insert_after': 'employee_number',
        'translatable': 0,
        'owner': 'Administrator'
    })
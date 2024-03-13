import frappe
import json


@frappe.whitelist()
def add_client_to_sales_person(values, doc):
    try:
        values = json.loads(values)
        doc_dict = json.loads(doc)
        docu = frappe.get_doc("Sales Person", doc_dict.get("name"))
        child = docu.append('custom_productivity', {})
        child.client = values.get('client')
        docu.save()
        return True
    except Exception as e:
        frappe.throw("An error occurred while adding client to sales person.")
        return False
    
@frappe.whitelist()
def create_client_to_sales_person(values, doc,is_present,client):
    try:
        if(client!=""):
            values = json.loads(values)
            doc_dict = json.loads(doc)

            docu = frappe.get_doc("Sales Person", doc_dict.get("name"))
            child = docu.append('custom_productivity', {})
            child.client = client#values.get('client')
            docu.save()
            return True
        else:
            values = json.loads(values)
            values["doctype"] = "Client"
            values["full_name"] = values.get("first_name")+ ((" " + values.get("middle_name")) if values.get("middle_name") != None else "")+ " " + values.get("last_name")
            new_doc = frappe.get_doc(values)
            new_doc.insert()
            doc_dict = json.loads(doc)
            docu = frappe.get_doc("Sales Person", doc_dict.get("name"))
            child = docu.append('custom_productivity', {})
            child.client = new_doc.name
            docu.save()
            return True
    except Exception as e:
        frappe.throw("An error occurred while adding client to sales person.",e)
        return False
    
@frappe.whitelist()
def remove_client_from_sales_person(values, doc):
    try:
        values = json.loads(values)

        doc_dict = json.loads(doc)
        docu = frappe.get_doc("Sales Person", doc_dict.get("name"))
        docu.custom_productivity = [row for row in docu.custom_productivity if row.client not in values]
        docu.save()

        return True
    except Exception as e:
        frappe.log_error(e, 'Error removing client from sales person')
        frappe.throw("An error occurred while removing client from sales person.")
        return False
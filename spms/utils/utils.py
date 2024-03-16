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
            new_doc = frappe.get_doc(values)
            new_doc.insert()
            doc_dict = json.loads(doc)
            docu = frappe.get_doc("Sales Person", doc_dict.get("name"))
            child = docu.append('custom_productivity', {})
            child.client = new_doc.name
            docu.save()
            return True
    except Exception as e:
        frappe.throw("An error occurred while adding client to sales person.")
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


@frappe.whitelist()
def set_target(doc):
    if isinstance(doc, str):
        doc = frappe.parse_json(doc)

    # Access the 'name' field of the dictionary directly
    sales_person_name = doc.get("name")
    doc = frappe.get_doc("Sales Person", sales_person_name)
    # Create a new document instance of Document Type B
    if doc.custom_type == "Sales":
        doc_b = frappe.new_doc("Visit Goal")
        # Set field values from Document Type A to Document Type B
        doc_b.sales_person = doc.sales_person_name
        if(doc.employee != ""):
            doc_b.employee = doc.employee
        doc_b.territory = doc.territory
        doc_b.from_ = doc.custom_from
        doc_b.to = doc.custom_to
        doc_b.target = doc.custom_target
        doc_b.achieved = doc.custom_achieved
        doc_b.number_of_days = doc.custom_number_of_days

        # Handle child tables if any
        for child_a in doc.custom_target_breakdown:
            doc_b.append("target_breakdown",{
                "item" : child_a.item,
                "quantity" : child_a.quantity,
                "sold" : child_a.sold,
                "achievement" : child_a.achievement,
            })  # Append to child table of Document Type B
        for child_a in doc.custom_productivity:
            doc_b.append("productivity",{
                "client": child_a.client,
                "name1": child_a.name1,
                "class_name": child_a.class_name,
                "number_of_visits": child_a.number_of_visits,
                "verified_visits": child_a.verified_visits,
                "achievement": child_a.achievement,
            }) 

        doc_b.insert()
        return f"New Visit Goal({doc_b.sales_person}) record was added"

    
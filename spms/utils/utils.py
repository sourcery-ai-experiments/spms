import frappe
import json

    

    
# @frappe.whitelist()
# def create_client_to_sales_person(values, doc,is_present,client):
#     try:
#         if(client!=""):
#             values = json.loads(values)
#             doc_dict = json.loads(doc)

#             docu = frappe.get_doc("Sales Person", doc_dict.get("name"))
#             child = docu.append('custom_productivity', {})
#             child.client = client#values.get('client')
#             docu.save()
#             return True
#         else:
#             values = json.loads(values)
#             values["doctype"] = "Client"
#             values["full_name"] = values.get("first_name")+ ((" " + values.get("middle_name")) if values.get("middle_name") != None else "")+ " " + values.get("last_name")
#             new_doc = frappe.get_doc(values)
#             new_doc.insert()
#             doc_dict = json.loads(doc)
#             docu = frappe.get_doc("Sales Person", doc_dict.get("name"))
#             child = docu.append('custom_productivity', {})
#             child.client = new_doc.name
#             docu.save()
#             return True
#     except Exception as e:
#         frappe.throw("An error occurred while adding client to sales person.",e)
#         return False
    
@frappe.whitelist()
def create_client_to_sales_person(values, doc, is_present, client):
    try:
        if client:
            # Check if client exists in the table
            client_exists = frappe.db.exists("Client", client)
            if not client_exists:
                values = json.loads(values)
                values["doctype"] = "Client"
                values["full_name"] = values.get("first_name") + ((" " + values.get("middle_name")) if values.get(
                    "middle_name") is not None else "") + " " + values.get("last_name")
                new_doc = frappe.get_doc(values)
                new_doc.insert()

            doc_dict = json.loads(doc)
            docu = frappe.get_doc("Sales Person", doc_dict.get("name"))
            # Check if the client is already appended
            existing_clients = [row.client for row in docu.custom_productivity]
            if client not in existing_clients:
                child = docu.append('custom_productivity', {})
                child.client = client
                docu.save()
                return True
            else:
                frappe.msgprint("Client already exists for this sales person.")
                return False
        else:
            frappe.msgprint("Please provide a valid client name.")
            return False
    except Exception as e:
        frappe.throw("An error occurred while adding client to sales person.", e)
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
def set_target(values, quantities, doc):
    try:
        values = json.loads(values)
        quantities = json.loads(quantities)  # Convert quantities to dictionary

        # Load the document
        doc_dict = json.loads(doc)
        docc = frappe.get_doc(doc_dict['doctype'], doc_dict['name'])

        # Update main document fields
        docc.custom_from = values['from']
        docc.custom_to = values['to']
        docc.custom_target = values['target']

        # Update child table quantities or add new row
        for item, quantity in quantities.items():
            target_row = next((row for row in docc.custom_target_breakdown if row.item == item), None)
            if target_row:
                target_row.quantity = quantity
            else:
                docc.append('custom_target_breakdown', {
                    'item': item,
                    'quantity': quantity
                })

        # Save the document
        docc.save()

        return True
    except Exception as e:
        frappe.throw("An error occurred while updating the document.")
        return False

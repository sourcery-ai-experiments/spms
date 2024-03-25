import frappe
import json

@frappe.whitelist()
def create_client_to_sales_person(values, doc,  client, address):
    try:
        address_dict = json.loads(address)
        if(address_dict.get("address_line_1") != ""):
            # Create a new Address document
            new_address = frappe.new_doc("Address")
            new_address.address_title = address_dict.get("address_line_1")
            new_address.address_line1 = address_dict.get("address_line_1")
            new_address.address_line2 = address_dict.get("address_line_2")
            new_address.city = address_dict.get("city")
            new_address.state = address_dict.get("state")
            new_address.pincode = address_dict.get("zip_code")
            new_address.country = address_dict.get("country")
            new_address.insert()

        # Check if client exists in the table
        client_exists = frappe.db.exists("Client", client)
        if not client_exists:
            values = json.loads(values)
            values["doctype"] = "Client"
            values["full_name"] = values.get("first_name") + ((" " + values.get("middle_name")) if values.get(
                "middle_name") is not None else "") + " " + values.get("last_name")
            # Assign address to client
            
            if(address_dict.get("address_line_1") != ""):
                values["address"] = new_address.name
                
            new_doc = frappe.get_doc(values)
            new_doc.insert()

        doc_dict = json.loads(doc)
        docu = frappe.get_doc("Sales Person", doc_dict.get("name"))

        # Check if the client is already appended
        existing_clients = [row.client for row in docu.custom_productivity]

        
        if new_doc not in existing_clients:
            child = docu.append('custom_productivity', {})
            child.client = new_doc
            docu.save()
            return True
        else:
            frappe.msgprint("Client already exists for this sales person.")
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
def remove_customer_from_sales_person(values, doc):
    try:
        values = json.loads(values)

        doc_dict = json.loads(doc)
        docu = frappe.get_doc("Sales Person", doc_dict.get("name"))
        docu.custom_customer_collects_goal = [row for row in docu.custom_customer_collects_goal if row.customer not in values]
        docu.save()

        return True
    except Exception as e:
        frappe.log_error(e, 'Error removing customer from sales person')
        frappe.throw("An error occurred while removing customer from sales person.")
        return False

@frappe.whitelist()
def set_target(values, quantities, doc):
    try:
        values = json.loads(values)
        quantities = json.loads(quantities)  # Convert quantities to dictionary

        # Load the document
        doc_dict = json.loads(doc)
        docc = frappe.get_doc(doc_dict['doctype'], doc_dict['name'])
        create_target_log(docc)
        # Update main document fields
        docc.custom_from = values['from']
        docc.custom_to = values['to']
        docc.custom_target = values['target']
        docc.custom_achieved =0
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

        docc.save()

        return True
    except Exception as e:
        frappe.throw("An error occurred while updating the document.")
        return False


@frappe.whitelist()
def set_collecting_target(values, quantities, doc,address):
    try:
        values = json.loads(values)
        quantities = json.loads(quantities)  # Convert quantities to dictionary

        doc_dict = json.loads(doc)
        docc = frappe.get_doc(doc_dict['doctype'], doc_dict['name'])
        docc.custom_from_ = values['from']
        docc.custom_to_ = values['to']
        docc.custom__target_type = values['target_type']

        create_collect_log(docc)
        
        docc.custom_additional_collected = 0
        docc.custom_additional_target = 0
        docc.custom_total_collected = 0
        
        for customer, amount_of_money in quantities.items():
            target_row = next((row for row in docc.custom_customer_collects_goal if row.customer == customer), None)
            if target_row:
                target_row.amount_of_money = amount_of_money
            else:
                customer_exists = frappe.db.get_list("Customer", filters={"customer_name": customer})
                if(customer_exists):
                    # ctmr = frappe.get_doc("Customer", customer)
                    docc.append('custom_customer_collects_goal', {
                        'customer': customer,
                        'amount_of_money': amount_of_money
                    })
                else:
                    address_dict = json.loads(address)

                    # Create a new Address document
                    new_address = frappe.new_doc("Address")
                    new_address.address_title = address_dict.get("address_line_1")
                    new_address.address_line1 = address_dict.get("address_line_1")
                    new_address.address_line2 = address_dict.get("address_line_2")
                    new_address.city = address_dict.get("city")
                    new_address.state = address_dict.get("state")
                    new_address.pincode = address_dict.get("zip_code")
                    new_address.country = address_dict.get("country")
                    new_address.insert()

                    new_customer = frappe.new_doc("Customer")
                    new_customer.customer_name = customer
                    new_customer.customer_primary_address = new_address.name
                    new_customer.insert()

                    docc.append('custom_customer_collects_goal', {
                        'customer': customer,
                        'amount_of_money': amount_of_money
                    }) 
                
        if(values['target_type']) == "Customer Debt-based Target":
            target_value = 0
            for i in docc.custom_customer_collects_goal:
                target_value += i.amount_of_money
                
            docc.custom_total_targets = target_value
        else:
            docc.custom_total_targets = values['target']
            
        docc.custom_total_collected = 0
        docc.save()
        return True
    except Exception as e:
        frappe.throw("An error occurred while updating the document.")
        return False

def create_target_log(doc):

    if isinstance(doc, str):
        doc = frappe.parse_json(doc)

    # Access the 'name' field of the dictionary directly
    sales_person_name = doc.get("name")
    doc = frappe.get_doc("Sales Person", sales_person_name)
    # Create a new document instance of Document Type B
    if doc.custom_type != "Collect":
        doc_b = frappe.new_doc("Sales Target")
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
        
        return True
    
def create_collect_log(doc):
    if isinstance(doc, str):
        doc = frappe.parse_json(doc)

    # Access the 'name' field of the dictionary directly
    sales_person_name = doc.get("name")
    doc = frappe.get_doc("Sales Person", sales_person_name)
    # Create a new document instance of Document Type B
    if doc.custom_type != "Sales":
        doc_b = frappe.new_doc("Collection Target")
        # Set field values from Document Type A to Document Type B
        doc_b.sales_person = doc.sales_person_name
        # if(doc.employee != ""):
        doc_b.employee = doc.employee
        
        doc_b.territory = doc.territory
        doc_b.from_ = doc.custom_from
        doc_b.set("from", doc.custom_from)

        doc_b.to = doc.custom_to
        
        doc_b.fixed_target = doc.custom_fixed_target
        doc_b.additional_target_int = doc.custom_additional_target
        doc_b.total_targets = doc.custom_total_targets

        # Handle child tables if any
        for child_a in doc.custom_customer_collects_goal:
            doc_b.append("customer_collects_goal",{
                "customer" : child_a.customer,
                "amount_of_money" : child_a.amount_of_money,
                "verified_collects" : child_a.verified_collects,
                "achieved_collects" : child_a.achieved_collects,    
                "number_of_visits" : child_a.number_of_visits,
                "verified_visits" : child_a.verified_visits,
                "achieved_visits" : child_a.achieved_visits,
            })  # Append to child table of Document Type B


        doc_b.insert()
        
        return True

 
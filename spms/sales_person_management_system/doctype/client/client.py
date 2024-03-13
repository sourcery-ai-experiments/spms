# Copyright (c) 2022, aoai and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class Client(Document):
    def validate(self):
        self.fullname = self.first_name + " " + self.mid_name + " " +self.last_name + " "

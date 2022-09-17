# Copyright (c) 2022, aoai and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Collecting(Document):
	def on_submit(self) -> None:
		# Get name of Collects Goal Document Depend on Sales Person and Date
		collect_goal_name = frappe.db.get_value('Collects Goal', {
			'sales_person': self.visited_by,
			'company':self.company,
			'from':['<=', self.date],
			'to':['>=', self.date]
		}, ['name'], as_dict=1)

		# Get objects for Specific Collects Goal
		collect_goal_doc = frappe.get_doc('Collects Goal', collect_goal_name)

		# find if Doctor and Item is Match with Goal
		for i in collect_goal_doc.customer_collects_goal:
			if(i.customer == self.customer_name):
				i.verified_collects = i.verified_collects + self.amount_of_money
				break
		collect_goal_doc.save()

# Copyright (c) 2022, aoai and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Visiting(Document):
	def on_submit(self) -> None:

		# Get name of Visit Goal Document Depend on Sales Person and Date
		visit_goal_name = frappe.db.get_value('Visit Goal', {
			'sales_person': self.visited_by,
			'company':self.company,
			'from':['<=', self.date],
			'to':['>=', self.date]
		}, ['name'], as_dict=1)

		# frappe.msgprint(visit_goal_name)

		# Get objects for Specific Visit Goal
		visit_goal_doc = frappe.get_doc('Visit Goal', visit_goal_name)

		# find if Doctor and Item is Match with Goal
		for i in visit_goal_doc.doctor_visit_goal:
			# frappe.msgprint(i.doctor)
			if(i.doctor == self.doctor_name and i.item == self.item):
				i.verified_visits = i.verified_visits + 1
		visit_goal_doc.save()
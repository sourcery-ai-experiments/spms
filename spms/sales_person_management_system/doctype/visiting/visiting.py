# Copyright (c) 2022, aoai and contributors
# For license information, please see license.txt

import frappe
from frappe.website.website_generator import WebsiteGenerator

class Visiting(WebsiteGenerator):
	def get_visit_goal_doc(self):
		visit_goal_name = frappe.db.get_value('Visit Goal', {
			'sales_person': self.visited_by,
			'company':self.company,

			'from':['<=', self.date],
			'to':['>=', self.date]
		},['name'], as_dict=1)
		return frappe.get_doc('Visit Goal', visit_goal_name)

	# increase the verified visit when submiting new visiting
	def on_submit(self):
		visit_goal_doc = self.get_visit_goal_doc()
		done = False
		for i in visit_goal_doc.doctor_visit_goal:
			if i.doctor == self.doctor_name:
				if not done:
					visit_goal_doc.verified_visits += 1
					done = True
				# looping throw the item table
				for item_object in self.get("item"):
					if item_object.item == i.item:
						i.verified_visits = i.verified_visits + 1
		visit_goal_doc.save()
		
	# remove the verified visit when canceling the visiting
	def on_cancel(self):
		visit_goal_doc = self.get_visit_goal_doc()
		done = False
		for i in visit_goal_doc.doctor_visit_goal:
			if i.doctor == self.doctor_name:
				if not done:
					visit_goal_doc.verified_visits -= 1
					done = True
				for item_object in self.get("item"):
					if item_object.item == i.item:
						i.verified_visits = i.verified_visits - 1

		visit_goal_doc.save()
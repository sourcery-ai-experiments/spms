# Copyright (c) 2022, aoai and contributors
# For license information, please see license.txt

import frappe
from frappe.website.website_generator import WebsiteGenerator


class Visiting(WebsiteGenerator):
	def get_visit_goal_doc(self):
		"""
		It returns the visit goal document for the given sales person and company for the given date
		:return: The name of the visit goal
		"""
		visit_goal_name = frappe.db.get_value('Visit Goal', {
			'sales_person': self.visited_by,
			'company': self.company,

			'from': ['<=', self.date],
			'to': ['>=', self.date]
		}, ['name'], as_dict=1)
		return frappe.get_doc('Visit Goal', visit_goal_name)

	def on_submit(self):
		"""
		It increments the number of verified visits for the doctor in the visit goal document
		"""
		visit_goal_doc = self.get_visit_goal_doc()

		for row in visit_goal_doc.productivity:
			if row.doctor == self.doctor_name:
				row.verified_visits += 1
				row.achievement = round(
					row.verified_visits / row.number_of_visits * 100)

		visit_goal_doc.save()
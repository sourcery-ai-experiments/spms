# Copyright (c) 2022, aoai and contributors
# For license information, please see license.txt

import frappe
from frappe.website.website_generator import WebsiteGenerator
from spms.methods.utils import update_visit_goal


class Visiting(WebsiteGenerator):
	def get_visit_goal_doc(self,sales_person):
		"""
		It returns the visit goal document for the given sales person and company for the given date
		:return: The name of the visit goal
		"""
		visit_goal_name = frappe.db.get_value('Visit Goal', {
			'sales_person': sales_person,
			'company': self.company,

			'from': ['<=', self.date],
			'to': ['>=', self.date]
		}, ['name'], as_dict=1)
		return frappe.get_doc('Visit Goal', visit_goal_name)

	def on_submit(self):
		"""
		This function updates the visit goal for the current user by 1
		"""
		update_visit_goal(self, 1)

	def on_cancel(self):
		"""
		It updates the visit goal by subtracting 1 from the current visit goal
		"""
		update_visit_goal(self, -1)
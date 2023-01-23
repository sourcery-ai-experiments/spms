# Copyright (c) 2022, aoai and contributors
# For license information, please see license.txt

import frappe
from frappe.website.website_generator import WebsiteGenerator


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
		It increments the number of verified visits for the doctor in the visit goal document
		"""
		visit_goal_doc = self.get_visit_goal_doc(self.visited_by)

		for row in visit_goal_doc.productivity:
			if row.doctor == self.doctor_name:
				row.verified_visits += 1
				row.achievement = round(
					row.verified_visits / row.number_of_visits * 100)

		visit_goal_doc.save()

		# Getting the sales person doc from the sales person in visit goal doc.
		sales_person_doc = frappe.get_doc("Sales Person",visit_goal_doc.sales_person)

		# Traversing the tree upwards , to the parents and Updating the verified visits for the parent sales person.
		# we check if the parent_sales_person is not equal to 'Sales Team' which is the root of the sales person tree
		while sales_person_doc.parent_sales_person != "Sales Team":
			parent_visit_goal = self.get_visit_goal_doc(sales_person_doc.parent_sales_person)
			for row in parent_visit_goal.productivity:
				if row.doctor == self.doctor_name:
					row.verified_visits += 1
					row.achievement = round(
						row.verified_visits / row.number_of_visits * 100)
			parent_visit_goal.save()
			# updating the sales person doc to the parent sales person doc.
			sales_person_doc = frappe.get_doc("Sales Person",parent_visit_goal.sales_person)
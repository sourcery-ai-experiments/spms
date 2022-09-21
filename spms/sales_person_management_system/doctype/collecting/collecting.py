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
			if(i.customer == self.customer):
				i.verified_collects = i.verified_collects + self.amount
				break

		# Calculate total amount for Verified Collects
		total = 0
		for i in collect_goal_doc.customer_collects_goal:
			total = total + i.verified_collects

		# set total value for Total Collected in Collected Goal
		collect_goal_doc.total_collected = frappe.utils.flt(total)

		total_incentives = 0
		# calculate the incentives
		if len(collect_goal_doc.commissions_range)!=0:
			target_percentge = (collect_goal_doc.total_collected / collect_goal_doc.total_targets) * 100
			for i in collect_goal_doc.commissions_range:
				if target_percentge >= i.from_ and target_percentge <= i.to_:
					total_incentives = (i.commission/100) * collect_goal_doc.total_collected
					break

		# set total value for Total Collected in Collected Goal
		collect_goal_doc.incentives = frappe.utils.flt(total_incentives)
		collect_goal_doc.save()

	
	def on_cancel(self) -> None:
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
			if(i.customer == self.customer):
				i.verified_collects = i.verified_collects - self.amount
				break

		# Calculate total amount for Verified Collects
		total = 0
		for i in collect_goal_doc.customer_collects_goal:
			total = total + i.verified_collects

		# set total value for Total Collected in Collected Goal
		collect_goal_doc.total_collected = frappe.utils.flt(total)

		total_incentives = 0
		# calculate the incentives
		if len(collect_goal_doc.commissions_range)!=0:
			target_percentge = (collect_goal_doc.total_collected / collect_goal_doc.total_targets) * 100
			for i in collect_goal_doc.commissions_range:
				if target_percentge >= i.from_ and target_percentge <= i.to_:
					total_incentives = (i.commission/100) * collect_goal_doc.total_collected
					break

		# set total value for Total Collected in Collected Goal
		collect_goal_doc.incentives = frappe.utils.flt(total_incentives)
		collect_goal_doc.save()
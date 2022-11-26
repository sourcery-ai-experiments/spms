# Copyright (c) 2022, aoai and contributors
# For license information, please see license.txt

from email.mime import image
import frappe
from frappe.website.website_generator import WebsiteGenerator
from spms.methods.utils import generate_qrcode
from frappe.utils import cstr
import hashlib

class Collecting(WebsiteGenerator):
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

		# if taget type is 'Fixed Type'
		if collect_goal_doc.target_type == "Fixed Target":
			collect_goal_doc.total_collected += frappe.utils.flt(self.amount_other_currency)

		# if taget type is 'According to Customer indebtedness' OR 'Debt + Additional Target'
		else:
			# trigger whether the customer in the table 'customer_collects_goal' or not
			customer_not_found = True
			# find if Doctor and Item is Match with Goal
			for i in collect_goal_doc.customer_collects_goal:
				if (i.customer == self.customer):
					i.verified_collects = i.verified_collects + self.amount_other_currency
					customer_not_found = False
					break
			# if cutomer not found so we add the amount to the  'additional_collected'
			if customer_not_found:
				collect_goal_doc.additional_collected = collect_goal_doc.additional_collected + self.amount_other_currency
			# Calculate total amount for Verified Collects
			total = 0
			for i in collect_goal_doc.customer_collects_goal:
				total = total + i.verified_collects
			if(collect_goal_doc.target_type == "Debt + Additional Target"):
				total += collect_goal_doc.additional_collected 
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
				i.verified_collects = i.verified_collects - self.amount_other_currency
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

	def before_submit(self):
		"""
		It takes the name of the route and generates a QR code image for it
		"""
		if not self.image:
			self.route = hashlib.sha1(str(self.name).encode()).hexdigest()
			site_name = cstr(frappe.local.site)
			image_path = generate_qrcode(site_name=site_name, route_name=self.route)
			self.image = image_path

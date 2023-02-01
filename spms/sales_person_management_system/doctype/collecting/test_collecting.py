# Copyright (c) 2022, aoai and Contributors
# See license.txt

# import frappe
import unittest
import hashlib
import frappe
from frappe.utils import cstr

class TestCollecting(unittest.TestCase):
    def setUp(self):
        # Create a new instance of the doctype for testing
        self.doc = frappe.new_doc("Collecting")
        self.doc.name = "/test-the-collecting"

    def test_before_submit_event(self):
        # Trigger the before_submit event
        self.doc.before_submit()

        # Verify that the route attribute is set correctly
        expected_route = hashlib.sha1(str(self.doc.name).encode()).hexdigest()
        self.assertEqual(self.doc.route, expected_route)

        # Verify that the image attribute is set correctly
        site_name = cstr(frappe.local.site)
        expected_image_path = "path/to/generated/qrcode/image.png" # Replace with the actual path to the generated QR code image
        self.assertEqual(self.doc.image, expected_image_path)

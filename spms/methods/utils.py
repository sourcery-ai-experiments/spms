import qrcode
import frappe
from frappe.utils import cstr
from random import randint
from datetime import date

def generate_qrcode(site_name, route_name):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(f'{site_name}/{route_name}')
    qr.make(fit=True)
    file_name = randint(1, 100000)
    file_name = f'{file_name}.{date.today()}'

    img = qr.make_image(fill_color="black", back_color="white")
    current_site_name = cstr(frappe.local.site)
    img.save(f"{current_site_name}/private/files/{file_name}.png")
    return (f"/private/files/{file_name}.png")

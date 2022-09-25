import qrcode
import frappe
from frappe.utils import cstr
from random import randint
from datetime import date

def generate_qrcode(url:str):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=15,
        border=2,
    )
    qr.add_data('Some data')
    qr.make(fit=True)
    file_name = randint(1, 100000)
    file_name = f'{file_name}.{date.today()}'

    img = qr.make_image(fill_color="black", back_color="white")
    site_name = cstr(frappe.local.site)
    img.save(f"../../sites/{site_name}/private/files/{file_name}.png")
    return 


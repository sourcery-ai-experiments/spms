frappe.ui.form.on('Item', {
    refresh(frm) {
        frm.add_custom_button('Generate Barcode', () => {
            const ean13Barcode = generate_ean13();
            const child = frm.add_child('barcodes');
            frappe.model.set_value(child.doctype, child.name, 'barcode', ean13Barcode);
            frappe.model.set_value(child.doctype, child.name, 'barcode_type', 'EAN');
            frm.refresh_field('barcodes');
        });
    }
});

function generate_ean13() {
    let productCode = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    let barcode = productCode;
    return barcode + calculate_check_digit(barcode);
}

function calculate_check_digit(barcode) {
    const digits = barcode.split('').map(Number);
    let evenSum = 0, oddSum = 0;

    digits.forEach((digit, index) => {
        if (index % 2 === 0) {
            oddSum += digit;
        } else {
            evenSum += digit;
        }
    });

    const totalSum = oddSum * 3 + evenSum;
    const nextTen = Math.ceil(totalSum / 10) * 10;
    const checkDigit = nextTen - totalSum;
    return checkDigit;
}

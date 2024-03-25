frappe.ui.form.on('Sales Person', {
    refresh(frm) {
        console.log('Sales Person');

        frm.add_custom_button(__('Add Client'), () => {
        });
    }

});

frappe.ui.form.on('Sales Target', {
    refresh(frm) {
        frm.add_custom_button(__('Add Client'), () => {
        });
    }

});
frappe.ui.form.on('Sales Person', {
    refresh(frm) {
        console.log('Sales Person');

        frm.add_custom_button(__('Add Client'), () => {
        });
    }

});

frappe.ui.form.on('Visit Goal', {
    refresh(frm) {
        console.log('Sales Person');
        console.log('Sales Person');
        console.log('Sales Person');
        console.log('Sales Person');

        frm.add_custom_button(__('Add Client'), () => {
        });
    }

});
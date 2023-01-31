import frappe

from spms.methods.utils import update_target



def on_submit(doc, method) -> None:
    """
    When a sales invoice is submitted, update the target
    
    :param doc: The document object
    :param method: The method that is being called
    """
    update_target(doc, method, 1)


def on_cancel(doc, method) -> None:
    """
    When a sales invoice is cancelled, update the target by subtracting the amount of the invoice.
    
    :param doc: The document that is being saved
    :param method: The method that is being called
    """
    update_target(doc, method, -1)

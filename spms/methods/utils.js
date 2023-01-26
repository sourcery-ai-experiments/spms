// if you want to add progress bar to a child table
// STEP-1 Add data field to your child table where you want the progress bar to show 
// and make sure to set its default value to 0
// STEP-2 copy all the code below and paste it inside your js doctype file
// STEP-3 inside any refresh event call 
// refresh_when_click_btn(frm) and progress_bar(frm,<table_name>,<field_name>)
// * <table_name> replace it with the name of the table like "productivity"
// * <field_name> replace it with the name of the data field you added it in step-1
// DONE

function progress_bar(frm,table_name,field_name,options = {color:"",text:""}){
    for(let row of $(`[data-fieldname = ${table_name}] .grid-body .rows`).children()) {
        let idx = $(row).data("idx") - 1
        let row_info = frm.doc[table_name][idx]
        const width = row_info[field_name]
        row.firstChild.querySelector(`[data-fieldname=${field_name}]`)
        .innerHTML = 
            `<div class="progress" style="height: 20px; font-size: 13px;font-weight:500;border-radius:300px">
                <div style="width:${width}%;background:${options.color&&options.color};" class="progress-bar" role="progressbar">${options.text&&options.text}${width}%</div>
            </div>`
    }
}


let first_try = true
function refresh_when_click_btn(frm) {
    /* Used to refresh the page when the user clicks on the next page, first page, previous page, or last
    page. */
    if (first_try) {
        $(".next-page").click(function () {
            frm.refresh()
        })
        $(".first-page").click(function () {
            frm.refresh()
        })
        $(".prev-page").click(function () {
            frm.refresh()
        })
        $(".last-page").click(function () {
            frm.refresh()
        })
        first_try = false
    }
}



// TODO:
// Gallery not working :DDD



const button_connections = [
    {element: ".go-to-main-settings", func: "go-to-menu", target: "main-settings"},
    {element: ".go-to-pages-settings", func: "go-to-menu", target: "pages-settings"},
    {element: ".go-to-footer-settings", func: "go-to-menu", target: "footer-settings"},
    {element: ".go-to-this-page-settings", func: "go-to-menu", target: "this-page-settings"},
    {element: ".go-to-new-page", func: "go-to-menu", target: "create-new-page"},
    {element: ".go-to-new-image", func: "go-to-menu", target: "upload-new-image"},
    {element: ".go-to-new-footeritem", func: "go-to-menu", target: "create-new-footeritem"},
    {element: ".footer-item", func: "go-to-menu", target: "footer-item-settings", set_id: "footer"},
    {element: ".image", func: "go-to-menu", target: "image-settings", set_id: "image"},
    {element: ".list-footer-item", func: "go-to-menu", target: "footer-item-settings", set_id: "footer"},
    {element: ".list-image", func: "go-to-menu", target: "image-settings", set_id: "image"},
]

let local_values = {}


let current_menu = null

let current_image_id = null
let current_footer_item_id = null

let item_at_left_id = null
let item_at_right_id = null
let force_save = false
$(document).ready(function () {

    if (check_local_changes()){
        set_save_buttons(true)
    } else {
        set_save_buttons(false)
    }
    do_local_changes()

    force_save = localStorage.getItem("force_save")
    current_menu = localStorage.getItem("current_menu")
    current_footer_item_id = localStorage.getItem("current_footer_item_id")
    current_image_id = localStorage.getItem("current_image_id")

    localStorage.removeItem("current_menu")

    if (current_menu) {
        go_to_menu(current_menu)
    } else {
        if (current_page_id){
            go_to_menu("this-page-settings")
        } else {
            go_to_menu("main-settings")
        }
    }

    $('.real-footer-link').click(function(e) {
        e.preventDefault()
    }).dblclick(function() {
        window.open(this.href, "_blank")
        return false;
    });
    for (let i = 0; i < button_connections.length; i++){
        let bc = button_connections[i]
        $(bc.element).click(function(e){
            e.stopPropagation();
            if (bc.hasOwnProperty("set_id")){
                switch (bc.set_id){
                    case "footer":
                        current_footer_item_id = this.id.split("-")[1]
                        localStorage.setItem("current_footer_item_id", current_footer_item_id)
                        break
                    case "image":
                        current_image_id = this.id.split("-")[1]
                        localStorage.setItem("current_image_id", current_image_id)
                        break
                }
            }
            switch (bc.func){
                case "go-to-menu":
                    go_to_menu(bc.target)
                    break
            }
        });
    }

    $(".discard-edit").click(function(){
        discard_value(this)
    });
    $(".reset-value").click(function(){
        reset_value(this)
    });
    $(".admin-input").on('input',function(e){
        input_value_changed(this)
    })
    $("#cancel-edits").click(function(){
        cancel_all_edits()
    });
    $("#save-edits").click(function(){
        save_all_edits()
    });
    $(".admin-item-button").click(function(){
        do_item_action(this)
    });
    $(".move_left").click(function(){
        move_current_item(-1)
    })
    $(".move_right").click(function(){
        move_current_item(1)
    });
    $("#submit_settings").click(function(){
        fix_all_orders()
    });
    $("#submit_page").click(function(){
        fix_all_orders(1,0,0)
    });
    $("#submit_image").click(function(){
        fix_all_orders(0,1,0)
    });
    $("#submit_footeritem").click(function(){
        fix_all_orders(0,0,1)
    });
});

function check_local_changes(){
    let c1 = get_local_changes("settings", in_settings)
    let c2 = get_local_changes("pages", in_pages)
    let c3 = get_local_changes("images", in_images)
    let c4 = get_local_changes("footer_items", in_footer_items)
    return c1 || c2 || c3 || c4 || force_save;
}
function get_local_changes(storage_key, input){
    let storage_item = window.localStorage.getItem(storage_key)
    let has_changes = false
    if (storage_item){
        local_values[storage_key] = JSON.parse(storage_item)
        for (const [key, item] of Object.entries(input)){
            if (!local_values[storage_key].hasOwnProperty(key)) {
                local_values[storage_key][key] = item
            } else if (!is_same(local_values[storage_key][key], item)){
                has_changes = true
            }
        }
        for (const [key, item] of Object.entries(local_values[storage_key])){
            if (!input.hasOwnProperty(key)) {
                has_changes = true
            }
        }
    } else {
        local_values[storage_key] = JSON.parse(JSON.stringify(input))
    }
    localStorage.setItem(storage_key, JSON.stringify(local_values[storage_key]));
    return has_changes
}

function is_same(d1, d2){
    for (const [key, item] of Object.entries(d2)) {
        if (d1[key] !== item) {
            return false
        }
    }
    return true
}

function check_neighbours(){
    item_at_left_id = null
    item_at_right_id = null
    let category = get_current_category()
    let current_id = current_item_id(category)
    if (!category || !current_id){
        return
    }
    let item_at_left = null
    let item_at_right = null
    let current = local_values[category][current_id]

    for (const [k, i] of Object.entries(local_values[category])) {
        if (i.hidden || (category === "pages" && i.disabled)) {
            continue
        }
        if (i.order < current.order) {
            if (!item_at_left || i.order > item_at_left.order) {
                item_at_left = i
            }
        }
        if (i.order > current.order) {
            if (!item_at_right || i.order < item_at_right.order) {
                item_at_right = i
            }
        }
    }
    if (item_at_left){
        item_at_left_id = item_at_left.id
    }
    if (item_at_right){
        item_at_right_id = item_at_right.id
    }
}

function get_current_category(){
    switch (current_menu){
        case "this-page-settings":
            return "pages"
        case "footer-item-settings":
            return "footer_items"
        case "image-settings":
            return "images"
    }
    return null
}
function move_current_item(dir){
    let category = get_current_category()
    let current_id = current_item_id(category)
    if (!category || !current_id){
        return
    }
    let current = local_values[category][current_id]
    let o = null
    if (dir === -1){
        if (item_at_left_id !== null){
            o = local_values[category][item_at_left_id].order
            local_values[category][item_at_left_id].order = current.order
        }
    } else {
        if (item_at_right_id !== null){
            o = local_values[category][item_at_right_id].order
            local_values[category][item_at_right_id].order = current.order
        }
    }
    if (o !== null){
        current.order = o
        local_values[category][current_id].order = o
        check_neighbours()
        save_changes(category)
    }
}
function do_local_changes() {
    do_changes("settings")
    do_changes("pages")
    do_changes("images")
    do_changes("footer_items")
}

function do_changes(category){
    let current_id = current_item_id(category)
    let common = var_mapping[category].common
    let current = var_mapping[category].current
    for (const [id, params] of Object.entries(local_values[category])) {
        let set_page_hidden = false
        for (const [key, val] of Object.entries(params)) {
            if (key === "id"){
                continue
            }
            let param_set = common[key]
            for (let i = 0; i < 2; i++){
                //console.log(key, category)
                //console.log(param_set)
                //console.log(i)
                if (!param_set) {
                    if (id === current_id){
                        param_set = current[key]
                    }
                    continue
                }
                if (param_set.hasOwnProperty("input_id")){
                    let input = $(("#input-" + param_set.input_id))
                    if (input.is(':checkbox')) {
                        input.prop("checked", val)
                    } else {
                        input.val(val)
                    }
                    set_resets(param_set.input_id, val, get_default_value(category, id, key))
                }
                if (param_set.hasOwnProperty("button_on_id")){
                    let input = $("#" + param_set.button_on_id)
                    if (val){
                        input.hide()
                    } else {
                        input.show()
                    }
                }
                if (param_set.hasOwnProperty("button_off_id")){
                    let input = $("#" + param_set.button_off_id)
                    if (val){
                        input.show()
                    } else {
                        input.hide()
                    }
                }
                if (param_set.hasOwnProperty("output")) {
                    let outputs = force_array(param_set.output)
                    for (let t = 0; t < outputs.length; t++){
                        let output = outputs[t].replace("<ID>", id)
                        if (param_set.hasOwnProperty("output_type") && param_set.output_type === "HTML") {
                            $(output).html(val)
                        } else {
                            $(output).text(val)
                        }
                    }
                }
                if (param_set.hasOwnProperty("set_css")) {
                    let targets = force_array(param_set.target)
                    for (let t = 0; t < targets.length; t++){
                        let target = targets[t].replace("<ID>", id)
                        let value = val.toString()
                        if (param_set.hasOwnProperty("suffix")){
                            value += param_set.suffix
                        }
                        $(target).css(param_set.set_css, value)
                    }
                }
                if (param_set.hasOwnProperty("class_toggle")) {
                    let targets = force_array(param_set.target)
                    for (let t = 0; t < targets.length; t++){
                        let target = targets[t].replace("<ID>", id)
                        if (val){
                            $(target).addClass(param_set.class_toggle)
                        } else {
                            $(target).removeClass(param_set.class_toggle)
                        }
                    }
                }
                if (param_set.hasOwnProperty("go_to")) {
                    go_to_menu(param_set.go_to)
                }
                if (param_set.hasOwnProperty("special")) {
                    switch (param_set.special ){
                        case "SET-TITLE":
                            if (local_values["settings"]["settings"]["use_page_titles"] && current_page_id){
                                document.title = local_values["pages"][current_page_id]["name"]
                            } else {
                                document.title = local_values["settings"]["settings"]["title"]
                            }
                            break
                        case "SET-HEADER":
                            let head = ""
                            for (let c = 0; c < val.length; c++){
                                head += "<div>" + val[c] + "</div>"
                            }
                            $("#header-text").html(head)
                            break
                        case "SET-HIDDEN":
                            if (val){
                                local_values["pages"][current_id]["hidden"] = true
                                save_changes("pages", true)
                                set_page_hidden = true
                                $("#page-show").prop('disabled', true)
                            } else {
                                $("#page-show").prop('disabled', false)
                            }
                            break
                        case "FORCE-SAVING":
                            if (val){
                                force_save = true
                                localStorage.setItem("force_save", force_save)
                            }
                            break
                    }
                }

                if (id === current_id){
                    param_set = current[key]
                } else {
                    break
                }
            }
        }
        if (set_page_hidden) {
            $("#page-show").show()
            $("#page-hide").hide()
        }
    }
    check_neighbours()
    set_status_icons()
    set_images()
}


function set_images(){
    var i = 0
    for (const [k, image] of Object.entries(local_values["images"])) {
        if (image.page === current_page_id){
            if (image.hidden){
                $("#image-"+image.id.toString()).hide()
                $("#listimage-"+image.id.toString()).show()
            } else {
                if (local_values["pages"][current_page_id]["page_type"] === "TEXT" && i > 0){
                    $("#image-"+image.id.toString()).hide()
                    $("#listimage-"+image.id.toString()).show()
                } else {
                    $("#image-"+image.id.toString()).show()
                    $("#listimage-"+image.id.toString()).hide()
                }
                i += 1
            }
        } else {
            $("#image-"+image.id.toString()).hide()
            $("#listimage-"+image.id.toString()).hide()
        }
    }
}


function get_default_value(category, id, key){
    switch (category){
        case "settings":
            return in_settings[id][key]
        case "pages":
            return in_pages[id][key]
        case "footer_items":
            return in_footer_items[id][key]
        case "images":
            return in_images[id][key]
    }
}

function set_status_icons(){
    if (current_menu){
        switch (current_menu){
            case "this-page-settings":
                if (local_values["pages"][current_page_id]["page_type"] === "TEXT"){
                    $("#input-PageText").parent().parent().show()
                } else {
                    $("#input-PageText").parent().parent().hide()
                }
                $("#this-page-settings > .statusrow > .status-icon").hide()
                if (!is_same(local_values["pages"][current_page_id], in_pages[current_page_id])){
                    $("#this-page-settings > .statusrow > .icon-saved").hide()
                    $("#this-page-settings > .statusrow > .icon-not-saved").show()
                } else {
                    $("#this-page-settings > .statusrow > .icon-saved").show()
                    $("#this-page-settings > .statusrow > .icon-not-saved").hide()
                }
                if (local_values["pages"][current_page_id]["disabled"]){
                    $(".move_button").addClass("disabled")
                    $("#this-page-settings > .statusrow > .icon-accessible").hide()
                    $("#this-page-settings > .statusrow > .icon-not-accessible").show()
                } else {
                    $(".move_button").removeClass("disabled")
                    $("#this-page-settings > .statusrow > .icon-accessible").show()
                    $("#this-page-settings > .statusrow > .icon-not-accessible").hide()
                }
                if (local_values["pages"][current_page_id]["hidden"]){
                    $(".move_button").addClass("disabled")
                    $("#this-page-settings > .statusrow > .icon-inmenu").hide()
                    $("#this-page-settings > .statusrow > .icon-not-inmenu").show()
                } else {
                    $(".move_button").removeClass("disabled")
                    $("#this-page-settings > .statusrow > .icon-inmenu").show()
                    $("#this-page-settings > .statusrow > .icon-not-inmenu").hide()
                }
                break
            case "footer-item-settings":
                $("#footer-item-settings > .statusrow > .status-icon").hide()
                if (!is_same(local_values["footer_items"][current_footer_item_id], in_footer_items[current_footer_item_id])){
                    $("#footer-item-settings > .statusrow > .icon-saved").hide()
                    $("#footer-item-settings > .statusrow > .icon-not-saved").show()
                } else {
                    $("#footer-item-settings > .statusrow > .icon-saved").show()
                    $("#footer-item-settings > .statusrow > .icon-not-saved").hide()
                }
                if (local_values["footer_items"][current_footer_item_id]["hidden"]){
                    $(".move_button").addClass("disabled")
                    $("#footer-item-settings > .statusrow > .icon-visible").hide()
                    $("#footer-item-settings > .statusrow > .icon-not-visible").show()
                } else  {
                    $(".move_button").removeClass("disabled")
                    $("#footer-item-settings > .statusrow > .icon-visible").show()
                    $("#footer-item-settings > .statusrow > .icon-not-visible").hide()
                }
                break
            case "image-settings":
                $("#image-settings > .statusrow > .status-icon").hide()
                if (!is_same(local_values["images"][current_image_id], in_images[current_image_id])){
                    $("#image-settings > .statusrow > .icon-saved").hide()
                    $("#image-settings > .statusrow > .icon-not-saved").show()
                } else {
                    $("#image-settings > .statusrow > .icon-saved").show()
                    $("#image-settings > .statusrow > .icon-not-saved").hide()
                }
                if (local_values["images"][current_image_id]["hidden"]){
                    $(".move_button").addClass("disabled")
                    $("#image-settings > .statusrow > .icon-visible").hide()
                    $("#image-settings > .statusrow > .icon-not-visible").show()
                } else {
                    $(".move_button").removeClass("disabled")
                    $("#image-settings > .statusrow > .icon-visible").show()
                    $("#image-settings > .statusrow > .icon-not-visible").hide()
                }
                break
        }
    }
    if (item_at_left_id !== null) {
        $(".move_left").removeClass("disabled")
    } else {
        $(".move_left").addClass("disabled")
    }
    if (item_at_right_id !== null) {
        $(".move_right").removeClass("disabled")
    } else {
        $(".move_right").addClass("disabled")
    }
}

function force_array(t){
    if (!Array.isArray(t)){
        t = [t]
    }
    return t
}

function set_resets(id, val, saved_val){
    //console.log(val)
    //console.log(id)
    //console.log(saved_val)
    let v = val.toString().toLowerCase()
    const discard = $("#discard-"+id)
    const reset = $("#reset-"+id)
    saved_val = saved_val.toString().toLowerCase()
    let default_val = reset.attr("value")
    if (default_val === undefined){
        default_val = ""
    }
    default_val = default_val.toLowerCase()

    if (v === saved_val){
        discard.prop("disabled",true);
    } else {
        discard.prop("disabled",false);
    }
    if (v === default_val){
        reset.prop("disabled",true);
    } else {
        reset.prop("disabled",false);
    }
}

function reset_value(btn){
    let reset_to = $(btn).attr("value")
    let id = btn.id.split(/-(.*)/s)[1]
    if (id){
        if (button_mappings.hasOwnProperty(id)) {
            const bm = button_mappings[id]
            if (bm.type === "input") {
                let current_id = current_item_id(bm.category)
                local_values[bm.category][current_id][bm.variable] = reset_to
                save_changes(bm.category)
                set_resets(id, reset_to, get_default_value(bm.category, current_id, bm.variable))
            }
        }
    }
}
function discard_value(btn){
    let id = btn.id.split(/-(.*)/s)[1]
    if (id){
        if (button_mappings.hasOwnProperty(id)) {
            const bm = button_mappings[id]
            if (bm.type === "input") {
                let current_id = current_item_id(bm.category)
                let def = get_default_value(bm.category, current_id, bm.variable)
                local_values[bm.category][current_id][bm.variable] = def
                save_changes(bm.category)
                set_resets(id, def, def)
            }
        }
    }
}

function save_changes(storage_key, just_save=false){
    localStorage.setItem(storage_key, JSON.stringify(local_values[storage_key]));
    if (!just_save){
        do_changes(storage_key)
    }
    if (check_local_changes()){
        set_save_buttons(true)
    } else {
        set_save_buttons(false)
    }
}
function set_save_buttons(changes){
    if (changes){
        $("#save-edits-menu").show()
    } else {
        $("#save-edits-menu").hide()
    }
}


function go_to_menu(menuid){
    $(".admin-tab").hide()
    $("#"+menuid).show()
    current_menu=menuid
    let dropdown = ""
    switch (current_menu) {
        case "footer-item-settings":

            do_changes("footer_items")
            break
        case "image-settings":
            $("#current-image-preview").html('<img src="/uploads/photos/'+local_values["images"][current_image_id]["filename"]+'">')
            do_changes("images")
            break
        case "upload-new-image":
            for (const [key, page] of Object.entries(local_values["pages"])){
                if (!page.deleted){
                    dropdown += '<option value="'+key+'">'+page.name+'</option>'
                }
            }
            $("#page").html(dropdown)
            break
    }
    check_neighbours()
    set_status_icons()
}




function input_value_changed(obj){
    let input = $(obj)
    let val;
    if (input.is(':checkbox')){
        val = obj.checked;
    } else {
        val = $(obj).val()
    }
    let id = obj.id.split(/-(.*)/s)[1]

    if (button_mappings.hasOwnProperty(id)) {
        const bm = button_mappings[id]
        if (bm.type === "input") {
            local_values[bm.category][current_item_id(bm.category)][bm.variable] = val
            save_changes(bm.category)
        }
    }
}

function do_item_action(btn) {
    let id = $(btn).attr("id")
    if (button_mappings.hasOwnProperty(id)) {
        const bm = button_mappings[id]
        if (bm.type === "button_on") {
            local_values[bm.category][current_item_id(bm.category)][bm.variable] = true
            save_changes(bm.category)
        } else if (bm.type === "button_off") {
            local_values[bm.category][current_item_id(bm.category)][bm.variable] = false
            save_changes(bm.category)
        }
    }
}

function current_item_id(cat){
    switch (cat) {
        case "settings":
            return "settings"
        case "pages":
            if (current_page_id) {
                return current_page_id.toString()
            }
            return null
        case "images":
            if (current_image_id) {
                return current_image_id.toString()
            }
            return null
        case "footer_items":
            if (current_footer_item_id) {
                return current_footer_item_id.toString()
            }
            return null
    }
    return null
}

function save_all_edits(){
    let data = {
        "action": "save-changes",
        "settings": JSON.stringify(local_values["settings"]["settings"]),
        "pages": JSON.stringify(local_values["pages"]),
        "images": JSON.stringify(local_values["images"]),
        "footer_items": JSON.stringify(local_values["footer_items"]),
    }
    $.ajax({
        type: "POST",
        url: window.location.pathname,
        data: data,
        success: cancel_all_edits,
        error: function (e){
            console.log("Error on save:")
            console.log(e)
        }
    });
}

function cancel_all_edits(){
    force_save = false
    localStorage.setItem("force_save", force_save)
    localStorage.setItem("current_menu", current_menu)
    localStorage.removeItem("settings")
    localStorage.removeItem("pages")
    localStorage.removeItem("images")
    localStorage.removeItem("footer_items")
    location.reload();

}

function fix_all_orders(p=0,i=0,f=0){
    fix_orders("pages", p)
    fix_orders("images", i)
    fix_orders("footer_item", f)
}

function fix_orders(key, begin = 0){
    let arr = []
    for (const [k, item] of Object.entries(local_values[key])) {
        arr.push({"k": k, "o": item.order})
    }
    arr.sort(function(a,b) {
        return a["o"] - b["o"]
    });

    let o = begin
    for (let i = 0; i < arr.length; i++){
        local_values[key][arr[i]["k"]].order = o
        o += 1
    }
    save_changes(key, true)
}

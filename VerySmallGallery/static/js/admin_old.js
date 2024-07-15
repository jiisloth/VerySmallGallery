
const button_connections = [
    {element: ".go-to-main-settings", func: "go-to-menu", target: "main-settings"},
    {element: ".go-to-pages-settings", func: "go-to-menu", target: "pages-settings"},
    {element: ".go-to-footer-settings", func: "go-to-menu", target: "footer-settings"},
    {element: ".go-to-this-page-settings", func: "go-to-menu", target: "this-page-settings"},

    {element: ".go-to-new-page", func: "go-to-menu", target: "create-new-page"},
    {element: ".go-to-new-image", func: "go-to-menu", target: "upload-new-image"},
    {element: ".go-to-new-footeritem", func: "go-to-menu", target: "create-new-footeritem"},

    {element: ".footer-item", func: "go-to-menu", target: "footer-item-settings"},
    {element: ".image", func: "go-to-menu", target: "image-settings"},
]
let changes = {
    settings: {},
    page: {},
    image: {},
    footer: {},
    orders: {}
}

let change_mapping = {
    "HeaderText": {model: "Main", variable: "header_text"},
    "MainTitle": {model: "Main", variable: "title"},
    "UsePageTitles": {model: "Main", variable: "use_page_titles"},
    "ContentWidth": {model: "Main", variable: "content_width"},
    "ContentHeight": {model: "Main", variable: "content_height"},
    "FooterSeparator": {model: "Main", variable: "footer_separator"},
    "FooterItemText": {model: "Footer", variable: "text"},
    "FooterItemLink": {model: "Footer", variable: "link"},
    "ImageLabel": {model: "Image", variable: "label"},
    "ImagePage": {model: "Image", variable: "page"}
}
let current_menu = null

$(document).ready(function () {
    check_local_changes()

    console.log(current_page_id)
    current_menu = localStorage.getItem("current_menu")
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

    get_unsaved_changes()
    for (let i = 0; i < button_connections.length; i++){
        let bc = button_connections[i]
        $(bc.element).click(function(){
            switch (bc.func){
                case "go-to-menu":
                    go_to_menu(bc.target)
                    break
            }
        });
    }
    $(".discard-edit").click(function(){
        reset_value(this)
    });
    $(".reset-value").click(function(){
        reset_value(this)
    });
    $(".admin-input").on('input',function(e){
        let input = $(this)
        let val;
        if (input.is(':checkbox')){
            val = this.checked;
        } else {
            val = $(this).val()
        }
        let id = this.id.split(/-(.*)/s)[1]
        set_change(id, val)
    }).each(function(){
        if (!change_mapping[this.id.split(/-(.*)/s)[1]]){
            console.log(this)
            console.error("Could not find mapping for: " + this.id.split(/-(.*)/s)[1])
        }
    });
    $("#cancel-edits").click(function(){
        cancel_all_edits()
    });
    $("#save-edits").click(function(){
        save_all_edits()
    });
    $(".admin-item-button").click(function(){
        do_item_action(this)
    });
});
function get_unsaved_changes(){
    let setting_changes = JSON.parse(window.localStorage.getItem("setting-changes"));
    if (setting_changes){
        for (const [id, val] of Object.entries(setting_changes)) {
            let input = $("#input-" + id)
            if (input.is(':checkbox')){
                input.prop("checked", val)
            } else {
                input.val(val)
            }
            set_change(id, val)
        }

    }
    get_single_changes("page")
}

function get_single_changes(type){
    let single_changes = JSON.parse(window.localStorage.getItem(type+"-changes"));
    if (single_changes){
        for (const [id, actions] of Object.entries(single_changes)) {
            for (const [action, value] of Object.entries(single_changes[id])) {
                resave_item_action(type, action, id, value)
                set_item_actions(type, id, changes[type][id], false)
            }
        }
    }
}


function reset_value(btn){
    let val = $(btn).attr("value")
    let id = btn.id.split(/-(.*)/s)[1]
    if (id){
        let input = $("#input-" + id)
        if (input.is(':checkbox')){
            input.prop("checked", val)
        } else {
            input.val(val)
        }
        set_change(id, val)
    }

}
function set_change(id, val){
    update_visuals(id, val)
    const discard = $("#discard-"+id)
    const reset = $("#reset-"+id)
    let saved_val = discard.attr("value")
    let default_val = reset.attr("value")
    if (val === saved_val){
        discard.prop("disabled",true);
        delete changes.settings[id]
    } else {
        discard.prop("disabled",false);
        changes.settings[id] = val
    }
    if (val === default_val){
        reset.prop("disabled",true);
    } else {
        reset.prop("disabled",false);
    }
    if (Object.keys(changes.settings).length > 0){
        localStorage.setItem("setting-changes", JSON.stringify(changes.settings));
    } else {
        localStorage.removeItem("setting-changes")
    }
    set_save_buttons()
}

function set_save_buttons(){
    const save_edits = $("#save-edits-menu")
    for (const [key, value] of Object.entries(changes)) {
        if (Object.keys(value).length > 0){
            save_edits.show()
            return
        }
    }
    save_edits.hide()
}

function go_to_menu(menuid){
    switch (menuid){
        case "this-page-settings":
            break
    }

    console.log(menuid)
    $(".admin-tab").hide()
    $("#"+menuid).show()
    current_menu=menuid
}

function update_visuals(id, val){
    switch (id){
        case "HeaderText":
            let head = ""
            for (let c = 0; c < val.length; c++){
                head += "<div>" + val[c] + "</div>"
            }
            $("#header-text").html(head)
            break
        case "MainTitle":
            document.title = val
            break
        case "UsePageTitles":
            if (val){
                if (current_page_id){
                    document.title = pages[current_page_id].name
                }
            }
            break
        case "ContentWidth":
            $(".container").width(val)
            break
        case "ContentHeight":
            $("#content").height(val)
            break
        case "FooterSeparator":
            $(".footer-separator").text(val)
            break
    }
}
function cancel_all_edits(){
    localStorage.setItem("current_menu", current_menu)
    localStorage.removeItem("setting-changes")
    localStorage.removeItem("page-changes")
    localStorage.removeItem("image-changes")
    localStorage.removeItem("footer-changes")
    location.reload();

}

function save_all_edits(){
    let data = {"action": "save-changes"}
    if (Object.keys(changes.settings).length > 0){
        data["settings"] = JSON.stringify(map_settings(changes.settings))
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

function map_settings(settings){
    let mapped = {}
    for (const [key, value] of Object.entries(settings)) {
        let model = change_mapping[key].model
        let variable = change_mapping[key].variable
        if (!mapped[model]){
            mapped[model] = {}
        }

        mapped[model][variable] = value
    }
    return mapped
}

function do_item_action(btn) {
    let params = btn.id.split("-")
    let type = params[0]
    let action = params[1]
    let id = $(btn).attr("value")
    save_item_action(type, action, id)
    set_item_actions(type, id, changes[type][id])

}

function set_item_actions(type, id, actions, do_move=true){
    let target = $("#"+type+"-"+id)
    let cpid = null

    if ("delete" in actions){
        target.addClass("item-deleted")
        if ((id === current_page_id && type === "page") || do_move){
            switch (type){
                case "page":
                    $("#this-page-button").hide()
                    go_to_menu("pages-settings")
                    break
                case "image":
                    go_to_menu("this-page-settings")
                    break
                case "footer":
                    go_to_menu("footer-settings")
                    break
            }
        }
    }
    if ("show" in actions){
        if (actions["show"]){
            target.removeClass("item-hidden")
            if ((id === current_page_id && type === "page") || do_move){
                $("#"+type+"-show").hide()
                $("#"+type+"-hide").show()
            }
            if (type === "page"){

            }
        } else {
            target.addClass("item-hidden")
            if ((id === current_page_id && type === "page") || do_move){
                $("#"+type+"-show").show()
                $("#"+type+"-hide").hide()

            }
        }
    }
    if ("enable" in actions){
        if (actions["enable"]){
            target.removeClass("item-disabled")
            if ((id === current_page_id && type === "page") || do_move){
                $("#"+type+"-disable").show()
                $("#"+type+"-enable").hide()
            }
        } else {
            target.addClass("item-disabled")
            if ((id === current_page_id && type === "page") || do_move){
                $("#"+type+"-disable").hide()
                $("#"+type+"-enable").show()
            }
        }
    }
}
function create_page_item(){

}
// <div id="page-{{ menu_item.id }}" className="menu-item admin-draggable">
//     {% if admin %}
//     <a href="{{ url_for(" admin", page_handle=menu_item.url_handle) }}">{{menu_item.name}}</a>
//     {% else %}
//     <a href="{{ url_for(" index", page_handle=menu_item.url_handle) }}">{{menu_item.name}}</a>
//     {% endif %}
// </div>
function resave_item_action(type, action, id, value){
    if (!changes[type][id]) {
        changes[type][id] = {}
    }
    changes[type][id][action] = value
    localStorage.setItem(type+"-changes", JSON.stringify(changes[type]));
}

function save_item_action(type, action, id,){
    if (!changes[type][id]) {
        changes[type][id] = {}
    }
    if (action === "hide"){
        changes[type][id]["show"] = false
    } else if (action === "disable"){
        changes[type][id]["enable"] = false
    } else {
        changes[type][id][action] = true
    }
    localStorage.setItem(type+"-changes", JSON.stringify(changes[type]));
}
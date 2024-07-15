let var_mapping = {
    "settings": {
        common: {
            "title": {
                input_id: "MainTitle",
                special: "SET-TITLE"
            },
            "header_text": {
                input_id: "HeaderText",
                special: "SET-HEADER"
            },
            "footer_separator": {
                input_id: "FooterSeparator",
                output: ".footer-separator"
            },
            "content_height": {
                input_id: "ContentHeight",
                special: "SET-HEADER"
            },
            "content_width": {
                input_id: "ContentWidth",
                set_css: "width",
                target: ".container",
                suffix: "px"
            },
            "use_page_titles": {
                input_id: "UsePageTitles",
                set_css: "height",
                target: "#content",
                suffix: "px",
                special: "SET-TITLE"
            },
            "main_page": {
                input_id: "MainPage"
            }

        },
        current: {}
    },
    "pages": {
        common: {
            "name": {
                output: [
                    "#page-<ID> > a",
                    "#listpage-<ID> > a"
                ],
            },
            "disabled": {
                class_toggle: "local-disabled",
                target: [
                    "#page-<ID>",
                    "#listpage-<ID>"
                ]
            },
            "hidden": {
                class_toggle: "local-hidden",
                target: [
                    "#page-<ID>",
                    "#listpage-<ID>"
                ]
            },
            "deleted": {
                class_toggle: "deleted",
                target: [
                    "#page-<ID>",
                    "#listpage-<ID>"
                ],
            },
            "order": {
                set_css: "order",
                target: [
                    "#page-<ID>",
                    "#listpage-<ID>"
                ],
            },
        },
        current: {
            "name": {
                input_id: "PageName",
                special: "SET-TITLE",
                output: "#this-page-header",
            },
            "text": {
                input_id: "PageText",
                output_type: "HTML",
                output: "#PageTextBox"
            },
            "url_handle": {
                input_id: "PageUrlHandle"
            },
            "hidden": {
                button_on_id: "page-hide",
                button_off_id: "page-show",
            },
            "disabled": {
                button_on_id: "page-disable",
                button_off_id: "page-enable",
                special: "SET-HIDDEN",
            },
            "deleted": {
                button_id: "page-delete",
                go_to: "main-settings",
                special: "FORCE-SAVING"
            },
            "added": {
                output: "#PageAdded"
            },
            "edited": {
                output: "#PageEdited"
            },
        }
    },
    "images": {
        common: {
            "label": {
                target: [
                    "#image-<ID>",
                    "#listimage-<ID>"
                ]
            },
            "hidden": {
                class_toggle: "local-hidden",
                target: [
                    "#image-<ID>",
                    "#listimage-<ID>"
                ]
            },
            "deleted": {
                class_toggle: "local-deleted",
                target: [
                    "#image-<ID>",
                    "#listimage-<ID>"
                ],
            },
            "order": {
                set_css: "order",
                target: [
                    "#image-<ID>",
                    "#listimage-<ID>"
                ],
            },
        },
        current: {
            "filename": {
                output: "#ImageFileName"
            },
            "label": {
                input_id: "ImageLabel"
            },
            "hidden": {
                button_on_id: "image-hide",
                button_off_id: "image-show",
            },
            "deleted": {
                button_id: "image-delete",
                go_to: "main-settings",
                special: "FORCE-SAVING"
            },
            "page": {
                input_id: "ImagePage"
            },
            "added": {
                output: "#ImageAdded"
            },
            "edited": {
                output: "#ImageEdited"
            },
        }
    },
    "footer_items": {
        common: {
            "text": {
                output: [
                    "#footer-<ID> > a",
                    "#listfooter-<ID> > a"
                ]
            },
            "hidden": {
                class_toggle: "local-hidden",
                target: [
                    "#footer-<ID>",
                    "#listfooter-<ID>"
                ]
            },
            "deleted": {
                class_toggle: "local-deleted",
                target: [
                    "#footer-<ID>",
                    "#listfooter-<ID>"
                ],
            },
            "order": {
                set_css: "order",
                target: [
                    "#footer-<ID>",
                    "#listfooter-<ID>"
                ],
            },
        },
        current: {
            "text": {
                input_id: "FooterItemText",
            },
            "link": {
                input_id: "FooterItemLink"
            },
            "hidden": {
                button_on_id: "footer-hide",
                button_off_id: "footer-show",
            },
            "deleted": {
                button_id: "footer-delete",
                go_to: "main-settings",
                special: "FORCE-SAVING"
            },
        }
    }
}
let button_mappings = {

}
$(document).ready(function () {
    for (const [cat, categorys] of Object.entries(var_mapping)){
        for (const [context, variables] of Object.entries(categorys)) {
            for (const [key, params] of Object.entries(variables)) {
                if (params.hasOwnProperty("button_on_id")){
                    button_mappings[params["button_on_id"]] = {variable: key, type: "button_on", category: cat}
                }
                if (params.hasOwnProperty("button_off_id")){
                    button_mappings[params["button_off_id"]] = {variable: key, type: "button_off", category: cat}
                }
                if (params.hasOwnProperty("input_id")){
                    button_mappings[params["input_id"]] = {variable: key, type: "input", category: cat}
                }
                if (params.hasOwnProperty("button_id")){
                    button_mappings[params["button_id"]] = {variable: key, type: "button_on", category: cat}
                }
            }
        }
    }
})

import datetime
import os
import json
import urllib.parse
from flask import render_template, request, redirect, url_for, send_from_directory
from VerySmallGallery import app, db, basic_auth
from VerySmallGallery.models import Settings, Page, Footer, Image
from VerySmallGallery.forms import ImageUpload, NewPage, NewFooterItem
from werkzeug.utils import secure_filename


@app.route('/admin/', defaults={'page_handle': ''}, methods=['GET', 'POST'])
@app.route('/admin/<page_handle>', methods=['GET', 'POST'])
@basic_auth.required
def admin(page_handle):
    if request.method == "POST":
        success, type, arg = handle_post_request(request)
        if type == "page":
            page_handle = arg
        if success:
            fix_orders()
            return redirect(url_for("admin", page_handle=page_handle))
    settings, footer, pages = get_common()
    title = settings.title
    imageupload = ImageUpload()
    newpage = NewPage()
    newfooteritem = NewFooterItem()

    if page_handle == "":
        return render_template(
            'admin.html', admin=True,
            imageupload=imageupload, newpage=newpage, newfooteritem=newfooteritem, current_page=None, title=title,
            settings=settings, footer=footer, pages=pages
        )
    return find_and_render(
        page_handle=page_handle, is_admin=True,
        imageupload=imageupload, newpage=newpage, newfooteritem=newfooteritem
    )


@app.route('/database/', defaults={'model': ''}, methods=['GET', 'POST'])
@app.route('/database/<model>', methods=['GET', 'POST'])
@basic_auth.required
def database(model):
    entries = []
    if request.method == "POST":
        delete_id = request.form.get("delete_id")
        to_del = None
        if model == "settings":
            to_del = Settings.query.filter_by(id=delete_id).first()
        elif model == "page":
            to_del = Page.query.filter_by(id=delete_id).first()
        elif model == "image":
            to_del = Image.query.filter_by(id=delete_id).first()
            if os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], to_del.filename)):
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], to_del.filename))
        elif model == "footer":
            to_del = Footer.query.filter_by(id=delete_id).first()
        if to_del:
            db.session.delete(to_del)
            db.session.commit()

    if model == "settings":
        entries = Settings.query.all()
    elif model == "page":
        entries = Page.query.all()
    elif model == "image":
        entries = Image.query.all()
    elif model == "footer":
        entries = Footer.query.all()
    return render_template('database.html', model=model, entries=entries)


@app.route('/', defaults={'page_handle': ''}, methods=['GET'])
@app.route('/<page_handle>', methods=['GET'])
def index(page_handle):
    return find_and_render(
        page_handle=page_handle
    )


@app.route('/uploads/photos/<filename>')
def uploaded(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


def find_and_render(page_handle, is_admin=False, imageupload=None, newpage=None, newfooteritem=None,):
    settings, footer, pages = get_common()
    title = settings.title
    if page_handle == "":
        page = Page.query.filter_by(id=settings.main_page).first()
        if not page:
            page = Page.query.filter_by(hidden=False).order_by(Page.order).first()
        if not page:
            return render_template(
                'configure_me.html', admin=is_admin,
                imageupload=imageupload, newpage=newpage, newfooteritem=newfooteritem, current_page=None, title=title,
                settings=settings, footer=footer, pages=pages
            )
    else:
        page = Page.query.filter_by(url_handle=page_handle).first()
        if not page or (page.disabled and not is_admin):
            return render_template(
                'not_found.html', admin=is_admin,
                imageupload=imageupload, newpage=newpage, newfooteritem=newfooteritem, current_page=None, title=title,
                settings=settings, footer=footer, pages=pages
            )

        if settings.use_page_titles:
            title = page.name

    if page.page_type == "GALLERY":
        if is_admin:
            images = Image.query.all()
        else:
            images = Image.query.filter_by(page=page.id).order_by(Image.order).all()
        return render_template(
            'gallerypage.html', admin=is_admin,
            imageupload=imageupload, newpage=newpage, newfooteritem=newfooteritem, current_page=page, title=title,
            settings=settings, footer=footer, pages=pages, images=images
        )

    if page.page_type == "TEXT":
        images = Image.query.filter_by(page=page.id).order_by(Image.order).all()
        if is_admin:
            images = Image.query.all()
        return render_template(
            'textpage.html', admin=is_admin,
            imageupload=imageupload, newpage=newpage, newfooteritem=newfooteritem, current_page=page, title=title,
            settings=settings, footer=footer, pages=pages, images=images, text=page.text
        )


def handle_post_request(post_request):
    imageupload = ImageUpload()
    newpage = NewPage()
    newfooteritem = NewFooterItem()
    timenow = datetime.datetime.now()
    if imageupload.submit_image.data:
        f = imageupload.file.data
        filename = secure_filename(f.filename)
        f.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        image = Image(
            hidden=imageupload.hidden.data,
            filename=filename,
            label=imageupload.label.data,
            page=imageupload.page.data,
            order=-1,
            added=timenow,
            edited=timenow
        )
        db.session.add(image)
        db.session.commit()
        return True, "image", None
    if newpage.submit_page.data and newpage.validate_on_submit():
        handle = unique_handle(newpage.url_handle.data, newpage.name.data)
        page = Page(
            disabled=True,
            name=newpage.name.data,
            url_handle=handle,
            hidden=True,
            page_type=newpage.page_type.data,
            text="",
            order=-1,
            added=timenow,
            edited=timenow
        )
        db.session.add(page)
        db.session.commit()
        return True, "page", handle
    if newfooteritem.submit_footeritem.data and newfooteritem.validate_on_submit():
        footeritem = Footer(
            hidden=newfooteritem.hidden.data,
            text=newfooteritem.text.data,
            link=newfooteritem.link.data,
            order=-1,
            added=timenow,
            edited=timenow
        )
        db.session.add(footeritem)
        db.session.commit()
        return True, "footer", None
    action = post_request.form.get("action")
    if action == "save-changes":
        data = post_request.form
        client_settings = json.loads(data.get("settings"))
        server_settings = Settings.query.first()
        if client_settings:
            for variable in client_settings.keys():
                if variable in ["id"]:
                    continue
                setattr(server_settings, variable,
                        check_for_bool(client_settings[variable], server_settings, variable)
                        )
        db.session.commit()
        for item in [["pages", Page], ["images", Image], ["footer_items", Footer]]:
            client_items = json.loads(data.get(item[0]))
            server_items = item[1].query.all()
            for server_item in server_items:
                client_item = client_items[str(server_item.id)]
                for variable in client_item.keys():
                    if variable in ["id", "added", "edited"]:
                        continue
                    if variable == "deleted":
                        if check_for_bool(client_item[variable], server_item, variable):
                            db.session.delete(server_item)
                            if item[0] == "images":
                                if os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], server_item.filename)):
                                    os.remove(os.path.join(app.config['UPLOAD_FOLDER'], server_item.filename))
                            print(client_item[variable], flush=True)
                            break
                        continue
                    setattr(server_item, variable,
                            check_for_bool(client_item[variable], server_item, variable)
                            )
            db.session.commit()
        return True, "changes", None
    return False, None, None


def check_for_bool(val, objclass, var):
    if val in ["True", "False"] and isinstance(getattr(objclass, var), bool):
        if val == "True":
            val = True
        else:
            val = False
    return val


def unique_handle(custom, default):
    handle = custom
    if handle == "":
        handle = default
    handle = urllib.parse.quote(handle.replace("/", "-"))
    handle_d = handle
    i = 1
    handles = []
    pages = Page.query.all()
    for page in pages:
        handles.append(page.url_handle)
    while handle in handles:
        handle = handle_d + "-" + str(i)
        i += 1
    return handle


def get_common():
    settings = Settings.query.first()
    if not settings:
        settings = Settings(
            title="VerySmallGallery by jsloth",
            header_text="VERY SMALL GALLERY",
            footer_separator="||",
            content_height=480,
            content_width=1200,
            use_page_titles=True,
            main_page=-1,
        )
        db.session.add(settings)
        db.session.commit()
    footer = Footer.query.order_by(Footer.order).all()
    pages = Page.query.order_by(Page.order).all()
    return settings, footer, pages


def fix_orders():
    for entries in [Page.query.order_by(Page.order).all(),
                    Footer.query.order_by(Footer.order).all(),
                    Image.query.order_by(Image.order).all()]:
        o = 0
        for entry in entries:
            entry.order = o
            o += 1
    db.session.commit()


from VerySmallGallery import db


class Visitor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip = db.Column(db.String())
    page = db.Column(db.String())
    admin = db.Column(db.Boolean)
    timestamp = db.Column(db.DateTime())


class Settings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String())
    header_text = db.Column(db.String())
    footer_separator = db.Column(db.String())
    content_height = db.Column(db.Integer)
    content_width = db.Column(db.Integer)
    use_page_titles = db.Column(db.Boolean)
    main_page = db.Column(db.Integer)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Footer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hidden = db.Column(db.Boolean)
    order = db.Column(db.Integer)
    text = db.Column(db.String())
    link = db.Column(db.String())
    added = db.Column(db.DateTime())
    edited = db.Column(db.DateTime())

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Page(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String())
    url_handle = db.Column(db.String())
    text = db.Column(db.String())
    page_type = db.Column(db.String())
    disabled = db.Column(db.Boolean)
    hidden = db.Column(db.Boolean)
    order = db.Column(db.Integer)
    added = db.Column(db.DateTime())
    edited = db.Column(db.DateTime())

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hidden = db.Column(db.Boolean)
    filename = db.Column(db.String())
    label = db.Column(db.String())
    page = db.Column(db.Integer)
    order = db.Column(db.Integer)
    added = db.Column(db.DateTime())
    edited = db.Column(db.DateTime())

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

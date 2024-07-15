from flask import Flask
import readconfig
from flask_sqlalchemy import SQLAlchemy
from flask_basicauth import BasicAuth

app = Flask(__name__)
conf = readconfig
app.config.from_object(conf.Config)
db = SQLAlchemy(app)
basic_auth = BasicAuth(app)
conf = readconfig

from VerySmallGallery import routes, models

with app.app_context():
    db.create_all()



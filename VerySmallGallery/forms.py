from flask_wtf import FlaskForm
from wtforms import StringField, BooleanField, SubmitField, FileField, SelectField
from wtforms.validators import DataRequired


class ImageUpload(FlaskForm):
    file = FileField('File:', validators=[DataRequired()])
    label = StringField('Label:')
    page = SelectField('Page:', choices=[])
    hidden = BooleanField('Set hidden on upload:', default=True)
    submit_image = SubmitField('Upload')


class NewPage(FlaskForm):
    name = StringField('Page title:', validators=[DataRequired()])
    url_handle = StringField('Custom URL handle:')
    page_type = SelectField('Page type:', choices=[("GALLERY", "Gallery"), ("TEXT", "Text")], validators=[DataRequired()])
    submit_page = SubmitField('Create')


class NewFooterItem(FlaskForm):
    text = StringField('Text:')
    link = StringField('Link:')
    hidden = BooleanField('Set hidden on creation', default=False)
    submit_footeritem = SubmitField('Create')
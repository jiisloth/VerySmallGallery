import argparse
import configparser
import os.path

dev = True
prod = False

conf_file = 'config.ini'


parser = argparse.ArgumentParser(prog='VerySmallGallery', description='Small photo gallery by using Flask',)
parser.add_argument('--production', help='Sets the app in production mode',
                    action='store_true')
parser.add_argument('-c', '--config', help='Set custom config file path',
                    action='store_const', const=conf_file, default=conf_file)
parameters = parser.parse_args()

configReader = configparser.ConfigParser()
configReader.read(conf_file)
common_conf = configReader['COMMON']

if parameters.production:
    dev = False
    prod = True
    env_conf_head = "PRODUCTION"
    env_conf = configReader["PRODUCTION"]
else:
    env_conf = configReader["DEVELOPMENT"]

if not os.path.exists(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads')):
    os.mkdir(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads'))
if not os.path.exists(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads', 'photos')):
    os.mkdir(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads', 'photos'))

class Config(object):
    SECRET_KEY = env_conf.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = env_conf.get('DATABASE_URL') or 'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    BASIC_AUTH_USERNAME = env_conf.get("ADMIN_USER") or 'admin'
    BASIC_AUTH_PASSWORD = env_conf.get("ADMIN_PASSWORD") or 'helevetinhyvasalasana'
    UPLOAD_FOLDER = env_conf.get('DATABASE_URL') or os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads', 'photos')
from VerySmallGallery import app, conf
import os

if __name__ == '__main__':
    if conf.dev:
        app.run(debug=True)
    else:
        app.run(debug=False)
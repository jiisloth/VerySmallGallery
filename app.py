from VerySmallGallery import app, conf
import logging
log = logging.getLogger('waitress')
log.propagate = False

if __name__ == '__main__':
    if conf.dev:
        app.run(debug=True, port=conf.Config.PORT)
    else:
        from waitress import serve
        serve(app, host="0.0.0.0", port=conf.Config.PORT)
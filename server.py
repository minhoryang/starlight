from flask import Flask
from flask_yeoman import flask_yeoman

app = Flask(__name__, static_folder='app')
app.config.update(DEBUG=False)
app.config.from_pyfile('settings.conf')
app.register_blueprint(flask_yeoman)

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=9000)

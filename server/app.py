from flask import Flask, send_from_directory

app = Flask(__name__)


@app.route("/")
def home():
    return send_from_directory('assets', 'board.html')


@app.route('/assets/<path:filename>')
def send_asset(filename):
    return send_from_directory('assets', filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)


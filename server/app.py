from flask import Flask, render_template, send_from_directory, jsonify, request
import requests


app = Flask(__name__)

REFEREE_URL = "http://referee:5001"

@app.route('/validate_move', methods=['POST'])
def validate_move():
    move_data = request.json  # Expecting {"from": "e2", "to": "e4", "piece": "pawn"}

    try:
        # Send the move to the referee
        response = requests.post(f"{REFEREE_URL}/check_move", json=move_data)
        response_data = response.json()

        # Forward the referee's response back to the client
        return jsonify(response_data), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/")
def home():
    return render_template("board.html")

@app.route('/assets/<path:filename>')
def send_asset(filename):
    return send_from_directory('assets', filename)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

